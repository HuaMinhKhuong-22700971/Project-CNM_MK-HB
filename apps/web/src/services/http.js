import axios from "axios";
import { getStoredAuth } from "../utils/storage";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

httpClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  return config;
});

// Response interceptor to handle token expiration/invalidation
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local auth state if backend rejects the token
      import("../store/authStore").then(({ clearAuthState }) => {
        clearAuthState();
        // Redirect to login if on protected action
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
      });
    }
    return Promise.reject(error);
  }
);
