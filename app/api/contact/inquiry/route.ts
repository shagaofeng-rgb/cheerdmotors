import { appendAnalyticsEvent } from "@/lib/commerceStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(value: unknown, limit = 500) {
  return String(value || "").trim().slice(0, limit);
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries((await request.formData()).entries());
  const now = new Date().toISOString();
  await appendAnalyticsEvent({ id: `${Date.now()}-contact-inquiry`, type: "contact_inquiry", visitorId: str(payload.visitorId) || "contact", sessionId: str(payload.sessionId) || `contact-${Date.now()}`, page: str(payload.page) || "/contact", pageTitle: "Contact Inquiry", referrer: str(payload.referrer), country: str(payload.country), city: "", device: str(payload.device) || "Unknown", browser: str(payload.browser) || "Contact", os: str(payload.os) || "Unknown", timestamp: now, payload: { name: str(payload.name), email: str(payload.email), phone: str(payload.phone), company: str(payload.company), country: str(payload.country), product: str(payload.product), message: str(payload.message, 1000) } });
  if (!contentType.includes("application/json")) return Response.redirect(new URL("/contact?sent=1", request.url), 303);
  return Response.json({ ok: true });
}
