import { useMutation, useQuery } from "@tanstack/react-query";
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

export async function pushPendingChanges() {
  if (!navigator.onLine) return { skipped: true, reason: "offline" };

  const uploads = await listPendingUploads();
  for (const upload of uploads.filter((item) => item.status !== "synced")) {
    await syncUpload(upload);
  }

  const mutations = await listPendingMutations();
  const pending = mutations.filter((item) => item.status !== "synced");
  if (pending.length > 0) {
    pending.forEach((item) => void updatePendingMutation({ ...item, status: "syncing" }));
    try {
      await apiClient.post("/sync/push", { mutations: pending });
      await Promise.all(pending.map((item) => removePendingMutation(item.id)));
    } catch (error) {
      await Promise.all(pending.map((item) => updatePendingMutation({ ...item, status: "error", error: error instanceof Error ? error.message : "Sync failed" })));
      throw error;
    }
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["articles"] }),
    queryClient.invalidateQueries({ queryKey: ["moments"] }),
    queryClient.invalidateQueries({ queryKey: ["albums"] }),
    queryClient.invalidateQueries({ queryKey: ["categories"] }),
    queryClient.invalidateQueries({ queryKey: ["tags"] }),
    queryClient.invalidateQueries({ queryKey: ["settings"] }),
    queryClient.invalidateQueries({ queryKey: ["memory-capsules"] }),
    queryClient.invalidateQueries({ queryKey: ["sync-status"] })
  ]);

  return { skipped: false, synced: pending.length + uploads.length };
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
    void pushPendingChanges();
  }
  return queued;
}

export async function queueUploadAndSync(upload: Parameters<typeof enqueueUpload>[0]) {
  const queued = await enqueueUpload(upload);
  await queryClient.invalidateQueries({ queryKey: ["sync-status"] });
  if (navigator.onLine) {
    void pushPendingChanges();
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
