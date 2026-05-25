import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { Project } from "../models/Project.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { slugify } from "../lib/slug.js";
import { sanitizeRichText } from "../lib/sanitize.js";

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — try again later" },
});

const upsertSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(80).optional(),
  description: z.string().min(1).max(1000),
  content: z.string().default(""),
  coverUrl: z.string().url().or(z.string().startsWith("/")).default(""),
  tags: z.array(z.string().min(1)).default([]),
  category: z.string().min(1),
  featured: z.boolean().default(false),
});

function serialize(p: any) {
  return {
    _id: String(p._id),
    title: p.title,
    slug: p.slug,
    description: p.description,
    content: p.content ?? "",
    coverUrl: p.coverUrl ?? "",
    tags: p.tags ?? [],
    category: p.category,
    featured: !!p.featured,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

router.get("/categories", publicLimiter, async (_req, res, next) => {
  try {
    const categories: string[] = await Project.distinct("category");
    res.json(categories.filter(Boolean).sort());
  } catch (err) {
    next(err);
  }
});

router.get("/", publicLimiter, async (_req, res, next) => {
  try {
    const docs = await Project.find().sort({ createdAt: -1 }).lean();
    res.json(docs.map(serialize));
  } catch (err) {
    next(err);
  }
});

router.get("/:idOrSlug", publicLimiter, async (req, res, next) => {
  try {
    const idOrSlug = req.params.idOrSlug ?? "";
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const doc = await Project.findOne(
      isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug }
    ).lean();
    if (!doc) throw new HttpError(404, "Project not found");
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = upsertSchema.parse(req.body);
    const slug = data.slug?.trim() || slugify(data.title);
    if (await Project.exists({ slug })) {
      throw new HttpError(409, `Slug "${slug}" already exists`);
    }
    const doc = await Project.create({
      ...data,
      slug,
      content: sanitizeRichText(data.content),
    });
    res.status(201).json(serialize(doc.toObject()));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const data = upsertSchema.parse(req.body);
    const slug = data.slug?.trim() || slugify(data.title);
    const conflict = await Project.findOne({ slug, _id: { $ne: req.params.id } }).lean();
    if (conflict) throw new HttpError(409, `Slug "${slug}" already in use`);
    const doc = await Project.findByIdAndUpdate(
      req.params.id,
      { ...data, slug, content: sanitizeRichText(data.content) },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) throw new HttpError(404, "Project not found");
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Project.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new HttpError(404, "Project not found");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
