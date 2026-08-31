import { SiteNav } from "@/app/category-content";
import CheckoutClient from "@/components/CheckoutClient";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/content";
import { getStorefrontProduct } from "@/lib/storefrontCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | CHEERDMOTO",
  description: "Create and review a CHEERDMOTO product order.",
  alternates: { canonical: absoluteUrl("/checkout") },
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ productSlug?: string; quantity?: string; variantId?: string; orderId?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const product = params.productSlug ? await getStorefrontProduct(params.productSlug) : null;
  return (
    <>
      <SiteNav />
      <CheckoutClient product={product} quantity={Number(params.quantity || 1)} variantId={params.variantId || ""} existingOrderId={params.orderId || ""} />
    </>
  );
}
