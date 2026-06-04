import { GalleryEvent, MoodEntry, Tag } from "../types";
import type { MemoryJarItem } from "../components/memory/MemoryJar";

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

const memoryThemes = [
  { pattern: /学习|成长|课程|知识|工作/, color: "#a891f5", icon: "📖" },
  { pattern: /旅行|城市|路|远方|山|海/, color: "#90ddb0", icon: "✈️" },
  { pattern: /阅读|书|文章|写作/, color: "#f5d86f", icon: "📚" },
  { pattern: /摄影|照片|相册|图片|影像/, color: "#f7b36f", icon: "📷" },
  { pattern: /音乐|歌|演出/, color: "#f58bb0", icon: "🎵" },
  { pattern: /电影|剧|观影/, color: "#89bef5", icon: "🎞️" },
  { pattern: /美食|饭|咖啡|甜点|餐/, color: "#f47f9d", icon: "🍴" },
  { pattern: /运动|健身|跑步|身体/, color: "#86c2f4", icon: "🏃" },
  { pattern: /游戏|玩/, color: "#9bdcab", icon: "🎮" },
  { pattern: /思考|灵感|想法/, color: "#f6d36c", icon: "💡" }
];

export function memoryStyleForName(name: string, fallbackColor = "#a891f5") {
  const theme = memoryThemes.find((item) => item.pattern.test(name));
  return {
    color: theme?.color ?? fallbackColor,
    icon: theme?.icon ?? "✨"
  };
}

export function memoryItemsFromTags(tags: Tag[], usage = new Map<string, number>()) {
  return tags
    .map((tag) => {
      const style = memoryStyleForName(tag.name, tag.color);
      return {
        id: tag.id,
        name: tag.name,
        count: usage.get(tag.id) ?? tag.usageCount ?? 0,
        color: style.color,
        icon: style.icon
      };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

export function memoryItemsFromTagIds(tags: Tag[], tagIds: string[], fallback: string[] = [], limit = 15): MemoryJarItem[] {
  const counts = new Map<string, number>();
  tagIds.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));

  const items = tags
    .filter((tag) => counts.has(tag.id))
    .map((tag) => {
      const style = memoryStyleForName(tag.name, tag.color);
      return {
        id: tag.id,
        name: tag.name,
        count: counts.get(tag.id) ?? 0,
        color: style.color,
        icon: style.icon
      };
    });

  fallback.forEach((name) => {
    if (items.some((item) => item.name === name)) return;
    const style = memoryStyleForName(name);
    items.push({
      id: `fallback-${name}`,
      name,
      count: 8,
      color: style.color,
      icon: style.icon
    });
  });

  return items.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN")).slice(0, limit);
}

export function imageCount(galleries: GalleryEvent[]) {
  return galleries.reduce((sum, event) => sum + event.images.length, 0);
}

export function moodSummary(entries: MoodEntry[]) {
  return countBy(entries.map((entry) => entry.mood));
}
