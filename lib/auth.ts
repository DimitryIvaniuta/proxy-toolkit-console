import { STORAGE_KEYS } from "./config";

export const AUTH_STORAGE_KEYS = {
  accessToken: "proxyToolkit.accessToken",
  refreshToken: "proxyToolkit.refreshToken",
  expiresAt: "proxyToolkit.expiresAt",
} as const;

export type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // epoch ms
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

export function setTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, tokens.accessToken);
  if (tokens.refreshToken) window.localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, tokens.refreshToken);
  if (tokens.expiresAt) window.localStorage.setItem(AUTH_STORAGE_KEYS.expiresAt, String(tokens.expiresAt));
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.expiresAt);
}

/**
 * Placeholder for future JWT/OIDC integration.
 * When backend adds auth:
 *  - Implement /auth/login (password or PKCE redirect)
 *  - Store tokens via setTokens()
 *  - Implement refresh flow (silent refresh)
 */
