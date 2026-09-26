import axios from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();
let isRefreshing = false;

// Where the API lives. Set VITE_API_BASE_URL (see .env) to point at a
// different backend; it should be the origin only, without the /api/v1 suffix.
// The fallbacks keep `npm run dev` talking to a local server and a production
// build talking to the deployed one even if the variable is missing.
export const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://pulse-monitor-backend.onrender.com")
).replace(/\/+$/, "");

const API_BASE_URL = `${API_ORIGIN}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  // The API issues an XSRF-TOKEN cookie and requires it echoed back in this
  // header on every mutating request (double-submit cookie).
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

// The API and the frontend are on different domains in production, so the
// XSRF-TOKEN cookie is not readable here. Fetch the value from the API once and
// keep it in memory; the cookie still travels with the request as the other
// half of the double-submit pair.
let csrfToken: string | null = null;
let csrfRequest: Promise<string | null> | null = null;

const fetchCsrfToken = async (): Promise<string | null> => {
  try {
    const { data } = await axios.get(`${API_ORIGIN}/api/v1/csrf-token`, {
      withCredentials: true,
    });
    csrfToken = data?.csrfToken ?? null;
  } catch {
    csrfToken = null;
  }
  return csrfToken;
};

const ensureCsrfToken = async (): Promise<string | null> => {
  if (csrfToken) return csrfToken;
  // Collapse concurrent callers onto a single in-flight request.
  if (!csrfRequest) {
    csrfRequest = fetchCsrfToken().finally(() => {
      csrfRequest = null;
    });
  }
  return csrfRequest;
};

const MUTATING = ["post", "put", "patch", "delete"];

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (MUTATING.includes((config.method || "get").toLowerCase())) {
      const token = await ensureCsrfToken();
      if (token) {
        config.headers["X-XSRF-TOKEN"] = token;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // The CSRF cookie is handed out by the API on its first response. A client
    // whose very first call is a mutation has no cookie yet, so retry once now
    // that it has been set.
    if (
      error.response?.status === 403 &&
      error.response?.data?.message === "Invalid CSRF token" &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      csrfToken = null; // force a refresh, the cached one is stale
      const token = await ensureCsrfToken();
      if (token) {
        originalRequest.headers["X-XSRF-TOKEN"] = token;
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      await mutex.runExclusive(async () => {
        if (!isRefreshing) {
          isRefreshing = true;
          originalRequest._retry = true;
          try {
            const { data } = await axios.post(
              `${API_BASE_URL}/auth/refresh-token`,
              {},
              { withCredentials: true }
            );
            localStorage.setItem("accessToken", data.data.accessToken);
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${data.data.accessToken}`;
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${data.data.accessToken}`;
            isRefreshing = false;
          } catch (refreshError) {
            isRefreshing = false;
            // Handle refresh token failure (e.g., redirect to login)
            console.error("Refresh token failed", refreshError);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(refreshError);
          }
        }
      });
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;
