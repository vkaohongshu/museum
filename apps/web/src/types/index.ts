export type ThemeName = "sunny" | "forest" | "ocean" | "sakura" | "coffee";

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  homeWelcome: string;
  authorNickname: string;
  theme: ThemeName;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount?: number;
}

export interface RelatedItems {
  relatedItems?: string[];
  relatedArticleIds?: string[];
  relatedMomentIds?: string[];
  relatedGalleryIds?: string[];
}

export interface Article extends RelatedItems {
  id: string;
  title: string;
  body: string;
  categoryId: string;
  tagIds: string[];
  cover: string;
  createdAt: string;
  updatedAt?: string;
  readMinutes?: number;
}

export interface Thought extends RelatedItems {
  id: string;
  content: string;
  images: string[];
  categoryId: string;
  tagIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface GalleryEvent extends RelatedItems {
  id: string;
  name: string;
  description: string;
  date: string;
  cover: string;
  images: string[];
  imageDetails?: GalleryImage[];
  location?: string;
  categoryId: string;
  tagIds: string[];
  linkedArticleIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: "sun" | "mint" | "sky" | "rose";
  createdAt: string;
  updatedAt?: string;
}

export interface LifeTask {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  status: "todo" | "doing" | "done";
  createdAt?: string;
  updatedAt?: string;
}

export interface MemoryCapsule extends RelatedItems {
  id: string;
  title: string;
  body: string;
  date: string;
  mood: string;
  image?: string;
  categoryId: string;
  tagIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type MoodName =
  | "\u5f00\u5fc3"
  | "\u5e73\u9759"
  | "\u75b2\u60eb"
  | "\u7126\u8651"
  | "\u5174\u594b"
  | "\u4f4e\u843d";

export type WeatherName =
  | "\u6674\u5929"
  | "\u591a\u4e91"
  | "\u4e0b\u96e8"
  | "\u4e0b\u96ea"
  | "\u9634\u5929";

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodName;
  weather: WeatherName;
  note: string;
  relatedArticleIds: string[];
  relatedMomentIds: string[];
  relatedGalleryIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationRecord {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  description: string;
  coverImage: string;
  relatedArticleIds: string[];
  relatedMomentIds: string[];
  relatedGalleryIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type InspirationType =
  | "\u60f3\u5199"
  | "\u60f3\u53bb"
  | "\u60f3\u505a"
  | "\u60f3\u770b"
  | "\u60f3\u4e70"
  | "\u5176\u4ed6";

export type InspirationStatus =
  | "\u5f85\u5b9e\u73b0"
  | "\u5df2\u5b9e\u73b0"
  | "\u6682\u4e0d\u8003\u8651";

export interface InspirationItem {
  id: string;
  title: string;
  content: string;
  type: InspirationType;
  status: InspirationStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineItem {
  id: string;
  type: "article" | "thought" | "gallery";
  title: string;
  description: string;
  date: string;
  categoryId: string;
  tagIds: string[];
  path: string;
}
