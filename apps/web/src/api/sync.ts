import { useMutation, useQuery } from "@tanstack/react-query";
import { SyncEntityName } from "@life-museum/shared-types";
import { apiClient } from "./client";
import {
  enqueueMutation,
  enqueueUpload,
  listPendingMutations,
  listPendingUploads,
  PendingMutation,
  PendingUpload,
  removePendingMutation,
  removePendingUpload,
  updatePendingMutation,
  updatePendingUpload
} from "./offlineStore";
import { queryClient } from "./queryClient";

export type SyncState = {
  pending: number;
  syncing: number;
  error: number;
};

const queryKeysByEntity: Record<SyncEntityName, string[]> = {
  articles: ["articles"],
  moments: ["moments"],
  albums: ["albums"],
  album_photos: ["albums"],
  categories: ["categories"],
  tags: ["tags"],
  memory_capsules: ["capsules"],
  inspirations: ["inspirations"],
  moodRecords: ["moods"],
  locations: ["locations"],
  settings: ["settings"]
};

async function invalidateChangedEntities(entities: Iterable<SyncEntityName>) {
  const queryKeys = new Set(Array.from(entities).flatMap((entity) => queryKeysByEntity[entity]));
  await Promise.all(Array.from(queryKeys, (queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })));
}

async function pushPendingChangesOnce() {
  if (!navigator.onLine) return { skipped: true, reason: "offline" };

  const uploads = await listPendingUploads();
  const changedEntities = new Set<SyncEntityName>();
  for (const upload of uploads.filter((item) => item.status !== "synced")) {
    await syncUpload(upload);
    if (upload.entity) changedEntities.add(upload.entity);
  }

  const mutations = await listPendingMutations();
  const pending = mutations.filter((item) => item.status !== "synced");
  if (pending.length > 0) {
    pending.forEach((item) => void updatePendingMutation({ ...item, status: "syncing" }));
    try {
      await apiClient.post("/sync/push", { mutations: pending });
      await Promise.all(pending.map((item) => removePendingMutation(item.id)));
      pending.forEach((item) => changedEntities.add(item.entity));
    } catch (error) {
      await Promise.all(pending.map((item) => updatePendingMutation({ ...item, status: "error", error: error instanceof Error ? error.message : "Sync failed" })));
      throw error;
    }
  }

  await invalidateChangedEntities(changedEntities);
  await queryClient.invalidateQueries({ queryKey: ["sync-status"] });

  return { skipped: false, synced: pending.length + uploads.length };
}

let pushQueue: Promise<unknown> = Promise.resolve();

export function pushPendingChanges() {
  const push = pushQueue.then(() => pushPendingChangesOnce());
  pushQueue = push.catch(() => undefined);
  return push;
}

async function syncUpload(upload: PendingUpload) {
  const syncing = { ...upload, status: "syncing" as const };
  await updatePendingUpload(syncing);
  const formData = new FormData();
  upload.files.forEach((file) => formData.append(upload.fieldName, file.blob, file.name));
  Object.entries(upload.extraFields ?? {}).forEach(([key, value]) => formData.append(key, value));
  try {
    await apiClient.post(upload.endpoint, formData, { headers: { "Content-Type": "multipart/form-data" } });
    await removePendingUpload(upload.id);
  } catch (error) {
    await updatePendingUpload({ ...upload, status: "error", error: error instanceof Error ? error.message : "Upload failed" });
    throw error;
  }
}

export async function pullServerChanges(since?: string) {
  const { data } = await apiClient.get("/sync/pull", { params: since ? { since } : undefined });
  return data;
}

export async function queueAndSync(mutation: Omit<PendingMutation, "id" | "timestamp" | "status"> & { id?: string }) {
  const queued = await enqueueMutation(mutation);
  await queryClient.invalidateQueries({ queryKey: ["sync-status"] });
  if (navigator.onLine) {
    await pushPendingChanges();
  }
  return queued;
}

export async function queueUploadAndSync(upload: Parameters<typeof enqueueUpload>[0]) {
  const queued = await enqueueUpload(upload);
  await queryClient.invalidateQueries({ queryKey: ["sync-status"] });
  if (navigator.onLine) {
    await pushPendingChanges();
  }
  return queued;
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ["sync-status"],
    queryFn: async (): Promise<SyncState> => {
      const [mutations, uploads] = await Promise.all([listPendingMutations(), listPendingUploads()]);
      const items = [...mutations, ...uploads];
      return {
        pending: items.filter((item) => item.status === "pending").length,
        syncing: items.filter((item) => item.status === "syncing").length,
        error: items.filter((item) => item.status === "error").length
      };
    },
    refetchInterval: 5000
  });
}

export function useRetrySyncMutation() {
  return useMutation({ mutationFn: pushPendingChanges });
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void pushPendingChanges();
  });
}
