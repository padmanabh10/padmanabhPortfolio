import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

const AUTH_COOKIE = "pk_auth";
const isProd = process.env.NODE_ENV === "production";

export async function POST(req: Request) {
  const body = await req.text();

  const upstream = await fetch(`${INTERNAL_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = await upstream.json().catch(() => ({}));

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  // Pull pk_auth out of the upstream Set-Cookie header and set it ourselves.
  const setCookie = upstream.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/pk_auth=([^;]+)/);
  const token = match?.[1];

  if (!token) {
    return NextResponse.json(
      { error: "Upstream login did not return a session cookie" },
      { status: 502 }
    );
  }

  const store = await cookies();
  store.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  return NextResponse.json(data, { status: 200 });
}
