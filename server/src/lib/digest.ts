import nodemailer from "nodemailer";
import { ContactSubmission } from "../models/ContactSubmission.js";
import { Subscriber } from "../models/Subscriber.js";
import { env } from "../env.js";
import { getSiteUrl } from "./email.js";

const GMAIL_USER = "updates.padmanabh@gmail.com";
const DIGEST_TO = env.ADMIN_EMAIL;

function getTransporter() {
  if (!env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
  });
}

export async function sendDailyDigest(): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) return;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [newSubscribers, unhandledMessages] = await Promise.all([
    Subscriber.find({ createdAt: { $gte: todayStart } }).lean(),
    ContactSubmission.find({ handled: false }).sort({ createdAt: -1 }).lean(),
  ]);

  if (newSubscribers.length === 0 && unhandledMessages.length === 0) return;

  const siteUrl = getSiteUrl();

  function fmtDate(d: Date) {
    return new Date(d).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  }

  function escape(s: string) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  const subscriberRows = newSubscribers.map((s) => `
    <tr>
      <td style="font-family:'Courier New',Courier,monospace;font-size:13.5px;color:#1f2a23;padding:10px 14px;border-bottom:1px solid #c8e0d0;">${escape(s.email)}</td>
      <td style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#6b8475;padding:10px 14px;border-bottom:1px solid #c8e0d0;white-space:nowrap;">${fmtDate(s.createdAt as Date)}</td>
    </tr>`).join("");

  const messageRows = unhandledMessages.map((m) => `
    <tr>
      <td style="font-family:'Courier New',Courier,monospace;font-size:13.5px;color:#1f2a23;padding:10px 14px;border-bottom:1px solid #c8e0d0;white-space:nowrap;">${escape(m.name)}</td>
      <td style="font-family:'Courier New',Courier,monospace;font-size:12px;color:#0f7a4f;padding:10px 14px;border-bottom:1px solid #c8e0d0;">
        <a href="mailto:${escape(m.email)}" style="color:#0f7a4f;text-decoration:none;">${escape(m.email)}</a>
      </td>
      <td style="font-family:'Courier New',Courier,monospace;font-size:12.5px;color:#2b3830;padding:10px 14px;border-bottom:1px solid #c8e0d0;">${escape(m.subject)}</td>
      <td style="font-family:'Courier New',Courier,monospace;font-size:11.5px;color:#6b8475;padding:10px 14px;border-bottom:1px solid #c8e0d0;white-space:nowrap;">${fmtDate(m.createdAt as Date)}</td>
    </tr>`).join("");

  const subscriberSection = newSubscribers.length > 0 ? `
    <tr><td style="padding-bottom:8px;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:#0f7a4f;margin:0 0 12px 0;">
        New Subscribers Today — ${newSubscribers.length}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#dcefe1;border-radius:8px;overflow:hidden;">
        <tbody>${subscriberRows}</tbody>
      </table>
    </td></tr>` : "";

  const messageSection = unhandledMessages.length > 0 ? `
    <tr><td style="padding-top:${newSubscribers.length > 0 ? "24px" : "0"};padding-bottom:8px;">
      <p style="font-family:'Courier New',Courier,monospace;font-size:11px;text-transform:uppercase;letter-spacing:2.5px;color:#0f7a4f;margin:0 0 12px 0;">
        Unhandled Messages — ${unhandledMessages.length}
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#dcefe1;border-radius:8px;overflow:hidden;">
        <tbody>${messageRows}</tbody>
      </table>
    </td></tr>` : "";

  const html = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#e9f7ec;background-image:radial-gradient(120% 90% at 100% 0%,rgba(142,205,255,0.18) 0%,rgba(142,205,255,0) 55%),radial-gradient(rgba(15,122,79,0.13) 1.3px,transparent 1.6px);border-radius:14px;background-size:auto,18px 18px;background-position:center center;background-repeat:no-repeat,repeat;">
      <tbody><tr><td style="padding:38px 40px 34px 40px;font-family:'Courier New',Courier,monospace;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tbody>
            <tr><td style="font-family:'Courier New',Courier,monospace;font-size:17px;line-height:1.6;color:#1f2a23;font-weight:700;padding-bottom:6px;">Daily Digest</td></tr>
            <tr><td style="font-family:'Courier New',Courier,monospace;font-size:13px;color:#6b8475;padding-bottom:28px;">${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}</td></tr>

            ${subscriberSection}
            ${messageSection}

            <tr><td style="padding-top:28px;">
              <div style="border-top:1px dashed #b6d8c0;font-size:1px;line-height:1px;">&nbsp;</div>
            </td></tr>

            <tr><td style="padding-top:20px;font-family:'Courier New',Courier,monospace;">
              <div style="font-size:13px;line-height:1.5;padding-bottom:4px;">
                <a href="${siteUrl}/admin/submissions" style="color:#0f7a4f;text-decoration:none;font-weight:700;border-bottom:1px solid #9fd0b2;">View in Admin →</a>
              </div>
              <div style="font-size:12.5px;line-height:1.5;color:#7d9387;">
                <a href="${siteUrl}" style="color:#5c7466;text-decoration:none;">padmanabhpk.me</a>
              </div>
            </td></tr>
          </tbody>
        </table>
      </td></tr></tbody>
    </table>
  `.trim();

  const text = [
    `Daily Digest`,
    ``,
    newSubscribers.length > 0 ? `New Subscribers (${newSubscribers.length}):\n${newSubscribers.map((s) => `  ${s.email}`).join("\n")}` : "",
    unhandledMessages.length > 0 ? `Unhandled Messages (${unhandledMessages.length}):\n${unhandledMessages.map((m) => `  ${m.name} <${m.email}> — ${m.subject}`).join("\n")}` : "",
    ``,
    `${siteUrl}/admin/submissions`,
  ].filter(Boolean).join("\n\n");

  await transporter.sendMail({
    from: `Padmanabh Portfolio <${GMAIL_USER}>`,
    to: DIGEST_TO,
    subject: `Daily Digest — ${newSubscribers.length} subscriber${newSubscribers.length !== 1 ? "s" : ""}, ${unhandledMessages.length} unhandled`,
    text,
    html,
  });

  console.log(`[digest] Sent — ${newSubscribers.length} subscribers, ${unhandledMessages.length} unhandled messages`);
}
