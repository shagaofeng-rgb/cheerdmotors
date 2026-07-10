import { appendStoreLine } from "@/lib/durableStore";

const NOTIFICATION_LOG_FILE = "notification-log.jsonl";
const NEWSLETTER_FILE = "newsletter-subscribers.jsonl";

export type InquiryNotificationPayload = {
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  product: string;
  message: string;
  page: string;
  createdAt: string;
};

function value(key: string) {
  return (process.env[key] || "").trim();
}

export function notificationStatus() {
  return {
    resendConfigured: Boolean(value("RESEND_API_KEY")),
    smtpConfigured: Boolean(value("SMTP_HOST") && value("SMTP_USER") && value("SMTP_PASSWORD")),
    to: value("ADMIN_NOTIFICATION_EMAIL") || value("INQUIRY_RECEIVER_EMAIL") || "admin@cheerdmotors.com",
    from: value("RESEND_FROM") || value("SMTP_FROM") || "CHEERDMOTO <no-reply@cheerdmotors.com>",
  };
}

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}

async function sendResendEmail(payload: InquiryNotificationPayload) {
  const status = notificationStatus();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${value("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: status.from,
      to: [status.to],
      subject: `New CHEERDMOTO inquiry: ${payload.product || payload.name || payload.email}`,
      html: `<h2>New CHEERDMOTO inquiry</h2><p><strong>Name:</strong> ${escapeHtml(payload.name)}</p><p><strong>Email:</strong> ${escapeHtml(payload.email)}</p><p><strong>Phone:</strong> ${escapeHtml(payload.phone)}</p><p><strong>Company:</strong> ${escapeHtml(payload.company)}</p><p><strong>Country:</strong> ${escapeHtml(payload.country)}</p><p><strong>Product:</strong> ${escapeHtml(payload.product)}</p><p><strong>Page:</strong> ${escapeHtml(payload.page)}</p><p><strong>Message:</strong><br>${escapeHtml(payload.message).replace(/\n/g, "<br>")}</p>`,
      text: `New CHEERDMOTO inquiry\nName: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nCompany: ${payload.company}\nCountry: ${payload.country}\nProduct: ${payload.product}\nPage: ${payload.page}\nMessage:\n${payload.message}`,
      reply_to: payload.email || undefined,
    }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(String(result.message || result.error || `Resend failed: ${response.status}`));
  return result;
}

export async function notifyInquiry(payload: InquiryNotificationPayload) {
  const status = notificationStatus();
  const startedAt = new Date().toISOString();
  if (!status.resendConfigured) {
    await appendStoreLine(NOTIFICATION_LOG_FILE, { type: "inquiry", status: "skipped", provider: "resend", reason: "RESEND_API_KEY missing", startedAt, to: status.to });
    return { ok: false, skipped: true, reason: "RESEND_API_KEY missing" };
  }
  try {
    const result = await sendResendEmail(payload);
    await appendStoreLine(NOTIFICATION_LOG_FILE, { type: "inquiry", status: "sent", provider: "resend", startedAt, completedAt: new Date().toISOString(), to: status.to });
    return { ok: true, skipped: false, result };
  } catch (error) {
    await appendStoreLine(NOTIFICATION_LOG_FILE, { type: "inquiry", status: "failed", provider: "resend", startedAt, completedAt: new Date().toISOString(), to: status.to, error: error instanceof Error ? error.message : "Unknown error" });
    return { ok: false, skipped: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function saveNewsletterSubscriber(email: string, source = "footer") {
  const cleanEmail = email.trim().toLowerCase().slice(0, 180);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { ok: false, error: "Invalid email" };
  await appendStoreLine(NEWSLETTER_FILE, { id: `newsletter-${Date.now()}`, email: cleanEmail, source, createdAt: new Date().toISOString(), consent: true });
  return { ok: true };
}
