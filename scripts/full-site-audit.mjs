import fs from "node:fs";

const base = (process.env.SITE_URL || "https://cheerdmotors.com").replace(/\/$/, "");
const reportFile = process.env.AUDIT_REPORT_FILE || "/tmp/cheerdmotors-full-site-audit.json";
const timeoutMs = Number(process.env.AUDIT_TIMEOUT_MS || 30000);

const extraPaths = [
  "/",
  "/electric-dirt-bikes",
  "/electric-bikes",
  "/electric-wheelchairs",
  "/accessories",
  "/news",
  "/blog",
  "/search",
  "/contact",
  "/checkout",
  "/privacy",
  "/terms",
  "/robots.txt",
  "/sitemap.xml",
  "/news/rss.xml",
  "/api/health",
  "/api/news",
  "/does-not-exist-audit",
];

function plainText(value = "") {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeAttribute(value = "") {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/gi, "'");
}

function attr(body, element, key, value, target) {
  const first = new RegExp(`<${element}[^>]+${key}=["']${value}["'][^>]+${target}=["']([^"']*)`, "i").exec(body)?.[1];
  if (first !== undefined) return first;
  return new RegExp(`<${element}[^>]+${target}=["']([^"']*)["'][^>]+${key}=["']${value}["']`, "i").exec(body)?.[1] || "";
}

async function fetchPage(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "CHEERDMOTO-FullAudit/1.0" },
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
    const type = response.headers.get("content-type") || "";
    const body = await response.text();
    const isHtml = type.includes("text/html");
    return {
      url,
      status: response.status,
      finalUrl: response.url,
      type,
      timeMs: Date.now() - started,
      bytes: Buffer.byteLength(body),
      title: isHtml ? plainText(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(body)?.[1]) : "",
      h1: isHtml ? [...body.matchAll(/<h1\b/gi)].length : 0,
      canonical: isHtml ? attr(body, "link", "rel", "canonical", "href") : "",
      description: isHtml ? plainText(attr(body, "meta", "name", "description", "content")) : "",
      encodedEntities: isHtml ? (body.match(/&amp;#(?:x[0-9a-f]+|\d+);/gi) || []).length : 0,
      oldDomain: isHtml ? /cheedmoto\.com|cheerdmoto\.com/i.test(body) : false,
      imageSrcs: isHtml
        ? [...body.matchAll(/<(?:img|source)\b[^>]+(?:src|srcset)=["']([^"']+)/gi)].map((match) => decodeAttribute(match[1].split(" ")[0])).slice(0, 150)
        : [],
      links: isHtml ? [...body.matchAll(/<a\b[^>]+href=["']([^"']+)/gi)].map((match) => match[1]).slice(0, 400) : [],
    };
  } catch (error) {
    return { url, status: 0, timeMs: Date.now() - started, error: String(error) };
  }
}

async function fetchImage(url) {
  const started = Date.now();
  try {
    let response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": "CHEERDMOTO-FullAudit/1.0" },
      signal: AbortSignal.timeout(Math.min(timeoutMs, 20000)),
    });
    if ([403, 405].includes(response.status)) {
      response = await fetch(url, {
        redirect: "follow",
        headers: { Range: "bytes=0-0", "User-Agent": "CHEERDMOTO-FullAudit/1.0" },
        signal: AbortSignal.timeout(Math.min(timeoutMs, 20000)),
      });
    }
    return {
      url,
      status: response.status,
      type: response.headers.get("content-type") || "",
      length: response.headers.get("content-length") || "",
      timeMs: Date.now() - started,
    };
  } catch (error) {
    return { url, status: 0, error: String(error), timeMs: Date.now() - started };
  }
}

async function mapConcurrent(values, concurrency, operation) {
  let cursor = 0;
  const results = [];
  async function worker() {
    while (cursor < values.length) {
      const index = cursor++;
      results[index] = await operation(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

const sitemapXml = await fetch(`${base}/sitemap.xml`, { cache: "no-store" }).then((response) => response.text());
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => {
  try {
    const source = new URL(match[1]);
    return `${base}${source.pathname}${source.search}`;
  } catch {
    return new URL(match[1], base).href;
  }
});
const urls = [...new Set([...sitemapUrls, ...extraPaths.map((path) => `${base}${path}`)])];
const pages = await mapConcurrent(urls, Number(process.env.AUDIT_CONCURRENCY || 4), fetchPage);

const images = [...new Set(pages.flatMap((page) => page.imageSrcs || []).map((src) => {
  try {
    return new URL(src, pageForImage(pages, src)?.url || base).href;
  } catch {
    return "";
  }
}).filter(Boolean))];
const imageResults = await mapConcurrent(images, 8, fetchImage);

function pageForImage(allPages, src) {
  return allPages.find((page) => (page.imageSrcs || []).includes(src));
}

const report = {
  generatedAt: new Date().toISOString(),
  base,
  sitemapCount: sitemapUrls.length,
  pages,
  images: imageResults,
};
fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

const htmlPages = pages.filter((page) => page.type?.includes("text/html") && page.status === 200);
const summary = {
  reportFile,
  urls: pages.length,
  statuses: Object.fromEntries([...new Set(pages.map((page) => page.status))].sort().map((status) => [status, pages.filter((page) => page.status === status).length])),
  failed: pages.filter((page) => !page.status || page.status >= 400).map((page) => ({ url: page.url, status: page.status, error: page.error })),
  htmlMissingTitle: htmlPages.filter((page) => !page.title).map((page) => page.url),
  htmlBadH1: htmlPages.filter((page) => page.h1 !== 1).map((page) => ({ url: page.url, h1: page.h1 })),
  missingDescription: htmlPages.filter((page) => !page.description).map((page) => page.url),
  missingCanonical: htmlPages.filter((page) => !page.canonical).map((page) => page.url),
  entityPages: htmlPages.filter((page) => page.encodedEntities > 0).map((page) => ({ url: page.url, count: page.encodedEntities })),
  oldDomainPages: htmlPages.filter((page) => page.oldDomain).map((page) => page.url),
  slowest: pages.slice().sort((a, b) => b.timeMs - a.timeMs).slice(0, 15).map((page) => ({ url: page.url, timeMs: page.timeMs, bytes: page.bytes })),
  images: imageResults.length,
  imageFailures: imageResults.filter((image) => !image.status || image.status >= 400),
};

console.log(JSON.stringify(summary, null, 2));
