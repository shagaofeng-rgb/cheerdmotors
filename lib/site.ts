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
  categorySlug?: string;
  categoryPath?: string;
  image: string;
  gallery?: string[];
  priceAmount: number;
  compareAtPriceAmount?: number;
  sku?: string;
  model?: string;
  brand?: string;
  shortDescription?: string;
  description?: string;
  specs: string[];
  specifications?: Array<{ label: string; value: string; group?: string }>;
  keyFeatures?: string[];
  variants?: Array<{
    id: string;
    label: string;
    sku: string;
    options: Record<string, string>;
    priceAmount?: number;
    compareAtPriceAmount?: number;
    inventory: number;
    image?: string;
  }>;
  inventory?: number;
  stockStatus?: "in_stock" | "out_of_stock" | "preorder";
  packageIncludes?: string[];
  shippingInfo?: string;
  warranty?: string;
  faq?: Array<{ question: string; answer: string }>;
  relatedIds?: ProductSlug[];
};

export const products: Record<ProductSlug, SiteProduct> = {
  xtreme: {
    slug: "xtreme",
    name: "XTREME",
    category: "Electric Dirt Bikes",
    categorySlug: "electric-dirt-bikes",
    categoryPath: "/electric-dirt-bikes",
    image: "/volt-lab/products/xtreme_transparent.png",
    gallery: ["/volt-lab/products/xtreme_transparent.png", "/volt-lab/category/dirt-bikes/dirt_bikes_use_product_card_01.png", "/volt-lab/category/dirt-bikes/dirt_bikes_use_editorial_compare_1.png"],
    priceAmount: 4499,
    compareAtPriceAmount: 4899,
    sku: "CM-XT-96V",
    model: "XTREME 96V",
    brand: "CHEERDMOTO",
    shortDescription: "High-output electric dirt bike platform for riders who want stronger peak power and a more aggressive off-road setup.",
    description: "XTREME is built around a 96V performance platform with instant torque, reinforced ride control and a modular ownership path for parts, service and support.",
    specs: ["96V system", "15,000W peak", "72 mph top speed", "465 N.m torque"],
    specifications: [
      { label: "Power System", value: "96V", group: "Performance" },
      { label: "Peak Power", value: "15,000W", group: "Performance" },
      { label: "Top Speed", value: "72 mph", group: "Performance" },
      { label: "Max Torque", value: "465 N.m", group: "Performance" },
      { label: "Warranty", value: "Model-specific warranty support", group: "Ownership" },
    ],
    keyFeatures: ["High-output 96V architecture", "Off-road focused power delivery", "Serviceable modular components", "CHEERDMOTO support path"],
    variants: [
      { id: "xtreme-96v-standard", label: "96V Standard", sku: "CM-XT-96V-STD", options: { Voltage: "96V", Color: "Factory Black" }, inventory: 12 },
    ],
    inventory: 12,
    stockStatus: "in_stock",
    packageIncludes: ["XTREME electric dirt bike", "Battery system", "Charger", "User documentation"],
    shippingInfo: "Shipping method and final delivery timing are confirmed after order review.",
    warranty: "Component-specific warranty coverage applies after order confirmation.",
    relatedIds: ["xceed", "battery-pack", "smart-charger"],
  },
  xceed: {
    slug: "xceed",
    name: "XCEED",
    category: "Electric Dirt Bikes",
    categorySlug: "electric-dirt-bikes",
    categoryPath: "/electric-dirt-bikes",
    image: "/volt-lab/products/xceed_transparent.png",
    gallery: ["/volt-lab/products/xceed_transparent.png", "/volt-lab/category/dirt-bikes/dirt_bikes_use_product_card_02.png", "/volt-lab/category/dirt-bikes/dirt_bikes_use_editorial_compare_2.png"],
    priceAmount: 3099,
    sku: "CM-XC-72V",
    model: "XCEED 72V",
    brand: "CHEERDMOTO",
    shortDescription: "Balanced 72V electric dirt bike for fast acceleration, controlled handling and everyday off-road ownership.",
    description: "XCEED combines a 72V power system with a lightweight electric dirt bike layout, giving riders a clear balance of power, range, braking control and service-ready ownership.",
    specs: ["72V system", "8,500W peak", "53 mph top speed", "380 N.m torque"],
    specifications: [
      { label: "Power System", value: "72V", group: "Performance" },
      { label: "Peak Power", value: "8,500W", group: "Performance" },
      { label: "Top Speed", value: "53 mph", group: "Performance" },
      { label: "Max Torque", value: "380 N.m", group: "Performance" },
      { label: "Protection", value: "IP54", group: "Build" },
    ],
    keyFeatures: ["72V electric power platform", "Responsive ride control", "Real product parts ecosystem", "Secure checkout and order record"],
    variants: [
      { id: "xceed-72v-black", label: "72V Black", sku: "CM-XC-72V-BLK", options: { Voltage: "72V", Color: "Black" }, inventory: 18 },
      { id: "xceed-72v-orange", label: "72V Blaze Orange", sku: "CM-XC-72V-ORG", options: { Voltage: "72V", Color: "Blaze Orange" }, inventory: 8, image: "/volt-lab/category/dirt-bikes/dirt_bikes_use_product_card_03.png" },
    ],
    inventory: 26,
    stockStatus: "in_stock",
    packageIncludes: ["XCEED electric dirt bike", "Battery system", "Charger", "Owner documentation"],
    shippingInfo: "Shipping method and final delivery timing are confirmed after order review.",
    warranty: "Warranty coverage is confirmed with the final order documents.",
    relatedIds: ["xtreme", "brake-kit", "smart-charger"],
  },
  xcite: {
    slug: "xcite",
    name: "XCITE",
    category: "Electric Bikes",
    categorySlug: "electric-bikes",
    categoryPath: "/electric-bikes",
    image: "/volt-lab/products/xcite_transparent.png",
    gallery: ["/volt-lab/products/xcite_transparent.png", "/volt-lab/category/e-bikes/e_bike_use_product_card_01.png", "/volt-lab/category/e-bikes/e_bike_use_editorial_compare_1.png"],
    priceAmount: 499,
    sku: "CM-EB-XCITE",
    model: "XCITE Step-Thru",
    brand: "CHEERDMOTO",
    shortDescription: "Step-thru electric bike designed for easy access, daily errands and comfortable urban mobility.",
    description: "XCITE keeps daily riding approachable with an easy-access frame, practical electric assist and a simple ownership experience for city and neighborhood use.",
    specs: ["Step-thru frame", "Daily mobility", "Compliant speed", "Easy access"],
    specifications: [
      { label: "Frame", value: "Step-thru", group: "Build" },
      { label: "Use Case", value: "Daily mobility", group: "Ownership" },
      { label: "Motor", value: "Electric assist", group: "Performance" },
    ],
    keyFeatures: ["Easy step-thru access", "Comfort-focused daily ride", "Simple charging workflow", "Support-ready ownership"],
    variants: [{ id: "xcite-standard", label: "Standard", sku: "CM-EB-XCITE-STD", options: { Frame: "Step-Thru" }, inventory: 32 }],
    inventory: 32,
    stockStatus: "in_stock",
    packageIncludes: ["XCITE electric bike", "Battery", "Charger", "User documentation"],
    shippingInfo: "Shipping method and delivery details are confirmed during order handling.",
    warranty: "Warranty support depends on component and order terms.",
    relatedIds: ["xplore", "xplus", "smart-charger"],
  },
  xplore: {
    slug: "xplore",
    name: "XPLORE",
    category: "Electric Bikes",
    categorySlug: "electric-bikes",
    categoryPath: "/electric-bikes",
    image: "/volt-lab/products/xplore_transparent.png",
    gallery: ["/volt-lab/products/xplore_transparent.png", "/volt-lab/category/e-bikes/e_bike_use_product_card_02.png", "/volt-lab/category/e-bikes/e_bike_use_editorial_compare_2.png"],
    priceAmount: 499,
    sku: "CM-EB-XPLORE",
    model: "XPLORE Utility",
    brand: "CHEERDMOTO",
    shortDescription: "Utility-frame electric bike for practical riding, cargo flexibility and everyday range.",
    description: "XPLORE is arranged around a utility frame and everyday electric assist, giving riders a stable platform for commuting, errands and weekend movement.",
    specs: ["Utility frame", "Daily cargo", "Compliant speed", "Modular platform"],
    specifications: [
      { label: "Frame", value: "Utility frame", group: "Build" },
      { label: "Use Case", value: "Daily cargo", group: "Ownership" },
      { label: "Platform", value: "Modular", group: "Build" },
    ],
    keyFeatures: ["Utility-focused frame", "Daily cargo flexibility", "Stable electric assist", "Serviceable component path"],
    variants: [{ id: "xplore-standard", label: "Standard", sku: "CM-EB-XPLORE-STD", options: { Frame: "Utility" }, inventory: 24 }],
    inventory: 24,
    stockStatus: "in_stock",
    packageIncludes: ["XPLORE electric bike", "Battery", "Charger", "User documentation"],
    shippingInfo: "Shipping method and delivery details are confirmed during order handling.",
    warranty: "Warranty support depends on component and order terms.",
    relatedIds: ["xcite", "xplus", "smart-charger"],
  },
  xplus: {
    slug: "xplus",
    name: "XPLUS",
    category: "Electric Bikes",
    categorySlug: "electric-bikes",
    categoryPath: "/electric-bikes",
    image: "/volt-lab/products/xplus_transparent.png",
    gallery: ["/volt-lab/products/xplus_transparent.png", "/volt-lab/category/e-bikes/e_bike_use_product_card_03.png", "/volt-lab/category/e-bikes/e_bike_use_editorial_compare_3.png"],
    priceAmount: 599,
    sku: "CM-EB-XPLUS",
    model: "XPLUS Suspension",
    brand: "CHEERDMOTO",
    shortDescription: "Comfort-oriented electric bike platform with full-suspension styling and urban trail confidence.",
    description: "XPLUS adds suspension comfort and a stronger ride posture to the daily electric bike family, built for riders who want more comfort and visual presence.",
    specs: ["Full suspension", "Comfort ride", "Compliant speed", "Urban trail"],
    specifications: [
      { label: "Suspension", value: "Full suspension comfort", group: "Build" },
      { label: "Use Case", value: "Urban trail", group: "Ownership" },
      { label: "Ride Feel", value: "Comfort focused", group: "Performance" },
    ],
    keyFeatures: ["Comfort-first ride position", "Suspension-oriented platform", "Daily electric assist", "Support-ready ownership"],
    variants: [{ id: "xplus-standard", label: "Standard", sku: "CM-EB-XPLUS-STD", options: { Comfort: "Full Suspension" }, inventory: 20 }],
    inventory: 20,
    stockStatus: "in_stock",
    packageIncludes: ["XPLUS electric bike", "Battery", "Charger", "User documentation"],
    shippingInfo: "Shipping method and delivery details are confirmed during order handling.",
    warranty: "Warranty support depends on component and order terms.",
    relatedIds: ["xcite", "xplore", "smart-charger"],
  },
  "smart-b02": {
    slug: "smart-b02",
    name: "SMART B02",
    category: "Electric Wheelchairs",
    categorySlug: "electric-wheelchairs",
    categoryPath: "/electric-wheelchairs",
    image: "/volt-lab/products/smart_b02_transparent.png",
    gallery: ["/volt-lab/products/smart_b02_transparent.png", "/volt-lab/category/wheelchairs/electric_wheelchair_use_product_main.png", "/volt-lab/category/wheelchairs/electric_wheelchair_use_lifestyle_1.png"],
    priceAmount: 399,
    sku: "CM-SMART-B02",
    model: "SMART B02",
    brand: "CHEERDMOTO",
    shortDescription: "Compact electric wheelchair platform for daily mobility, travel handling and simple support.",
    description: "SMART B02 is organized for practical daily mobility with compact handling, dual motor movement and a support path that keeps ownership clear.",
    specs: ["15 mi range", "350 lb capacity", "2 x 250W motors", "Smart mobility"],
    specifications: [
      { label: "Range", value: "15 mi", group: "Performance" },
      { label: "Capacity", value: "350 lb", group: "Build" },
      { label: "Motors", value: "2 x 250W", group: "Performance" },
      { label: "Use Case", value: "Daily mobility", group: "Ownership" },
    ],
    keyFeatures: ["Compact mobility platform", "Dual motor drive", "Daily travel support", "Simple order and service path"],
    variants: [{ id: "smart-b02-standard", label: "Standard", sku: "CM-SMART-B02-STD", options: { Model: "B02" }, inventory: 16 }],
    inventory: 16,
    stockStatus: "in_stock",
    packageIncludes: ["SMART B02 electric wheelchair", "Battery", "Charger", "User documentation"],
    shippingInfo: "Shipping and delivery details are confirmed after order review.",
    warranty: "Warranty coverage is confirmed with the final order documents.",
    relatedIds: ["xcite", "xplore", "smart-charger"],
  },
  "battery-pack": {
    slug: "battery-pack",
    name: "X Series Battery Pack",
    category: "Parts & Accessories",
    categorySlug: "accessories",
    categoryPath: "/accessories",
    image: "/volt-lab/category/accessories/parts_accessories_use_accessory_01.png",
    gallery: ["/volt-lab/category/accessories/parts_accessories_use_accessory_01.png", "/volt-lab/category/accessories/parts_accessories_use_product_xceed.png"],
    priceAmount: 1199,
    sku: "CM-ACC-BATTERY",
    model: "X Series Battery Pack",
    brand: "CHEERDMOTO",
    shortDescription: "Genuine replacement battery pack for compatible X Series platforms.",
    description: "This battery pack supports compatible CHEERDMOTO X Series products and is intended for genuine replacement or service workflows.",
    specs: ["Genuine part", "X series fit", "Dealer support", "Export ready"],
    specifications: [{ label: "Compatibility", value: "X Series", group: "Fitment" }, { label: "Part Type", value: "Battery pack", group: "Build" }],
    keyFeatures: ["Genuine CHEERDMOTO part", "Compatible X Series fit", "Service support path"],
    variants: [{ id: "battery-pack-standard", label: "Standard", sku: "CM-ACC-BATTERY-STD", options: { Package: "Battery Pack" }, inventory: 10 }],
    inventory: 10,
    stockStatus: "in_stock",
    packageIncludes: ["Battery pack"],
    shippingInfo: "Battery shipping requirements are confirmed after order review.",
    warranty: "Warranty depends on final order terms and compatibility confirmation.",
    relatedIds: ["xtreme", "xceed", "smart-charger"],
  },
  "brake-kit": {
    slug: "brake-kit",
    name: "Xceed Brake Kit",
    category: "Parts & Accessories",
    categorySlug: "accessories",
    categoryPath: "/accessories",
    image: "/volt-lab/category/accessories/parts_accessories_use_accessory_02.png",
    gallery: ["/volt-lab/category/accessories/parts_accessories_use_accessory_02.png", "/volt-lab/category/accessories/parts_accessories_use_product_xceed.png"],
    priceAmount: 49,
    sku: "CM-ACC-BRAKE-KIT",
    model: "Xceed Brake Kit",
    brand: "CHEERDMOTO",
    shortDescription: "Service brake kit for compatible XCEED electric dirt bike maintenance.",
    description: "The Xceed Brake Kit is a genuine service part for maintenance workflows where fitment and support need to stay clear.",
    specs: ["Service part", "Xceed fit", "Workshop ready", "OEM quality"],
    specifications: [{ label: "Compatibility", value: "XCEED", group: "Fitment" }, { label: "Part Type", value: "Brake service kit", group: "Build" }],
    keyFeatures: ["XCEED compatible fit", "Service-ready part", "Genuine accessory support"],
    variants: [{ id: "brake-kit-standard", label: "Standard", sku: "CM-ACC-BRAKE-KIT-STD", options: { Package: "Brake Kit" }, inventory: 40 }],
    inventory: 40,
    stockStatus: "in_stock",
    packageIncludes: ["Brake kit components"],
    shippingInfo: "Shipping method is confirmed after order review.",
    warranty: "Warranty depends on final order terms and compatibility confirmation.",
    relatedIds: ["xceed", "xtreme", "battery-pack"],
  },
  "smart-charger": {
    slug: "smart-charger",
    name: "Smart Fast Charger",
    category: "Parts & Accessories",
    categorySlug: "accessories",
    categoryPath: "/accessories",
    image: "/volt-lab/category/accessories/parts_accessories_use_accessory_08.png",
    gallery: ["/volt-lab/category/accessories/parts_accessories_use_accessory_08.png", "/volt-lab/category/accessories/parts_accessories_use_cta_scene.png"],
    priceAmount: 249,
    sku: "CM-ACC-CHARGER",
    model: "Smart Fast Charger",
    brand: "CHEERDMOTO",
    shortDescription: "Smart charger accessory for compatible CHEERDMOTO electric platforms.",
    description: "The Smart Fast Charger supports compatible CHEERDMOTO platforms with a clear charging accessory path for service and ownership.",
    specs: ["Fast charge", "Smart protection", "X series", "Travel ready"],
    specifications: [{ label: "Part Type", value: "Smart charger", group: "Build" }, { label: "Compatibility", value: "Compatible CHEERDMOTO platforms", group: "Fitment" }],
    keyFeatures: ["Smart protection workflow", "Compatible platform accessory", "Compact charging support"],
    variants: [{ id: "smart-charger-us", label: "US Plug", sku: "CM-ACC-CHARGER-US", options: { Plug: "US" }, inventory: 36 }],
    inventory: 36,
    stockStatus: "in_stock",
    packageIncludes: ["Smart fast charger"],
    shippingInfo: "Shipping method is confirmed after order review.",
    warranty: "Warranty depends on final order terms and compatibility confirmation.",
    relatedIds: ["xceed", "xtreme", "battery-pack"],
  },
};

export const productSlugs = Object.keys(products) as ProductSlug[];

export function getProduct(slug: string) {
  return products[slug as ProductSlug] || null;
}

export function getRelatedProducts(product: SiteProduct) {
  return (product.relatedIds || [])
    .map((slug) => products[slug])
    .filter((item): item is SiteProduct => Boolean(item));
}
