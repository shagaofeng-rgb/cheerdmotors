import Image from "next/image";
import { Heart, Menu, Search, ShoppingBag, UserRound } from "lucide-react";

const products = [
  {
    id: "xm-0716",
    name: "XTREME",
    category: "96V E-System",
    price: "From $4,499",
    image: "/volt-lab/products/xtreme_transparent.png",
  },
  {
    id: "xm-0320",
    name: "XCEED",
    category: "72V Bafang",
    price: "$3,099",
    image: "/volt-lab/products/xceed_transparent.png",
  },
  {
    id: "eg-0918",
    name: "XCITE",
    category: "Step-Thru",
    price: "From $499",
    image: "/volt-lab/products/xcite_transparent.png",
  },
  {
    id: "eg-0919",
    name: "XPLORE",
    category: "Over-Frame",
    price: "From $499",
    image: "/volt-lab/products/xplore_transparent.png",
  },
  {
    id: "eg-0712",
    name: "XPLUS",
    category: "Full Suspension",
    price: "From $599",
    image: "/volt-lab/products/xplus_transparent.png",
  },
  {
    id: "ch-smrtb",
    name: "SMART B02",
    category: "Dual Drive",
    price: "$399",
    image: "/volt-lab/products/smart_b02_transparent.png",
  },
];

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

const grandeux = [
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

const productLinks: Record<string, string> = {
  XTREME: "/electric-dirt-bikes#catalog",
  XCEED: "/electric-dirt-bikes#catalog",
  XCITE: "/electric-bikes#catalog",
  XPLORE: "/electric-bikes#catalog",
  XPLUS: "/electric-bikes#catalog",
  "SMART B02": "/electric-wheelchairs#catalog",
};

export default function Home() {
  return (
    <main className="site-shell">
      <header className="nav-wrap" aria-label="Main navigation">
        <a className="brand" href="/">
          CHEERDMOTO
        </a>
        <nav className="desktop-nav">
          <a href="/electric-dirt-bikes">E-Motorcycle</a>
          <a href="/electric-bikes">E-Bike</a>
          <a href="/electric-wheelchairs">E-Wheelchair</a>
          <a href="/accessories">Accessories</a>
          <a href="#support">Support</a>
        </nav>
        <div className="nav-actions" aria-label="Account actions">
          <button aria-label="Search">
            <Search size={18} />
          </button>
          <button aria-label="Wishlist">
            <Heart size={18} />
          </button>
          <button aria-label="Account">
            <UserRound size={18} />
          </button>
          <button aria-label="Cart">
            <ShoppingBag size={18} />
          </button>
          <button className="mobile-menu" aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

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
          {products.map((product) => (
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
                <a href={productLinks[product.name]}>Details</a>
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
          <p>Grandeux models organized by frame geometry and rider use case.</p>
        </div>
        <div className="daily-grid">
          {grandeux.map((item) => (
            <article className="daily-card" key={item.name}>
              <Image src={item.image} alt={`${item.name} e-bike`} width={620} height={440} />
              <h3>{item.name}</h3>
              <p>{item.label}</p>
              <span>1350W max / 20 mph compliant</span>
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
            <a href="#support">Contact</a>
            <a href="#support">Manuals</a>
            <a href="#support">Warranty</a>
            <a href="#support">Order tracking</a>
          </div>
          <div>
            <h3>Discover</h3>
            <a href="#motorcycle">About</a>
            <a href="#products">News</a>
            <a href="#bike">Rider club</a>
            <a href="/accessories">B2B</a>
          </div>
        </div>
        <form className="newsletter">
          <h3>Newsletter</h3>
          <label>
            <span>Email address</span>
            <input type="email" placeholder="Email address" />
          </label>
          <button type="submit">Subscribe</button>
        </form>
        <div className="legal">
          <span>© 2026 CHEERDMOTO. All rights reserved.</span>
          <span>Privacy / Terms</span>
        </div>
      </footer>
    </main>
  );
}
