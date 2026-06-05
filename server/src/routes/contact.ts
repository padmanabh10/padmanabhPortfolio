import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { ContactSubmission } from "../models/ContactSubmission.js";
import { requireAuth } from "../middleware/auth.js";
import { sendReply } from "../lib/email.js";

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions — try again later" },
});

const submitSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

router.post("/", submitLimiter, async (req, res, next) => {
  try {
    const data = submitSchema.parse(req.body);
    const ip = (req.ip ?? req.socket.remoteAddress ?? "").replace(/^::ffff:/, "");
    const doc = await ContactSubmission.create({ ...data, ip });
    res.status(201).json({ ok: true, id: String(doc._id) });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const docs = await ContactSubmission.find().sort({ createdAt: -1 }).lean();
    res.json(
      docs.map((d) => ({
        _id: String(d._id),
        name: d.name,
        email: d.email,
        subject: d.subject,
        message: d.message,
        handled: !!d.handled,
        ip: d.ip ?? "",
        createdAt: d.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const { handled } = z.object({ handled: z.boolean() }).parse(req.body);
    const doc = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { handled },
      { new: true }
    ).lean();
    if (!doc) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reply", requireAuth, async (req, res, next) => {
  try {
    const { body } = z.object({ body: z.string().min(1).max(10000) }).parse(req.body);
    const doc = await ContactSubmission.findById(req.params.id).lean();
    if (!doc) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }
    await sendReply(doc.email, doc.name, doc.subject, doc.message, body);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await ContactSubmission.findByIdAndDelete(req.params.id).lean();
    if (!doc) {
      res.status(404).json({ error: "Submission not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
