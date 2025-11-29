import axios from "axios";
import { Mutex } from "async-mutex";

const mutex = new Mutex();
let isRefreshing = false;

// const API_BASE_URL = "http://localhost:5000/api/v1";
const API_BASE_URL = "https://pulse-monitor-backend.onrender.com/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
    if (error.response.status === 401 && !originalRequest._retry) {
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
