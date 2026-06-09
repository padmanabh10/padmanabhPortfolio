import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { Subscriber } from "../models/Subscriber.js";
import { requireAuth } from "../middleware/auth.js";
import { MAX_SUBSCRIBERS, verifyUnsubscribe } from "../lib/email.js";

const router = Router();

const subscribeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests - try again later" },
});

const subscribeSchema = z.object({
  email: z.string().email(),
});

router.post("/", subscribeLimiter, async (req, res, next) => {
  try {
    const { email } = subscribeSchema.parse(req.body);
    const normalized = email.toLowerCase().trim();

    const existing = await Subscriber.exists({ email: normalized });
    if (!existing) {
      const count = await Subscriber.countDocuments();
      if (count >= MAX_SUBSCRIBERS) {
        res.status(200).json({ ok: false, error: "Subscriber list is full" });
        return;
      }
    }

    await Subscriber.updateOne(
      { email: normalized },
      { $setOnInsert: { email: normalized } },
      { upsert: true }
    );
    res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/unsubscribe", async (req, res, next) => {
  try {
    const email = typeof req.query.email === "string" ? req.query.email.toLowerCase().trim() : "";
    const token = typeof req.query.token === "string" ? req.query.token : "";

    if (!email || !token || !verifyUnsubscribe(email, token)) {
      res.status(400).json({ ok: false, error: "Invalid unsubscribe link" });
      return;
    }

    await Subscriber.deleteOne({ email });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const docs = await Subscriber.find().sort({ createdAt: -1 }).lean();
    res.json(
      docs.map((d) => ({
        _id: String(d._id),
        email: d.email,
        createdAt: d.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Subscriber.findByIdAndDelete(req.params.id).lean();
    if (!doc) {
      res.status(404).json({ error: "Subscriber not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
