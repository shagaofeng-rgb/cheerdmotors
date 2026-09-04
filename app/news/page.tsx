import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, contentFallbackImage, postPath } from "@/lib/content";
import SiteNav from "@/components/SiteNav";
import ContentImage from "@/components/ContentImage";
import PublicPagination from "@/components/PublicPagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COWIN News | Electric Mobility Industry Updates",
  description: "Recent electric mobility news with COWIN analysis, source attribution, related products, SEO and GEO context.",
  alternates: { canonical: absoluteUrl("/news") },
};

const PAGE_SIZE = 9;

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const requestedPage = Number(Array.isArray(params.page) ? params.page[0] : params.page || 1);
  const allPosts = await listPublishedPosts("news");
  const filteredPosts = allPosts.filter((post) => !category || post.category === category || post.tags.includes(category));
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const page = Math.max(1, Math.min(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1, totalPages));
  const posts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const categories = [...new Set(allPosts.map((post) => post.category).filter(Boolean))];
  return (
    <main className="content-site editorial-c news-c">
      <SiteNav />
      <section className="content-hero">
        <h1>Electric mobility news, filtered for product decisions.</h1>
        <p>Every published item keeps the original source visible, adds COWIN analysis, and links readers to relevant product categories.</p>
        <span className="content-hero-label">COWIN / Global News</span>
      </section>
      <section className="content-filters">
        <Link className={!category ? "is-active" : ""} href="/news">All</Link>
        {categories.map((item) => <Link className={category === item ? "is-active" : ""} href={`/news?category=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}
      </section>
      <section className="content-grid">
        {posts.length ? posts.map((post) => (
          <article className="content-card" key={post.id}>
            <ContentImage src={post.coverImage} fallback={contentFallbackImage(post)} alt={post.imageAlt || post.title} />
            <div><span>{post.publishDate} · {post.category}</span><h2><Link href={postPath(post)}>{post.title}</Link></h2><p>{post.excerpt}</p><small>Source: {post.sourceName || post.source || "COWIN"}</small></div>
          </article>
        )) : <article className="content-empty"><h2>No published news yet</h2><p>Published news will appear here.</p></article>}
      </section>
      <PublicPagination pathname="/news" page={page} totalPages={totalPages} query={{ category }} />
    </main>
  );
}
