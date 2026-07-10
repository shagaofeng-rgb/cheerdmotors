import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CHEERDMOTO",
  description: "How CHEERDMOTO collects, uses, stores, and protects customer inquiry, order, and website analytics data.",
};

export default function PrivacyPage() {
  return (
    <main className="content-page legal-page">
      <section className="content-hero">
        <p className="eyebrow">Privacy</p>
        <h1>Privacy Policy</h1>
        <p>Last updated: July 10, 2026</p>
      </section>
      <section className="content-body">
        <h2>Information We Collect</h2>
        <p>CHEERDMOTO collects information that customers submit through inquiry forms, contact forms, checkout flows, newsletter subscriptions, and support requests. This may include name, email, phone number, company, country, product interest, shipping details, and message content.</p>
        <h2>How We Use Information</h2>
        <p>We use submitted information to respond to inquiries, prepare quotations, process orders, arrange shipping, provide after-sales support, improve website performance, and understand product demand.</p>
        <h2>Website Analytics</h2>
        <p>We collect basic website interaction data such as page views, referral source, device type, product views, checkout steps, and inquiry events. This data is used for internal operations, conversion analysis, SEO reporting, and customer service follow-up.</p>
        <h2>Data Storage</h2>
        <p>Customer, order, content, media, and analytics data may be stored in secure cloud services connected to the CHEERDMOTO website. Access is limited to authorized administrators.</p>
        <h2>Email And Communications</h2>
        <p>If you submit an inquiry or subscribe to updates, we may contact you by email or other contact details you provide. You can request removal from marketing communication at any time.</p>
        <h2>Contact</h2>
        <p>For privacy requests, contact us through the website contact page or the published CHEERDMOTO support email.</p>
      </section>
    </main>
  );
}
