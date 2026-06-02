import { apiClient } from "../client";

export type BackupKind = "json" | "markdown" | "images-manifest";

export async function downloadBackup(kind: BackupKind) {
  const response = await apiClient.get<Blob>(`/admin/backup/${kind}`, { responseType: "blob" });
  const extension = kind === "markdown" ? "md" : "json";
  const name = kind === "images-manifest" ? "life-museum-images" : "life-museum-backup";
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${name}-${new Date().toISOString().slice(0, 10)}.${extension}`;
  anchor.click();
  URL.revokeObjectURL(url);
}
