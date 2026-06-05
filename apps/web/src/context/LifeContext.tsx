import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicAlbums } from "../api/public/albums";
import { fetchPublicArticles } from "../api/public/articles";
import { fetchPublicMoments } from "../api/public/moments";
import { fetchPublicSettings } from "../api/public/settings";
import { fetchCategories } from "../api/categories";
import { fetchInspirations } from "../api/inspirations";
import { fetchLocations } from "../api/locations";
import { fetchMemoryCapsules } from "../api/memoryCapsules";
import { fetchMoods } from "../api/moods";
import { fetchTags } from "../api/tags";
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

interface LifeContextValue {
  settings: SiteSettings;
  articles: Article[];
  thoughts: Thought[];
  galleryEvents: GalleryEvent[];
  capsules: MemoryCapsule[];
  moodEntries: MoodEntry[];
  locations: LocationRecord[];
  inspirations: InspirationItem[];
  categories: Category[];
  tags: Tag[];
  notes: Note[];
  setNotes: Dispatch<SetStateAction<Note[]>>;
  tasks: LifeTask[];
  setTasks: Dispatch<SetStateAction<LifeTask[]>>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const LifeContext = createContext<LifeContextValue | null>(null);

const fallbackSettings: SiteSettings = {
  siteName: "Life Museum",
  siteDescription: "",
  homeWelcome: "",
  authorNickname: "",
  theme: "sunny"
};

export function LifeProvider({ children }: { children: ReactNode }) {
  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: fetchPublicSettings });
  const articlesQuery = useQuery({ queryKey: ["articles"], queryFn: fetchPublicArticles });
  const thoughtsQuery = useQuery({ queryKey: ["moments"], queryFn: fetchPublicMoments });
  const galleryEventsQuery = useQuery({ queryKey: ["albums"], queryFn: fetchPublicAlbums });
  const capsulesQuery = useQuery({ queryKey: ["capsules"], queryFn: fetchMemoryCapsules });
  const moodsQuery = useQuery({ queryKey: ["moods"], queryFn: fetchMoods });
  const locationsQuery = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });
  const inspirationsQuery = useQuery({ queryKey: ["inspirations"], queryFn: fetchInspirations });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  const queries = [
    settingsQuery,
    articlesQuery,
    thoughtsQuery,
    galleryEventsQuery,
    capsulesQuery,
    moodsQuery,
    locationsQuery,
    inspirationsQuery,
    categoriesQuery,
    tagsQuery
  ];
  const isLoading = queries.some((query) => query.isLoading);
  const error = queries.find((query) => query.error)?.error ?? null;
  const noopSetter = useCallback(() => undefined, []);

  return (
    <LifeContext.Provider
      value={{
        settings: settingsQuery.data ?? fallbackSettings,
        articles: articlesQuery.data ?? [],
        thoughts: thoughtsQuery.data ?? [],
        galleryEvents: galleryEventsQuery.data ?? [],
        capsules: capsulesQuery.data ?? [],
        moodEntries: moodsQuery.data ?? [],
        locations: locationsQuery.data ?? [],
        inspirations: inspirationsQuery.data ?? [],
        categories: categoriesQuery.data ?? [],
        tags: tagsQuery.data ?? [],
        notes: [],
        setNotes: noopSetter,
        tasks: [],
        setTasks: noopSetter,
        isLoading,
        isError: Boolean(error),
        error
      }}
    >
      {children}
    </LifeContext.Provider>
  );
}

export function useLife() {
  const context = useContext(LifeContext);
  if (!context) {
    throw new Error("useLife must be used inside LifeProvider");
  }
  return context;
}
