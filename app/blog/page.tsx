import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedPosts } from "@/lib/backendStore";
import { absoluteUrl, postPath } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CHEERDMOTO Blog | Buying Guides and Product Knowledge",
  description: "CHEERDMOTO buying guides, product knowledge, ownership advice and electric mobility comparison content.",
  alternates: { canonical: absoluteUrl("/blog") },
};

export default async function BlogPage() {
  const posts = await listPublishedPosts("blog");
  return (
    <main className="content-site">
      <header className="content-nav"><Link href="/">CHEERDMOTO</Link><nav><Link href="/news">News</Link><Link href="/blog">Blog</Link><Link href="/search">Search</Link></nav></header>
      <section className="content-hero"><p className="eyebrow">Buying Guides</p><h1>Product knowledge for better electric mobility decisions.</h1><p>Guides and explainers connected to CHEERDMOTO product categories and real ownership questions.</p></section>
      <section className="content-grid">
        {posts.map((post) => <article className="content-card" key={post.id}><img src={post.coverImage} alt={post.imageAlt || post.title} /><div><span>{post.publishDate} · {post.category}</span><h2><Link href={postPath(post)}>{post.title}</Link></h2><p>{post.excerpt}</p></div></article>)}
      </section>
    </main>
  );
}
