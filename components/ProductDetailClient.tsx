"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, ChevronRight, CreditCard, Minus, PackageCheck, Plus, ShieldCheck, Truck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ProductSlug, SiteProduct } from "@/lib/site";

type Props = {
  product: SiteProduct;
  related: SiteProduct[];
};

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function inStockText(inventory: number, stockStatus?: string) {
  if (stockStatus === "out_of_stock" || inventory <= 0) return "Out of stock";
  if (stockStatus === "preorder") return "Pre-order";
  return "In stock";
}

export default function ProductDetailClient({ product, related }: Props) {
  const variants = product.variants || [];
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const activeVariant = variants.find((variant) => variant.id === variantId) || variants[0] || null;
  const gallery = useMemo(() => {
    const selectedImage = activeVariant?.image;
    return Array.from(new Set([selectedImage, ...(product.gallery || []), product.image].filter(Boolean) as string[]));
  }, [activeVariant?.image, product.gallery, product.image]);
  const [activeImage, setActiveImage] = useState(gallery[0] || product.image);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cartNotice, setCartNotice] = useState("");
  const maxQuantity = activeVariant?.inventory ?? product.inventory ?? 99;
  const purchasable = maxQuantity > 0 && product.stockStatus !== "out_of_stock";
  const [quantity, setQuantity] = useState(1);
  const price = activeVariant?.priceAmount || product.priceAmount;
  const compareAt = activeVariant?.compareAtPriceAmount || product.compareAtPriceAmount;

  function clampQuantity(next: number) {
    setQuantity(Math.max(1, Math.min(maxQuantity || 1, Number.isFinite(next) ? next : 1)));
  }

  function selectVariant(nextVariantId: string) {
    const nextVariant = variants.find((variant) => variant.id === nextVariantId);
    setVariantId(nextVariantId);
    if (nextVariant?.image) setActiveImage(nextVariant.image);
    clampQuantity(quantity);
  }

  function addToCart() {
    if (!purchasable) return;
    const item = {
      productSlug: product.slug,
      productName: product.name,
      variantId: activeVariant?.id || "",
      variantLabel: activeVariant?.label || "",
      quantity,
      price,
      image: activeImage,
      addedAt: new Date().toISOString(),
    };
    let existing: unknown[] = [];
    try {
      const stored = JSON.parse(window.localStorage.getItem("cheerdmoto_cart") || "[]");
      existing = Array.isArray(stored) ? stored : [];
    } catch {
      existing = [];
    }
    window.localStorage.setItem("cheerdmoto_cart", JSON.stringify([...existing, item]));
    window.dispatchEvent(new CustomEvent("cheerdmoto:add_to_cart", { detail: item }));
    setCartNotice(`${product.name} added to cart.`);
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setLightboxOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [lightboxOpen]);

  const checkoutHref = `/checkout?productSlug=${encodeURIComponent(product.slug)}&quantity=${quantity}${activeVariant ? `&variantId=${encodeURIComponent(activeVariant.id)}` : ""}`;

  return (
    <main className="pdp-shell">
      <TrustBar />
      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <Link href={product.categoryPath || "/"}>{product.category}</Link>
        <ChevronRight size={14} />
        <span>{product.name}</span>
      </nav>

      <section className="pdp-hero">
        <div className="pdp-gallery">
          <button className="pdp-main-media" type="button" onClick={() => setLightboxOpen(true)} aria-label={`Open image preview for ${product.name}`}>
            <Image src={activeImage || product.image} alt={`${product.name} product image`} width={760} height={620} priority />
          </button>
          <div className="pdp-thumbs" aria-label="Product images">
            {gallery.map((image) => (
              <button className={image === activeImage ? "active" : ""} type="button" key={image} onClick={() => setActiveImage(image)} aria-label={`View ${product.name} image`}>
                <Image src={image} alt={`${product.name} thumbnail`} width={120} height={96} />
              </button>
            ))}
            <div className="pdp-video-slot">Video</div>
          </div>
        </div>

        <aside className="pdp-summary">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="pdp-meta">
            {activeVariant?.sku || product.sku ? <span>SKU: {activeVariant?.sku || product.sku}</span> : null}
            {product.model ? <span>Model: {product.model}</span> : null}
          </div>
          <div className="pdp-price-row">
            <strong>{money(price)}</strong>
            {compareAt && compareAt > price ? <del>{money(compareAt)}</del> : null}
            <span className={purchasable ? "stock in" : "stock out"}>{inStockText(maxQuantity, product.stockStatus)}</span>
          </div>
          <p className="pdp-short">{product.shortDescription || product.description || "Product details are available for this item."}</p>
          {product.keyFeatures?.length ? (
            <ul className="pdp-feature-list">
              {product.keyFeatures.slice(0, 5).map((feature) => (
                <li key={feature}><Check size={16} />{feature}</li>
              ))}
            </ul>
          ) : null}

          {variants.length ? (
            <div className="pdp-option-group">
              <span>Options</span>
              <div className="pdp-variant-grid">
                {variants.map((variant) => (
                  <button key={variant.id} type="button" className={variant.id === activeVariant?.id ? "selected" : ""} disabled={variant.inventory < 1} aria-pressed={variant.id === activeVariant?.id} onClick={() => selectVariant(variant.id)}>
                    <strong>{variant.label}</strong>
                    <small>{variant.inventory > 0 ? `${variant.inventory} available` : "Out of stock"}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="pdp-qty-row">
            <label htmlFor="pdp-quantity">Quantity</label>
            <div className="qty-control">
              <button type="button" onClick={() => clampQuantity(quantity - 1)} disabled={quantity <= 1} aria-label="Decrease quantity"><Minus size={16} /></button>
              <input id="pdp-quantity" type="number" min={1} max={maxQuantity || 1} value={quantity} onChange={(event) => clampQuantity(Number(event.target.value))} />
              <button type="button" onClick={() => clampQuantity(quantity + 1)} disabled={quantity >= maxQuantity} aria-label="Increase quantity"><Plus size={16} /></button>
            </div>
          </div>

          <div className="pdp-cta-grid">
            <Link className={`button primary buy-now ${purchasable ? "" : "disabled"}`} href={purchasable ? checkoutHref : "#"} aria-disabled={!purchasable}>Buy Now</Link>
            <button className="button ghost add-cart" type="button" disabled={!purchasable} onClick={addToCart}>Add to Cart</button>
          </div>
          {cartNotice ? <p className="pdp-cart-notice" role="status">{cartNotice}</p> : null}

          <PaymentTrustBadges />
          <div className="pdp-service-notes">
            <span><Truck size={16} /> Global shipping confirmed after order review</span>
            <span><PackageCheck size={16} /> Warranty and support recorded with your order</span>
          </div>
        </aside>
      </section>

      <QuickSpecs product={product} />
      <ProductDetails product={product} />
      <RelatedItems related={related} />

      <div className="pdp-mobile-bar">
        <strong>{money(price)}</strong>
        <button type="button" disabled={!purchasable} onClick={addToCart}>Add</button>
        <Link className={purchasable ? "" : "disabled"} href={purchasable ? checkoutHref : "#"} aria-disabled={!purchasable}>Buy Now</Link>
      </div>

      {lightboxOpen ? (
        <div className="pdp-lightbox" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close image preview" onClick={() => setLightboxOpen(false)}><X size={22} /></button>
          <Image src={activeImage || product.image} alt={`${product.name} enlarged product image`} width={1100} height={820} />
        </div>
      ) : null}
    </main>
  );
}

function TrustBar() {
  return (
    <section className="pdp-trust-bar" aria-label="Store trust signals">
      <span><ShieldCheck size={16} /> Secure Payment</span>
      <span><Truck size={16} /> Global Shipping</span>
      <span><PackageCheck size={16} /> Reliable Service</span>
      <span><Check size={16} /> Quality Guarantee</span>
    </section>
  );
}

function PaymentTrustBadges() {
  return (
    <div className="payment-trust">
      <CreditCard size={18} />
      <div>
        <strong>Secure credit card checkout</strong>
        <span>Payment information is processed securely. CHEERDMOTO does not store card details.</span>
      </div>
    </div>
  );
}

function QuickSpecs({ product }: { product: SiteProduct }) {
  const specs = product.specifications?.length ? product.specifications : product.specs.map((value, index) => ({ label: `Spec ${index + 1}`, value }));
  return (
    <section className="pdp-quick-specs" aria-label="Quick specifications">
      {specs.slice(0, 6).filter((spec) => spec.value).map((spec) => (
        <article key={`${spec.label}-${spec.value}`}>
          <span>{spec.label}</span>
          <strong>{spec.value}</strong>
        </article>
      ))}
    </section>
  );
}

function ProductDetails({ product }: { product: SiteProduct }) {
  const faqs = product.faq?.length ? product.faq : [
    { question: "How do I choose the right option?", answer: "Select the option that matches your preferred configuration. If compatibility matters, contact support before ordering." },
    { question: "Is this item in stock?", answer: "The product page shows current availability based on website inventory data." },
    { question: "What payment methods are available?", answer: "Checkout supports the payment methods enabled for the store. Card payment is handled through the secure payment flow, not inside this product page." },
    { question: "How long does shipping take?", answer: "Shipping method and delivery timing are confirmed after order review." },
  ];
  return (
    <section className="pdp-details">
      <details open>
        <summary>Description</summary>
        <p>{product.description || product.shortDescription || "Detailed product description will be available soon."}</p>
        {product.keyFeatures?.length ? <ul>{product.keyFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul> : null}
      </details>
      {product.specifications?.length ? (
        <details open>
          <summary>Specifications</summary>
          <div className="spec-table">
            {product.specifications.map((spec) => (
              <div key={`${spec.label}-${spec.value}`}>
                <span>{spec.label}</span>
                <strong>{spec.value}</strong>
              </div>
            ))}
          </div>
        </details>
      ) : null}
      {product.packageIncludes?.length ? (
        <details>
          <summary>Package Includes</summary>
          <ul>{product.packageIncludes.map((item) => <li key={item}>{item}</li>)}</ul>
        </details>
      ) : null}
      <details>
        <summary>Shipping & Returns</summary>
        <p>{product.shippingInfo || "Shipping method, delivery timing and returns are confirmed during order handling."}</p>
        <p>{product.warranty || "Warranty coverage depends on final order terms."}</p>
        <p><Link href="/terms">View terms</Link> · <Link href="/privacy">Privacy policy</Link></p>
      </details>
      <details>
        <summary>Reviews</summary>
        <p>Customer reviews will be available soon.</p>
      </details>
      <details>
        <summary>FAQ</summary>
        <div className="faq-stack">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </details>
    </section>
  );
}

function RelatedItems({ related }: { related: SiteProduct[] }) {
  if (!related.length) return null;
  return (
    <section className="pdp-related">
      <div className="section-heading">
        <h2>You May Also Like</h2>
        <p>Related products from the same platform, category or ownership path.</p>
      </div>
      <div className="product-grid">
        {related.map((item) => (
          <article className="product-card" key={item.slug}>
            <span className="product-code">{item.sku || item.slug}</span>
            <Image src={item.image} alt={`${item.name} related product`} width={520} height={360} />
            <h3>{item.name}</h3>
            <p>{item.category}</p>
            <div className="card-footer">
              <strong>{money(item.priceAmount)}</strong>
              <Link href={`/products/${item.slug as ProductSlug}`}>Details</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
