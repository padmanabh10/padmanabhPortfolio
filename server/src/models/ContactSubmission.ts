import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const contactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    ip: { type: String, default: "" },
    handled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contactSchema.index({ createdAt: -1 });

export type ContactSubmissionDoc = InferSchemaType<typeof contactSchema> & { _id: string };

export const ContactSubmission: Model<ContactSubmissionDoc> =
  (model as unknown as { models?: Record<string, Model<ContactSubmissionDoc>> }).models
    ?.ContactSubmission ??
  model<ContactSubmissionDoc>("ContactSubmission", contactSchema);
