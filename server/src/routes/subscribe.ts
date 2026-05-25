import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { Subscriber } from "../models/Subscriber.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const subscribeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — try again later" },
});

const subscribeSchema = z.object({
  email: z.string().email(),
});

router.post("/", subscribeLimiter, async (req, res, next) => {
  try {
    const { email } = subscribeSchema.parse(req.body);
    const normalized = email.toLowerCase().trim();
    await Subscriber.updateOne(
      { email: normalized },
      { $setOnInsert: { email: normalized } },
      { upsert: true }
    );
    // Always 200 (don't leak whether the email is new vs existing)
    res.status(200).json({ ok: true });
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
