import Link from "next/link";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/content";
import { products, productSlugs } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact CHEERDMOTO | Product Inquiry",
  description: "Send CHEERDMOTO a product inquiry about electric dirt bikes, e-bikes, smart wheelchairs or accessories.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <main className="content-site">
      <header className="content-nav"><Link href="/">CHEERDMOTO</Link><nav><Link href="/news">News</Link><Link href="/blog">Blog</Link><Link href="/search">Search</Link></nav></header>
      <section className="content-hero"><p className="eyebrow">Contact</p><h1>Ask about a CHEERDMOTO product.</h1><p>Send a retail, dealer, support or product availability question. Your inquiry is saved into the backend lead system.</p></section>
      <section className="contact-panel">
        <form className="contact-form" action="/api/contact/inquiry" method="post">
          <input type="hidden" name="page" value="/contact" />
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="phone" placeholder="Phone" />
          <input name="company" placeholder="Company" />
          <input name="country" placeholder="Country / Region" />
          <select name="product" defaultValue="">
            <option value="" disabled>Select product interest</option>
            {productSlugs.map((slug) => <option value={products[slug].name} key={slug}>{products[slug].name}</option>)}
          </select>
          <textarea name="message" placeholder="Tell us what you need" required />
          <button type="submit">Submit inquiry</button>
        </form>
      </section>
    </main>
  );
}
