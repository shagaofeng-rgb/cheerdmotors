import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/content";
import { CategoryPage, categoryPages } from "../category-content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Electric Wheelchairs | CHEERDMOTO",
  description: "Explore the CHEERDMOTO SMART B02 electric wheelchair for daily mobility, compact handling and support.",
  alternates: { canonical: absoluteUrl("/electric-wheelchairs") },
};

export default function ElectricWheelchairsPage() {
  return <CategoryPage data={categoryPages.wheelchairs} />;
}
