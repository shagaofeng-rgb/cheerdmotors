import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, postPath } from "@/lib/content";

export const dynamic = "force-dynamic";

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] || char);
}

export async function GET() {
  const posts = await listPublishedPosts("news");
  const items = posts.slice(0, 50).map((post) => `<item><title>${escapeXml(post.title)}</title><link>${absoluteUrl(postPath(post))}</link><guid>${absoluteUrl(postPath(post))}</guid><pubDate>${new Date(post.createdAt).toUTCString()}</pubDate><description>${escapeXml(post.excerpt)}</description><source url="${escapeXml(post.sourceUrl || "")}">${escapeXml(post.sourceName || post.source || "CHEERDMOTO")}</source></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>CHEERDMOTO News</title><link>${absoluteUrl("/news")}</link><description>CHEERDMOTO electric mobility news and analysis.</description>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
