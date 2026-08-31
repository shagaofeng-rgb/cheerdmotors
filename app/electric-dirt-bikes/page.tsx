import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/content";
import { CategoryPage, categoryPages } from "../category-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Electric Dirt Bikes | CHEERDMOTO",
  description: "Compare CHEERDMOTO XTREME and XCEED electric dirt bikes, performance, pricing and ownership support.",
  alternates: { canonical: absoluteUrl("/electric-dirt-bikes") },
};

export default function ElectricDirtBikesPage() {
  return <CategoryPage data={categoryPages.dirtBikes} />;
}
