import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicAlbums } from "../api/public/albums";
import { fetchPublicArticles } from "../api/public/articles";
import { fetchPublicMoments } from "../api/public/moments";
import { fetchPublicSettings } from "../api/public/settings";
import { fetchCategories } from "../api/categories";
import { fetchMemoryCapsules } from "../api/memoryCapsules";
import { fetchTags } from "../api/tags";
import { lifeStore } from "../data/store";
import { useLocalState } from "../hooks/useLocalState";
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
  setSettings: Dispatch<SetStateAction<SiteSettings>>;
  articles: Article[];
  setArticles: Dispatch<SetStateAction<Article[]>>;
  thoughts: Thought[];
  setThoughts: Dispatch<SetStateAction<Thought[]>>;
  galleryEvents: GalleryEvent[];
  setGalleryEvents: Dispatch<SetStateAction<GalleryEvent[]>>;
  capsules: MemoryCapsule[];
  setCapsules: Dispatch<SetStateAction<MemoryCapsule[]>>;
  moodEntries: MoodEntry[];
  setMoodEntries: Dispatch<SetStateAction<MoodEntry[]>>;
  locations: LocationRecord[];
  setLocations: Dispatch<SetStateAction<LocationRecord[]>>;
  inspirations: InspirationItem[];
  setInspirations: Dispatch<SetStateAction<InspirationItem[]>>;
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  tags: Tag[];
  setTags: Dispatch<SetStateAction<Tag[]>>;
  notes: Note[];
  setNotes: Dispatch<SetStateAction<Note[]>>;
  tasks: LifeTask[];
  setTasks: Dispatch<SetStateAction<LifeTask[]>>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

const LifeContext = createContext<LifeContextValue | null>(null);

export function LifeProvider({ children }: { children: ReactNode }) {
  const settingsQuery = useQuery({ queryKey: ["settings"], queryFn: fetchPublicSettings });
  const articlesQuery = useQuery({ queryKey: ["articles"], queryFn: fetchPublicArticles });
  const thoughtsQuery = useQuery({ queryKey: ["moments"], queryFn: fetchPublicMoments });
  const galleryEventsQuery = useQuery({ queryKey: ["albums"], queryFn: fetchPublicAlbums });
  const capsulesQuery = useQuery({ queryKey: ["memory-capsules"], queryFn: fetchMemoryCapsules });
  const categoriesQuery = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  const [settings, setSettings] = useLocalState(lifeStore.getSettings, lifeStore.setSettings);
  const [articles, setArticles] = useLocalState(lifeStore.getArticles, lifeStore.setArticles);
  const [thoughts, setThoughts] = useLocalState(lifeStore.getThoughts, lifeStore.setThoughts);
  const [galleryEvents, setGalleryEvents] = useLocalState(lifeStore.getGalleryEvents, lifeStore.setGalleryEvents);
  const [capsules, setCapsules] = useLocalState(lifeStore.getCapsules, lifeStore.setCapsules);
  const [moodEntries, setMoodEntries] = useLocalState(lifeStore.getMoodEntries, lifeStore.setMoodEntries);
  const [locations, setLocations] = useLocalState(lifeStore.getLocations, lifeStore.setLocations);
  const [inspirations, setInspirations] = useLocalState(lifeStore.getInspirations, lifeStore.setInspirations);
  const [categories, setCategories] = useLocalState(lifeStore.getCategories, lifeStore.setCategories);
  const [tags, setTags] = useLocalState(lifeStore.getTags, lifeStore.setTags);
  const [notes, setNotes] = useLocalState(lifeStore.getNotes, lifeStore.setNotes);
  const [tasks, setTasks] = useLocalState(lifeStore.getTasks, lifeStore.setTasks);
  const queries = [settingsQuery, articlesQuery, thoughtsQuery, galleryEventsQuery, capsulesQuery, categoriesQuery, tagsQuery];
  const isLoading = queries.some((query) => query.isLoading);
  const error = queries.find((query) => query.error)?.error ?? null;

  useEffect(() => {
    if (settingsQuery.data) setSettings(settingsQuery.data);
  }, [settingsQuery.data, setSettings]);

  useEffect(() => {
    if (articlesQuery.data) setArticles(articlesQuery.data);
  }, [articlesQuery.data, setArticles]);

  useEffect(() => {
    if (thoughtsQuery.data) setThoughts(thoughtsQuery.data);
  }, [thoughtsQuery.data, setThoughts]);

  useEffect(() => {
    if (galleryEventsQuery.data) setGalleryEvents(galleryEventsQuery.data);
  }, [galleryEventsQuery.data, setGalleryEvents]);

  useEffect(() => {
    if (capsulesQuery.data) setCapsules(capsulesQuery.data);
  }, [capsulesQuery.data, setCapsules]);

  useEffect(() => {
    if (categoriesQuery.data) setCategories(categoriesQuery.data);
  }, [categoriesQuery.data, setCategories]);

  useEffect(() => {
    if (tagsQuery.data) setTags(tagsQuery.data);
  }, [tagsQuery.data, setTags]);

  return (
    <LifeContext.Provider
      value={{
        settings,
        setSettings,
        articles,
        setArticles,
        thoughts,
        setThoughts,
        galleryEvents,
        setGalleryEvents,
        capsules,
        setCapsules,
        moodEntries,
        setMoodEntries,
        locations,
        setLocations,
        inspirations,
        setInspirations,
        categories,
        setCategories,
        tags,
        setTags,
        notes,
        setNotes,
        tasks,
        setTasks,
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
