import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import SiteNavComponent from "@/components/SiteNav";
import { listStorefrontProducts } from "@/lib/storefrontCatalog";
import type { ProductSlug } from "@/lib/site";

export { default as SiteNav } from "@/components/SiteNav";

type CategoryProduct = {
  slug?: ProductSlug;
  badge?: string;
  image: string;
  name: string;
  price: string;
  specs: string[];
};

type CategoryPageData = {
  eyebrow: string;
  title: string;
  titleAccent?: string;
  copy: string;
  primaryCta: string;
  secondaryCta: string;
  heroImage: string;
  heroAlt: string;
  stats: Array<[string, string]>;
  filters: string[];
  products: CategoryProduct[];
  compareTitle: string;
  compareCopy: string;
  compareImages: Array<{ image: string; label: string }>;
  supportTone: string;
};

const sharedSupport = [
  ["Free & Secure Shipping", "Fast, insured delivery to your door."],
  ["14-Day Returns", "Ride with confidence. Hassle-free returns."],
  ["Warranty Coverage", "Protection designed around every ride."],
  ["Lifetime Support", "We are here for you, ride after ride."],
];

export const categoryPages: Record<string, CategoryPageData> = {
  dirtBikes: {
    eyebrow: "Dirt Bikes",
    title: "Intelligent off-road power",
    copy:
      "Electric dirt bikes engineered for instant torque, precise control and all-terrain confidence without the noise.",
    primaryCta: "Explore the lineup",
    secondaryCta: "Compare models",
    heroImage: "/volt-lab/category/dirt-bikes/dirt_bikes_use_hero_scene.png",
    heroAlt: "XCEED electric dirt bike in a blue technical lab scene",
    stats: [
      ["8.5 kW", "peak power"],
      ["53 mph", "top speed"],
      ["380 N.m", "max torque"],
      ["72V", "power system"],
      ["IP54", "water resistant"],
    ],
    filters: ["Availability", "Price", "Color", "Voltage", "Model"],
    products: [
      {
        badge: "Sale",
        slug: "xtreme",
        image: "/volt-lab/category/dirt-bikes/dirt_bikes_use_product_card_01.png",
        name: "Xtreme Performance 96V Electric Dirt Bike",
        price: "$4,499.00",
        specs: ["96V", "15,000W peak", "72 mph", "465 N.m"],
      },
      {
        badge: "Sale",
        slug: "xceed",
        image: "/volt-lab/category/dirt-bikes/dirt_bikes_use_product_card_02.png",
        name: "Xceed 72V Electric Dirt Bike",
        price: "$3,099.00",
        specs: ["72V", "8,500W peak", "53 mph", "380 N.m"],
      },
      {
        badge: "Sale",
        slug: "xceed",
        image: "/volt-lab/category/dirt-bikes/dirt_bikes_use_product_card_03.png",
        name: "Xceed 72V Electric Dirt Bike - Blaze Orange",
        price: "$3,099.00",
        specs: ["72V", "8,500W peak", "53 mph", "380 N.m"],
      },
    ],
    compareTitle: "Find your perfect ride",
    compareCopy:
      "Compare specs, performance and features side by side to choose the bike that fits your terrain and style.",
    compareImages: [
      { image: "/volt-lab/category/dirt-bikes/dirt_bikes_use_editorial_compare_1.png", label: "Xtreme 96V" },
      { image: "/volt-lab/category/dirt-bikes/dirt_bikes_use_editorial_compare_2.png", label: "Xceed 72V" },
      { image: "/volt-lab/category/dirt-bikes/dirt_bikes_use_editorial_compare_3.png", label: "Xceed Blaze Orange" },
    ],
    supportTone: "built tough",
  },
  eBikes: {
    eyebrow: "E-Bikes",
    title: "Connected. capable. everyday.",
    copy:
      "Smart electric bikes built for city streets, weekend escapes and everyday range without losing comfort or utility.",
    primaryCta: "Explore e-bikes",
    secondaryCta: "Compare models",
    heroImage: "/volt-lab/category/e-bikes/e_bike_use_hero_scene.png",
    heroAlt: "CHEERDMOTO electric bikes in a blue city scene",
    stats: [
      ["3", "daily ride models"],
      ["$499", "starting price"],
      ["Step-thru", "easy access"],
      ["Utility", "daily cargo"],
      ["Suspension", "ride comfort"],
    ],
    filters: ["Availability", "Price", "Category", "Ride Style", "Payload"],
    products: [
      {
        badge: "Step-Thru",
        slug: "xcite",
        image: "/volt-lab/category/e-bikes/e_bike_use_product_card_01.png",
        name: "Xcite Step-Thru Electric Bike",
        price: "$499.00",
        specs: ["Step-thru frame", "Daily mobility", "Compliant speed", "Easy access"],
      },
      {
        badge: "Fat Tire",
        slug: "xplore",
        image: "/volt-lab/category/e-bikes/e_bike_use_product_card_02.png",
        name: "Xplore Fat Tire E-Bike",
        price: "$499.00",
        specs: ["Utility frame", "Daily cargo", "Compliant speed", "Modular platform"],
      },
      {
        badge: "Moped Style",
        slug: "xplus",
        image: "/volt-lab/category/e-bikes/e_bike_use_product_card_03.png",
        name: "Xplus Fat Tire Moped E-Bike",
        price: "From $599.00",
        specs: ["Full suspension", "Comfort ride", "Compliant speed", "Urban trail"],
      },
    ],
    compareTitle: "Find your perfect ride",
    compareCopy: "Compare range, speed, payload and features side by side to choose the e-bike that fits your lifestyle.",
    compareImages: [
      { image: "/volt-lab/category/e-bikes/e_bike_use_editorial_compare_1.png", label: "Xcite Step-Thru" },
      { image: "/volt-lab/category/e-bikes/e_bike_use_editorial_compare_2.png", label: "Xplore Fat Tire" },
      { image: "/volt-lab/category/e-bikes/e_bike_use_editorial_compare_3.png", label: "Xplus Moped" },
    ],
    supportTone: "ride ready",
  },
  wheelchairs: {
    eyebrow: "Intelligent Mobility",
    title: "Comfort. freedom.",
    titleAccent: "Your way.",
    copy:
      "The Smart B02 electric wheelchair is engineered for real life: lightweight, foldable and travel friendly.",
    primaryCta: "Explore Smart B02",
    secondaryCta: "View buying guide",
    heroImage: "/volt-lab/category/wheelchairs/electric_wheelchair_use_hero_scene.png",
    heroAlt: "Smart B02 electric wheelchair in a blue technical scene",
    stats: [
      ["15 mi", "range"],
      ["350 lb", "capacity"],
      ["46 lb", "net weight"],
      ["2 x 250W", "motors"],
      ["6 mph", "top speed"],
    ],
    filters: ["Availability", "Price", "Color", "Weight Capacity", "Features"],
    products: [
      {
        badge: "In stock",
        slug: "smart-b02",
        image: "/volt-lab/category/wheelchairs/electric_wheelchair_use_product_main.png",
        name: "Smart B02 Electric Wheelchair",
        price: "$399.00",
        specs: ["Foldable", "Lightweight", "Range", "Safety first"],
      },
    ],
    compareTitle: "Travel. independence. peace of mind.",
    compareCopy: "Made for real life at home, on the go and everywhere in between.",
    compareImages: [
      { image: "/volt-lab/category/wheelchairs/electric_wheelchair_use_lifestyle_1.png", label: "Travel with ease" },
      { image: "/volt-lab/category/wheelchairs/electric_wheelchair_use_lifestyle_2.png", label: "Daily independence" },
      { image: "/volt-lab/category/wheelchairs/electric_wheelchair_use_lifestyle_3.png", label: "Compact and convenient" },
    ],
    supportTone: "real freedom",
  },
  accessories: {
    eyebrow: "Parts & Accessories",
    title: "Precision upgrades.",
    titleAccent: "Genuine performance.",
    copy:
      "Genuine CHEERDMOTO parts and accessories engineered for perfect fit, lasting durability and peak performance.",
    primaryCta: "Shop all parts",
    secondaryCta: "View guides",
    heroImage: "/volt-lab/category/accessories/parts_accessories_use_hero_scene.png",
    heroAlt: "CHEERDMOTO parts and accessories on a blue ring platform",
    stats: [
      ["Genuine", "parts"],
      ["Perfect", "fit"],
      ["Rapid", "delivery"],
      ["Expert", "support"],
      ["3", "managed products"],
    ],
    filters: ["Category", "Availability", "Price", "Compatibility", "Sort By"],
    products: Array.from({ length: 15 }, (_, index) => ({
      image: `/volt-lab/category/accessories/parts_accessories_use_accessory_${String(index + 1).padStart(2, "0")}.png`,
      name:
        [
          "72V 30Ah Battery",
          "Xceed Brake Kit",
          "Xceed Dirt Bike Front Fender Set",
          "Xceed Dirt Bike Wheel Shell",
          "Xceed Brake Rotor",
          "Xceed Hydraulic Brake Hose",
          "Xceed Body Kit",
          "Xceed Smart Fast Charger",
          "Xceed Side Stand",
          "Xceed Throttle",
          "Xceed Helmet",
          "X Series LCD Display Kit",
          "Universal Bike Phone Holder",
          "X Series Rear Cargo Rack",
          "Xceed Spoor-Light Rear",
        ][index],
      price:
        ["$1,199.00", "$49.00", "$49.00", "$29.00", "$49.00", "From $59.00", "From $69.00", "$249.00", "$39.00", "$69.00", "$199.00", "$79.00", "$29.00", "$69.00", "$29.00"][index],
      specs: ["CHEERDMOTO"],
      slug: index === 0 ? "battery-pack" : index === 1 ? "brake-kit" : index === 7 ? "smart-charger" : undefined,
      badge: index === 2 || index === 8 || index === 14 ? "Sale" : undefined,
    })),
    compareTitle: "Keep your ride peak-ready",
    compareCopy: "From brake pads to batteries, small upgrades make a big difference.",
    compareImages: [{ image: "/volt-lab/category/accessories/parts_accessories_use_cta_scene.png", label: "Maintenance guide" }],
    supportTone: "genuine parts",
  },
};

function usd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export async function CategoryPage({ data }: { data: CategoryPageData }) {
  const storefrontProducts = await listStorefrontProducts();
  const managedProducts = new Map(storefrontProducts.map((product) => [product.slug, product]));
  const visibleProducts = data.products.flatMap((product) => {
    if (!product.slug) return [];
    const managed = managedProducts.get(product.slug);
    if (!managed) return [];
    return [{ ...product, price: usd(managed.priceAmount), specs: managed.specs }];
  });
  return (
    <main className="category-shell">
      <SiteNavComponent />
      <section className="category-hero">
        <div className="category-copy">
          <p className="eyebrow">{data.eyebrow}</p>
          <h1>
            {data.title}
            {data.titleAccent ? <span>{data.titleAccent}</span> : null}
          </h1>
          <p>{data.copy}</p>
          <div className="hero-ctas">
            <a className="button primary" href="#catalog">
              {data.primaryCta}
            </a>
            <a className="button ghost" href="#compare">
              {data.secondaryCta}
            </a>
          </div>
        </div>
        <Image className="category-hero-image" src={data.heroImage} alt={data.heroAlt} width={520} height={430} priority />
      </section>

      <section className="category-stats" aria-label="Category highlights">
        {data.stats.map(([value, label]) => (
          <article key={`${value}-${label}`}>
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </section>

      <section className="catalog-section" id="catalog">
        <aside className="filter-panel catalog-guide">
          <div className="filter-title"><strong>Shop this collection</strong></div>
          <p>Compare the available models, then open a product page for configuration, pricing and checkout.</p>
          {data.filters.map((filter) => <span className="filter-row" key={filter}>{filter}</span>)}
          <Link className="button primary" href="/contact">Need help choosing?</Link>
        </aside>

        <div className="catalog-main">
          <div className="catalog-toolbar">
            <strong>{visibleProducts.length} results</strong>
            <span>Sort by Featured</span>
          </div>
          <div className={visibleProducts.length > 6 ? "category-product-grid accessories" : "category-product-grid"}>
            {visibleProducts.map((product) => (
              <article className="category-product-card" key={product.name}>
                {product.badge ? <span className="badge">{product.badge}</span> : null}
                <button className="heart" aria-label={`Save ${product.name}`}>
                  <Heart size={18} />
                </button>
                <Image src={product.image} alt={product.name} width={320} height={360} />
                <small>CHEERDMOTO</small>
                <h2>{product.name}</h2>
                <div className="rating">Customer reviews will be available soon.</div>
                <div className="spec-pills">
                  {product.specs.map((spec) => (
                    <span key={spec}>{spec}</span>
                  ))}
                </div>
                <strong className="price">{product.price}</strong>
                <Link className="quick-add" href={product.slug ? `/products/${product.slug}` : "/contact"}>{product.slug ? "View details" : "Contact us"}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="category-benefits">
        {["Instant torque", "Precise control", "Long range", data.supportTone].map((item) => (
          <article key={item}>
            <strong>{item}</strong>
            <span>Designed around real ownership, not just the spec sheet.</span>
          </article>
        ))}
      </section>

      <section className="compare-panel" id="compare">
        <div>
          <p className="eyebrow">Not sure which one?</p>
          <h2>{data.compareTitle}</h2>
          <p>{data.compareCopy}</p>
          <a className="button primary" href="#catalog">
            Compare models
          </a>
        </div>
        <div className="compare-images">
          {data.compareImages.map((item) => (
            <figure key={item.label}>
              <Image src={item.image} alt={item.label} width={260} height={220} />
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="support-band">
        {sharedSupport.map(([title, body]) => (
          <article key={title}>
            <strong>{title}</strong>
            <span>{body}</span>
          </article>
        ))}
      </section>

      <CategoryFooter />
    </main>
  );
}

function CategoryFooter() {
  return (
    <footer className="footer-section category-footer">
      <div className="footer-brand">
        <Link className="brand cyan" href="/">
          CHEERDMOTO
        </Link>
        <p>Future mobility, real products.</p>
      </div>
      <div className="footer-links">
        <div>
          <h3>Shop</h3>
          <Link href="/electric-dirt-bikes">E-Motorcycle</Link>
          <Link href="/electric-bikes">E-Bike</Link>
          <Link href="/electric-wheelchairs">E-Wheelchair</Link>
          <Link href="/accessories">Accessories</Link>
        </div>
        <div>
          <h3>Support</h3>
          <a href="/contact">Contact</a>
          <a href="/#support">Manuals</a>
          <a href="/#support">Warranty</a>
          <a href="/#support">Order Tracking</a>
        </div>
        <div>
          <h3>Discover</h3>
          <a href="/#motorcycle">About</a>
          <Link href="/news">News</Link>
          <a href="/#bike">Rider Club</a>
          <Link href="/blog">Blog</Link>
        </div>
      </div>
      <form className="newsletter" action="/api/newsletter/subscribe" method="post">
        <h3>Newsletter</h3>
        <input type="hidden" name="source" value="category-footer" />
        <label>
          <span>Email address</span>
          <input type="email" name="email" placeholder="Enter your email" required />
        </label>
        <button type="submit">Subscribe</button>
      </form>
      <div className="legal">
        <span>© 2026 CHEERDMOTO. All rights reserved.</span>
        <span><a href="/privacy">Privacy</a> / <a href="/terms">Terms</a></span>
      </div>
    </footer>
  );
}
