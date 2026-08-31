#!/usr/bin/env node

const KV_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const STORE_PREFIX = process.env.COMMERCE_STORE_PREFIX || "cheerdmotors-commerce";
const STORE_KEY = `${STORE_PREFIX}:admin-store.json`;
const WRITE = process.argv.includes("--write");
const FALLBACK_COVER = "/volt-lab/products/xceed_transparent.png";
const BROKEN_COVER = "https://www.electrive.com/media/2026/07/audi-a2-etron-erlkonig-2026-electrive-400x307.png";
const PRODUCT_IMAGE_FIXES = {
  "battery-pack": "/volt-lab/category/accessories/parts_accessories_use_accessory_01.png",
  "brake-kit": "/volt-lab/category/accessories/parts_accessories_use_accessory_02.png",
  "smart-charger": "/volt-lab/category/accessories/parts_accessories_use_accessory_08.png",
};

if (!KV_URL || !KV_TOKEN) throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN are required.");

const named = { amp: "&", apos: "'", gt: ">", hellip: "...", ldquo: '"', lsquo: "'", lt: "<", mdash: "-", nbsp: " ", ndash: "-", quot: '"', rdquo: '"', rsquo: "'" };

function decode(value) {
  return String(value || "").replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (entity, code) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()] ?? entity;
    const hexadecimal = code[1]?.toLowerCase() === "x";
    const parsed = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 0x10ffff) return entity;
    try { return String.fromCodePoint(parsed); } catch { return entity; }
  });
}

async function pipeline(commands) {
  const response = await fetch(`${KV_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!response.ok) throw new Error(`KV request failed with HTTP ${response.status}`);
  const result = await response.json();
  const error = result.find((item) => item.error)?.error;
  if (error) throw new Error(error);
  return result.map((item) => item.result);
}

const [storedValue] = await pipeline([["GET", STORE_KEY]]);
if (!storedValue) throw new Error("admin-store.json was not found.");
const store = JSON.parse(storedValue);
const fields = ["title", "excerpt", "category", "content", "author", "source", "seoTitle", "seoDescription", "originalTitle", "sourceName", "sourceUrl", "canonicalSourceUrl", "facts", "perspective", "customerImpact", "ourHelp", "geoSummary", "imageAlt"];
let changedPosts = 0;
let changedFields = 0;
let replacedCovers = 0;
let repairedProductImages = 0;

store.posts = (store.posts || []).map((post) => {
  const next = { ...post };
  fields.forEach((field) => {
    if (typeof next[field] !== "string") return;
    const decoded = decode(next[field]);
    if (decoded !== next[field]) changedFields += 1;
    next[field] = decoded;
  });
  next.tags = (next.tags || []).map(decode);
  next.faq = next.faq?.map((item) => ({ question: decode(item.question), answer: decode(item.answer) }));
  next.coverImage = decode(next.coverImage);
  if (next.coverImage === BROKEN_COVER) {
    next.coverImage = FALLBACK_COVER;
    replacedCovers += 1;
  }
  if (JSON.stringify(next) !== JSON.stringify(post)) changedPosts += 1;
  return next;
});

store.products = (store.products || []).map((product) => {
  const fixedImage = PRODUCT_IMAGE_FIXES[product.slug];
  if (!fixedImage || product.coverImage === fixedImage) return product;
  repairedProductImages += 1;
  return { ...product, coverImage: fixedImage, galleryImages: [fixedImage, ...(product.galleryImages || []).filter((image) => image !== product.coverImage && image !== fixedImage)], updatedAt: new Date().toISOString() };
});

if (WRITE && (changedPosts || repairedProductImages)) await pipeline([["SET", STORE_KEY, JSON.stringify(store)]]);
process.stdout.write(`${JSON.stringify({ mode: WRITE ? "write" : "dry-run", posts: store.posts.length, changedPosts, changedFields, replacedCovers, repairedProductImages }, null, 2)}\n`);
