import Link from "next/link";
import { listPublishedPosts } from "@/lib/backendStore";
import { postPath } from "@/lib/content";
import { products, productSlugs } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const q = String(Array.isArray(params.q) ? params.q[0] : params.q || "").trim().toLowerCase();
  const posts = await listPublishedPosts();
  const postResults = q ? posts.filter((post) => `${post.title} ${post.excerpt} ${post.content} ${post.tags.join(" ")}`.toLowerCase().includes(q)) : posts.slice(0, 8);
  const productResults = q ? productSlugs.map((slug) => products[slug]).filter((product) => `${product.name} ${product.category} ${product.specs.join(" ")}`.toLowerCase().includes(q)) : [];
  return (
    <main className="content-site">
      <header className="content-nav"><Link href="/">CHEERDMOTO</Link><nav><Link href="/news">News</Link><Link href="/blog">Blog</Link></nav></header>
      <section className="content-hero"><p className="eyebrow">Search</p><h1>Search products, News and Blog content.</h1><form className="search-form"><input name="q" defaultValue={q} placeholder="Search electric dirt bikes, range, battery, wheelchair..." /><button>Search</button></form></section>
      <section className="search-results">
        <h2>Products</h2>{productResults.length ? productResults.map((product) => <Link href={`/${product.category === "Electric Dirt Bikes" ? "electric-dirt-bikes" : product.category === "Electric Bikes" ? "electric-bikes" : product.category === "Electric Wheelchairs" ? "electric-wheelchairs" : "accessories"}#catalog`} key={product.slug}>{product.name}<span>{product.category}</span></Link>) : <p>No product matches yet.</p>}
        <h2>Content</h2>{postResults.length ? postResults.map((post) => <Link href={postPath(post)} key={post.id}>{post.title}<span>{post.type} · {post.publishDate}</span></Link>) : <p>No content matches yet.</p>}
      </section>
    </main>
  );
}
