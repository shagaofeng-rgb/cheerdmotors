import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/content";
import { products, productSlugs } from "@/lib/site";
import SiteNav from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "Contact COWIN | Product Inquiry",
  description: "Send COWIN a product inquiry about electric dirt bikes, e-bikes, smart wheelchairs or accessories.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;
  return (
    <main className="content-site">
      <SiteNav />
      {sent === "1" ? <p className="form-notice" role="status">Your inquiry was saved successfully. Our team will follow up using the contact details you provided.</p> : null}
      <section className="content-hero"><p className="eyebrow">Contact</p><h1>Ask about a COWIN product.</h1><p>Send a retail, dealer, support or product availability question. Your inquiry is saved into the backend lead system.</p></section>
      <section className="contact-panel">
        <form className="contact-form" action="/api/contact/inquiry" method="post">
          <input type="hidden" name="page" value="/contact" />
          <label><span>Name</span><input name="name" autoComplete="name" required /></label>
          <label><span>Email</span><input name="email" type="email" autoComplete="email" required /></label>
          <label><span>Phone</span><input name="phone" autoComplete="tel" /></label>
          <label><span>Company</span><input name="company" autoComplete="organization" /></label>
          <label><span>Country / Region</span><input name="country" autoComplete="country-name" /></label>
          <label><span>Product interest</span><select name="product" defaultValue="">
            <option value="" disabled>Select product interest</option>
            {productSlugs.map((slug) => <option value={products[slug].name} key={slug}>{products[slug].name}</option>)}
          </select></label>
          <label className="contact-message"><span>How can we help?</span><textarea name="message" placeholder="Tell us what you need" required /></label>
          <button type="submit">Submit inquiry</button>
        </form>
      </section>
    </main>
  );
}
