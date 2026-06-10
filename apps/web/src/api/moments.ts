import { Thought } from "../types";
import { apiClient } from "./client";
import { resolveMediaUrl } from "./media";
import { queueAndSync } from "./sync";
import { useMutation } from "@tanstack/react-query";

type ApiMoment = {
  id: string;
  content: string;
  imageUrl?: string | null;
  image_url?: string | null;
  categoryId?: string;
  tagIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchMoments(): Promise<Thought[]> {
  const { data } = await apiClient.get<ApiMoment[]>("/moments");
  return data.map((item) => {
    const image = resolveMediaUrl(item.imageUrl ?? item.image_url);
    return {
      id: item.id,
      content: item.content,
      images: image ? [image] : [],
      categoryId: item.categoryId ?? "",
      tagIds: item.tagIds ?? [],
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt,
      relatedItems: []
    };
  });
}

export type MomentPayload = Partial<Thought> & {
  imageUrl?: string | null;
};

function toApiPayload(moment: MomentPayload) {
  return {
    content: moment.content,
    imageUrl: moment.imageUrl ?? moment.images?.[0] ?? null,
    tagIds: moment.tagIds ?? []
  };
}

export async function createMoment(moment: MomentPayload) {
  const id = moment.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "moments",
    method: "POST",
    endpoint: "/moments",
    data: { ...toApiPayload(moment), id, updatedAt: new Date().toISOString() }
  });
}

export async function updateMoment(id: string, moment: MomentPayload) {
  return queueAndSync({
    entity: "moments",
    method: "PUT",
    endpoint: `/moments/${id}`,
    data: { ...toApiPayload(moment), id, updatedAt: new Date().toISOString() }
  });
}

export async function deleteMoment(id: string) {
  await queueAndSync({
    entity: "moments",
    method: "DELETE",
    endpoint: `/moments/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateMomentMutation() {
  return useMutation({ mutationFn: createMoment });
}

export function useUpdateMomentMutation() {
  return useMutation({ mutationFn: ({ id, moment }: { id: string; moment: MomentPayload }) => updateMoment(id, moment) });
}

export function useDeleteMomentMutation() {
  return useMutation({ mutationFn: deleteMoment });
}
