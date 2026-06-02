import { MemoryCapsule } from "../types";
import { apiClient } from "./client";
import { queryClient } from "./queryClient";
import { queueAndSync } from "./sync";
import { useMutation } from "@tanstack/react-query";

type ApiMemoryCapsule = {
  id: string;
  title: string;
  content?: string;
  body?: string;
  date: string;
  mood?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchMemoryCapsules(): Promise<MemoryCapsule[]> {
  const { data } = await apiClient.get<ApiMemoryCapsule[]>("/memory-capsules");
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    body: item.body ?? item.content ?? "",
    date: item.date,
    mood: item.mood ?? "",
    categoryId: "",
    tagIds: [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));
}

export type MemoryCapsulePayload = Partial<MemoryCapsule> & {
  content?: string;
};

function toApiPayload(capsule: MemoryCapsulePayload) {
  return {
    title: capsule.title,
    content: capsule.content ?? capsule.body,
    date: capsule.date,
    mood: capsule.mood
  };
}

export async function createMemoryCapsule(capsule: MemoryCapsulePayload) {
  const id = capsule.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "memory_capsules",
    method: "POST",
    endpoint: "/memory-capsules",
    data: { ...toApiPayload(capsule), id, updatedAt: new Date().toISOString() }
  });
}

export async function updateMemoryCapsule(id: string, capsule: MemoryCapsulePayload) {
  return queueAndSync({
    entity: "memory_capsules",
    method: "PUT",
    endpoint: `/memory-capsules/${id}`,
    data: { ...toApiPayload(capsule), id, updatedAt: new Date().toISOString() }
  });
}

export async function deleteMemoryCapsule(id: string) {
  await queueAndSync({
    entity: "memory_capsules",
    method: "DELETE",
    endpoint: `/memory-capsules/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateMemoryCapsuleMutation() {
  return useMutation({ mutationFn: createMemoryCapsule, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["memory-capsules"] }) });
}

export function useUpdateMemoryCapsuleMutation() {
  return useMutation({
    mutationFn: ({ id, capsule }: { id: string; capsule: MemoryCapsulePayload }) => updateMemoryCapsule(id, capsule),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["memory-capsules"] })
  });
}

export function useDeleteMemoryCapsuleMutation() {
  return useMutation({ mutationFn: deleteMemoryCapsule, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["memory-capsules"] }) });
}
