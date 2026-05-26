import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { connectDb } from "./db.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRouter from "./routes/auth.js";
import projectsRouter from "./routes/projects.js";
import blogsRouter from "./routes/blogs.js";
import uploadsRouter from "./routes/uploads.js";
import contactRouter from "./routes/contact.js";
import subscribeRouter from "./routes/subscribe.js";

async function main() {
  await connectDb();

  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/blogs", blogsRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/subscribe", subscribeRouter);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`[server] listening on port:${env.PORT}`);

    if (env.RENDER_EXTERNAL_URL) {
      const url = `${env.RENDER_EXTERNAL_URL}/api/health`;
      const INTERVAL = 14 * 60 * 1000;
      setInterval(() => {
        fetch(url).catch(() => {});
      }, INTERVAL);
      console.log(`[keep-alive] pinging ${url} every 14 min`);
    }
  });
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
