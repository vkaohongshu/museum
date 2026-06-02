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

export type SyncEntityName =
  | "articles"
  | "moments"
  | "albums"
  | "album_photos"
  | "categories"
  | "tags"
  | "memory_capsules"
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
