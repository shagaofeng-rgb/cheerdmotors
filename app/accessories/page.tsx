import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/content";
import { CategoryPage, categoryPages } from "../category-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parts and Accessories | CHEERDMOTO",
  description: "Shop managed CHEERDMOTO battery, brake and charging accessories with verified fitment and support.",
  alternates: { canonical: absoluteUrl("/accessories") },
};

export default function AccessoriesPage() {
  return <CategoryPage data={categoryPages.accessories} />;
}
