import crypto from "node:crypto";
import { readStoreObject, writeStoreObject } from "@/lib/durableStore";

const GSC_STORE_FILE = "google-search-console.json";
const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

export type GoogleSearchRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GoogleSearchSnapshot = {
  configured: boolean;
  siteUrl: string;
  syncedAt: string;
  startDate: string;
  endDate: string;
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  queryPages: GoogleSearchRow[];
  queries: GoogleSearchRow[];
  pages: GoogleSearchRow[];
  countries: GoogleSearchRow[];
  devices: GoogleSearchRow[];
  dates: GoogleSearchRow[];
  error: string;
};

type SearchAnalyticsResponse = {
  rows?: GoogleSearchRow[];
  responseAggregationType?: string;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function envValue(key: string) {
  return (process.env[key] || "").trim();
}

function privateKey() {
  return envValue("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");
}

export function googleSearchConsoleStatus() {
  const siteUrl = envValue("GOOGLE_SEARCH_CONSOLE_SITE_URL") || envValue("GOOGLE_SITE_URL") || "sc-domain:cheerdmotors.com";
  const clientEmail = envValue("GOOGLE_SERVICE_ACCOUNT_EMAIL") || envValue("GOOGLE_CLIENT_EMAIL");
  const hasPrivateKey = Boolean(privateKey());
  return {
    configured: Boolean(siteUrl && clientEmail && hasPrivateKey),
    siteUrl,
    clientEmailConfigured: Boolean(clientEmail),
    privateKeyConfigured: hasPrivateKey,
  };
}

function defaultDateWindow() {
  const end = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const start = new Date(end.getTime() - 27 * 24 * 60 * 60 * 1000);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

function normalizeDate(value: string | null, fallback: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? String(value) : fallback;
}

export function googleSearchDateRange(formData?: FormData) {
  const defaults = defaultDateWindow();
  const startDate = normalizeDate(formData ? String(formData.get("startDate") || "") : "", defaults.startDate);
  const endDate = normalizeDate(formData ? String(formData.get("endDate") || "") : "", defaults.endDate);
  return startDate <= endDate ? { startDate, endDate } : { startDate: endDate, endDate: startDate };
}

async function getGoogleAccessToken() {
  const status = googleSearchConsoleStatus();
  const email = envValue("GOOGLE_SERVICE_ACCOUNT_EMAIL") || envValue("GOOGLE_CLIENT_EMAIL");
  const key = privateKey();
  if (!status.configured) throw new Error("Google Search Console credentials are not configured.");
  const iat = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({ iss: email, scope: GSC_SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600 }));
  const unsigned = `${header}.${claim}`;
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(key);
  const assertion = `${unsigned}.${base64Url(signature)}`;
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error(String(payload.error_description || payload.error || `Google token request failed: ${response.status}`));
  return String(payload.access_token);
}

async function querySearchAnalytics(accessToken: string, dimensions: string[], startDate: string, endDate: string) {
  const { siteUrl } = googleSearchConsoleStatus();
  const rowLimit = Math.max(1, Math.min(25000, Number(process.env.GOOGLE_SEARCH_CONSOLE_ROW_LIMIT || 25000)));
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate, dimensions, rowLimit, type: "web", dataState: "final" }),
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as SearchAnalyticsResponse & { error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message || `Google Search Console request failed: ${response.status}`);
  return (payload.rows || []).map((row) => ({ keys: row.keys || [], clicks: Number(row.clicks || 0), impressions: Number(row.impressions || 0), ctr: Number(row.ctr || 0), position: Number(row.position || 0) }));
}

function totalsFrom(rows: GoogleSearchRow[]) {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const positionWeight = rows.reduce((sum, row) => sum + row.position * row.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? positionWeight / impressions : 0,
  };
}

function emptySnapshot(error = ""): GoogleSearchSnapshot {
  const status = googleSearchConsoleStatus();
  const range = defaultDateWindow();
  return {
    configured: status.configured,
    siteUrl: status.siteUrl,
    syncedAt: "",
    startDate: range.startDate,
    endDate: range.endDate,
    totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    queryPages: [],
    queries: [],
    pages: [],
    countries: [],
    devices: [],
    dates: [],
    error,
  };
}

export async function readGoogleSearchSnapshot() {
  const stored = await readStoreObject<GoogleSearchSnapshot>(GSC_STORE_FILE);
  if (!stored) return emptySnapshot();
  const status = googleSearchConsoleStatus();
  return { ...stored, configured: status.configured, siteUrl: status.siteUrl };
}

export async function syncGoogleSearchConsole(formData?: FormData) {
  const status = googleSearchConsoleStatus();
  if (!status.configured) {
    const snapshot = emptySnapshot("Google Search Console 环境变量未配置完整。");
    await writeStoreObject(GSC_STORE_FILE, snapshot);
    return snapshot;
  }
  const { startDate, endDate } = googleSearchDateRange(formData);
  const accessToken = await getGoogleAccessToken();
  const [queryPages, queries, pages, countries, devices, dates] = await Promise.all([
    querySearchAnalytics(accessToken, ["query", "page"], startDate, endDate),
    querySearchAnalytics(accessToken, ["query"], startDate, endDate),
    querySearchAnalytics(accessToken, ["page"], startDate, endDate),
    querySearchAnalytics(accessToken, ["country"], startDate, endDate),
    querySearchAnalytics(accessToken, ["device"], startDate, endDate),
    querySearchAnalytics(accessToken, ["date"], startDate, endDate),
  ]);
  const snapshot: GoogleSearchSnapshot = {
    configured: true,
    siteUrl: status.siteUrl,
    syncedAt: new Date().toISOString(),
    startDate,
    endDate,
    totals: totalsFrom(dates.length ? dates : queries),
    queryPages,
    queries,
    pages,
    countries,
    devices,
    dates,
    error: "",
  };
  await writeStoreObject(GSC_STORE_FILE, snapshot);
  return snapshot;
}
