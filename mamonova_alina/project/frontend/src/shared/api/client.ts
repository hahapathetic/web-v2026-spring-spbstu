import { env } from "../config/env";
import { useAuthStore } from "../../features/auth/authStore";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T>(
  path: string,
  opts: { method?: HttpMethod; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const method = opts.method ?? "GET";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (opts.auth) {
    const token = useAuthStore.getState().token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const base = env.apiBaseUrl?.trim() ?? "";
  const url = base ? `${base}${path}` : path;

  const res = await fetch(url, {
    method,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data = (await res.json()) as { error?: string; message?: string };
      msg = data.error || data.message || msg;
    } catch {
      msg = msg || res.statusText;
    }
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
