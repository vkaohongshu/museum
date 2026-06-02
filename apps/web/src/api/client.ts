import axios, { AxiosError } from "axios";

export const AUTH_TOKEN_KEY = "life-museum-auth-token";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.assign(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
    const message = error.response?.data?.message ?? error.message ?? "API request failed";
    return Promise.reject(new Error(message));
  }
);
