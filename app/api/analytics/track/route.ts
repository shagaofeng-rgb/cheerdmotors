import { appendAnalyticsEvent } from "@/lib/commerceStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request) {
  return request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "";
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const now = new Date().toISOString();
  await appendAnalyticsEvent({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type: String(payload.type || "page_view").slice(0, 80),
    visitorId: String(payload.visitorId || "anonymous").slice(0, 160),
    sessionId: String(payload.sessionId || "session").slice(0, 160),
    page: String(payload.page || "/").slice(0, 500),
    pageTitle: String(payload.pageTitle || "").slice(0, 240),
    referrer: String(payload.referrer || "").slice(0, 500),
    country: String(payload.country || clientIp(request)).slice(0, 80),
    city: String(payload.city || "").slice(0, 120),
    device: String(payload.device || "Unknown").slice(0, 40),
    browser: String(payload.browser || request.headers.get("user-agent") || "Unknown").slice(0, 260),
    os: String(payload.os || "Unknown").slice(0, 80),
    timestamp: now,
    payload: typeof payload.payload === "object" && payload.payload ? payload.payload : {},
  });
  return Response.json({ ok: true });
}
