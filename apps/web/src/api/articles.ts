import { Article } from "../types";
import { apiClient } from "./client";
import { resolveMediaUrl } from "./media";
import { queueAndSync } from "./sync";
import { useMutation } from "@tanstack/react-query";

type ApiArticle = {
  id: string;
  title: string;
  content?: string;
  body?: string;
  summary?: string | null;
  coverUrl?: string | null;
  cover_url?: string | null;
  categoryId?: string;
  tagIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchArticles(): Promise<Article[]> {
  const { data } = await apiClient.get<ApiArticle[]>("/articles");
  return data.map((item) => {
    const body = item.body ?? item.content ?? "";
    return {
      id: item.id,
      title: item.title,
      body,
      categoryId: item.categoryId ?? "",
      tagIds: item.tagIds ?? [],
      cover: resolveMediaUrl(item.coverUrl ?? item.cover_url),
      createdAt: item.createdAt ?? new Date().toISOString(),
      updatedAt: item.updatedAt,
      readMinutes: Math.max(1, Math.ceil(body.length / 450))
    };
  });
}

export async function fetchArticle(id: string): Promise<Article> {
  const { data: item } = await apiClient.get<ApiArticle>(`/articles/${id}`);
  const body = item.body ?? item.content ?? "";
  return {
    id: item.id,
    title: item.title,
    body,
    categoryId: item.categoryId ?? "",
    tagIds: item.tagIds ?? [],
    cover: resolveMediaUrl(item.coverUrl ?? item.cover_url),
    createdAt: item.createdAt ?? new Date().toISOString(),
    updatedAt: item.updatedAt,
    readMinutes: Math.max(1, Math.ceil(body.length / 450))
  };
}

export type ArticlePayload = Partial<Article> & {
  content?: string;
  coverUrl?: string;
};

function toApiPayload(article: ArticlePayload) {
  return {
    title: article.title,
    content: article.content ?? article.body,
    summary: undefined,
    coverUrl: article.coverUrl ?? article.cover
  };
}

export async function createArticle(article: ArticlePayload) {
  const id = article.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "articles",
    method: "POST",
    endpoint: "/articles",
    data: { ...toApiPayload(article), id, updatedAt: new Date().toISOString() }
  });
}

export async function updateArticle(id: string, article: ArticlePayload) {
  return queueAndSync({
    entity: "articles",
    method: "PUT",
    endpoint: `/articles/${id}`,
    data: { ...toApiPayload(article), id, updatedAt: new Date().toISOString() }
  });
}

export async function deleteArticle(id: string) {
  await queueAndSync({
    entity: "articles",
    method: "DELETE",
    endpoint: `/articles/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateArticleMutation() {
  return useMutation({ mutationFn: createArticle });
}

export function useUpdateArticleMutation() {
  return useMutation({ mutationFn: ({ id, article }: { id: string; article: ArticlePayload }) => updateArticle(id, article) });
}

export function useDeleteArticleMutation() {
  return useMutation({ mutationFn: deleteArticle });
}
