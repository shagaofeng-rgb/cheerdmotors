import crypto from "node:crypto";
import { readAdminStore, writeAdminStore, type ContentPost } from "@/lib/backendStore";
import { canonicalizeSourceUrl, cleanText, fallbackRelatedProducts, slugify } from "@/lib/content";
import { appendStoreLineLimited, readStoreLines } from "@/lib/durableStore";
import { products, type ProductSlug } from "@/lib/site";

const LOG_FILE = "news-automation-log.jsonl";
const LOG_LIMIT = 120;

const defaultFeeds = [
  "https://electrek.co/feed/",
  "https://cleantechnica.com/feed/",
  "https://insideevs.com/rss/news/all/",
  "https://www.electrive.com/feed/",
];

const relevanceTerms = [
  "electric", "ev", "e-bike", "ebike", "mobility", "battery", "charging", "motor",
  "motorcycle", "bike", "scooter", "wheelchair", "off-road", "vehicle", "transport",
];

type FeedItem = {
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  sourceName: string;
  language: string;
};

export type NewsAutomationRun = {
  ok: boolean;
  status: "completed" | "target_reached" | "dry_run" | "failed";
  startedAt: string;
  completedAt: string;
  durationMs: number;
  target: number;
  existingToday: number;
  needed: number;
  candidates: number;
  eligible: number;
  published: number;
  publishedSlugs: string[];
  sourceResults: Array<{ feed: string; ok: boolean; items: number; error?: string }>;
  skipped: string[];
  errors: string[];
  dryRun: boolean;
};

type StoredNewsAutomationRun = Partial<NewsAutomationRun> & {
  generatedAt?: string;
};

function envList(key: string, fallback: string[] = []) {
  return (process.env[key] || fallback.join(","))
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dailyTarget() {
  const configured = Number(process.env.NEWS_DAILY_TARGET || 4);
  return Number.isFinite(configured) ? Math.max(1, Math.min(8, configured)) : 4;
}

function sourceWindowHours() {
  const configured = Number(process.env.NEWS_SOURCE_WINDOW_HOURS || 72);
  return Number.isFinite(configured) ? Math.max(24, Math.min(168, configured)) : 72;
}

function decodeHtml(value: string) {
  const named: Record<string, string> = {
    amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"',
    hellip: "...", laquo: '"', ldquo: '"', lsquo: "'", mdash: "-", ndash: "-",
    raquo: '"', rdquo: '"', rsquo: "'",
  };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&([a-z]+);/gi, (entity, name) => named[name.toLowerCase()] ?? entity);
}

function tagRaw(item: string, tag: string) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(item);
  return (match?.[1] || "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function tagText(item: string, tag: string, limit = 2000) {
  return cleanText(decodeHtml(tagRaw(item, tag)), limit);
}

function tagAttr(item: string, tag: string, attr: string) {
  const match = new RegExp(`<${tag}[^>]*>`, "i").exec(item)?.[0] || "";
  return decodeHtml(new RegExp(`${attr}=["']([^"']+)["']`, "i").exec(match)?.[1] || "");
}

function normalizedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function feedSourceName(xml: string, feedUrl: string) {
  const channel = /<channel[\s\S]*?<\/channel>/i.exec(xml)?.[0] || xml;
  const title = tagText(channel, "title", 120);
  if (title) return title;
  try {
    return new URL(feedUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown source";
  }
}

function parseFeed(xml: string, feedUrl: string): FeedItem[] {
  const sourceName = feedSourceName(xml, feedUrl);
  const language = tagText(xml, "language", 30) || "en";
  const nodes = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return nodes
    .map((item) => ({
      title: tagText(item, "title", 220),
      link: tagText(item, "link", 1000) || tagAttr(item, "link", "href"),
      description: tagText(item, "description", 1400) || tagText(item, "summary", 1400) || tagText(item, "content:encoded", 1400),
      publishedAt: normalizedDate(tagText(item, "pubDate", 120) || tagText(item, "published", 120) || tagText(item, "updated", 120)),
      sourceName,
      language,
    }))
    .filter((item) => item.title && item.link && item.publishedAt);
}

function trustScore(source: string, url: string) {
  const allow = envList("NEWS_SOURCE_ALLOWLIST");
  const deny = envList("NEWS_SOURCE_BLOCKLIST");
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {}
  if (deny.some((item) => host.includes(item.toLowerCase()) || source.toLowerCase().includes(item.toLowerCase()))) return 0;
  if (!allow.length) return 80;
  return allow.some((item) => host.includes(item.toLowerCase()) || source.toLowerCase().includes(item.toLowerCase())) ? 90 : 35;
}

function hashId(value: string) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function isWithinWindow(value: string) {
  const age = Date.now() - new Date(value).getTime();
  return age >= -60 * 60 * 1000 && age <= sourceWindowHours() * 60 * 60 * 1000;
}

function isRelevant(item: FeedItem) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return relevanceTerms.some((term) => text.includes(term));
}

function articleContent(item: FeedItem, relatedSlugs: ProductSlug[]) {
  const productNames = relatedSlugs.map((slug) => products[slug]?.name).filter(Boolean).join(", ");
  const sourceSummary = cleanText(item.description, 320);
  const facts = sourceSummary
    ? `${item.sourceName} reported this electric mobility development: ${sourceSummary}`
    : `${item.sourceName} reported a recent development related to electric mobility.`;
  const perspective = "For CHEERDMOTO customers, the useful signal is how this development may affect range expectations, battery confidence, service support, ownership cost and model selection.";
  const customerImpact = `Customers comparing ${productNames} can use this context to ask better questions about ride scenario, parts support, comfort, power and long-term maintenance.`;
  const ourHelp = "CHEERDMOTO connects product specifications, category pages and ownership support so customers can move from industry context to a practical product decision.";
  return {
    facts,
    perspective,
    customerImpact,
    ourHelp,
    body: `## Original news fact summary\n\n${facts}\n\n## Why this matters\n\n${perspective}\n\n## Relationship to customers\n\n${customerImpact}\n\n## How CHEERDMOTO can help\n\n${ourHelp}\n\n## Related products\n\nThis analysis is connected to ${productNames}.`,
  };
}

async function fetchFeed(feed: string) {
  const response = await fetch(feed, {
    headers: { "User-Agent": "CHEERDMOTO-NewsBot/2.0 (+https://cheerdmotors.com/news)" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return parseFeed(await response.text(), feed);
}

function compactReason(reason: string) {
  return cleanText(reason, 240);
}

async function recordRun(run: NewsAutomationRun) {
  await appendStoreLineLimited(LOG_FILE, run, LOG_LIMIT);
}

export async function getNewsAutomationRuns(limit = 10) {
  const runs = await readStoreLines<StoredNewsAutomationRun>(LOG_FILE);
  return runs
    .map((run) => {
      const timestamp = run.completedAt || run.startedAt || run.generatedAt || new Date(0).toISOString();
      const status: NewsAutomationRun["status"] = ["completed", "target_reached", "dry_run", "failed"].includes(String(run.status))
        ? (run.status as NewsAutomationRun["status"])
        : run.ok ? "completed" : "failed";
      return {
        ok: Boolean(run.ok),
        status,
        startedAt: run.startedAt || run.generatedAt || timestamp,
        completedAt: timestamp,
        durationMs: Number(run.durationMs || 0),
        target: Number(run.target || 4),
        existingToday: Number(run.existingToday || 0),
        needed: Number(run.needed || 0),
        candidates: Number(run.candidates || 0),
        eligible: Number(run.eligible || 0),
        published: Number(run.published || 0),
        publishedSlugs: Array.isArray(run.publishedSlugs) ? run.publishedSlugs : [],
        sourceResults: Array.isArray(run.sourceResults) ? run.sourceResults : [],
        skipped: Array.isArray(run.skipped) ? run.skipped : [],
        errors: Array.isArray(run.errors) ? run.errors : [],
        dryRun: Boolean(run.dryRun),
      } satisfies NewsAutomationRun;
    })
    .slice(-Math.max(1, Math.min(50, limit)))
    .reverse();
}

export async function runNewsAutomation(options: { dryRun?: boolean } = {}) {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const target = dailyTarget();
  const dryRun = Boolean(options.dryRun);
  const store = await readAdminStore();
  const today = startedAt.slice(0, 10);
  const existingNews = store.posts.filter((post) => post.type === "news");
  const existingToday = existingNews.filter((post) => post.status === "published" && post.publishDate === today).length;
  const needed = Math.max(0, target - existingToday);
  const sourceResults: NewsAutomationRun["sourceResults"] = [];
  const skipped: string[] = [];
  const errors: string[] = [];
  const publishedSlugs: string[] = [];
  let candidates = 0;
  let eligible = 0;

  const finish = async (status: NewsAutomationRun["status"], ok: boolean) => {
    const run: NewsAutomationRun = {
      ok,
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startedMs,
      target,
      existingToday,
      needed,
      candidates,
      eligible,
      published: dryRun ? 0 : publishedSlugs.length,
      publishedSlugs,
      sourceResults,
      skipped: skipped.slice(0, 80),
      errors: errors.slice(0, 20),
      dryRun,
    };
    await recordRun(run);
    return run;
  };

  if (!needed && !dryRun) {
    skipped.push("Daily publication target already reached.");
    return finish("target_reached", true);
  }

  const feeds = envList("NEWS_RSS_FEEDS", defaultFeeds);
  const settled = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)));
  const items: FeedItem[] = [];
  settled.forEach((result, index) => {
    const feed = feeds[index];
    if (result.status === "fulfilled") {
      sourceResults.push({ feed, ok: true, items: result.value.length });
      items.push(...result.value);
    } else {
      const error = compactReason(result.reason instanceof Error ? result.reason.message : "Unknown feed error");
      sourceResults.push({ feed, ok: false, items: 0, error });
      errors.push(`${feed}: ${error}`);
    }
  });

  const knownSources = new Set(existingNews.map((post) => post.canonicalSourceUrl || post.sourceUrl).filter(Boolean));
  const knownSlugs = new Set(existingNews.map((post) => post.slug));
  const selected: ContentPost[] = [];
  const selectionLimit = dryRun ? Math.max(1, target) : needed;

  for (const item of items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    if (selected.length >= selectionLimit) break;
    candidates += 1;
    const canonicalSourceUrl = canonicalizeSourceUrl(item.link);
    if (!isWithinWindow(item.publishedAt)) {
      skipped.push(`Outside ${sourceWindowHours()}h window: ${item.title}`);
      continue;
    }
    if (!isRelevant(item)) {
      skipped.push(`Not relevant enough: ${item.title}`);
      continue;
    }
    if (knownSources.has(canonicalSourceUrl)) {
      skipped.push(`Source already published: ${item.title}`);
      continue;
    }
    const sourceTrust = trustScore(item.sourceName, item.link);
    if (sourceTrust < 50) {
      skipped.push(`Source blocked or outside allowlist: ${item.title}`);
      continue;
    }

    const relatedProductSlugs = fallbackRelatedProducts(`${item.title} ${item.description}`) as ProductSlug[];
    const content = articleContent(item, relatedProductSlugs);
    const slug = `${slugify(item.title)}-${hashId(canonicalSourceUrl)}`;
    if (knownSlugs.has(slug)) continue;
    const primaryProduct = products[relatedProductSlugs[0]] || products.xceed;
    const createdAt = new Date().toISOString();
    selected.push({
      id: `news-${Date.now()}-${hashId(canonicalSourceUrl)}`,
      type: "news",
      slug,
      title: item.title.slice(0, 120),
      excerpt: cleanText(content.facts, 260),
      coverImage: primaryProduct.image,
      category: "Industry News",
      content: content.body,
      publishDate: today,
      author: "CHEERDMOTO Editorial Team",
      source: item.sourceName,
      tags: ["electric mobility", "industry news", ...relatedProductSlugs],
      seoTitle: `${item.title.slice(0, 62)} | CHEERDMOTO News`,
      seoDescription: cleanText(`${content.facts} ${content.perspective}`, 155),
      status: "published",
      createdAt,
      updatedAt: createdAt,
      originalTitle: item.title,
      originalLanguage: item.language,
      sourceName: item.sourceName,
      sourceUrl: item.link,
      canonicalSourceUrl,
      sourcePublishedAt: item.publishedAt,
      sourceFetchedAt: startedAt,
      sourceTimezone: "source-provided",
      facts: content.facts,
      perspective: content.perspective,
      customerImpact: content.customerImpact,
      ourHelp: content.ourHelp,
      geoSummary: `CHEERDMOTO connects this ${item.sourceName} report to product selection, ownership support and related electric mobility models.`,
      faq: [
        { question: "What source is cited?", answer: `${item.sourceName}, originally published on ${item.publishedAt.slice(0, 10)}.` },
        { question: "Which CHEERDMOTO products are related?", answer: relatedProductSlugs.map((slug) => products[slug]?.name).filter(Boolean).join(", ") },
      ],
      relatedProductSlugs,
      imageAlt: `${primaryProduct.name} - related CHEERDMOTO product`,
      imageSourceUrl: primaryProduct.image,
      imagePageUrl: `/products/${primaryProduct.slug}`,
      automationStatus: "published",
      relevanceScore: 70,
      trustScore: sourceTrust,
      retryCount: 0,
    });
    knownSources.add(canonicalSourceUrl);
    knownSlugs.add(slug);
    eligible += 1;
  }

  if (dryRun) {
    publishedSlugs.push(...selected.map((post) => post.slug));
    return finish(selected.length ? "dry_run" : "failed", selected.length > 0);
  }

  if (selected.length) {
    await writeAdminStore((current) => {
      const currentSources = new Set(current.posts.map((post) => post.canonicalSourceUrl || post.sourceUrl).filter(Boolean));
      const currentSlugs = new Set(current.posts.map((post) => post.slug));
      const additions = selected.filter((post) => !currentSources.has(post.canonicalSourceUrl) && !currentSlugs.has(post.slug));
      publishedSlugs.push(...additions.map((post) => post.slug));
      return additions.length ? { ...current, posts: [...current.posts, ...additions] } : current;
    });
  }

  const ok = publishedSlugs.length >= needed;
  if (!publishedSlugs.length) errors.push("No eligible unpublished items were available from the configured sources.");
  return finish(ok ? "completed" : "failed", ok);
}
