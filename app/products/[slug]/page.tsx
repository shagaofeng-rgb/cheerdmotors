import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";
import { SiteNav } from "@/app/category-content";
import { absoluteUrl } from "@/lib/content";
import { getProduct, getRelatedProducts, productSlugs, type ProductSlug } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return productSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const title = `${product.name} | CHEERDMOTO`;
  const description = product.shortDescription || product.description || `${product.name} product details, price, specifications and checkout.`;
  const url = absoluteUrl(`/products/${product.slug}`);
  const image = absoluteUrl(product.image);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: [{ url: image, alt: product.name }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product);
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const imageUrls = (product.gallery?.length ? product.gallery : [product.image]).map((image) => absoluteUrl(image));
  const availability = product.stockStatus === "out_of_stock" || (product.inventory || 0) < 1 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: product.category, item: absoluteUrl(product.categoryPath || "/") },
        { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: imageUrls,
      description: product.shortDescription || product.description || product.name,
      sku: product.sku || product.slug,
      brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
      offers: product.priceAmount
        ? {
            "@type": "Offer",
            url: productUrl,
            priceCurrency: "USD",
            price: product.priceAmount,
            availability,
            itemCondition: "https://schema.org/NewCondition",
          }
        : undefined,
    },
  ];
  return (
    <>
      <SiteNav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
