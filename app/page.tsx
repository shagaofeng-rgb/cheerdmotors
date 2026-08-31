import Image from "next/image";
import type { Metadata } from "next";
import SiteNav from "@/components/SiteNav";
import { absoluteUrl } from "@/lib/content";
import { listStorefrontProducts } from "@/lib/storefrontCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CHEERDMOTO | Intelligent Electric Mobility",
  description: "CHEERDMOTO electric dirt bikes, e-bikes, smart mobility platforms, genuine parts and ownership support.",
  alternates: { canonical: absoluteUrl("/") },
};

const homeProducts = [
  {
    id: "xm-0716",
    slug: "xtreme",
    category: "96V E-System",
  },
  {
    id: "xm-0320",
    slug: "xceed",
    category: "72V Bafang",
  },
  {
    id: "eg-0918",
    slug: "xcite",
    category: "Step-Thru",
  },
  {
    id: "eg-0919",
    slug: "xplore",
    category: "Over-Frame",
  },
  {
    id: "eg-0712",
    slug: "xplus",
    category: "Full Suspension",
  },
  {
    id: "ch-smrtb",
    slug: "smart-b02",
    category: "Dual Drive",
  },
] as const;

const decisions = [
  ["01", "Power Map", "Clear motor, range and terrain hierarchy."],
  ["02", "Range System", "Battery and recharge explained at a glance."],
  ["03", "Ride Control", "Modes, braking and suspension surfaced early."],
  ["04", "Ownership", "Shipping, warranty and support before checkout."],
];

const platforms = [
  {
    name: "XTREME",
    image: "/volt-lab/products/xtreme_transparent.png",
    accent: "orange",
    stats: ["96V system", "15,000W peak", "72 mph top speed", "465 N.m torque"],
  },
  {
    name: "XCEED",
    image: "/volt-lab/products/xceed_transparent.png",
    accent: "cyan",
    stats: ["72V system", "8,500W peak", "53 mph top speed", "380 N.m torque"],
  },
];

const dailyRides = [
  {
    name: "XCITE",
    image: "/volt-lab/products/xcite_transparent.png",
    label: "Easy access",
  },
  {
    name: "XPLORE",
    image: "/volt-lab/products/xplore_transparent.png",
    label: "Utility frame",
  },
  {
    name: "XPLUS",
    image: "/volt-lab/products/xplus_transparent.png",
    label: "Suspension comfort",
  },
];

const support = [
  ["Free Shipping", "Available across the contiguous U.S."],
  ["14-Day Returns", "A clear and visible return path."],
  ["Warranty Coverage", "Component-specific protection."],
  ["Lifetime Support", "Human help for long-term ownership."],
];

function usd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export default async function Home({ searchParams }: { searchParams: Promise<{ newsletter?: string }> }) {
  const { newsletter } = await searchParams;
  const storefrontProducts = await listStorefrontProducts();
  const productMap = new Map(storefrontProducts.map((product) => [product.slug, product]));
  const productCards = homeProducts.flatMap((item) => {
    const product = productMap.get(item.slug);
    return product ? [{ ...item, ...product, price: usd(product.priceAmount) }] : [];
  });
  return (
    <main className="site-shell">
      <SiteNav />
      {newsletter === "1" ? <p className="form-notice home-notice" role="status">Subscription confirmed. Product updates will be sent to this email address.</p> : null}
      {newsletter === "error" ? <p className="form-notice home-notice error" role="alert">Please enter a valid email address and try again.</p> : null}

      <section className="hero-section" id="motorcycle">
        <div className="hero-copy">
          <p className="eyebrow">XCEED / EM 2.0</p>
          <h1>Intelligent power. Controlled chaos.</h1>
          <p>
            A precision-focused homepage system built around your existing
            products with clearer hierarchy, stronger technical storytelling and
            a modular conversion path.
          </p>
          <div className="hero-ctas">
            <a className="button primary" href="#products">
              Explore Xceed
            </a>
            <a className="button ghost" href="#platforms">
              Compare
            </a>
          </div>
        </div>
        <div className="hero-bike">
          <Image
            src="/volt-lab/products/xceed_transparent.png"
            alt="CHEERDMOTO XCEED electric dirt bike"
            width={940}
            height={692}
            priority
          />
        </div>
        <div className="spec-strip" aria-label="XCEED core specifications">
          {[
            ["8.5 kW", "peak power"],
            ["85 km/h", "top speed"],
            ["85 km", "range"],
            ["IP54", "protection"],
          ].map(([value, label]) => (
            <div className="spec-card" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="decision-section">
        <h2>Engineered around the decision</h2>
        <div className="decision-grid">
          {decisions.map(([num, title, body]) => (
            <article className="decision-card" key={title}>
              <span>{num}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="product-lab section-pad" id="products">
        <div className="section-heading">
          <h2>Product Lab</h2>
          <p>A unified modular card system for every current model.</p>
        </div>
        <div className="product-grid">
          {productCards.map((product) => (
            <article className="product-card" key={product.id}>
              <span className="product-code">{product.id}</span>
              <Image
                src={product.image}
                alt={`${product.name} product`}
                width={520}
                height={360}
              />
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <div className="card-footer">
                <strong>{product.price}</strong>
                <a href={`/products/${product.slug}`}>Details</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="platform-section section-pad" id="platforms">
        <div className="section-heading dark-on-light">
          <h2>Choose your power platform</h2>
          <p>Two off-bike architectures, presented without making the user decode a spec table.</p>
        </div>
        <div className="platform-grid">
          {platforms.map((platform) => (
            <article className={`platform-card ${platform.accent}`} key={platform.name}>
              <div>
                <h3>{platform.name}</h3>
                <ul>
                  {platform.stats.map((stat) => (
                    <li key={stat}>{stat}</li>
                  ))}
                </ul>
                <a href="/electric-dirt-bikes#compare">Compare model</a>
              </div>
              <Image
                src={platform.image}
                alt={`${platform.name} electric motorcycle`}
                width={560}
                height={420}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="daily-section section-pad" id="bike">
        <div className="section-heading dark-on-light">
          <h2>One system. Three daily rides.</h2>
          <p>CHEERDMOTO models organized by frame geometry and rider use case.</p>
        </div>
        <div className="daily-grid">
          {dailyRides.map((item) => (
            <article className="daily-card" key={item.name}>
              <Image src={item.image} alt={`${item.name} e-bike`} width={620} height={440} />
              <h3>{item.name}</h3>
              <p>{item.label}</p>
              <span>Daily electric assist / support-ready ownership</span>
            </article>
          ))}
        </div>
      </section>

      <section className="smart-section" id="wheelchair">
        <div className="smart-copy">
          <h2>
            Smart mobility is <span>part of the same family.</span>
          </h2>
          <p>
            The Smart B02 gets its own category architecture while staying
            inside the same visual system, making the site feel broad and
            connected.
          </p>
          <div className="smart-stats">
            <div>
              <strong>15 mi</strong>
              <span>range</span>
            </div>
            <div>
              <strong>350 lb</strong>
              <span>capacity</span>
            </div>
            <div>
              <strong>2 x 250W</strong>
              <span>motors</span>
            </div>
          </div>
          <a className="button primary" href="/electric-wheelchairs#catalog">
            View Smart B02
          </a>
        </div>
        <div className="smart-product">
          <Image
            src="/volt-lab/products/smart_b02_transparent.png"
            alt="CHEERDMOTO Smart B02 electric wheelchair"
            width={691}
            height={646}
          />
        </div>
      </section>

      <section className="support-section section-pad" id="support">
        <div className="section-heading dark-on-light">
          <h2>Confidence after the click.</h2>
          <p>Service benefits presented as product value, not footer fine print.</p>
        </div>
        <div className="support-grid">
          {support.map(([title, body]) => (
            <article className="support-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <a className="button dark" href="#support">
          Get product updates
        </a>
      </section>

      <footer className="footer-section">
        <div className="footer-brand">
          <a className="brand cyan" href="/">
            CHEERDMOTO
          </a>
          <p>Future mobility / real machines.</p>
        </div>
        <div className="footer-links">
          <div>
            <h3>Shop</h3>
            <a href="/electric-dirt-bikes">E-Motorcycle</a>
            <a href="/electric-bikes">E-Bike</a>
            <a href="/electric-wheelchairs">E-Wheelchair</a>
            <a href="/accessories">Accessories</a>
          </div>
          <div>
            <h3>Support</h3>
            <a href="/contact">Contact</a>
            <a href="#support">Manuals</a>
            <a href="#support">Warranty</a>
            <a href="#support">Order tracking</a>
          </div>
          <div>
            <h3>Discover</h3>
            <a href="#motorcycle">About</a>
            <a href="/news">News</a>
            <a href="#bike">Rider club</a>
            <a href="/blog">Blog</a>
          </div>
        </div>
        <form className="newsletter" action="/api/newsletter/subscribe" method="post">
          <h3>Newsletter</h3>
          <input type="hidden" name="source" value="homepage-footer" />
          <label>
            <span>Email address</span>
            <input type="email" name="email" placeholder="Email address" required />
          </label>
          <button type="submit">Subscribe</button>
        </form>
        <div className="legal">
          <span>© 2026 CHEERDMOTO. All rights reserved.</span>
          <span><a href="/privacy">Privacy</a> / <a href="/terms">Terms</a></span>
        </div>
      </footer>
    </main>
  );
}
