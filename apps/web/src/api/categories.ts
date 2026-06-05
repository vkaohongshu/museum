import { Category } from "../types";
import { apiClient } from "./client";
import { queryClient } from "./queryClient";
import { queueAndSync } from "./sync";
import { useMutation } from "@tanstack/react-query";

const colors = ["#ffb84d", "#5aa9ff", "#35c88a", "#ff7b72", "#9b8cff", "#f2c94c"];

type ApiCategory = {
  id: string;
  name: string;
  color?: string;
  description?: string | null;
};

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<ApiCategory[]>("/categories");
  return data.map((item, index) => ({
    id: item.id,
    name: item.name,
    color: item.color ?? colors[index % colors.length],
    description: item.description ?? ""
  }));
}

export type CategoryPayload = Partial<Category>;

export async function createCategory(category: CategoryPayload) {
  const id = category.id ?? crypto.randomUUID();
  return queueAndSync({
    entity: "categories",
    method: "POST",
    endpoint: "/categories",
    data: { id, name: category.name, description: category.description, color: category.color, updatedAt: new Date().toISOString() }
  });
}

export async function updateCategory(id: string, category: CategoryPayload) {
  return queueAndSync({
    entity: "categories",
    method: "PUT",
    endpoint: `/categories/${id}`,
    data: { id, name: category.name, description: category.description, color: category.color, updatedAt: new Date().toISOString() }
  });
}

export async function deleteCategory(id: string) {
  await queueAndSync({
    entity: "categories",
    method: "DELETE",
    endpoint: `/categories/${id}`,
    data: { id, updatedAt: new Date().toISOString() }
  });
}

export function useCreateCategoryMutation() {
  return useMutation({ mutationFn: createCategory, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["categories"] }) });
}

export function useUpdateCategoryMutation() {
  return useMutation({ mutationFn: ({ id, category }: { id: string; category: CategoryPayload }) => updateCategory(id, category), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["categories"] }) });
}

export function useDeleteCategoryMutation() {
  return useMutation({ mutationFn: deleteCategory, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["categories"] }) });
}
