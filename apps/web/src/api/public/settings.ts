import { SiteSettings } from "../../types";
import { fetchSettings } from "../settings";

export async function fetchPublicSettings(): Promise<SiteSettings> {
  return fetchSettings("/public/settings");
}
