"use client";

import Link from "next/link";
import { Menu, Minus, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

type CartItem = {
  productSlug: string;
  productName: string;
  variantId?: string;
  variantLabel?: string;
  quantity: number;
  price: number;
};

const navigation = [
  { href: "/electric-dirt-bikes", label: "E-Motorcycle" },
  { href: "/electric-bikes", label: "E-Bike" },
  { href: "/electric-wheelchairs", label: "E-Wheelchair" },
  { href: "/accessories", label: "Accessories" },
  { href: "/news", label: "News" },
  { href: "/blog", label: "Guides" },
];

function readCart() {
  try {
    const value = JSON.parse(window.localStorage.getItem("cheerdmoto_cart") || "[]");
    return Array.isArray(value) ? (value as CartItem[]) : [];
  } catch {
    return [];
  }
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export default function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => setCart(readCart());
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("cheerdmoto:add_to_cart", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("cheerdmoto:add_to_cart", syncCart);
    };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setCartOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const itemCount = cart.reduce((total, item) => total + Math.max(1, item.quantity || 1), 0);
  const total = cart.reduce((sum, item) => sum + item.price * Math.max(1, item.quantity || 1), 0);

  function removeItem(index: number) {
    const next = cart.filter((_, itemIndex) => itemIndex !== index);
    window.localStorage.setItem("cheerdmoto_cart", JSON.stringify(next));
    setCart(next);
  }

  return (
    <header className="nav-wrap" aria-label="Main navigation">
      <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
        COWIN
      </Link>
      <nav className="desktop-nav" aria-label="Primary">
        {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
      </nav>
      <div className="nav-actions" aria-label="Store actions">
        <Link aria-label="Search" href="/search"><Search size={18} /></Link>
        <button type="button" className="cart-trigger" aria-label={`Open cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`} onClick={() => setCartOpen(true)}>
          <ShoppingBag size={18} />
          {itemCount ? <span>{itemCount}</span> : null}
        </button>
        <button type="button" className="mobile-menu" aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen ? (
        <nav className="mobile-nav-panel" id="mobile-navigation" aria-label="Mobile navigation">
          {navigation.map((item) => <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</Link>)}
          <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        </nav>
      ) : null}

      {cartOpen ? (
        <div className="cart-layer" role="dialog" aria-modal="true" aria-label="Shopping cart" onMouseDown={() => setCartOpen(false)}>
          <aside className="cart-panel" onMouseDown={(event) => event.stopPropagation()}>
            <div className="cart-panel-head"><div><span>Your selection</span><strong>Cart</strong></div><button type="button" onClick={() => setCartOpen(false)} aria-label="Close cart"><X size={20} /></button></div>
            {cart.length ? <div className="cart-items">{cart.map((item, index) => (
              <article key={`${item.productSlug}-${item.variantId}-${index}`}>
                <div><strong>{item.productName}</strong><span>{item.variantLabel || "Standard"} · Qty {item.quantity}</span></div>
                <div><b>{formatPrice(item.price * item.quantity)}</b><button type="button" onClick={() => removeItem(index)} aria-label={`Remove ${item.productName}`}><Minus size={15} /></button></div>
              </article>
            ))}</div> : <div className="cart-empty"><strong>Your cart is empty.</strong><span>Add a product from its detail page to keep it here.</span></div>}
            {cart.length ? <div className="cart-total"><span>Estimated product total</span><strong>{formatPrice(total)}</strong></div> : null}
            <Link className="button primary" href={cart.length ? `/checkout?productSlug=${encodeURIComponent(cart[0].productSlug)}&quantity=${cart[0].quantity}${cart[0].variantId ? `&variantId=${encodeURIComponent(cart[0].variantId)}` : ""}` : "/electric-dirt-bikes"} onClick={() => setCartOpen(false)}>{cart.length ? "Continue to checkout" : "Browse products"}</Link>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
