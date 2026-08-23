import crypto from "node:crypto";
import type { AnalyticsEvent } from "@/lib/commerceStore";

export type TrafficQuality = "real" | "internal_test" | "bot" | "excluded";
export type TrafficChannel = "Direct" | "Google" | "Bing" | "Other Search" | "Social" | "Referral" | "Email" | "Internal";

export type EnrichedAnalyticsEvent = AnalyticsEvent & {
  ipHash?: string;
  maskedIp?: string;
  region?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  trafficQuality?: TrafficQuality;
  exclusionReason?: string;
  channel?: TrafficChannel;
};

export type VisitorProfile = {
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  visitCount: number;
  pageViews: number;
  lastPage: string;
  country: string;
  city: string;
  maskedIp: string;
  channel: TrafficChannel;
  device: string;
  quality: TrafficQuality;
  classification: "新访客" | "回访客" | "高意向" | "已留资";
  interestedProducts: string[];
};

const BOT_PATTERN = /(?:bot\b|crawler|spider|headless|lighthouse|pagespeed|prerender|puppeteer|playwright|cypress|selenium|phantomjs|curl\/|wget\/)/i;
const INTERNAL_PATTERN = /(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\.vercel\.app|cmd_sco|analytics_test|codex|collects?)/i;
const SOCIAL_HOSTS = ["facebook.com", "instagram.com", "linkedin.com", "tiktok.com", "x.com", "twitter.com", "youtube.com", "pinterest.com"];

function host(value: string) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function channelForEvent(event: AnalyticsEvent): TrafficChannel {
  const source = `${event.referrer} ${event.utmSource || event.payload?.utm_source || ""} ${event.utmMedium || event.payload?.utm_medium || ""}`.toLowerCase();
  if (!source.trim()) return "Direct";
  if (/(?:google\.|\bgoogle\b)/.test(source)) return "Google";
  if (/(?:bing\.|\bbing\b)/.test(source)) return "Bing";
  if (/duckduckgo|yahoo\.|baidu\.|yandex\./.test(source)) return "Other Search";
  if (SOCIAL_HOSTS.some((item) => source.includes(item))) return "Social";
  if (/email|newsletter|edm/.test(source)) return "Email";
  if (/cheerdmotors\.com/.test(source)) return "Internal";
  return "Referral";
}

export function classifyTraffic(event: AnalyticsEvent): { quality: TrafficQuality; reason: string } {
  const evidence = [event.page, event.referrer, event.browser, event.os, String(event.payload?.environment || ""), String(event.payload?.testTraffic || "")].join(" ");
  if (INTERNAL_PATTERN.test(evidence)) return { quality: "internal_test", reason: "内部、本地、预览或 Collects/Codex 测试流量" };
  if (BOT_PATTERN.test(evidence)) return { quality: "bot", reason: "自动化浏览器或搜索爬虫" };
  if (event.trafficQuality === "excluded") return { quality: "excluded", reason: event.exclusionReason || "已由数据质量规则排除" };
  return { quality: "real", reason: "" };
}

export function enrichEvent(event: AnalyticsEvent): EnrichedAnalyticsEvent {
  const classification = classifyTraffic(event);
  return { ...event, channel: channelForEvent(event), trafficQuality: classification.quality, exclusionReason: classification.reason };
}

export function isRealEvent(event: AnalyticsEvent) {
  return enrichEvent(event).trafficQuality === "real";
}

export function maskedIp(value: string) {
  if (!value) return "";
  if (value.includes(":")) return `${value.split(":").slice(0, 3).join(":")}::*`;
  const parts = value.split(".");
  return parts.length === 4 ? `${parts[0]}.${parts[1]}.${parts[2]}.*` : "";
}

export function hashIp(value: string) {
  if (!value) return "";
  const secret = process.env.ANALYTICS_IP_HASH_SALT || process.env.ADMIN_JWT_SECRET || "cheerdmotors-analytics-ip";
  return crypto.createHmac("sha256", secret).update(value).digest("hex").slice(0, 24);
}

function sortedEvents(events: AnalyticsEvent[]) {
  return [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function buildVisitorProfiles(events: AnalyticsEvent[]): VisitorProfile[] {
  const groups = new Map<string, AnalyticsEvent[]>();
  events.filter(isRealEvent).forEach((event) => groups.set(event.visitorId, [...(groups.get(event.visitorId) || []), event]));
  return [...groups.entries()].map(([visitorId, rawEvents]) => {
    const rows = sortedEvents(rawEvents);
    const latest = rows.at(-1)!;
    const sessions = new Set(rows.map((event) => event.sessionId).filter(Boolean));
    const productInterest = [...new Set(rows.map((event) => String(event.payload?.productSlug || event.payload?.product || "")).filter(Boolean))];
    const hasLead = rows.some((event) => /contact|checkout|order/i.test(event.type));
    const classification: VisitorProfile["classification"] = hasLead ? "已留资" : sessions.size > 1 ? "回访客" : productInterest.length || rows.some((event) => event.page.includes("/checkout")) ? "高意向" : "新访客";
    const enriched = enrichEvent(latest);
    return {
      visitorId,
      firstSeen: rows[0].timestamp,
      lastSeen: latest.timestamp,
      visitCount: sessions.size,
      pageViews: rows.filter((event) => event.type === "page_view").length,
      lastPage: latest.page,
      country: latest.country || "未知",
      city: latest.city || "",
      maskedIp: latest.maskedIp || "",
      channel: enriched.channel!,
      device: latest.device || "Unknown",
      quality: enriched.trafficQuality!,
      classification,
      interestedProducts: productInterest,
    };
  }).sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
}

export function groupCounts(values: string[]) {
  const groups = new Map<string, number>();
  values.filter(Boolean).forEach((value) => groups.set(value, (groups.get(value) || 0) + 1));
  return [...groups.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function trafficTrend(events: AnalyticsEvent[]) {
  const groups = new Map<string, { date: string; visitors: Set<string>; pageViews: number; leads: number }>();
  events.filter(isRealEvent).forEach((event) => {
    const date = event.timestamp.slice(0, 10);
    const current = groups.get(date) || { date, visitors: new Set<string>(), pageViews: 0, leads: 0 };
    current.visitors.add(event.visitorId);
    if (event.type === "page_view") current.pageViews += 1;
    if (/contact|checkout|order/i.test(event.type)) current.leads += 1;
    groups.set(date, current);
  });
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date)).map((row) => ({ date: row.date, visitors: row.visitors.size, pageViews: row.pageViews, leads: row.leads }));
}
