import { durableStoreStatus } from "@/lib/durableStore";
import { listPublishedPosts } from "@/lib/backendStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const [news, blog] = await Promise.all([listPublishedPosts("news"), listPublishedPosts("blog")]);
  return Response.json({ ok: true, generatedAt: new Date().toISOString(), store: durableStoreStatus(), content: { news: news.length, blog: blog.length } }, { headers: { "Cache-Control": "no-store" } });
}
