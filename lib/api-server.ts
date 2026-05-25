import "server-only";
import { cookies } from "next/headers";
import { ApiError, INTERNAL_API_BASE } from "./api";

// Server-only fetch for protected endpoints. Forwards the auth cookie from
// the current request so Express's requireAuth middleware accepts it.
export async function apiServer<T>(path: string): Promise<T> {
  const store = await cookies();
  const cookieHeader = store
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  const res = await fetch(`${INTERNAL_API_BASE}${path}`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg =
      (body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : null) ?? `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, body);
  }
  return (await res.json()) as T;
}
