import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublishedPost } from "@/lib/backendStore";
import { absoluteUrl, markdownToBlocks, postPath, productUrl } from "@/lib/content";
import { products, type ProductSlug } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await findPublishedPost("blog", slug);
  if (!post) return {};
  return { title: post.seoTitle || post.title, description: post.seoDescription || post.excerpt, alternates: { canonical: absoluteUrl(postPath(post)) }, openGraph: { title: post.title, description: post.excerpt, images: [absoluteUrl(post.coverImage)], type: "article" } };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await findPublishedPost("blog", slug);
  if (!post) notFound();
  const related = (post.relatedProductSlugs || ["xceed"]).map((slug) => products[slug as ProductSlug]).filter(Boolean);
  const jsonLd = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description: post.seoDescription || post.excerpt, image: [absoluteUrl(post.coverImage)], datePublished: post.createdAt, dateModified: post.updatedAt, author: { "@type": "Organization", name: post.author || "CHEERDMOTO" }, publisher: { "@type": "Organization", name: "CHEERDMOTO", url: absoluteUrl("/") }, mainEntityOfPage: absoluteUrl(postPath(post)), about: related.map((product) => product.name) };
  return (
    <main className="content-site">
      <header className="content-nav"><Link href="/">CHEERDMOTO</Link><nav><Link href="/news">News</Link><Link href="/blog">Blog</Link><Link href="/search">Search</Link></nav></header>
      <article className="article-shell">
        <nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/blog">Blog</Link><span>/</span><span>{post.title}</span></nav>
        <p className="eyebrow">{post.category}</p><h1>{post.title}</h1><p className="article-summary">{post.excerpt}</p>
        <img className="article-cover" src={post.coverImage} alt={post.imageAlt || post.title} />
        <section className="article-body">{markdownToBlocks(post.content).map((block, index) => block.type === "heading" ? <h2 key={index}>{block.text}</h2> : <p key={index}>{block.text}</p>)}</section>
        <section className="related-products"><h2>Related CHEERDMOTO products</h2>{related.map((product) => <Link href={productUrl(product.slug)} key={product.slug}><strong>{product.name}</strong><span>{product.category}</span></Link>)}</section>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </article>
    </main>
  );
}
