import { useMutation } from "@tanstack/react-query";
import { InspirationItem } from "../types";
import { apiClient } from "./client";
import { queueAndSync } from "./sync";

type ApiInspiration = {
  id: string;
  title: string;
  content?: string | null;
  type?: string | null;
  status?: string | null;
  tags?: string[] | string | null;
  createdAt?: string;
  updatedAt?: string;
};

function parseTags(value: ApiInspiration["tags"]) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchInspirations(): Promise<InspirationItem[]> {
  const { data } = await apiClient.get<ApiInspiration[]>("/inspirations");
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content ?? "",
    type: (item.type ?? "其他") as InspirationItem["type"],
    status: (item.status ?? "待实现") as InspirationItem["status"],
    tags: parseTags(item.tags),
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.createdAt ?? new Date().toISOString()
  }));
}

export type InspirationPayload = Partial<InspirationItem>;

function toApiPayload(inspiration: InspirationPayload) {
  return {
    title: inspiration.title,
    content: inspiration.content ?? "",
    type: inspiration.type,
    status: inspiration.status,
    tags: inspiration.tags ?? []
  };
}

export async function createInspiration(inspiration: InspirationPayload) {
  const id = inspiration.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "inspirations",
    method: "POST",
    endpoint: "/inspirations",
    data: { ...toApiPayload(inspiration), id, updatedAt: new Date().toISOString() }
  });
}

export async function updateInspiration(id: string, inspiration: InspirationPayload) {
  return queueAndSync({
    entity: "inspirations",
    method: "PUT",
    endpoint: `/inspirations/${id}`,
    data: { ...toApiPayload(inspiration), id, updatedAt: new Date().toISOString() }
  });
}

export async function deleteInspiration(id: string) {
  await queueAndSync({
    entity: "inspirations",
    method: "DELETE",
    endpoint: `/inspirations/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateInspirationMutation() {
  return useMutation({ mutationFn: createInspiration });
}

export function useUpdateInspirationMutation() {
  return useMutation({
    mutationFn: ({ id, inspiration }: { id: string; inspiration: InspirationPayload }) => updateInspiration(id, inspiration)
  });
}

export function useDeleteInspirationMutation() {
  return useMutation({ mutationFn: deleteInspiration });
}
