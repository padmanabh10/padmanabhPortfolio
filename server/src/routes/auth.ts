import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { User } from "../models/User.js";
import { LoginAttempt } from "../models/LoginAttempt.js";
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
    const ip = (req.ip ?? req.socket.remoteAddress ?? "unknown").replace(/^::ffff:/, "");
    const userAgent = req.headers["user-agent"] ?? "";

    const user = await User.findOne({ email: email.toLowerCase() }).lean();
    const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!ok) {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentCount = await LoginAttempt.countDocuments({ ip, createdAt: { $gte: dayAgo } });
      const suspicious = recentCount >= 1;

      await LoginAttempt.create({ ip, email, userAgent, suspicious });

      if (suspicious) {
        await LoginAttempt.updateMany(
          { ip, createdAt: { $gte: dayAgo }, suspicious: false },
          { suspicious: true }
        );
      }

      throw new HttpError(401, "Invalid credentials");
    }

    const token = signAuthToken({ uid: String(user!._id) });
    res.cookie(AUTH_COOKIE, token, cookieOptions());
    res.json({ user: { id: String(user!._id), email: user!.email } });
  } catch (err) {
    next(err);
  }
});

router.get("/suspicious", requireAuth, async (_req, res, next) => {
  try {
    const attempts = await LoginAttempt.find({ suspicious: true, dismissed: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(attempts.map((a) => ({
      _id: String(a._id),
      ip: a.ip,
      email: a.email,
      userAgent: a.userAgent,
      createdAt: a.createdAt,
    })));
  } catch (err) {
    next(err);
  }
});

router.patch("/suspicious/:id/dismiss", requireAuth, async (req, res, next) => {
  try {
    const doc = await LoginAttempt.findByIdAndUpdate(
      req.params.id,
      { dismissed: true },
      { new: true }
    ).lean();
    if (!doc) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json({ ok: true });
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
