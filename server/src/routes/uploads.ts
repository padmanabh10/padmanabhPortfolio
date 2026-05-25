import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../middleware/error.js";
import { env } from "../env.js";

const router = Router();

let configured = false;
function ensureConfigured() {
  if (configured) return;
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new HttpError(
      500,
      "Cloudinary not configured — set CLOUDINARY_* env vars in server/.env"
    );
  }
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

const querySchema = z.object({
  folder: z.string().min(1).max(80).default("portfolio"),
});

router.get("/signature", requireAuth, (req, res, next) => {
  try {
    ensureConfigured();
    const { folder } = querySchema.parse(req.query);
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      env.CLOUDINARY_API_SECRET
    );
    res.json({
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
