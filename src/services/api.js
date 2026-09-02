import axios from "axios";

// Determine API base URL dynamically based on environment and VITE_API_URL
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // 1. If explicit VITE_API_URL is defined
  if (envUrl && envUrl.trim() !== "") {
    const trimmed = envUrl.trim().replace(/\/$/, "");
    return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
  }

  // 2. In production (e.g. Vercel deployment), default to relative "/api" to avoid HTTPS -> HTTP mixed-content
  if (import.meta.env.PROD) {
    return "/api";
  }

  // 3. In local development default to EC2 backend
  return "http://13.211.190.78:5000/api";
};

export const API_BASE_URL = getApiBaseUrl();


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

