import { Schema, model, type Model } from "mongoose";

const loginAttemptSchema = new Schema(
  {
    ip: { type: String, required: true },
    email: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    suspicious: { type: Boolean, default: false },
    dismissed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

loginAttemptSchema.index({ createdAt: -1 });
loginAttemptSchema.index({ ip: 1, createdAt: -1 });

interface LoginAttemptDoc {
  _id: string;
  ip: string;
  email: string;
  userAgent: string;
  suspicious: boolean;
  createdAt: Date;
}

export const LoginAttempt: Model<LoginAttemptDoc> =
  (model as unknown as { models?: Record<string, Model<LoginAttemptDoc>> }).models
    ?.LoginAttempt ??
  model<LoginAttemptDoc>("LoginAttempt", loginAttemptSchema);
