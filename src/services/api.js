import axios from "axios";

// Normalize API base URL from VITE_API_URL
const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const trimmedBaseUrl = rawBaseUrl.replace(/\/$/, "");
export const API_BASE_URL = trimmedBaseUrl.endsWith("/api")
  ? trimmedBaseUrl
  : `${trimmedBaseUrl}/api`;

// Create configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

// Request interceptor to attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("campusconnect_token");
    if (token && token !== "null" && token !== "undefined" && token !== "mock-token") {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthorized errors and clean error message unwrapping
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthEndpoint =
        requestUrl.includes("/auth/login") || requestUrl.includes("/auth/register");

      if (!isAuthEndpoint) {
        localStorage.removeItem("campusconnect_token");
        localStorage.removeItem("campusconnect_current_user");
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred while communicating with the server.";
    return Promise.reject(new Error(message));
  }
);


export default api;

