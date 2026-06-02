export const entityConfigs = {
  articles: {
    table: "articles",
    writable: ["title", "content", "summary", "cover_url"],
    required: ["title", "content"],
    userScoped: true
  },
  moments: {
    table: "moments",
    writable: ["content", "image_url"],
    required: ["content"],
    userScoped: true
  },
  albums: {
    table: "albums",
    writable: ["title", "description"],
    required: ["title"],
    userScoped: true
  },
  albumPhotos: {
    table: "album_photos",
    writable: ["album_id", "image_url", "description", "metadata"],
    required: ["album_id", "image_url"],
    userScoped: true
  },
  categories: {
    table: "categories",
    writable: ["name", "description"],
    required: ["name"],
    userScoped: true
  },
  tags: {
    table: "tags",
    writable: ["name", "usage_count"],
    required: ["name"],
    userScoped: true
  },
  memoryCapsules: {
    table: "memory_capsules",
    writable: ["title", "content", "date", "mood"],
    required: ["title", "content", "date"],
    userScoped: true
  },
  settings: {
    table: "settings",
    writable: ["key", "value"],
    required: ["key", "value"],
    userScoped: true
  },
  inspirations: {
    table: "inspirations",
    writable: ["title", "content", "type", "status", "tags"],
    required: ["title", "content"],
    userScoped: true
  },
  moodRecords: {
    table: "mood_records",
    writable: ["date", "mood", "weather", "note", "related_article_ids", "related_moment_ids", "related_gallery_ids"],
    required: ["date", "mood"],
    userScoped: true
  },
  locations: {
    table: "locations",
    writable: ["name", "city", "country", "latitude", "longitude", "description", "cover_image", "related_article_ids", "related_moment_ids", "related_gallery_ids"],
    required: ["name"],
    userScoped: true
  }
} as const;

export type EntityKey = keyof typeof entityConfigs;

export function toSnake(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`), value])
  );
}

export function toCamel(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase()), value])
  );
}
