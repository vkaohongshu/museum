import { useMutation } from "@tanstack/react-query";
import { MoodEntry } from "../types";
import { apiClient } from "./client";
import { queryClient } from "./queryClient";
import { queueAndSync } from "./sync";

type ApiMoodRecord = {
  id: string;
  date: string;
  mood: string;
  weather?: string | null;
  note?: string | null;
  relatedArticleIds?: string[] | string | null;
  relatedMomentIds?: string[] | string | null;
  relatedGalleryIds?: string[] | string | null;
  createdAt?: string;
  updatedAt?: string;
};

function parseIds(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchMoods(): Promise<MoodEntry[]> {
  const { data } = await apiClient.get<ApiMoodRecord[]>("/mood-records");
  return data.map((item) => ({
    id: item.id,
    date: item.date,
    mood: item.mood as MoodEntry["mood"],
    weather: (item.weather ?? "晴天") as MoodEntry["weather"],
    note: item.note ?? "",
    relatedArticleIds: parseIds(item.relatedArticleIds),
    relatedMomentIds: parseIds(item.relatedMomentIds),
    relatedGalleryIds: parseIds(item.relatedGalleryIds),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));
}

export type MoodPayload = Partial<MoodEntry>;

function toApiPayload(mood: MoodPayload) {
  return {
    date: mood.date,
    mood: mood.mood,
    weather: mood.weather,
    note: mood.note,
    relatedArticleIds: mood.relatedArticleIds ?? [],
    relatedMomentIds: mood.relatedMomentIds ?? [],
    relatedGalleryIds: mood.relatedGalleryIds ?? []
  };
}

export async function createMood(mood: MoodPayload) {
  const id = mood.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "moodRecords",
    method: "POST",
    endpoint: "/mood-records",
    data: { ...toApiPayload(mood), id, updatedAt: new Date().toISOString() }
  });
}

export async function updateMood(id: string, mood: MoodPayload) {
  return queueAndSync({
    entity: "moodRecords",
    method: "PUT",
    endpoint: `/mood-records/${id}`,
    data: { ...toApiPayload(mood), id, updatedAt: new Date().toISOString() }
  });
}

export async function deleteMood(id: string) {
  await queueAndSync({
    entity: "moodRecords",
    method: "DELETE",
    endpoint: `/mood-records/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateMoodMutation() {
  return useMutation({ mutationFn: createMood, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["moods"] }) });
}

export function useUpdateMoodMutation() {
  return useMutation({
    mutationFn: ({ id, mood }: { id: string; mood: MoodPayload }) => updateMood(id, mood),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["moods"] })
  });
}

export function useDeleteMoodMutation() {
  return useMutation({ mutationFn: deleteMood, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["moods"] }) });
}
