import crypto from "node:crypto";
import { appendStoreLine } from "@/lib/durableStore";
import { readAdminStore, writeAdminStore, type ContentPost } from "@/lib/backendStore";
import { canonicalizeSourceUrl, cleanText, fallbackRelatedProducts, slugify } from "@/lib/content";
import { products, type ProductSlug } from "@/lib/site";

const LOG_FILE = "news-automation-log.jsonl";

type FeedItem = {
  title: string;
  link: string;
  description: string;
  publishedAt: string;
  sourceName: string;
  imageUrl: string;
  language: string;
};

const defaultFeeds = [
  "https://electrek.co/feed/",
  "https://cleantechnica.com/feed/",
  "https://insideevs.com/rss/news/all/",
  "https://www.electrive.com/feed/",
];

function envList(key: string, fallback: string[] = []) {
  return (process.env[key] || fallback.join(",")).split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
}

function dailyTarget() {
  return Math.max(1, Math.min(8, Number(process.env.NEWS_DAILY_TARGET || 4)));
}

function sourceWindowHours() {
  return Math.max(1, Math.min(168, Number(process.env.NEWS_SOURCE_WINDOW_HOURS || 72)));
}

function tagText(item: string, tag: string) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(item);
  return cleanText((match?.[1] || "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, ""), 2000);
}

function tagRaw(item: string, tag: string) {
  const match = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(item);
  return (match?.[1] || "").replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function tagAttr(item: string, tag: string, attr: string) {
  const match = new RegExp(`<${tag}[^>]*>`, "i").exec(item)?.[0] || "";
  return new RegExp(`${attr}=["']([^"']+)["']`, "i").exec(match)?.[1] || "";
}

function normalizedDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function sourceName(xml: string, feedUrl: string) {
  const title = tagText(/<channel[\s\S]*?<\/channel>/i.exec(xml)?.[0] || xml, "title");
  if (title) return title.slice(0, 120);
  try {
    return new URL(feedUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown source";
  }
}

function itemImage(item: string) {
  const media = tagAttr(item, "media:content", "url") || tagAttr(item, "media:thumbnail", "url") || tagAttr(item, "enclosure", "url");
  if (media && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(media)) return media;
  const raw = tagRaw(item, "description") || tagRaw(item, "content:encoded");
  return /<img[^>]+src=["']([^"']+)["']/i.exec(raw)?.[1] || "";
}

function parseFeed(xml: string, feedUrl: string): FeedItem[] {
  const name = sourceName(xml, feedUrl);
  const language = tagText(xml, "language") || "en";
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) || xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];
  return items
    .map((item) => ({
      title: tagText(item, "title"),
      link: tagText(item, "link") || tagAttr(item, "link", "href"),
      description: cleanText(tagRaw(item, "description") || tagRaw(item, "summary") || tagRaw(item, "content:encoded"), 1200),
      publishedAt: normalizedDate(tagText(item, "pubDate") || tagText(item, "published") || tagText(item, "updated")),
      sourceName: name,
      imageUrl: itemImage(item),
      language,
    }))
    .filter((item) => item.title && item.link && item.publishedAt);
}

function trustScore(source: string, url: string) {
  const allow = envList("NEWS_SOURCE_ALLOWLIST");
  const deny = envList("NEWS_SOURCE_BLOCKLIST");
  const host = (() => {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      return "";
    }
  })();
  if (deny.some((item) => host.includes(item.toLowerCase()) || source.toLowerCase().includes(item.toLowerCase()))) return 0;
  if (!allow.length) return 80;
  return allow.some((item) => host.includes(item.toLowerCase()) || source.toLowerCase().includes(item.toLowerCase())) ? 90 : 35;
}

function hashId(value: string) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 12);
}

function isWithinWindow(value: string) {
  const age = Date.now() - new Date(value).getTime();
  return age >= 0 && age <= sourceWindowHours() * 60 * 60 * 1000;
}

function sevenDaysAgo() {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

function articleContent(item: FeedItem, relatedSlugs: string[]) {
  const productNames = relatedSlugs.map((slug) => products[slug as ProductSlug]?.name).filter(Boolean).join(", ");
  const shortSourceSummary = cleanText(item.description, 280);
  const facts = shortSourceSummary ? `${item.sourceName} reported this electric mobility development: ${shortSourceSummary}` : `${item.sourceName} reported a recent development related to electric mobility.`;
  const perspective = "For CHEERDMOTO customers, the useful signal is not only the headline. It is how the development may affect range expectations, battery confidence, service support, ownership cost and model selection.";
  const customerImpact = `Customers comparing ${productNames} can use this context to ask better questions about ride scenario, parts support, comfort, power and long-term maintenance.`;
  const ourHelp = "CHEERDMOTO helps by connecting product specifications, category pages and ownership support paths, so shoppers and dealers can move from industry context to a practical product decision.";
  return {
    facts,
    perspective,
    customerImpact,
    ourHelp,
    body: `## Original news fact summary\n\n${facts}\n\n## Why this matters\n\n${perspective}\n\n## Relationship to customers\n\n${customerImpact}\n\n## How CHEERDMOTO can help\n\n${ourHelp}\n\n## Related products\n\nThis analysis is connected to ${productNames}.`,
  };
}

async function fetchFeed(url: string) {
  const response = await fetch(url, {
    headers: { "User-Agent": "CHEERDMOTO-NewsBot/1.0 (+https://cheerdmotors.com/news)" },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Feed request failed ${response.status} for ${url}`);
  return response.text();
}

export async function runNewsAutomation() {
  const generatedAt = new Date().toISOString();
  const result = { ok: true, generatedAt, target: dailyTarget(), published: 0, candidates: 0, skipped: [] as string[], errors: [] as string[] };
  const today = generatedAt.slice(0, 10);
  const store = await readAdminStore();
  const existingNews = store.posts.filter((post) => post.type === "news");
  const todayPublished = existingNews.filter((post) => post.status === "published" && post.publishDate === today).length;
  const needed = Math.max(0, result.target - todayPublished);
  const usedSources = new Set(existingNews.filter((post) => (post.sourcePublishedAt || post.createdAt) >= sevenDaysAgo()).map((post) => post.canonicalSourceUrl || post.sourceUrl).filter(Boolean));

  if (!needed) {
    result.skipped.push("Daily target already reached.");
    await appendStoreLine(LOG_FILE, result);
    return result;
  }

  const items: FeedItem[] = [];
  for (const feed of envList("NEWS_RSS_FEEDS", defaultFeeds)) {
    try {
      items.push(...parseFeed(await fetchFeed(feed), feed));
    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : `Feed failed: ${feed}`);
    }
  }

  for (const item of items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))) {
    if (result.published >= needed) break;
    result.candidates += 1;
    const canonicalSourceUrl = canonicalizeSourceUrl(item.link);
    if (!isWithinWindow(item.publishedAt)) {
      result.skipped.push(`Older than ${sourceWindowHours()}h: ${item.title}`);
      continue;
    }
    if (usedSources.has(canonicalSourceUrl)) {
      result.skipped.push(`Duplicate source in 7 days: ${item.title}`);
      continue;
    }
    const sourceTrust = trustScore(item.sourceName, item.link);
    if (sourceTrust < 50) {
      result.skipped.push(`Low trust source: ${item.title}`);
      continue;
    }
    if (!item.imageUrl) {
      result.skipped.push(`No usable source image: ${item.title}`);
      continue;
    }
    const relatedProductSlugs = fallbackRelatedProducts(`${item.title} ${item.description}`);
    const content = articleContent(item, relatedProductSlugs);
    const slug = `${slugify(item.title)}-${hashId(canonicalSourceUrl)}`;
    if (store.posts.some((post) => post.slug === slug)) continue;
    const post: ContentPost = {
      id: `news-${Date.now()}-${hashId(canonicalSourceUrl)}`,
      type: "news",
      slug,
      title: item.title.slice(0, 120),
      excerpt: cleanText(content.facts, 260),
      coverImage: item.imageUrl,
      category: "Industry News",
      content: content.body,
      publishDate: today,
      author: "CHEERDMOTO Editorial Team",
      source: item.sourceName,
      tags: ["electric mobility", "industry news", ...relatedProductSlugs],
      seoTitle: `${item.title.slice(0, 62)} | CHEERDMOTO News`,
      seoDescription: cleanText(`${content.facts} ${content.perspective}`, 155),
      status: "published",
      createdAt: generatedAt,
      updatedAt: generatedAt,
      originalTitle: item.title,
      originalLanguage: item.language,
      sourceName: item.sourceName,
      sourceUrl: item.link,
      canonicalSourceUrl,
      sourcePublishedAt: item.publishedAt,
      sourceFetchedAt: generatedAt,
      sourceTimezone: "source-provided",
      facts: content.facts,
      perspective: content.perspective,
      customerImpact: content.customerImpact,
      ourHelp: content.ourHelp,
      geoSummary: `CHEERDMOTO connects this ${item.sourceName} report to product selection, ownership support and related electric mobility models.`,
      faq: [
        { question: "What source is cited?", answer: `${item.sourceName}, originally published on ${item.publishedAt.slice(0, 10)}.` },
        { question: "Which CHEERDMOTO products are related?", answer: relatedProductSlugs.map((slug) => products[slug as ProductSlug]?.name).filter(Boolean).join(", ") },
      ],
      relatedProductSlugs,
      imageAlt: `${item.title} - CHEERDMOTO industry news`,
      imageSourceUrl: item.imageUrl,
      imagePageUrl: item.link,
      automationStatus: "published",
      relevanceScore: 70,
      trustScore: sourceTrust,
      retryCount: 0,
    };
    await writeAdminStore((current) => ({ ...current, posts: [...current.posts, post] }));
    usedSources.add(canonicalSourceUrl);
    result.published += 1;
  }

  result.ok = result.published >= needed;
  await appendStoreLine(LOG_FILE, result);
  return result;
}

export async function runBlogAutomation() {
  const generatedAt = new Date().toISOString();
  const today = generatedAt.slice(0, 10);
  const store = await readAdminStore();
  const todayBlog = store.posts.some((post) => post.type === "blog" && post.publishDate === today && post.automationStatus === "published");
  const result = { ok: true, generatedAt, published: 0, skipped: [] as string[], errors: [] as string[] };
  if (todayBlog) {
    result.skipped.push("Daily blog automation target already reached.");
    await appendStoreLine(LOG_FILE, { ...result, type: "blog" });
    return result;
  }
  const sourceNews = store.posts
    .filter((post) => post.type === "news" && post.status === "published" && post.coverImage && post.sourceUrl && post.relatedProductSlugs?.length)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  if (!sourceNews) {
    result.ok = false;
    result.errors.push("No verified News source is available for Blog automation.");
    await appendStoreLine(LOG_FILE, { ...result, type: "blog" });
    return result;
  }
  const relatedProductSlugs = sourceNews.relatedProductSlugs || ["xceed"];
  const productNames = relatedProductSlugs.map((slug) => products[slug as ProductSlug]?.name).filter(Boolean).join(", ");
  const title = `How to read ${sourceNews.category.toLowerCase()} signals when comparing ${productNames}`;
  const slug = `${slugify(title)}-${hashId(sourceNews.slug)}`;
  if (store.posts.some((post) => post.slug === slug)) {
    result.skipped.push("Derived blog already exists.");
    await appendStoreLine(LOG_FILE, { ...result, type: "blog" });
    return result;
  }
  const content = `## The buyer question\n\nRecent industry news can help customers ask sharper questions before choosing an electric mobility product.\n\n## What the source indicates\n\n${sourceNews.facts || sourceNews.excerpt}\n\n## How to compare products\n\nCompare power, battery confidence, service support, comfort, replacement parts and the real riding scenario. For CHEERDMOTO, this naturally connects to ${productNames}.\n\n## What to check before purchase\n\nConfirm the category, expected range, service parts, charging path, warranty coverage and whether the model matches daily use or dealer support needs.\n\n## Related CHEERDMOTO products\n\n${productNames} are the most relevant products for this guide.`;
  const post: ContentPost = {
    id: `blog-${Date.now()}-${hashId(sourceNews.slug)}`,
    type: "blog",
    slug,
    title,
    excerpt: `A CHEERDMOTO buying guide derived from verified industry news, connected to ${productNames}.`,
    coverImage: sourceNews.coverImage,
    category: "Buying Guide",
    content,
    publishDate: today,
    author: "CHEERDMOTO Editorial Team",
    source: sourceNews.sourceName || sourceNews.source,
    tags: ["buying guide", "electric mobility", ...relatedProductSlugs],
    seoTitle: `${title.slice(0, 62)} | CHEERDMOTO Blog`,
    seoDescription: `Use recent electric mobility news to compare ${productNames}, ownership support, charging, service parts and product fit.`,
    status: "published",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    originalTitle: sourceNews.originalTitle || sourceNews.title,
    originalLanguage: sourceNews.originalLanguage || "en",
    sourceName: sourceNews.sourceName || sourceNews.source,
    sourceUrl: sourceNews.sourceUrl,
    canonicalSourceUrl: sourceNews.canonicalSourceUrl,
    sourcePublishedAt: sourceNews.sourcePublishedAt,
    sourceFetchedAt: generatedAt,
    sourceTimezone: sourceNews.sourceTimezone,
    facts: sourceNews.facts || sourceNews.excerpt,
    perspective: "This guide turns verified industry context into a practical product comparison checklist.",
    customerImpact: `Customers can use the guide to compare ${productNames} by use case and support needs.`,
    ourHelp: "CHEERDMOTO provides product category pages, specifications and support paths that help turn research into a product decision.",
    geoSummary: `A CHEERDMOTO buying guide linking verified industry news to ${productNames}, product fit, ownership support and customer decision criteria.`,
    faq: [
      { question: "What is this guide based on?", answer: `It is based on a verified News source from ${sourceNews.sourceName || sourceNews.source}.` },
      { question: "Which products are most relevant?", answer: productNames },
    ],
    relatedProductSlugs,
    imageAlt: `CHEERDMOTO buying guide image related to ${productNames}`,
    imageSourceUrl: sourceNews.imageSourceUrl || sourceNews.coverImage,
    imagePageUrl: sourceNews.imagePageUrl || sourceNews.sourceUrl,
    automationStatus: "published",
    relevanceScore: 70,
    trustScore: sourceNews.trustScore || 70,
    retryCount: 0,
  };
  await writeAdminStore((current) => ({ ...current, posts: [...current.posts, post] }));
  result.published = 1;
  await appendStoreLine(LOG_FILE, { ...result, type: "blog" });
  return result;
}
