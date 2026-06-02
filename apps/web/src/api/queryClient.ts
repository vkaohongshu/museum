import { QueryClient } from "@tanstack/react-query";

const DB_NAME = "life-museum-query-cache";
const STORE_NAME = "queries";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

function openCacheDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "queryHash" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function hydrateQueryCache() {
  if (typeof indexedDB === "undefined") return;
  const db = await openCacheDb();
  const tx = db.transaction(STORE_NAME, "readonly");
  const request = tx.objectStore(STORE_NAME).getAll();
  const entries = await new Promise<Array<{ queryKey: unknown[]; data: unknown; updatedAt: number }>>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  entries.forEach((entry) => {
    queryClient.setQueryData(entry.queryKey, entry.data, { updatedAt: entry.updatedAt });
  });
}

export function persistQueryCache() {
  if (typeof indexedDB === "undefined") return () => undefined;
  return queryClient.getQueryCache().subscribe((event) => {
    const query = event.query;
    if (!query || query.state.status !== "success") return;
    void openCacheDb().then((db) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({
        queryHash: query.queryHash,
        queryKey: query.queryKey,
        data: query.state.data,
        updatedAt: query.state.dataUpdatedAt
      });
    });
  });
}
