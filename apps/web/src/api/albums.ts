import { GalleryEvent, GalleryImage } from "../types";
import { apiClient } from "./client";
import { resolveMediaUrl } from "./media";
import { queueAndSync, queueUploadAndSync } from "./sync";
import { useMutation } from "@tanstack/react-query";

type ApiAlbum = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  categoryId?: string;
  tagIds?: string[];
  photos?: ApiAlbumPhoto[];
};

type ApiAlbumPhoto = {
  id: string;
  albumId?: string;
  album_id?: string;
  imageUrl?: string;
  image_url?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchAlbums(): Promise<GalleryEvent[]> {
  const { data: albums } = await apiClient.get<ApiAlbum[]>("/albums");

  return albums.map((album) => {
    const imageDetails = (album.photos ?? []).map<GalleryImage>((photo) => ({
      id: photo.id,
      imageUrl: resolveMediaUrl(photo.imageUrl ?? photo.image_url),
      description: photo.description ?? "",
      createdAt: photo.createdAt ?? new Date().toISOString(),
      updatedAt: photo.updatedAt
    })).filter((photo) => photo.imageUrl);
    const images = imageDetails.map((photo) => photo.imageUrl);
    return {
      id: album.id,
      name: album.name ?? album.title ?? "",
      description: album.description ?? "",
      date: album.createdAt ?? new Date().toISOString(),
      cover: images[0] ?? "",
      images,
      imageDetails,
      linkedArticleIds: [],
      categoryId: album.categoryId ?? "",
      tagIds: album.tagIds ?? [],
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    };
  });
}

export type AlbumPayload = Partial<GalleryEvent> & {
  title?: string;
};

function toApiPayload(album: AlbumPayload) {
  return {
    title: album.title ?? album.name,
    description: album.description
  };
}

export async function createAlbum(album: AlbumPayload) {
  const id = album.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "albums",
    method: "POST",
    endpoint: "/albums",
    data: { ...toApiPayload(album), id, updatedAt: new Date().toISOString() }
  });
}

export async function updateAlbum(id: string, album: AlbumPayload) {
  return queueAndSync({
    entity: "albums",
    method: "PUT",
    endpoint: `/albums/${id}`,
    data: { ...toApiPayload(album), id, updatedAt: new Date().toISOString() }
  });
}

export async function deleteAlbum(id: string) {
  await queueAndSync({
    entity: "albums",
    method: "DELETE",
    endpoint: `/albums/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export async function fetchAlbumPhotos(albumId: string) {
  const { data } = await apiClient.get<GalleryImage[]>(`/albums/${albumId}/photos`);
  return data;
}

export async function uploadAlbumPhotos(albumId: string, files: File[], description = "") {
  return queueUploadAndSync({
    entity: "album_photos",
    endpoint: `/albums/${albumId}/photos`,
    fieldName: "images",
    files: files.map((file) => ({ name: file.name, type: file.type, blob: file })),
    extraFields: { description }
  });
}

export async function uploadAlbumPhoto(albumId: string, file: File, description = "") {
  return uploadAlbumPhotos(albumId, [file], description);
}

export async function updateAlbumPhoto(albumId: string, id: string, description: string) {
  return queueAndSync({
    entity: "album_photos",
    method: "PUT",
    endpoint: `/albums/${albumId}/photos/${id}`,
    data: { id, albumId, description, updatedAt: new Date().toISOString() }
  });
}

export async function deleteAlbumPhoto(albumId: string, id: string) {
  await queueAndSync({
    entity: "album_photos",
    method: "DELETE",
    endpoint: `/albums/${albumId}/photos/${id}`,
    data: { id, albumId, updatedAt: new Date().toISOString() }
  });
}

export function useCreateAlbumMutation() {
  return useMutation({ mutationFn: createAlbum });
}

export function useUpdateAlbumMutation() {
  return useMutation({ mutationFn: ({ id, album }: { id: string; album: AlbumPayload }) => updateAlbum(id, album) });
}

export function useDeleteAlbumMutation() {
  return useMutation({ mutationFn: deleteAlbum });
}

export function useUploadAlbumPhotosMutation(albumId: string) {
  return useMutation({
    mutationFn: ({ files, description }: { files: File[]; description?: string }) => uploadAlbumPhotos(albumId, files, description)
  });
}

export function useUpdateAlbumPhotoMutation(albumId: string) {
  return useMutation({
    mutationFn: ({ id, description }: { id: string; description: string }) => updateAlbumPhoto(albumId, id, description)
  });
}

export function useDeleteAlbumPhotoMutation(albumId: string) {
  return useMutation({
    mutationFn: (id: string) => deleteAlbumPhoto(albumId, id)
  });
}
