import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, postPath } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CHEERDMOTO News | Electric Mobility Industry Updates",
  description: "Recent electric mobility news with CHEERDMOTO analysis, source attribution, related products, SEO and GEO context.",
  alternates: { canonical: absoluteUrl("/news") },
};

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const posts = (await listPublishedPosts("news")).filter((post) => !category || post.category === category || post.tags.includes(category));
  const categories = [...new Set((await listPublishedPosts("news")).map((post) => post.category).filter(Boolean))];
  return (
    <main className="content-site">
      <header className="content-nav"><Link href="/">CHEERDMOTO</Link><nav><Link href="/news">News</Link><Link href="/blog">Blog</Link><Link href="/search">Search</Link></nav></header>
      <section className="content-hero">
        <p className="eyebrow">Global News</p>
        <h1>Electric mobility news, filtered for product decisions.</h1>
        <p>Every published item keeps the original source visible, adds CHEERDMOTO analysis, and links readers to relevant product categories.</p>
      </section>
      <section className="content-filters">
        <Link className={!category ? "is-active" : ""} href="/news">All</Link>
        {categories.map((item) => <Link className={category === item ? "is-active" : ""} href={`/news?category=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}
      </section>
      <section className="content-grid">
        {posts.length ? posts.map((post) => (
          <article className="content-card" key={post.id}>
            <img src={post.coverImage} alt={post.imageAlt || post.title} />
            <div><span>{post.publishDate} · {post.category}</span><h2><Link href={postPath(post)}>{post.title}</Link></h2><p>{post.excerpt}</p><small>Source: {post.sourceName || post.source || "CHEERDMOTO"}</small></div>
          </article>
        )) : <article className="content-empty"><h2>No published news yet</h2><p>The automation publishes only when a verified source, source date, image and product match are available.</p></article>}
      </section>
    </main>
  );
}
