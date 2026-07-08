import { products, productSlugs, type ProductSlug } from "@/lib/site";
import type { ContentPost } from "@/lib/backendStore";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://cheerdmotors.com").replace(/\/$/, "");

export function absoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function postPath(post: Pick<ContentPost, "type" | "slug">) {
  return `/${post.type}/${post.slug}`;
}

export function cleanText(value: string, limit = 5000) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96) || `post-${Date.now()}`;
}

export function canonicalizeSourceUrl(value: string) {
  try {
    const url = new URL(value);
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "mc_cid", "mc_eid"].forEach((key) => url.searchParams.delete(key));
    url.hash = "";
    return url.toString();
  } catch {
    return value.trim();
  }
}

export function relatedProductsForText(text: string, max = 3) {
  const haystack = text.toLowerCase();
  const scored = productSlugs.map((slug) => {
    const product = products[slug];
    const terms = [product.name, product.category, ...product.specs].map((item) => item.toLowerCase());
    const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 2 : 0) + term.split(/\s+/).filter((word) => word.length > 3 && haystack.includes(word)).length, 0);
    return { slug, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, max)
    .map((item) => item.slug);
}

export function fallbackRelatedProducts(text: string, max = 3) {
  const related = relatedProductsForText(text, max);
  if (related.length) return related;
  return ["xceed", "xcite", "smart-b02"].slice(0, max) as ProductSlug[];
}

export function productUrl(slug: string) {
  const product = products[slug as ProductSlug];
  if (!product) return "/";
  if (product.category === "Electric Dirt Bikes") return "/electric-dirt-bikes#catalog";
  if (product.category === "Electric Bikes") return "/electric-bikes#catalog";
  if (product.category === "Electric Wheelchairs") return "/electric-wheelchairs#catalog";
  return "/accessories#catalog";
}

export function markdownToBlocks(markdown: string) {
  return markdown
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const heading = /^#{2,3}\s+(.+)$/.exec(block);
      if (heading) return { type: "heading", text: heading[1] };
      return { type: "paragraph", text: block.replace(/^[-*]\s+/gm, "") };
    });
}
