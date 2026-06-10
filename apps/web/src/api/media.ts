import { apiClient } from "./client";

export function resolveMediaUrl(value: string | null | undefined) {
  if (!value) return "";

  const uploadsIndex = value.indexOf("/uploads/");
  if (uploadsIndex < 0) return value;

  const key = value.slice(uploadsIndex + 1);
  const apiBaseUrl = String(apiClient.defaults.baseURL ?? "/api").replace(/\/$/, "");
  return `${apiBaseUrl}/media/${key}`;
}
