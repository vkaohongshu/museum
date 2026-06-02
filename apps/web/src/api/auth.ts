import { apiClient, AUTH_TOKEN_KEY } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  nickname: string | null;
};

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<{ token: string; user: AuthUser }>("/auth/login", { email, password });
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem("life-museum-auth-user", JSON.stringify(data.user));
  return data;
}

export async function fetchMe() {
  const { data } = await apiClient.get<{ user: AuthUser }>("/auth/me");
  localStorage.setItem("life-museum-auth-user", JSON.stringify(data.user));
  return data.user;
}

export async function logout() {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem("life-museum-auth-user");
  }
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem("life-museum-auth-user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}
