import { readStoreObject } from "@/lib/durableStore";
import { products, productSlugs, type ProductSlug, type SiteProduct } from "@/lib/site";
import { rebrandLegacyText } from "@/lib/brand";
import { cache } from "react";

const STORE_FILE = "admin-store.json";

type StoredProduct = {
  slug: string;
  name?: string;
  categoryName?: string;
  coverImage?: string;
  galleryImages?: string[];
  shortDescription?: string;
  fullDescription?: string;
  keyFeatures?: string[];
  specifications?: Array<{ label: string; value: string }>;
  priceCents?: number;
  salePriceCents?: number;
  sku?: string;
  stock?: number;
  shippingInfo?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

type StoredCatalog = { products?: StoredProduct[] };

function usesLegacyExtractedImage(value?: string) {
  return Boolean(value && /^\/volt-lab\/category\//.test(value));
}

function mergeProduct(base: SiteProduct, stored?: StoredProduct): SiteProduct | null {
  if (stored?.status && stored.status !== "published") return null;
  if (!stored) return base;
  const activePriceCents = stored.salePriceCents || stored.priceCents;
  const inventory = Number.isFinite(stored.stock) ? Math.max(0, Number(stored.stock)) : base.inventory;
  const customShortDescription = stored.shortDescription && !/for (?:CHEERDMOTO|COWIN) retail, dealer and service sales/i.test(stored.shortDescription);
  const customDescription = stored.fullDescription && !/connected to the (?:Cheerdmoto|COWIN) admin system/i.test(stored.fullDescription);
  const customFeatures = stored.keyFeatures?.length && JSON.stringify(stored.keyFeatures) !== JSON.stringify(base.specs);
  const customShipping = stored.shippingInfo && !/Shipping method can be confirmed after order or dealer quote/i.test(stored.shippingInfo);
  return {
    ...base,
    name: rebrandLegacyText(stored.name || base.name),
    category: rebrandLegacyText(stored.categoryName || base.category),
    image: usesLegacyExtractedImage(stored.coverImage) ? base.image : stored.coverImage || base.image,
    gallery: stored.galleryImages?.some(usesLegacyExtractedImage)
      ? base.gallery
      : stored.galleryImages && stored.galleryImages.length > 1 ? stored.galleryImages : base.gallery,
    shortDescription: rebrandLegacyText((customShortDescription ? stored.shortDescription : base.shortDescription) || ""),
    description: rebrandLegacyText((customDescription ? stored.fullDescription : base.description) || ""),
    keyFeatures: (customFeatures ? stored.keyFeatures : base.keyFeatures)?.map(rebrandLegacyText),
    specifications: customFeatures && stored.specifications?.length
      ? stored.specifications.map((item) => ({ label: rebrandLegacyText(item.label), value: rebrandLegacyText(item.value), group: "Product details" }))
      : base.specifications,
    priceAmount: activePriceCents ? activePriceCents / 100 : base.priceAmount,
    compareAtPriceAmount: stored.salePriceCents && stored.priceCents ? stored.priceCents / 100 : base.compareAtPriceAmount,
    sku: (stored.sku || base.sku)?.replace(/^CM-/, "CW-"),
    inventory,
    stockStatus: inventory === 0 ? "out_of_stock" : base.stockStatus === "preorder" ? "preorder" : "in_stock",
    shippingInfo: rebrandLegacyText((customShipping ? stored.shippingInfo : base.shippingInfo) || ""),
    variants: base.variants?.map((variant) => ({ ...variant, inventory: Math.min(variant.inventory, inventory ?? variant.inventory) })),
  };
}

const storedProducts = cache(async function storedProducts() {
  const store = await readStoreObject<StoredCatalog>(STORE_FILE);
  return new Map((store?.products || []).map((product) => [product.slug, product]));
});

export const listStorefrontProducts = cache(async function listStorefrontProducts() {
  const stored = await storedProducts();
  return productSlugs.map((slug) => mergeProduct(products[slug], stored.get(slug))).filter((product): product is SiteProduct => Boolean(product));
});

export async function getStorefrontProduct(slug: string) {
  return (await listStorefrontProducts()).find((product) => product.slug === slug) || null;
}
