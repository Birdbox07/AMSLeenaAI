import axios from "axios";
import { handleError } from "../errors/errorHandler";

// Central HTTP client — the ONE place every feature's service.js should
// eventually route real network calls through when a backend exists. Right
// now this app runs entirely on mock data (see each feature's <feature>.mock.js
// + <feature>.service.js), but every service function is already written as
// `async () => { ...resolve mock data with a delay... }` so swapping a
// service function's body to `return api.get('/leaves').then(r => r.data)`
// is a one-line change per function, with auth/error handling already wired
// up here.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attaches an auth token once real auth exists.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ams-auth-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — every failed request funnels through the same
// central error handler (toast + console.error) so individual call sites
// never need their own try/catch just to report a failure.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    handleError(error, "api");
    return Promise.reject(error);
  }
);

export default api;
