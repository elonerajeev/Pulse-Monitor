// Kept for backwards compatibility. Prefer importing the configured axios
// client from `utils/api.ts`, which already targets `${API_BASE_URL}/api/v1`.
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://pulse-monitor-backend.onrender.com")
).replace(/\/+$/, "");
