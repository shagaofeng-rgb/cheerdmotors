import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { absoluteUrl } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service | COWIN",
  description: "COWIN website terms covering inquiries, product information, quotations, orders, shipping, support, and website use.",
  alternates: { canonical: absoluteUrl("/terms") },
};

export default function TermsPage() {
  return (
    <main className="content-page legal-page">
      <SiteNav />
      <section className="content-hero">
        <p className="eyebrow">Terms</p>
        <h1>Terms of Service</h1>
        <p>Last updated: July 10, 2026</p>
      </section>
      <section className="content-body">
        <h2>Website Use</h2>
        <p>The COWIN website provides product information, inquiry tools, content resources, and support channels for electric mobility products and accessories.</p>
        <h2>Product Information</h2>
        <p>Product specifications, prices, availability, images, shipping notes, and support details may change without prior notice. Final order details are confirmed in written quotation, invoice, or order confirmation.</p>
        <h2>Inquiries And Quotations</h2>
        <p>Submitting a form does not create a purchase contract. Orders are confirmed only after COWIN accepts the order details and payment or agreed commercial terms are completed.</p>
        <h2>Payments</h2>
        <p>Where online checkout or payment links are available, customers are responsible for providing accurate billing, shipping, and contact information. Manual quotation and offline payment workflows may be used for B2B or export orders.</p>
        <h2>Shipping And Support</h2>
        <p>Shipping timelines, warranty coverage, returns, and service support depend on product model, destination, local rules, and order terms confirmed at purchase.</p>
        <h2>Contact</h2>
        <p>For questions about these terms, contact COWIN through the website contact page.</p>
      </section>
    </main>
  );
}
