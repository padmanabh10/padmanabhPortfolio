import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "pk_auth";
const LOGIN_PATH = "/padmanabh-login";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET is missing or too short (need 32+ chars)");
  }
  return new TextEncoder().encode(secret);
}

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("from", req.nextUrl.pathname);
    const res = NextResponse.redirect(url);
    res.cookies.delete(AUTH_COOKIE);
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
