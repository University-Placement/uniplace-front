import { createClient } from "@/lib/supabase/client";

// Strip any trailing slash so `${API_URL}${path}` never produces a double slash
// (a trailing slash in NEXT_PUBLIC_API_URL would otherwise 404 every call).
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
  /\/+$/,
  "",
);

/**
 * Thin fetch wrapper for the uniplace-api (FastAPI) backend.
 *
 * Attaches the current Supabase access token as a Bearer credential so the API
 * can authorize the request. All exam/admin business logic lives in the API;
 * the frontend only talks to Supabase directly for auth.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${detail}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
