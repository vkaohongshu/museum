import { Category, Tag } from "../types";

export function categoryById(categories: Category[], id: string) {
  return categories.find((category) => category.id === id);
}

export function tagsByIds(tags: Tag[], ids: string[]) {
  return ids.map((id) => tags.find((tag) => tag.id === id)).filter(Boolean) as Tag[];
}

export function slugifyName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "");
}
