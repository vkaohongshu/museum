import { SiteSettings } from "../types";
import { apiClient } from "./client";
import { queryClient } from "./queryClient";
import { queueAndSync } from "./sync";
import { useMutation } from "@tanstack/react-query";

const fallbackSettings: SiteSettings = {
  siteName: "Life Museum",
  siteDescription: "",
  homeWelcome: "",
  authorNickname: "",
  theme: "sunny"
};

type ApiSetting = {
  key: string;
  value: unknown;
};

export async function fetchSettings(endpoint = "/settings"): Promise<SiteSettings> {
  const { data } = await apiClient.get<ApiSetting[] | Partial<SiteSettings>>(endpoint);
  if (Array.isArray(data)) {
    return data.reduce<SiteSettings>((settings, item) => {
      if (item.key in settings) {
        return { ...settings, [item.key]: item.value };
      }
      return settings;
    }, fallbackSettings);
  }
  return { ...fallbackSettings, ...data };
}

export async function fetchSetting(key: keyof SiteSettings) {
  const { data } = await apiClient.get<{ key: string; value: unknown }>(`/settings/${String(key)}`);
  return data.value;
}

export async function updateSetting<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
  return queueAndSync({
    entity: "settings",
    method: "PUT",
    endpoint: `/settings/${String(key)}`,
    data: { key: String(key), value, updatedAt: new Date().toISOString() }
  });
}

type UpdateSettingVariables = {
  [K in keyof SiteSettings]: { key: K; value: SiteSettings[K] };
}[keyof SiteSettings];

export function useUpdateSettingMutation() {
  return useMutation({
    mutationFn: ({ key, value }: UpdateSettingVariables) => updateSetting(key, value),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["settings"] })
  });
}
