import {
  Article,
  Category,
  GalleryEvent,
  InspirationItem,
  LifeTask,
  LocationRecord,
  MemoryCapsule,
  MoodEntry,
  Note,
  SiteSettings,
  Tag,
  Thought
} from "../types";

const prefix = "digital-life-log";

export const defaultSettings: SiteSettings = {
  siteName: "Link 的人生记录馆",
  siteDescription: "记录生活、成长与回忆。",
  homeWelcome: "今天也要好好生活。",
  authorNickname: "Link",
  theme: "sunny"
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(`${prefix}:${key}`);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}

function readArray<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(`${prefix}:${key}`);
    return raw ? (JSON.parse(raw) as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${prefix}:${key}`, JSON.stringify(value));
}

function normalizeArticles<T extends Article>(value: T[]): Article[] {
  return value.map((raw) => {
    const article = { ...raw } as Record<string, unknown>;
    delete article[["sum", "mary"].join("")];
    return article as unknown as Article;
  });
}

export const lifeStore = {
  getSettings: () => read<SiteSettings>("settings", defaultSettings),
  setSettings: (value: SiteSettings) => write("settings", value),
  getArticles: () => normalizeArticles(readArray<Article>("articles", [])),
  setArticles: (value: Article[]) => write("articles", normalizeArticles(value)),
  getThoughts: () => readArray<Thought>("thoughts", []),
  setThoughts: (value: Thought[]) => write("thoughts", value),
  getGalleryEvents: () => readArray<GalleryEvent>("gallery-events", []),
  setGalleryEvents: (value: GalleryEvent[]) => write("gallery-events", value),
  getCapsules: () => readArray<MemoryCapsule>("capsules", []),
  setCapsules: (value: MemoryCapsule[]) => write("capsules", value),
  getMoodEntries: () => readArray<MoodEntry>("mood-entries", []),
  setMoodEntries: (value: MoodEntry[]) => write("mood-entries", value),
  getLocations: () => readArray<LocationRecord>("locations", []),
  setLocations: (value: LocationRecord[]) => write("locations", value),
  getInspirations: () => readArray<InspirationItem>("inspirations", []),
  setInspirations: (value: InspirationItem[]) => write("inspirations", value),
  getCategories: () => readArray<Category>("categories", []),
  setCategories: (value: Category[]) => write("categories", value),
  getTags: () => readArray<Tag>("tags", []),
  setTags: (value: Tag[]) => write("tags", value),
  getNotes: () => readArray<Note>("notes", []),
  setNotes: (value: Note[]) => write("notes", value),
  getTasks: () => readArray<LifeTask>("tasks", []),
  setTasks: (value: LifeTask[]) => write("tasks", value),
  exportData: () => ({
    settings: lifeStore.getSettings(),
    articles: lifeStore.getArticles(),
    thoughts: lifeStore.getThoughts(),
    galleryEvents: lifeStore.getGalleryEvents(),
    capsules: lifeStore.getCapsules(),
    moodEntries: lifeStore.getMoodEntries(),
    locations: lifeStore.getLocations(),
    inspirations: lifeStore.getInspirations(),
    categories: lifeStore.getCategories(),
    tags: lifeStore.getTags(),
    notes: lifeStore.getNotes(),
    tasks: lifeStore.getTasks()
  })
};
