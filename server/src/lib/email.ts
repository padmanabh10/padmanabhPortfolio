import { createHmac } from "crypto";
import nodemailer from "nodemailer";
import { Subscriber } from "../models/Subscriber.js";
import { env } from "../env.js";

const MAX_SUBSCRIBERS = 49;

export { MAX_SUBSCRIBERS };

const GMAIL_USER = "updates.padmanabh@gmail.com";

export function signUnsubscribe(email: string): string {
  return createHmac("sha256", env.JWT_SECRET).update(email).digest("hex");
}

export function verifyUnsubscribe(email: string, token: string): boolean {
  return signUnsubscribe(email) === token;
}

function getTransporter() {
  if (!env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: env.GMAIL_APP_PASSWORD,
    },
  });
}

function getSiteUrl(): string {
  return env.CORS_ORIGIN.split(",")[0]!.trim();
}

function buildUnsubscribeUrl(email: string): string {
  const token = signUnsubscribe(email);
  return `${getSiteUrl()}/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

function buildEmail(
  type: "blog" | "project",
  title: string,
  description: string,
  slug: string,
  subscriberEmail: string
): { subject: string; html: string } {
  const siteUrl = getSiteUrl();
  const path = type === "blog" ? `/blog/${slug}` : `/projects/${slug}`;
  const url = `${siteUrl}${path}`;
  const label = type === "blog" ? "Blog Post" : "Project";
  const unsubscribeUrl = buildUnsubscribeUrl(subscriberEmail);

  return {
    subject: `New ${label}: ${title}`,
    html: `
      <div style="font-family:monospace;max-width:560px;margin:0 auto;padding:32px 16px;color:#1a1a1a">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#666;margin:0 0 8px">New ${label}</p>
        <h1 style="font-size:22px;margin:0 0 16px;font-weight:700">${title}</h1>
        <p style="font-size:14px;line-height:1.6;color:#444;margin:0 0 24px">${description}</p>
        <a href="${url}" style="display:inline-block;background:#1a1a1a;color:#fff;font-family:monospace;font-size:12px;font-weight:700;letter-spacing:1px;text-decoration:none;padding:12px 24px;text-transform:uppercase">Read More →</a>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:32px 0 16px">
        <p style="font-size:10px;color:#999;margin:0">You received this because you subscribed at ${siteUrl}.</p>
        <p style="font-size:10px;margin:8px 0 0"><a href="${unsubscribeUrl}" style="color:#999;text-decoration:underline">Unsubscribe</a></p>
      </div>
    `.trim(),
  };
}

export async function notifySubscribers(
  type: "blog" | "project",
  title: string,
  description: string,
  slug: string
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  try {
    const subscribers = await Subscriber.find({}, "email").lean();
    if (subscribers.length === 0) return;

    const sends = subscribers.map((s) => {
      const { subject, html } = buildEmail(type, title, description, slug, s.email);
      return transporter.sendMail({
        from: `Padmanabh <${GMAIL_USER}>`,
        to: s.email,
        subject,
        html,
      }).catch((err: unknown) => {
        console.error(`[email] Failed to send to ${s.email}:`, err);
      });
    });

    await Promise.allSettled(sends);
  } catch (err) {
    console.error("[email] Failed to send notifications:", err);
  }
}
