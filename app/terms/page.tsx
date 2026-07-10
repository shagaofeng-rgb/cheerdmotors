import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CHEERDMOTO",
  description: "CHEERDMOTO website terms covering inquiries, product information, quotations, orders, shipping, support, and website use.",
};

export default function TermsPage() {
  return (
    <main className="content-page legal-page">
      <section className="content-hero">
        <p className="eyebrow">Terms</p>
        <h1>Terms of Service</h1>
        <p>Last updated: July 10, 2026</p>
      </section>
      <section className="content-body">
        <h2>Website Use</h2>
        <p>The CHEERDMOTO website provides product information, inquiry tools, content resources, and support channels for electric mobility products and accessories.</p>
        <h2>Product Information</h2>
        <p>Product specifications, prices, availability, images, shipping notes, and support details may change without prior notice. Final order details are confirmed in written quotation, invoice, or order confirmation.</p>
        <h2>Inquiries And Quotations</h2>
        <p>Submitting a form does not create a purchase contract. Orders are confirmed only after CHEERDMOTO accepts the order details and payment or agreed commercial terms are completed.</p>
        <h2>Payments</h2>
        <p>Where online checkout or payment links are available, customers are responsible for providing accurate billing, shipping, and contact information. Manual quotation and offline payment workflows may be used for B2B or export orders.</p>
        <h2>Shipping And Support</h2>
        <p>Shipping timelines, warranty coverage, returns, and service support depend on product model, destination, local rules, and order terms confirmed at purchase.</p>
        <h2>Contact</h2>
        <p>For questions about these terms, contact CHEERDMOTO through the website contact page.</p>
      </section>
    </main>
  );
}
