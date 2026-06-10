import { useMutation } from "@tanstack/react-query";
import { LocationRecord } from "../types";
import { apiClient } from "./client";
import { resolveMediaUrl } from "./media";
import { queueAndSync } from "./sync";

type ApiLocation = {
  id: string;
  name: string;
  city?: string | null;
  country?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  description?: string | null;
  coverImage?: string | null;
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

function toNumber(value: ApiLocation["latitude"]) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value);
}

export async function fetchLocations(): Promise<LocationRecord[]> {
  const { data } = await apiClient.get<ApiLocation[]>("/locations");
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    city: item.city ?? "",
    country: item.country ?? "",
    latitude: toNumber(item.latitude),
    longitude: toNumber(item.longitude),
    description: item.description ?? "",
    coverImage: resolveMediaUrl(item.coverImage),
    relatedArticleIds: parseIds(item.relatedArticleIds),
    relatedMomentIds: parseIds(item.relatedMomentIds),
    relatedGalleryIds: parseIds(item.relatedGalleryIds),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  }));
}

export type LocationPayload = Partial<LocationRecord>;

function toApiPayload(location: LocationPayload) {
  return {
    name: location.name,
    city: location.city,
    country: location.country,
    latitude: location.latitude,
    longitude: location.longitude,
    description: location.description,
    coverImage: location.coverImage,
    relatedArticleIds: location.relatedArticleIds ?? [],
    relatedMomentIds: location.relatedMomentIds ?? [],
    relatedGalleryIds: location.relatedGalleryIds ?? []
  };
}

export async function createLocation(location: LocationPayload) {
  const id = location.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "locations",
    method: "POST",
    endpoint: "/locations",
    data: { ...toApiPayload(location), id, updatedAt: new Date().toISOString() }
  });
}

export async function updateLocation(id: string, location: LocationPayload) {
  return queueAndSync({
    entity: "locations",
    method: "PUT",
    endpoint: `/locations/${id}`,
    data: { ...toApiPayload(location), id, updatedAt: new Date().toISOString() }
  });
}

export async function deleteLocation(id: string) {
  await queueAndSync({
    entity: "locations",
    method: "DELETE",
    endpoint: `/locations/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateLocationMutation() {
  return useMutation({ mutationFn: createLocation });
}

export function useUpdateLocationMutation() {
  return useMutation({
    mutationFn: ({ id, location }: { id: string; location: LocationPayload }) => updateLocation(id, location)
  });
}

export function useDeleteLocationMutation() {
  return useMutation({ mutationFn: deleteLocation });
}
