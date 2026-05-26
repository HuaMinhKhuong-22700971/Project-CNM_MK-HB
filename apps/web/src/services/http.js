import axios from "axios";
import { clearAuthState, getAuthState, setAuthState } from "../store/authStore";
import { getStoredAuth } from "../utils/storage";

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

let refreshPromise = null;

function redirectToLogin() {
  clearAuthState();
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login?expired=true";
  }
}

async function tryRefreshToken() {
  const auth = getAuthState();
  const refreshToken = auth?.refreshToken;

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        const payload = response?.data?.data || response?.data;
        const accessToken = payload?.accessToken || "";
        const nextRefreshToken = payload?.refreshToken || refreshToken;
        const user = payload?.user || auth.user;

        if (!accessToken) {
          throw new Error("Refresh response is invalid");
        }

        setAuthState({
          accessToken,
          refreshToken: nextRefreshToken,
          user
        });

        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

httpClient.interceptors.request.use((config) => {
  const auth = getStoredAuth();

  if (auth?.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const accessToken = await tryRefreshToken();

      if (!accessToken) {
        redirectToLogin();
        return Promise.reject(error);
      }

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return httpClient(originalRequest);
    } catch (_refreshError) {
      redirectToLogin();
      return Promise.reject(error);
    }
  }
);
