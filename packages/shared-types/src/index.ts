export type ID = string;

export interface Timestamped {
  createdAt: string;
  updatedAt?: string;
}

export interface Article extends Timestamped {
  id: ID;
  title: string;
  content: string;
  summary?: string | null;
  coverUrl?: string | null;
}

export interface Tag extends Timestamped {
  id: ID;
  name: string;
  color?: string | null;
  usageCount: number;
}

export interface Moment extends Timestamped {
  id: ID;
  content: string;
  imageUrl?: string | null;
  tags: Tag[];
}

export interface Album extends Timestamped {
  id: ID;
  title: string;
  description?: string | null;
  photos?: AlbumPhoto[];
}

export interface AlbumPhoto extends Timestamped {
  id: ID;
  albumId: ID;
  imageUrl: string;
  description?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface Category extends Timestamped {
  id: ID;
  name: string;
  color?: string | null;
  description?: string | null;
}

export interface MemoryCapsule extends Timestamped {
  id: ID;
  title: string;
  content: string;
  date: string;
  mood?: string | null;
}

export interface Setting extends Timestamped {
  id: ID;
  key: string;
  value: unknown;
}

export interface Inspiration extends Timestamped {
  id: ID;
  title: string;
  content: string;
  type?: string | null;
  status?: string | null;
  tags?: string[] | null;
}

export interface MoodRecord extends Timestamped {
  id: ID;
  date: string;
  mood: string;
  weather?: string | null;
  note?: string | null;
  relatedArticleIds?: string[] | null;
  relatedMomentIds?: string[] | null;
  relatedGalleryIds?: string[] | null;
}

export interface LocationRecord extends Timestamped {
  id: ID;
  name: string;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  coverImage?: string | null;
  relatedArticleIds?: string[] | null;
  relatedMomentIds?: string[] | null;
  relatedGalleryIds?: string[] | null;
}

export type SyncEntityName =
  | "articles"
  | "moments"
  | "albums"
  | "album_photos"
  | "categories"
  | "tags"
  | "memory_capsules"
  | "inspirations"
  | "moodRecords"
  | "locations"
  | "settings";

export interface SyncPullResponse {
  serverTime: string;
  articles: Article[];
  moments: Moment[];
  albums: Album[];
  albumPhotos: AlbumPhoto[];
  categories: Category[];
  tags: Tag[];
  memoryCapsules: MemoryCapsule[];
  inspirations: Inspiration[];
  moodRecords: MoodRecord[];
  locations: LocationRecord[];
  settings: Setting[];
}

export interface SyncMutation<T = Record<string, unknown>> {
  entity: SyncEntityName;
  method?: "POST" | "PUT" | "DELETE";
  endpoint?: string;
  timestamp?: string;
  data: T & { id?: ID; updatedAt?: string };
}

export interface UploadResponse {
  url: string;
  key: string;
  bucket: string;
  contentType: string;
}
