import Link from "next/link";
import SiteNav from "@/components/SiteNav";

export default function NotFound() {
  return (
    <main className="content-site">
      <SiteNav />
      <section className="content-hero not-found-hero">
        <p className="eyebrow">404</p>
        <h1>This page is not available.</h1>
        <p>The address may have changed, or the product or article may no longer be published.</p>
        <div className="hero-ctas">
          <Link className="button primary" href="/">Return home</Link>
          <Link className="button ghost" href="/search">Search the site</Link>
        </div>
      </section>
    </main>
  );
}
