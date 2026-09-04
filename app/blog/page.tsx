import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, contentFallbackImage, postPath } from "@/lib/content";
import SiteNav from "@/components/SiteNav";
import ContentImage from "@/components/ContentImage";
import PublicPagination from "@/components/PublicPagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COWIN Blog | Buying Guides and Product Knowledge",
  description: "COWIN buying guides, product knowledge, ownership advice and electric mobility comparison content.",
  alternates: { canonical: absoluteUrl("/blog") },
};

const PAGE_SIZE = 9;

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requestedPage = Number(Array.isArray(params.page) ? params.page[0] : params.page || 1);
  const allPosts = await listPublishedPosts("blog");
  const totalPages = Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE));
  const page = Math.max(1, Math.min(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1, totalPages));
  const posts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <main className="content-site editorial-c blog-c">
      <SiteNav />
      <section className="content-hero"><h1>Product knowledge for better electric mobility decisions.</h1><p>Guides and explainers connected to COWIN product categories and real ownership questions.</p><span className="content-hero-label">COWIN / Buying Guides</span></section>
      <section className="content-grid">
        {posts.length ? posts.map((post) => <article className="content-card" key={post.id}><ContentImage src={post.coverImage} fallback={contentFallbackImage(post)} alt={post.imageAlt || post.title} /><div><span>{post.publishDate} · {post.category}</span><h2><Link href={postPath(post)}>{post.title}</Link></h2><p>{post.excerpt}</p></div></article>) : <article className="content-empty"><h2>No published guides yet</h2><p>Published buying guides will appear here.</p></article>}
      </section>
      <PublicPagination pathname="/blog" page={page} totalPages={totalPages} />
    </main>
  );
}
