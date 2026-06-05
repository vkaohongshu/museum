import { Tag } from "../types";
import { apiClient } from "./client";
import { queryClient } from "./queryClient";
import { queueAndSync } from "./sync";
import { useMutation } from "@tanstack/react-query";

const colors = ["#ffb84d", "#5aa9ff", "#35c88a", "#ff7b72", "#9b8cff", "#f2c94c"];

type ApiTag = {
  id: string;
  name: string;
  color?: string;
  usageCount?: number;
  usage_count?: number;
};

export async function fetchTags(): Promise<Tag[]> {
  const { data } = await apiClient.get<ApiTag[]>("/tags");
  return data.map((item, index) => ({
    id: item.id,
    name: item.name,
    color: item.color ?? colors[index % colors.length],
    usageCount: item.usageCount ?? item.usage_count ?? 0
  }));
}

export type TagPayload = Partial<Tag>;

export async function createTag(tag: TagPayload) {
  const id = tag.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "tags",
    method: "POST",
    endpoint: "/tags",
    data: { id, name: tag.name, color: tag.color, usageCount: tag.usageCount ?? 0, updatedAt: new Date().toISOString() }
  });
}

export async function updateTag(id: string, tag: TagPayload) {
  return queueAndSync({
    entity: "tags",
    method: "PUT",
    endpoint: `/tags/${id}`,
    data: { id, name: tag.name, color: tag.color, usageCount: tag.usageCount, updatedAt: new Date().toISOString() }
  });
}

export async function deleteTag(id: string) {
  await queueAndSync({
    entity: "tags",
    method: "DELETE",
    endpoint: `/tags/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateTagMutation() {
  return useMutation({ mutationFn: createTag, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["tags"] }) });
}

export function useUpdateTagMutation() {
  return useMutation({ mutationFn: ({ id, tag }: { id: string; tag: TagPayload }) => updateTag(id, tag), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["tags"] }) });
}

export function useDeleteTagMutation() {
  return useMutation({ mutationFn: deleteTag, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["tags"] }) });
}
