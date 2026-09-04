import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, PackageCheck, RotateCcw, Truck } from "lucide-react";
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
  theme: "trail" | "daily" | "mobility" | "parts";
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
    theme: "trail",
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
    theme: "daily",
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
    theme: "mobility",
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
    theme: "parts",
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
  const configuredProducts = new Map<ProductSlug, CategoryProduct>();
  data.products.forEach((product) => {
    if (product.slug && !configuredProducts.has(product.slug)) configuredProducts.set(product.slug, product);
  });
  const visibleProducts = Array.from(configuredProducts.entries()).flatMap(([slug, presentation]) => {
    const managed = managedProducts.get(slug);
    if (!managed) return [];
    return [{ ...managed, badge: presentation.badge, price: usd(managed.priceAmount) }];
  });
  const supportIcons = [Truck, RotateCcw, PackageCheck, Headphones];

  return (
    <main className={`category-shell category-c ${data.theme}`}>
      <SiteNavComponent />
      <section className="category-hero">
        <div className="category-hero-media">
          <Image src={data.heroImage} alt={data.heroAlt} fill sizes="100vw" priority />
        </div>
        <div className="category-copy">
          <h1>
            {data.title}
            {data.titleAccent ? <span>{data.titleAccent}</span> : null}
          </h1>
          <p className="category-hero-copy">{data.copy}</p>
          <div className="category-hero-actions">
            <a className="category-primary-action" href="#catalog">{data.primaryCta} <ArrowRight size={17} /></a>
            <a className="category-secondary-action" href="#compare">{data.secondaryCta} <ArrowRight size={16} /></a>
          </div>
        </div>
        <span className="category-hero-label">CHEERDMOTO / {data.eyebrow}</span>
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
        <div className="category-catalog-head">
          <div>
            <h2>Choose your {data.eyebrow.toLowerCase()}</h2>
            <p>Every product below is connected to the managed catalog for current pricing, availability and specifications.</p>
          </div>
          <nav className="category-switcher" aria-label="Product categories">
            <Link className={data.theme === "trail" ? "active" : ""} href="/electric-dirt-bikes">Trail</Link>
            <Link className={data.theme === "daily" ? "active" : ""} href="/electric-bikes">Daily</Link>
            <Link className={data.theme === "mobility" ? "active" : ""} href="/electric-wheelchairs">Mobility</Link>
            <Link className={data.theme === "parts" ? "active" : ""} href="/accessories">Parts</Link>
          </nav>
        </div>
        <div className="catalog-main">
          <div className="catalog-toolbar">
            <strong>{visibleProducts.length} {visibleProducts.length === 1 ? "model" : "models"}</strong>
            <Link href="/contact">Need help choosing? <ArrowRight size={15} /></Link>
          </div>
          <div className={`category-product-grid ${data.theme === "parts" ? "accessories" : ""} ${visibleProducts.length === 1 ? "single" : ""}`}>
            {visibleProducts.map((product) => (
              <article className="category-product-card" key={product.slug}>
                {product.badge ? <span className="badge">{product.badge}</span> : null}
                <Link className="category-product-image" href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
                  <Image src={product.image} alt={product.name} width={560} height={420} />
                </Link>
                <span className="category-product-type">{product.category}</span>
                <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
                <p>{product.shortDescription}</p>
                <div className="spec-pills">
                  {product.specs.slice(0, 4).map((spec) => (
                    <span key={spec}>{spec}</span>
                  ))}
                </div>
                <div className="category-product-foot">
                  <strong className="price">{product.price}</strong>
                  <Link className="quick-add" href={`/products/${product.slug}`}>View details <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="compare-panel" id="compare">
        <div className="compare-copy">
          <h2>{data.compareTitle}</h2>
          <p>{data.compareCopy}</p>
          <a className="category-primary-action" href="#catalog">Compare models <ArrowRight size={17} /></a>
        </div>
        <div className="compare-images">
          {visibleProducts.map((product) => (
            <figure key={product.slug}>
              <Image src={product.image} alt={product.name} width={420} height={320} />
              <figcaption>{product.name}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="support-band">
        {sharedSupport.map(([title, body], index) => {
          const Icon = supportIcons[index];
          return (
          <article key={title}>
            <Icon aria-hidden="true" size={23} />
            <div><strong>{title}</strong><span>{body}</span></div>
          </article>
          );
        })}
      </section>

      <CategoryFooter />
    </main>
  );
}

function CategoryFooter() {
  return (
    <footer className="category-footer">
      <div className="category-footer-inner">
        <div className="category-footer-brand">
          <Link className="brand" href="/">CHEERDMOTO</Link>
          <p>Electric machines for trail, city and everyday independence.</p>
        </div>
        <nav className="category-footer-links" aria-label="Footer navigation">
          <div>
            <h3>Shop</h3>
            <Link href="/electric-dirt-bikes">E-Motorcycle</Link>
            <Link href="/electric-bikes">E-Bike</Link>
            <Link href="/electric-wheelchairs">E-Wheelchair</Link>
            <Link href="/accessories">Accessories</Link>
          </div>
          <div>
            <h3>Discover</h3>
            <Link href="/news">News</Link>
            <Link href="/blog">Guides</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/search">Search</Link>
          </div>
        </nav>
        <form className="category-newsletter" action="/api/newsletter/subscribe" method="post">
          <h3>Product updates</h3>
          <p>New models, ownership updates and product releases.</p>
          <input type="hidden" name="source" value="category-footer" />
          <label><span>Email address</span><input type="email" name="email" placeholder="Email address" required /></label>
          <button type="submit" aria-label="Subscribe to product updates"><ArrowRight size={19} /></button>
        </form>
        <div className="category-legal">
          <span>© 2026 CHEERDMOTO. All rights reserved.</span>
          <span><Link href="/privacy">Privacy</Link> / <Link href="/terms">Terms</Link></span>
        </div>
      </div>
    </footer>
  );
}
