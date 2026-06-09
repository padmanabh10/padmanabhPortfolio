import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const AUTH_COOKIE = "pk_auth";

export async function POST() {
  await fetch(`${INTERNAL_API_URL}/api/auth/logout`, { method: "POST" }).catch(
    () => null
  );

  const store = await cookies();
  store.delete(AUTH_COOKIE);

  return NextResponse.json({ ok: true });
}
