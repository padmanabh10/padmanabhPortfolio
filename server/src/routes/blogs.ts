import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { Blog } from "../models/Blog.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
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
  excerpt: z.string().min(1).max(500),
  content: z.string().default(""),
  coverUrl: z.string().url().or(z.string().startsWith("/")).default(""),
  tags: z.array(z.string().min(1)).default([]),
  readTime: z.string().default("5 MIN READ"),
  published: z.boolean().default(true),
});

function serialize(b: any) {
  return {
    _id: String(b._id),
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    content: b.content ?? "",
    coverUrl: b.coverUrl ?? "",
    tags: b.tags ?? [],
    readTime: b.readTime ?? "",
    published: !!b.published,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

// GET /api/blogs?all=1 returns drafts too (used by admin via cookie-auth fetch;
// public consumers get only published posts).
router.get("/", publicLimiter, optionalAuth, async (req, res, next) => {
  try {
    const includeAll = req.query.all === "1" && !!req.user;
    const filter = includeAll ? {} : { published: true };
    const docs = await Blog.find(filter).sort({ createdAt: -1 }).lean();
    res.json(docs.map(serialize));
  } catch (err) {
    next(err);
  }
});

router.get("/:idOrSlug", publicLimiter, async (req, res, next) => {
  try {
    const idOrSlug = req.params.idOrSlug ?? "";
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const doc = await Blog.findOne(
      isObjectId ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug }
    ).lean();
    if (!doc) throw new HttpError(404, "Blog post not found");
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const data = upsertSchema.parse(req.body);
    const slug = data.slug?.trim() || slugify(data.title);
    if (await Blog.exists({ slug })) {
      throw new HttpError(409, `Slug "${slug}" already exists`);
    }
    const doc = await Blog.create({
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
    const conflict = await Blog.findOne({ slug, _id: { $ne: req.params.id } }).lean();
    if (conflict) throw new HttpError(409, `Slug "${slug}" already in use`);
    const doc = await Blog.findByIdAndUpdate(
      req.params.id,
      { ...data, slug, content: sanitizeRichText(data.content) },
      { new: true, runValidators: true }
    ).lean();
    if (!doc) throw new HttpError(404, "Blog post not found");
    res.json(serialize(doc));
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const doc = await Blog.findByIdAndDelete(req.params.id).lean();
    if (!doc) throw new HttpError(404, "Blog post not found");
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
