export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const STORAGE_KEYS = {
  apiKey: "proxyToolkit.apiKey",
} as const;

export function getApiKey(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEYS.apiKey);
}

export function setApiKey(value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.apiKey, value);
}

export function clearApiKey() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEYS.apiKey);
}
