import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Headphones, PackageCheck, RotateCcw } from "lucide-react";
import SiteNav from "@/components/SiteNav";
import { absoluteUrl } from "@/lib/content";
import { listStorefrontProducts } from "@/lib/storefrontCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "COWIN | Electric Bikes & Smart Mobility",
  description: "Explore COWIN electric dirt bikes, daily e-bikes and compact smart mobility products with real specifications, pricing and ownership support.",
  alternates: { canonical: absoluteUrl("/") },
};

const worldConfig = [
  {
    slug: "xceed",
    number: "01",
    label: "Trail",
    title: ["Break", "the line."],
    description: "Responsive off-road power with control that stays composed when the terrain changes.",
    className: "trail",
    href: "/electric-dirt-bikes",
  },
  {
    slug: "xcite",
    number: "02",
    label: "Daily",
    title: ["Own the", "everyday."],
    description: "Easy access, practical electric assist and a frame made for everyday movement.",
    className: "daily",
    href: "/electric-bikes",
  },
  {
    slug: "smart-b02",
    number: "03",
    label: "Mobility",
    title: ["Go with", "confidence."],
    description: "Compact powered mobility built around independence, comfort and simple support.",
    className: "mobility",
    href: "/electric-wheelchairs",
  },
] as const;

const featuredConfig = [
  { slug: "xtreme", label: "Maximum output", accent: "black" },
  { slug: "xplore", label: "Utility frame", accent: "cyan" },
  { slug: "xplus", label: "Suspension comfort", accent: "orange" },
] as const;

const confidenceItems = [
  { value: "14 days", label: "Clear return path", icon: RotateCcw },
  { value: "Genuine", label: "Parts ecosystem", icon: PackageCheck },
  { value: "Lifetime", label: "Ownership support", icon: Headphones },
] as const;

function usd(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
}

export default async function Home({ searchParams }: { searchParams: Promise<{ newsletter?: string }> }) {
  const { newsletter } = await searchParams;
  const storefrontProducts = await listStorefrontProducts();
  const productMap = new Map(storefrontProducts.map((product) => [product.slug, product]));
  const worlds = worldConfig.flatMap((item) => {
    const product = productMap.get(item.slug);
    return product ? [{ ...item, product }] : [];
  });
  const featured = featuredConfig.flatMap((item) => {
    const product = productMap.get(item.slug);
    return product ? [{ ...item, product }] : [];
  });
  const xceed = productMap.get("xceed");
  const smartB02 = productMap.get("smart-b02");

  return (
    <main className="site-shell home-c">
      <SiteNav />
      {newsletter === "1" ? <p className="form-notice home-notice" role="status">Subscription confirmed. Product updates will be sent to this email address.</p> : null}
      {newsletter === "error" ? <p className="form-notice home-notice error" role="alert">Please enter a valid email address and try again.</p> : null}

      <section className="home-c-intro" aria-labelledby="home-c-title">
        <div className="home-c-intro-inner">
          <div className="home-c-title-block">
            <p className="home-c-kicker">Electric mobility, made personal</p>
            <h1 id="home-c-title">
              <span>Move</span>
              <strong>Your way.</strong>
            </h1>
          </div>
          <div className="home-c-intro-copy">
            <p>From off-road power to everyday rides and compact mobility, COWIN builds electric machines around real lives.</p>
            <div className="home-c-actions">
              <Link className="home-c-button lime" href="#choose-your-ride">Explore models <ArrowRight size={17} /></Link>
              <Link className="home-c-text-link" href="/contact">Talk to our team <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-c-worlds" aria-label="Choose an electric mobility category">
        {worlds.map(({ product, ...item }) => (
          <article className={`home-c-world ${item.className}`} key={item.slug}>
            <Link className="home-c-world-link" href={item.href} aria-label={`Explore ${item.label} mobility with ${product.name}`}>
              <div className="home-c-world-head">
                <span>{item.number} / {item.label}</span>
                <h2>{item.title[0]}<br />{item.title[1]}</h2>
                <p>{item.description}</p>
              </div>
              <Image src={product.image} alt={`${product.name} ${product.category}`} width={760} height={560} priority={item.slug === "xceed"} />
              <div className="home-c-world-foot">
                <span>{product.name} / From {usd(product.priceAmount)}</span>
                <span>Explore <ArrowRight size={16} /></span>
              </div>
            </Link>
          </article>
        ))}
      </section>

      <section className="home-c-selector" id="choose-your-ride" aria-labelledby="home-c-selector-title">
        <div className="home-c-container">
          <div className="home-c-selector-head">
            <h2 id="home-c-selector-title">Pick the ride.<br />We build the rest.</h2>
            <p>Start with where you want to go. Performance, comfort, price and ownership support stay clear from first comparison to final delivery.</p>
          </div>
          <div className="home-c-choices">
            {featured.map(({ product, label, accent }) => (
              <article className={`home-c-choice ${accent}`} key={product.slug}>
                <span className="home-c-choice-label">{label}</span>
                <Link className="home-c-choice-image" href={`/products/${product.slug}`} aria-label={`View ${product.name}`}>
                  <Image src={product.image} alt={`${product.name} ${product.category}`} width={620} height={430} />
                </Link>
                <div className="home-c-choice-copy">
                  <h3><Link href={`/products/${product.slug}`}>{product.name}</Link></h3>
                  <p>{product.specs.slice(0, 2).join(" / ")}</p>
                </div>
                <div className="home-c-choice-foot">
                  <strong>{usd(product.priceAmount)}</strong>
                  <Link href={`/products/${product.slug}`} aria-label={`See ${product.name} details`}>Details <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
          <div className="home-c-all-models">
            <span>Not sure which platform fits?</span>
            <Link href="/electric-dirt-bikes#compare">Compare every model <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <section className="home-c-proof" aria-labelledby="home-c-proof-title">
        <div className="home-c-container home-c-proof-row">
          <h2 id="home-c-proof-title">Confidence after<br />the first ride.</h2>
          {confidenceItems.map(({ value, label, icon: Icon }) => (
            <div className="home-c-proof-item" key={label}>
              <Icon aria-hidden="true" size={24} strokeWidth={1.8} />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-c-final" aria-labelledby="home-c-final-title">
        <div className="home-c-container home-c-final-grid">
          <div className="home-c-final-copy">
            <p className="home-c-kicker">One electric family</p>
            <h2 id="home-c-final-title">More ways<br /><span>forward.</span></h2>
            <p>Trail performance, daily transport and compact smart mobility share one standard: useful engineering backed by parts and real support.</p>
            <Link className="home-c-button light" href="/electric-bikes">See the full lineup <ArrowRight size={17} /></Link>
          </div>
          <div className="home-c-final-products">
            {xceed ? (
              <Link href={`/products/${xceed.slug}`} className="home-c-final-product">
                <Image src={xceed.image} alt={`${xceed.name} electric dirt bike`} width={620} height={450} />
                <span><strong>{xceed.name}</strong> Off-road</span>
              </Link>
            ) : null}
            {smartB02 ? (
              <Link href={`/products/${smartB02.slug}`} className="home-c-final-product">
                <Image src={smartB02.image} alt={`${smartB02.name} electric wheelchair`} width={620} height={450} />
                <span><strong>{smartB02.name}</strong> Mobility</span>
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="home-c-footer">
        <div className="home-c-container home-c-footer-grid">
          <div className="home-c-footer-brand">
            <Link className="brand" href="/">COWIN</Link>
            <p>Electric machines for trail, city and everyday independence.</p>
          </div>
          <nav className="home-c-footer-links" aria-label="Footer navigation">
            <div>
              <h3>Shop</h3>
              <Link href="/electric-dirt-bikes">E-Motorcycle</Link>
              <Link href="/electric-bikes">E-Bike</Link>
              <Link href="/electric-wheelchairs">E-Wheelchair</Link>
              <Link href="/accessories">Accessories</Link>
            </div>
            <div>
              <h3>Company</h3>
              <Link href="/news">News</Link>
              <Link href="/blog">Guides</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/search">Search</Link>
            </div>
          </nav>
          <form className="home-c-newsletter" action="/api/newsletter/subscribe" method="post">
            <h3>Product updates</h3>
            <p>New models, ownership updates and product releases.</p>
            <input type="hidden" name="source" value="homepage-footer" />
            <label>
              <span>Email address</span>
              <input type="email" name="email" placeholder="Email address" required />
            </label>
            <button type="submit" aria-label="Subscribe to product updates"><ArrowRight size={19} /></button>
          </form>
          <div className="home-c-legal">
            <span>© 2026 COWIN. All rights reserved.</span>
            <span><Link href="/privacy">Privacy</Link> / <Link href="/terms">Terms</Link></span>
          </div>
        </div>
      </footer>
    </main>
  );
}
