import { Article } from "../../types";
import { apiClient } from "../client";

type ApiArticle = {
  id: string;
  title: string;
  content?: string;
  body?: string;
  coverUrl?: string | null;
  cover_url?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchPublicArticles(): Promise<Article[]> {
  const { data } = await apiClient.get<ApiArticle[]>("/public/articles");
  return data.map((item) => {
    const body = item.body ?? item.content ?? "";
    return {
      id: item.id,
      title: item.title,
      body,
      categoryId: "",
      tagIds: [],
      cover: item.coverUrl ?? item.cover_url ?? "",
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt,
      readMinutes: Math.max(1, Math.ceil(body.length / 450))
    };
  });
}
