import { Schema, model, type InferSchemaType, type Model } from "mongoose";

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

subscriberSchema.index({ createdAt: -1 });

export type SubscriberDoc = InferSchemaType<typeof subscriberSchema> & { _id: string };

export const Subscriber: Model<SubscriberDoc> =
  (model as unknown as { models?: Record<string, Model<SubscriberDoc>> }).models
    ?.Subscriber ??
  model<SubscriberDoc>("Subscriber", subscriberSchema);
