import { listPublishedPosts } from "@/lib/backendStore";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "blog" ? "blog" : searchParams.get("type") === "news" ? "news" : undefined;
  return Response.json({ posts: await listPublishedPosts(type) }, { headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=3600" } });
}
