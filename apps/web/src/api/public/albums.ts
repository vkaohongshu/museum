import { GalleryEvent, GalleryImage } from "../../types";
import { apiClient } from "../client";

type ApiAlbumPhoto = {
  id: string;
  imageUrl?: string;
  image_url?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ApiAlbum = {
  id: string;
  title?: string;
  name?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  photos?: ApiAlbumPhoto[];
};

export async function fetchPublicAlbums(): Promise<GalleryEvent[]> {
  const { data: albums } = await apiClient.get<ApiAlbum[]>("/public/albums");
  return albums.map((album) => {
    const imageDetails = (album.photos ?? []).map<GalleryImage>((photo) => ({
      id: photo.id,
      imageUrl: photo.imageUrl ?? photo.image_url ?? "",
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
      categoryId: "",
      tagIds: [],
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    };
  });
}
