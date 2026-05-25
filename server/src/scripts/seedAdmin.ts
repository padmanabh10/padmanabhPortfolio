import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../env.js";
import { connectDb } from "../db.js";
import { User } from "../models/User.js";

async function run() {
  await connectDb();
  const email = env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  const result = await User.findOneAndUpdate(
    { email },
    { email, passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();

  console.log(`[seed] admin upserted: ${result?.email} (id=${result?._id})`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("[seed] failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
