import type { BlogPost, Project } from "./types";

// Browser-facing base - empty string means same-origin, and Next's rewrites
// in next.config.ts proxy /api/* through to the Express backend. This keeps
// the auth cookie on the same host as the Next app so middleware can read it.
export const API_URL = "";

// Server-side base - Server Components fetch directly from Express, bypassing
// the Next rewrite (faster, no extra hop). Set INTERNAL_API_URL in deploy if
// the backend is reachable at a different host.
const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}

// Server-friendly fetch helpers for public list pages.
export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/projects`, {
      next: { revalidate: 60, tags: ["projects"] },
    });
    if (!res.ok) return [];
    return (await res.json()) as Project[];
  } catch {
    return [];
  }
}

export async function getProject(idOrSlug: string): Promise<Project | null> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/projects/${idOrSlug}`, {
      next: { revalidate: 60, tags: ["projects", `project:${idOrSlug}`] },
    });
    if (!res.ok) return null;
    return (await res.json()) as Project;
  } catch {
    return null;
  }
}

export async function getBlogs(opts: { all?: boolean } = {}): Promise<BlogPost[]> {
  try {
    const qs = opts.all ? "?all=1" : "";
    const res = await fetch(`${INTERNAL_API_URL}/api/blogs${qs}`, {
      next: { revalidate: 60, tags: ["blogs"] },
    });
    if (!res.ok) return [];
    return (await res.json()) as BlogPost[];
  } catch {
    return [];
  }
}

export async function getBlog(idOrSlug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/api/blogs/${idOrSlug}`, {
      next: { revalidate: 60, tags: ["blogs", `blog:${idOrSlug}`] },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

export const INTERNAL_API_BASE = INTERNAL_API_URL;
