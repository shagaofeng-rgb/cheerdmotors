import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, postPath } from "@/lib/content";
import { listStorefrontProducts } from "@/lib/storefrontCatalog";
import SiteNav from "@/components/SiteNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search | COWIN",
  description: "Search COWIN products, News and Blog content.",
  alternates: { canonical: absoluteUrl("/search") },
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = String(Array.isArray(params.q) ? params.q[0] : params.q || "").trim().toLowerCase();
  const [posts, storefrontProducts] = await Promise.all([listPublishedPosts(), listStorefrontProducts()]);
  const postResults = q ? posts.filter((post) => `${post.title} ${post.excerpt} ${post.content} ${post.tags.join(" ")}`.toLowerCase().includes(q)) : posts.slice(0, 8);
  const productResults = q ? storefrontProducts.filter((product) => `${product.name} ${product.category} ${product.specs.join(" ")}`.toLowerCase().includes(q)) : [];
  return (
    <main className="content-site">
      <SiteNav />
      <section className="content-hero"><p className="eyebrow">Search</p><h1>Search products, News and Blog content.</h1><form className="search-form"><label className="sr-only" htmlFor="site-search">Search the COWIN website</label><input id="site-search" name="q" defaultValue={q} placeholder="Search electric dirt bikes, range, battery, wheelchair..." /><button>Search</button></form></section>
      <section className="search-results">
        <h2>Products</h2>{productResults.length ? productResults.map((product) => <Link href={`/products/${product.slug}`} key={product.slug}>{product.name}<span>{product.category}</span></Link>) : <p>{q ? "No products match this search." : "Enter a search term to find a product."}</p>}
        <h2>Content</h2>{postResults.length ? postResults.map((post) => <Link href={postPath(post)} key={post.id}>{post.title}<span>{post.type} · {post.publishDate}</span></Link>) : <p>No content matches yet.</p>}
      </section>
    </main>
  );
}
