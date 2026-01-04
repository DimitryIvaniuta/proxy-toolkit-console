import { API_BASE_URL, getApiKey } from "./config";
import { getAccessToken } from "./auth";

export type ApiError = {
  status: number;
  error?: string;
  message?: string;
  path?: string;
  correlationId?: string;
  timestamp?: string;
  retryAfter?: string | null;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  idempotencyKey?: string;
  signal?: AbortSignal;
};

export function isApiError(e: unknown): e is ApiError {
  return (
      typeof e === "object" &&
      e !== null &&
      "status" in e &&
      typeof (e as any).status === "number"
  );
}

function newCorrelationId(): string {
  // modern browsers: crypto.randomUUID()
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
}

async function parseError(res: Response): Promise<ApiError> {
  const retryAfter = res.headers.get("Retry-After");
  try {
    const json = await res.json();
    return {
      status: res.status,
      retryAfter,
      ...json,
    };
  } catch {
    return { status: res.status, message: res.statusText, retryAfter };
  }
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = {
    "X-Correlation-Id": newCorrelationId(),
  };

  const apiKey = getApiKey();
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  if (apiKey) headers["X-Api-Key"] = apiKey;

  if (opts.idempotencyKey) headers["X-Idempotency-Key"] = opts.idempotencyKey;

  if (opts.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
