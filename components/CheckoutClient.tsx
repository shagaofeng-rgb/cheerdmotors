"use client";

import Image from "next/image";
import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { SiteProduct } from "@/lib/site";

type Props = {
  product: SiteProduct | null;
  quantity: number;
  variantId: string;
  existingOrderId: string;
};

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function CheckoutClient({ product, quantity, variantId, existingOrderId }: Props) {
  const variant = product?.variants?.find((item) => item.id === variantId) || product?.variants?.[0] || null;
  const safeQuantity = Math.max(1, Math.min(quantity || 1, variant?.inventory ?? product?.inventory ?? 99));
  const unitPrice = variant?.priceAmount || product?.priceAmount || 0;
  const total = unitPrice * safeQuantity;
  const [status, setStatus] = useState(existingOrderId ? `Order ${existingOrderId} is ready for review.` : "");
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const variantLabel = useMemo(() => variant?.label || "Standard", [variant?.label]);

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setLoading(true);
    setStatus("");
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok || !result.ok) {
      setStatus(result.message || "Unable to create order. Please check your information.");
      return;
    }
    setPaymentUrl(result.paymentUrl || "");
    setStatus(`Order ${result.order.id} created. ${result.paymentUrl ? "Continue to secure payment." : "Payment link will be confirmed after order review."}`);
  }

  if (!product) {
    return (
      <main className="checkout-shell">
        <section className="checkout-card">
          <p className="eyebrow">Checkout</p>
          <h1>Choose a product first</h1>
          <p>Open a product detail page and select Buy Now to start checkout.</p>
          <Link className="button primary" href="/#products">Shop Products</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-shell">
      <section className="checkout-grid">
        <form className="checkout-card checkout-form" onSubmit={submitOrder}>
          <p className="eyebrow">Secure Checkout</p>
          <h1>Confirm your order</h1>
          <input type="hidden" name="productSlug" value={product.slug} />
          <input type="hidden" name="variantId" value={variant?.id || ""} />
          <input type="hidden" name="quantity" value={safeQuantity} />
          <input type="hidden" name="paymentMethod" value="card" />
          <label>Name<input name="name" required autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Phone<input name="phone" autoComplete="tel" /></label>
          <label>Company<input name="company" autoComplete="organization" /></label>
          <label>Country<input name="country" required autoComplete="country-name" /></label>
          <label>Shipping address<textarea name="address" required rows={4} /></label>
          <label>Message<textarea name="message" rows={3} placeholder="Optional order notes" /></label>
          <button className="button primary" type="submit" disabled={loading}>{loading ? "Creating order..." : "Create Order"}</button>
          {paymentUrl ? <a className="button ghost" href={paymentUrl}>Continue to Secure Payment</a> : null}
          {status ? <p className="checkout-status">{status}</p> : null}
          <div className="payment-trust">
            <ShieldCheck size={18} />
            <div>
              <strong>Card data is not collected on this page</strong>
              <span>Payment details are handled only through the configured secure payment provider.</span>
            </div>
          </div>
        </form>
        <aside className="checkout-card order-summary">
          <Image src={variant?.image || product.image} alt={`${product.name} order summary`} width={520} height={380} priority />
          <h2>{product.name}</h2>
          <p>{variantLabel}</p>
          <dl>
            <div><dt>Unit price</dt><dd>{money(unitPrice)}</dd></div>
            <div><dt>Quantity</dt><dd>{safeQuantity}</dd></div>
            <div><dt>Shipping</dt><dd>Confirmed after review</dd></div>
            <div><dt>Total</dt><dd>{money(total)}</dd></div>
          </dl>
          <div className="checkout-provider"><CreditCard size={18} /> Oceanpayment-ready secure checkout path</div>
        </aside>
      </section>
    </main>
  );
}
