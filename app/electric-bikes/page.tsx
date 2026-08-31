import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/content";
import { CategoryPage, categoryPages } from "../category-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Electric Bikes | CHEERDMOTO",
  description: "Explore CHEERDMOTO XCITE, XPLORE and XPLUS electric bikes for daily mobility, utility and ride comfort.",
  alternates: { canonical: absoluteUrl("/electric-bikes") },
};

export default function ElectricBikesPage() {
  return <CategoryPage data={categoryPages.eBikes} />;
}
