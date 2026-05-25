import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { User } from "../models/User.js";
import { AUTH_COOKIE, requireAuth, signAuthToken } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { env, isProd } from "../env.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function cookieOptions() {
  // Omit `domain` on localhost — browsers drop cookies with an explicit
  // domain that has no dot. In prod, set COOKIE_DOMAIN to a real domain
  // (e.g. ".pk.dev") so the cookie is shared across api.pk.dev + pk.dev.
  const isLocalhost = env.COOKIE_DOMAIN === "localhost" || env.COOKIE_DOMAIN === "";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    ...(isLocalhost ? {} : { domain: env.COOKIE_DOMAIN }),
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    if (!user) throw new HttpError(401, "Invalid credentials");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const token = signAuthToken({ uid: String(user._id) });
    res.cookie(AUTH_COOKIE, token, cookieOptions());
    res.json({ user: { id: String(user._id), email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions(), maxAge: 0 });
  res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user!.uid).lean();
    if (!user) throw new HttpError(401, "Session user not found");
    res.json({ user: { id: String(user._id), email: user.email } });
  } catch (err) {
    next(err);
  }
});

export default router;
