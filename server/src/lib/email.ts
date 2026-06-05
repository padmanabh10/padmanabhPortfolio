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
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#e9f7ec;background-image:radial-gradient(120% 90% at 100% 0%,rgba(142,205,255,0.18) 0%,rgba(142,205,255,0) 55%),radial-gradient(rgba(15,122,79,0.13) 1.3px,transparent 1.6px);border-radius:14px;background-size:auto,18px 18px;background-position:center center;background-repeat:no-repeat,repeat;">
        <tbody><tr><td style="padding:38px 40px 34px 40px;font-family:'Courier New',Courier,monospace;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
            <tbody>
              <tr><td style="font-family:'Courier New',Courier,monospace;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:#0f7a4f;padding-bottom:10px;">New ${label}</td></tr>

              <tr><td style="font-family:'Courier New',Courier,monospace;font-size:20px;line-height:1.3;color:#1f2a23;font-weight:700;padding-bottom:16px;">${title}</td></tr>

              <tr><td style="font-family:'Courier New',Courier,monospace;font-size:15px;line-height:1.75;color:#2b3830;padding-bottom:28px;">${description}</td></tr>

              <tr><td style="padding-bottom:30px;">
                <a href="${url}" style="display:inline-block;background-color:#0f7a4f;color:#ffffff;font-family:'Courier New',Courier,monospace;font-size:12px;font-weight:700;letter-spacing:1.5px;text-decoration:none;padding:12px 24px;text-transform:uppercase;border-radius:4px;">Read More →</a>
              </td></tr>

              <tr><td style="font-family:'Courier New',Courier,monospace;font-size:15px;line-height:1.7;color:#2b3830;padding-bottom:4px;">Best regards,</td></tr>
              <tr><td style="font-family:'Courier New',Courier,monospace;font-size:16px;line-height:1.5;color:#0f7a4f;font-weight:700;padding-bottom:8px;">Padmanabh Kulkarni</td></tr>

              <tr><td style="font-family:'Courier New',Courier,monospace;">
                <div style="font-size:13px;line-height:1.5;padding-bottom:4px;">
                  <a href="${siteUrl}" style="color:#0f7a4f;text-decoration:none;font-weight:700;border-bottom:1px solid #9fd0b2;">padmanabhpk.me</a>
                </div>
                <div style="font-size:12.5px;line-height:1.5;color:#7d9387;padding-bottom:20px;">
                  <a href="https://github.com/padmanabh10" style="color:#5c7466;text-decoration:none;">GitHub</a>
                  <span style="color:#b6cdbd;">&nbsp;·&nbsp;</span>
                  <a href="https://www.linkedin.com/in/padmanabhpk" style="color:#5c7466;text-decoration:none;">LinkedIn</a>
                </div>
                <div style="font-size:11px;color:#a0b8a8;">
                  You received this because you subscribed at <a href="${siteUrl}" style="color:#a0b8a8;">${siteUrl}</a>.
                  &nbsp;<a href="${unsubscribeUrl}" style="color:#a0b8a8;text-decoration:underline;">Unsubscribe</a>
                </div>
              </td></tr>
            </tbody>
          </table>
        </td></tr></tbody>
      </table>
    `.trim(),
  };
}

export async function sendReply(
  toEmail: string,
  toName: string,
  originalSubject: string,
  originalMessage: string,
  replyBody: string
): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) throw new Error("Email not configured (GMAIL_APP_PASSWORD missing)");

  const siteUrl = getSiteUrl();

  function escape(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
  }

  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#e9f7ec;background-image:radial-gradient(120% 90% at 100% 0%,rgba(142,205,255,0.18) 0%,rgba(142,205,255,0) 55%),radial-gradient(rgba(15,122,79,0.13) 1.3px,transparent 1.6px);border-radius:14px;background-size:auto,18px 18px;background-position:center center;background-repeat:no-repeat,repeat;">
      <tbody><tr><td style="padding:38px 40px 34px 40px;font-family:'Courier New',Courier,monospace;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tbody>
            <tr><td style="font-family:'Courier New',Courier,monospace;font-size:17px;line-height:1.6;color:#1f2a23;font-weight:700;padding-bottom:18px;">Hi ${toName},</td></tr>

            <tr><td style="font-family:'Courier New',Courier,monospace;font-size:15px;line-height:1.75;color:#2b3830;padding-bottom:22px;">Thanks for reaching out — here&apos;s my reply to your message.</td></tr>

            <tr><td style="padding-bottom:22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#dcefe1;border-radius:8px;">
                <tbody><tr>
                  <td width="4" style="background-color:#0f7a4f;border-radius:8px 0 0 8px;font-size:1px;line-height:1px;">&nbsp;</td>
                  <td style="padding:14px 18px;font-family:'Courier New',Courier,monospace;font-size:14.5px;font-style:italic;line-height:1.7;color:#3a4a40;white-space:pre-wrap;">"${escape(originalMessage)}"</td>
                </tr></tbody>
              </table>
            </td></tr>

            <tr><td style="font-family:'Courier New',Courier,monospace;font-size:15px;line-height:1.75;color:#2b3830;padding-bottom:30px;white-space:pre-wrap;">${escape(replyBody)}</td></tr>

            <tr><td style="font-family:'Courier New',Courier,monospace;font-size:15px;line-height:1.7;color:#2b3830;padding-bottom:4px;">Best regards,</td></tr>
            <tr><td style="font-family:'Courier New',Courier,monospace;font-size:16px;line-height:1.5;color:#0f7a4f;font-weight:700;padding-bottom:8px;">Padmanabh Kulkarni</td></tr>

            <tr><td style="font-family:'Courier New',Courier,monospace;">
              <div style="font-size:13px;line-height:1.5;padding-bottom:4px;">
                <a href="${siteUrl}" style="color:#0f7a4f;text-decoration:none;font-weight:700;border-bottom:1px solid #9fd0b2;">padmanabhpk.me</a>
              </div>
              <div style="font-size:12.5px;line-height:1.5;color:#7d9387;">
                <a href="https://github.com/padmanabh10" style="color:#5c7466;text-decoration:none;">GitHub</a>
                <span style="color:#b6cdbd;">&nbsp;·&nbsp;</span>
                <a href="https://www.linkedin.com/in/padmanabhpk" style="color:#5c7466;text-decoration:none;">LinkedIn</a>
              </div>
            </td></tr>
          </tbody>
        </table>
      </td></tr></tbody>
    </table>
  `.trim();

  const messageId = `<reply-${Date.now()}@padmanabhpk.me>`;

  const text = [
    `Hi ${toName},`,
    ``,
    `Thanks for reaching out — here's my reply to your message.`,
    ``,
    `Your message:`,
    originalMessage,
    ``,
    `---`,
    ``,
    replyBody,
    ``,
    `Best regards,`,
    `Padmanabh Kulkarni`,
    `${siteUrl}`,
  ].join("\n");

  await transporter.sendMail({
    from: `Padmanabh Kulkarni <${GMAIL_USER}>`,
    to: toEmail,
    subject: `Re: ${originalSubject}`,
    messageId,
    headers: {
      "In-Reply-To": messageId,
      "References": messageId,
    },
    text,
    html,
  });
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
