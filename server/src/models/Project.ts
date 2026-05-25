import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const projectSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    content: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    tags: { type: [String], default: [] },
    category: { type: String, required: true, trim: true },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ createdAt: -1 });

export type ProjectDoc = InferSchemaType<typeof projectSchema> & { _id: string };

export const Project: Model<ProjectDoc> =
  (model as unknown as { models?: Record<string, Model<ProjectDoc>> }).models?.Project ??
  model<ProjectDoc>("Project", projectSchema);
