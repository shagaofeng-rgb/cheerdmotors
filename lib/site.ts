export type ProductSlug =
  | "xtreme"
  | "xceed"
  | "xcite"
  | "xplore"
  | "xplus"
  | "smart-b02"
  | "battery-pack"
  | "brake-kit"
  | "smart-charger";

export type CheckoutProductSlug = ProductSlug;

export type SiteProduct = {
  slug: ProductSlug;
  name: string;
  category: string;
  image: string;
  priceAmount: number;
  specs: string[];
};

export const products: Record<ProductSlug, SiteProduct> = {
  xtreme: {
    slug: "xtreme",
    name: "XTREME",
    category: "Electric Dirt Bikes",
    image: "/volt-lab/products/xtreme_transparent.png",
    priceAmount: 4499,
    specs: ["96V system", "15,000W peak", "72 mph top speed", "465 N.m torque"],
  },
  xceed: {
    slug: "xceed",
    name: "XCEED",
    category: "Electric Dirt Bikes",
    image: "/volt-lab/products/xceed_transparent.png",
    priceAmount: 3099,
    specs: ["72V system", "8,500W peak", "53 mph top speed", "380 N.m torque"],
  },
  xcite: {
    slug: "xcite",
    name: "XCITE",
    category: "Electric Bikes",
    image: "/volt-lab/products/xcite_transparent.png",
    priceAmount: 499,
    specs: ["Step-thru frame", "Daily mobility", "Compliant speed", "Easy access"],
  },
  xplore: {
    slug: "xplore",
    name: "XPLORE",
    category: "Electric Bikes",
    image: "/volt-lab/products/xplore_transparent.png",
    priceAmount: 499,
    specs: ["Utility frame", "Daily cargo", "Compliant speed", "Modular platform"],
  },
  xplus: {
    slug: "xplus",
    name: "XPLUS",
    category: "Electric Bikes",
    image: "/volt-lab/products/xplus_transparent.png",
    priceAmount: 599,
    specs: ["Full suspension", "Comfort ride", "Compliant speed", "Urban trail"],
  },
  "smart-b02": {
    slug: "smart-b02",
    name: "SMART B02",
    category: "Electric Wheelchairs",
    image: "/volt-lab/products/smart_b02_transparent.png",
    priceAmount: 399,
    specs: ["15 mi range", "350 lb capacity", "2 x 250W motors", "Smart mobility"],
  },
  "battery-pack": {
    slug: "battery-pack",
    name: "X Series Battery Pack",
    category: "Parts & Accessories",
    image: "/volt-lab/category/accessories/parts_accessories_product_01.png",
    priceAmount: 1199,
    specs: ["Genuine part", "X series fit", "Dealer support", "Export ready"],
  },
  "brake-kit": {
    slug: "brake-kit",
    name: "Xceed Brake Kit",
    category: "Parts & Accessories",
    image: "/volt-lab/category/accessories/parts_accessories_product_04.png",
    priceAmount: 49,
    specs: ["Service part", "Xceed fit", "Workshop ready", "OEM quality"],
  },
  "smart-charger": {
    slug: "smart-charger",
    name: "Smart Fast Charger",
    category: "Parts & Accessories",
    image: "/volt-lab/category/accessories/parts_accessories_product_10.png",
    priceAmount: 249,
    specs: ["Fast charge", "Smart protection", "X series", "Travel ready"],
  },
};

export const productSlugs = Object.keys(products) as ProductSlug[];
