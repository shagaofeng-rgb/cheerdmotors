import { SiteNav } from "@/app/category-content";
import CheckoutClient from "@/components/CheckoutClient";
import { getProduct } from "@/lib/site";

type Props = {
  searchParams: Promise<{ productSlug?: string; quantity?: string; variantId?: string; orderId?: string }>;
};

export default async function CheckoutPage({ searchParams }: Props) {
  const params = await searchParams;
  const product = params.productSlug ? getProduct(params.productSlug) : null;
  return (
    <>
      <SiteNav />
      <CheckoutClient product={product} quantity={Number(params.quantity || 1)} variantId={params.variantId || ""} existingOrderId={params.orderId || ""} />
    </>
  );
}
