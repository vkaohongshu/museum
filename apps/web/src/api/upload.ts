import { apiClient } from "./client";
import { queueUploadAndSync } from "./sync";

export type UploadedFile = {
  url: string;
  key: string;
  bucket: string;
  contentType: string;
};

export async function uploadImages(files: File[]) {
  if (!navigator.onLine) {
    return queueUploadAndSync({
      endpoint: "/upload",
      fieldName: "images",
      files: files.map((file) => ({ name: file.name, type: file.type, blob: file }))
    });
  }
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  const { data } = await apiClient.post<{ files: UploadedFile[]; urls: string[] }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}
