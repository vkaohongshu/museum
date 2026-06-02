import { Thought } from "../../types";
import { apiClient } from "../client";

type ApiMoment = {
  id: string;
  content: string;
  imageUrl?: string | null;
  image_url?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchPublicMoments(): Promise<Thought[]> {
  const { data } = await apiClient.get<ApiMoment[]>("/public/moments");
  return data.map((item) => {
    const image = item.imageUrl ?? item.image_url;
    return {
      id: item.id,
      content: item.content,
      images: image ? [image] : [],
      categoryId: "",
      tagIds: [],
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt,
      relatedItems: []
    };
  });
}
