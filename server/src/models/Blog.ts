import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const blogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    tags: { type: [String], default: [] },
    readTime: { type: String, default: "5 MIN READ" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blogSchema.index({ createdAt: -1 });
blogSchema.index({ published: 1, createdAt: -1 });

export type BlogDoc = InferSchemaType<typeof blogSchema> & { _id: string };

export const Blog: Model<BlogDoc> =
  (model as unknown as { models?: Record<string, Model<BlogDoc>> }).models?.Blog ??
  model<BlogDoc>("Blog", blogSchema);
