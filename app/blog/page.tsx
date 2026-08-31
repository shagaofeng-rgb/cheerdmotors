import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, postPath } from "@/lib/content";
import SiteNav from "@/components/SiteNav";
import ContentImage from "@/components/ContentImage";
import PublicPagination from "@/components/PublicPagination";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CHEERDMOTO Blog | Buying Guides and Product Knowledge",
  description: "CHEERDMOTO buying guides, product knowledge, ownership advice and electric mobility comparison content.",
  alternates: { canonical: absoluteUrl("/blog") },
};

const PAGE_SIZE = 12;

export default async function BlogPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const requestedPage = Number(Array.isArray(params.page) ? params.page[0] : params.page || 1);
  const allPosts = await listPublishedPosts("blog");
  const totalPages = Math.max(1, Math.ceil(allPosts.length / PAGE_SIZE));
  const page = Math.max(1, Math.min(Number.isFinite(requestedPage) ? Math.floor(requestedPage) : 1, totalPages));
  const posts = allPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <main className="content-site">
      <SiteNav />
      <section className="content-hero"><p className="eyebrow">Buying Guides</p><h1>Product knowledge for better electric mobility decisions.</h1><p>Guides and explainers connected to CHEERDMOTO product categories and real ownership questions.</p></section>
      <section className="content-grid">
        {posts.map((post) => <article className="content-card" key={post.id}><ContentImage src={post.coverImage} alt={post.imageAlt || post.title} /><div><span>{post.publishDate} · {post.category}</span><h2><Link href={postPath(post)}>{post.title}</Link></h2><p>{post.excerpt}</p></div></article>)}
      </section>
      <PublicPagination pathname="/blog" page={page} totalPages={totalPages} />
    </main>
  );
}
