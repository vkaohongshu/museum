import { GalleryEvent, MoodEntry, Tag } from "../types";

export function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<T, number>>((result, item) => {
    result[item] = (result[item] ?? 0) + 1;
    return result;
  }, {} as Record<T, number>);
}

export function topEntry<T extends string>(items: T[]) {
  const counts = countBy(items);
  return Object.entries(counts).sort((a, b) => Number(b[1]) - Number(a[1]))[0]?.[0] ?? "暂无";
}

export function keywordsFromTags(tags: Tag[], tagIds: string[], fallback: string[] = []) {
  const names = tagIds.map((id) => tags.find((tag) => tag.id === id)?.name).filter(Boolean) as string[];
  return Array.from(new Set([...names, ...fallback])).slice(0, 12);
}

export function imageCount(galleries: GalleryEvent[]) {
  return galleries.reduce((sum, event) => sum + event.images.length, 0);
}

export function moodSummary(entries: MoodEntry[]) {
  return countBy(entries.map((entry) => entry.mood));
}
