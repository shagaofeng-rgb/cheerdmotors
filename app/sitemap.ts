import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, postPath } from "@/lib/content";
import { listStorefrontProducts } from "@/lib/storefrontCatalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/electric-dirt-bikes", "/electric-bikes", "/electric-wheelchairs", "/accessories", "/news", "/blog", "/search", "/contact", "/privacy", "/terms"];
  const [posts, storefrontProducts] = await Promise.all([listPublishedPosts(), listStorefrontProducts()]);
  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route), lastModified: new Date(), changeFrequency: route === "/" ? "daily" as const : "weekly" as const, priority: route === "/" ? 1 : 0.8 })),
    ...storefrontProducts.map((product) => ({ url: absoluteUrl(`/products/${product.slug}`), lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.85 })),
    ...posts.map((post) => ({ url: absoluteUrl(postPath(post)), lastModified: new Date(post.updatedAt), changeFrequency: "weekly" as const, priority: post.type === "news" ? 0.7 : 0.65 })),
  ];
}
