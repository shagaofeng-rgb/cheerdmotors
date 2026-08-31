import { appendAnalyticsEvent } from "@/lib/commerceStore";
import { notifyInquiry, type InquiryNotificationPayload } from "@/lib/notifications";
import { hashIp, maskedIp } from "@/lib/trafficAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(value: unknown, limit = 500) {
  return String(value || "").trim().slice(0, limit);
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries((await request.formData()).entries());
  const now = new Date().toISOString();
  const inquiry: InquiryNotificationPayload = { name: str(payload.name), email: str(payload.email), phone: str(payload.phone), company: str(payload.company), country: str(payload.country), product: str(payload.product), message: str(payload.message, 1000), page: str(payload.page) || "/contact", createdAt: now };
  if (!inquiry.name || !inquiry.message || !validEmail(inquiry.email)) return Response.json({ ok: false, message: "Name, valid email and message are required." }, { status: 400 });
  const ip = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "").split(",")[0].trim();
  try {
    await appendAnalyticsEvent({ id: `${Date.now()}-contact-inquiry`, type: "contact_inquiry", visitorId: str(payload.visitorId) || `contact-${hashIp(inquiry.email)}`, sessionId: str(payload.sessionId) || `contact-${Date.now()}`, page: inquiry.page, pageTitle: "Contact Inquiry", referrer: str(payload.referrer), country: inquiry.country, city: "", device: str(payload.device) || "Unknown", browser: str(payload.browser) || "Contact Form", os: str(payload.os) || "Unknown", timestamp: now, payload: inquiry, ipHash: hashIp(ip), maskedIp: maskedIp(ip) });
  } catch {
    // Email delivery remains available if non-critical analytics storage is temporarily unavailable.
  }
  const notification = await notifyInquiry(inquiry);
  if (!contentType.includes("application/json")) return Response.redirect(new URL("/contact?sent=1", request.url), 303);
  return Response.json({ ok: true, notification: notification.ok ? "sent" : "saved" });
}
