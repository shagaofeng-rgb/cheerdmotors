import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, postPath } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/electric-dirt-bikes", "/electric-bikes", "/electric-wheelchairs", "/accessories", "/news", "/blog", "/search", "/contact"];
  const posts = await listPublishedPosts();
  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route), lastModified: new Date(), changeFrequency: route === "/" ? "daily" as const : "weekly" as const, priority: route === "/" ? 1 : 0.8 })),
    ...posts.map((post) => ({ url: absoluteUrl(postPath(post)), lastModified: new Date(post.updatedAt), changeFrequency: "weekly" as const, priority: post.type === "news" ? 0.7 : 0.65 })),
  ];
}
