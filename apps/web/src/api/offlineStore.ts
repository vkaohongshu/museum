import { SyncEntityName } from "@life-museum/shared-types";

export type PendingStatus = "pending" | "syncing" | "synced" | "error";
export type PendingMethod = "POST" | "PUT" | "DELETE";

export interface PendingMutation {
  id: string;
  entity: SyncEntityName;
  method: PendingMethod;
  endpoint: string;
  data?: Record<string, unknown>;
  timestamp: string;
  status: PendingStatus;
  error?: string;
}

export interface PendingUpload {
  id: string;
  endpoint: string;
  fieldName: string;
  files: Array<{ name: string; type: string; blob: Blob }>;
  extraFields?: Record<string, string>;
  timestamp: string;
  status: PendingStatus;
  error?: string;
}

const DB_NAME = "life-museum-offline";
const MUTATIONS = "mutations";
const UPLOADS = "uploads";

function openOfflineDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MUTATIONS)) {
        db.createObjectStore(MUTATIONS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(UPLOADS)) {
        db.createObjectStore(UPLOADS, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function put<T>(storeName: string, value: T) {
  const db = await openOfflineDb();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).put(value);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getAll<T>(storeName: string) {
  const db = await openOfflineDb();
  const tx = db.transaction(storeName, "readonly");
  const request = tx.objectStore(storeName).getAll();
  return new Promise<T[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

async function remove(storeName: string, id: string) {
  const db = await openOfflineDb();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).delete(id);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function enqueueMutation(input: Omit<PendingMutation, "id" | "timestamp" | "status"> & { id?: string }) {
  const mutation: PendingMutation = {
    id: input.id ?? crypto.randomUUID(),
    entity: input.entity,
    method: input.method,
    endpoint: input.endpoint,
    data: input.data,
    timestamp: new Date().toISOString(),
    status: "pending"
  };
  await put(MUTATIONS, mutation);
  return mutation;
}

export async function enqueueUpload(input: Omit<PendingUpload, "id" | "timestamp" | "status"> & { id?: string }) {
  const upload: PendingUpload = {
    id: input.id ?? crypto.randomUUID(),
    endpoint: input.endpoint,
    fieldName: input.fieldName,
    files: input.files,
    extraFields: input.extraFields,
    timestamp: new Date().toISOString(),
    status: "pending"
  };
  await put(UPLOADS, upload);
  return upload;
}

export function listPendingMutations() {
  return getAll<PendingMutation>(MUTATIONS);
}

export function listPendingUploads() {
  return getAll<PendingUpload>(UPLOADS);
}

export function updatePendingMutation(mutation: PendingMutation) {
  return put(MUTATIONS, mutation);
}

export function updatePendingUpload(upload: PendingUpload) {
  return put(UPLOADS, upload);
}

export function removePendingMutation(id: string) {
  return remove(MUTATIONS, id);
}

export function removePendingUpload(id: string) {
  return remove(UPLOADS, id);
}
