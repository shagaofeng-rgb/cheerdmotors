import { appendAnalyticsEvent } from "@/lib/commerceStore";
import { hashIp, maskedIp, enrichEvent } from "@/lib/trafficAnalytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requestIp(request: Request) {
  return (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "").split(",")[0].trim();
}

function locationHeader(request: Request, name: string) {
  const value = request.headers.get(name) || "";
  try {
    return decodeURIComponent(value).slice(0, 120);
  } catch {
    return value.slice(0, 120);
  }
}

function safePayload(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .slice(0, 20)
      .map(([key, item]) => [key.slice(0, 80), typeof item === "string" ? item.slice(0, 500) : typeof item === "number" || typeof item === "boolean" ? item : ""]),
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const now = new Date().toISOString();
  const page = String(payload.page || "/").slice(0, 500);
  const ip = requestIp(request);
  const search = new URL(page, "https://cheerdmotors.com").searchParams;
  const event = enrichEvent({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type: String(payload.type || "page_view").slice(0, 80),
    visitorId: String(payload.visitorId || "anonymous").slice(0, 160),
    sessionId: String(payload.sessionId || "session").slice(0, 160),
    page,
    pageTitle: String(payload.pageTitle || "").slice(0, 240),
    referrer: String(payload.referrer || "").slice(0, 500),
    country: locationHeader(request, "x-vercel-ip-country") || locationHeader(request, "cf-ipcountry") || "",
    city: locationHeader(request, "x-vercel-ip-city"),
    device: String(payload.device || "Unknown").slice(0, 40),
    browser: String(request.headers.get("user-agent") || payload.browser || "Unknown").slice(0, 260),
    os: String(payload.os || "Unknown").slice(0, 80),
    timestamp: now,
    payload: { ...safePayload(payload.payload), environment: String(payload.environment || "").slice(0, 120) },
    ipHash: hashIp(ip),
    maskedIp: maskedIp(ip),
    region: locationHeader(request, "x-vercel-ip-country-region"),
    landingPage: String(payload.landingPage || page).slice(0, 500),
    utmSource: search.get("utm_source")?.slice(0, 120) || "",
    utmMedium: search.get("utm_medium")?.slice(0, 120) || "",
    utmCampaign: search.get("utm_campaign")?.slice(0, 120) || "",
  });
  if (event.trafficQuality !== "real") {
    return Response.json({ ok: true, recorded: false }, { headers: { "Cache-Control": "no-store" } });
  }
  await appendAnalyticsEvent(event);
  return Response.json({ ok: true, recorded: true }, { headers: { "Cache-Control": "no-store" } });
}
