import path from "node:path";
import { readStoreObject, writeStoreObject } from "@/lib/durableStore";
import { products, productSlugs, type ProductSlug } from "@/lib/site";
import { readAnalyticsEvents, readStoreOrders, type AnalyticsEvent, type StoreOrder } from "@/lib/commerceStore";
import { buildVisitorProfiles, channelForEvent, enrichEvent, groupCounts, isRealEvent, trafficTrend } from "@/lib/trafficAnalytics";
import { decodeHtmlEntities } from "@/lib/text";
import { rebrandLegacyText } from "@/lib/brand";

const STORE_FILE = "admin-store.json";

export type PublishStatus = "draft" | "published" | "unpublished" | "scheduled" | "archived";
export type ContentType = "blog" | "news";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
  status: PublishStatus;
  parentId: string;
  updatedAt: string;
};

export type AdminProduct = {
  id: string;
  slug: ProductSlug | string;
  name: string;
  categorySlug: string;
  categoryName: string;
  coverImage: string;
  galleryImages: string[];
  shortDescription: string;
  fullDescription: string;
  keyFeatures: string[];
  specifications: { label: string; value: string }[];
  applicationScenarios: string[];
  priceCents: number;
  salePriceCents: number;
  currency: "USD";
  sku: string;
  stock: number;
  moq: number;
  weightDimension: string;
  shippingInfo: string;
  seoTitle: string;
  seoDescription: string;
  status: PublishStatus;
  sortOrder: number;
  showOnHome: boolean;
  allowCart: boolean;
  allowDirectOrder: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  fileName: string;
  url: string;
  alt: string;
  mimeType: string;
  sizeBytes: number;
  usage: string[];
  createdAt: string;
};

export type ContentPost = {
  id: string;
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  content: string;
  publishDate: string;
  author: string;
  source: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  status: PublishStatus;
  createdAt: string;
  updatedAt: string;
  canonicalUrl?: string;
  originalTitle?: string;
  originalLanguage?: string;
  sourceName?: string;
  sourceUrl?: string;
  canonicalSourceUrl?: string;
  sourcePublishedAt?: string;
  sourceFetchedAt?: string;
  sourceTimezone?: string;
  facts?: string;
  perspective?: string;
  customerImpact?: string;
  ourHelp?: string;
  geoSummary?: string;
  faq?: Array<{ question: string; answer: string }>;
  relatedProductSlugs?: string[];
  imageAlt?: string;
  imageSourceUrl?: string;
  imagePageUrl?: string;
  automationStatus?: "manual" | "candidate" | "published" | "review_required" | "rejected" | "failed";
  relevanceScore?: number;
  trustScore?: number;
  retryCount?: number;
};

export type SiteSettings = {
  companyName: string;
  adminNotificationEmail: string;
  contactEmail: string;
  whatsapp: string;
  address: string;
  paymentCurrency: string;
  gatewayStatus: string;
  cookieConsentReady: boolean;
  updatedAt: string;
};

export type AdminStore = {
  categories: AdminCategory[];
  products: AdminProduct[];
  media: MediaAsset[];
  posts: ContentPost[];
  settings: SiteSettings;
};

export type CustomerLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  company: string;
  source: string;
  status: "New Lead" | "Contact Captured" | "Order Created" | "Payment Pending" | "Paid" | "Abandoned";
  interestedProducts: string[];
  cartItems: string[];
  lastActiveTime: string;
  trafficSource: string;
  notes: string;
};

function now() {
  return new Date().toISOString();
}

function cents(amount: number) {
  return Math.round(amount * 100);
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function readAdminStore() {
  const stored = await readStoreObject<AdminStore>(STORE_FILE);
  if (stored) return normalizeAdminStoreBranding(stored);
  const seeded = createSeedStore();
  await writeStoreObject(STORE_FILE, seeded);
  return seeded;
}

function normalizeAdminStoreBranding(store: AdminStore): AdminStore {
  const brand = (value: string) => rebrandLegacyText(value || "");
  const legacyImage = (value?: string) => Boolean(value && /^\/volt-lab\/category\//.test(value));
  return {
    ...store,
    categories: store.categories.map((category) => ({
      ...category,
      description: brand(category.description),
      seoTitle: brand(category.seoTitle),
      seoDescription: brand(category.seoDescription),
    })),
    products: store.products.map((product) => {
      const base = products[product.slug as ProductSlug];
      return {
        ...product,
        coverImage: base && legacyImage(product.coverImage) ? base.image : product.coverImage,
        galleryImages: base && product.galleryImages.some(legacyImage) ? base.gallery || [base.image] : product.galleryImages,
        shortDescription: brand(product.shortDescription),
        fullDescription: brand(product.fullDescription),
        keyFeatures: product.keyFeatures.map(brand),
        specifications: product.specifications.map((item) => ({ label: brand(item.label), value: brand(item.value) })),
        applicationScenarios: product.applicationScenarios.map(brand),
        sku: product.sku.replace(/^CM-/, "CW-"),
        shippingInfo: brand(product.shippingInfo),
        seoTitle: brand(product.seoTitle),
        seoDescription: brand(product.seoDescription),
      };
    }),
    media: store.media.map((asset) => ({ ...asset, alt: brand(asset.alt), usage: asset.usage.map(brand) })),
    posts: store.posts.map(normalizeContentPost),
    settings: {
      ...store.settings,
      companyName: brand(store.settings.companyName) || "COWIN",
    },
  };
}

export async function writeAdminStore(updater: (store: AdminStore) => AdminStore) {
  const next = updater(await readAdminStore());
  await writeStoreObject(STORE_FILE, next);
  return next;
}

export async function listAdminProducts() {
  return (await readAdminStore()).products.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listAdminCategories() {
  return (await readAdminStore()).categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listAdminMedia() {
  return (await readAdminStore()).media.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAdminPosts(type?: ContentType) {
  const posts = (await readAdminStore()).posts;
  return posts.map(normalizeContentPost).filter((post) => !type || post.type === type).sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export async function listPublishedPosts(type?: ContentType) {
  return (await listAdminPosts(type)).filter((post) => post.status === "published");
}

export async function findPublishedPost(type: ContentType, slug: string) {
  const post = (await readAdminStore()).posts.find((item) => item.type === type && item.slug === slug && item.status === "published");
  return post ? normalizeContentPost(post) : null;
}

const KNOWN_BROKEN_COVERS = new Set([
  "https://www.electrive.com/media/2026/07/audi-a2-etron-erlkonig-2026-electrive-400x307.png",
]);

function normalizeContentPost(post: ContentPost): ContentPost {
  const relatedSlug = post.relatedProductSlugs?.find((slug) => slug in products) as ProductSlug | undefined;
  const decodedCover = decodeHtmlEntities(post.coverImage || "");
  const coverImage = KNOWN_BROKEN_COVERS.has(decodedCover) || /^\/volt-lab\/category\//.test(decodedCover)
    ? products[relatedSlug || "xceed"].image
    : decodedCover || products[relatedSlug || "xceed"].image;
  const decoded = (value?: string) => rebrandLegacyText(decodeHtmlEntities(value || ""));
  return {
    ...post,
    title: decoded(post.title),
    excerpt: decoded(post.excerpt),
    coverImage,
    category: decoded(post.category),
    content: decoded(post.content),
    author: decoded(post.author),
    source: decoded(post.source),
    tags: (post.tags || []).map(decoded),
    seoTitle: decoded(post.seoTitle),
    seoDescription: decoded(post.seoDescription),
    originalTitle: post.originalTitle ? decoded(post.originalTitle) : undefined,
    sourceName: post.sourceName ? decoded(post.sourceName) : undefined,
    sourceUrl: post.sourceUrl ? decoded(post.sourceUrl) : undefined,
    canonicalSourceUrl: post.canonicalSourceUrl ? decoded(post.canonicalSourceUrl) : undefined,
    facts: post.facts ? decoded(post.facts) : undefined,
    perspective: post.perspective ? decoded(post.perspective) : undefined,
    customerImpact: post.customerImpact ? decoded(post.customerImpact) : undefined,
    ourHelp: post.ourHelp ? decoded(post.ourHelp) : undefined,
    geoSummary: post.geoSummary ? decoded(post.geoSummary) : undefined,
    faq: post.faq?.map((item) => ({ question: decoded(item.question), answer: decoded(item.answer) })),
    imageAlt: post.imageAlt ? decoded(post.imageAlt) : undefined,
  };
}

function isInsideRange(timestamp: string, filter?: { from?: Date; to?: Date }) {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return false;
  if (filter?.from && time < filter.from.getTime()) return false;
  if (filter?.to && time > filter.to.getTime()) return false;
  return true;
}

export async function getAdminDashboardData(filter?: { from?: Date; to?: Date }) {
  const [store, orders, events] = await Promise.all([readAdminStore(), readStoreOrders(), readAnalyticsEvents()]);
  const filteredOrders = orders.filter((order) => isInsideRange(order.createdAt, filter));
  const scopedEvents = events.filter((event) => isInsideRange(event.timestamp, filter));
  const filteredEvents = scopedEvents.filter(isRealEvent);
  const leads = buildCustomerLeads(filteredOrders, filteredEvents);
  const paidOrders = filteredOrders.filter((order) => ["paid", "processing", "shipped", "delivered", "completed"].includes(order.status));
  const productViews = filteredEvents.filter((event) => event.type === "product_view").length;
  const checkoutEvents = filteredEvents.filter((event) => /checkout|order|contact|commerce_click/i.test(event.type)).length;
  return {
    store,
    metrics: {
      products: store.products.length,
      publishedProducts: store.products.filter((product) => product.status === "published").length,
      posts: store.posts.length,
      orders: filteredOrders.length,
      paidOrders: paidOrders.length,
      leads: leads.length,
      revenue: paidOrders.reduce((sum, order) => sum + order.total, 0),
      visitors: new Set(filteredEvents.map((event) => event.visitorId)).size,
      pageViews: filteredEvents.filter((event) => event.type === "page_view").length,
      productViews,
      checkoutEvents,
      conversionRate: filteredEvents.length ? Math.round((filteredOrders.length / Math.max(1, new Set(filteredEvents.map((event) => event.visitorId)).size)) * 1000) / 10 : 0,
    },
    orders: filteredOrders.slice(-12).reverse(),
    events: filteredEvents.slice(-24).reverse(),
    allEvents: scopedEvents,
    leads,
    funnel: buildFunnel(filteredEvents, filteredOrders),
    popularProducts: countBy([...filteredOrders.map((order) => order.productName), ...filteredEvents.map((event) => String(event.payload?.productSlug || event.payload?.product || "")).filter(Boolean)]),
    trafficSources: groupCounts(filteredEvents.map((event) => channelForEvent(event))),
    countries: groupCounts([...filteredOrders.map((order) => order.customer.country), ...filteredEvents.map((event) => event.country || "未知")]),
    traffic: {
      profiles: buildVisitorProfiles(events).filter((profile) => isInsideRange(profile.lastSeen, filter)),
      trend: trafficTrend(filteredEvents),
      excluded: scopedEvents.filter((event) => !isRealEvent(event)).map(enrichEvent),
      channels: groupCounts(filteredEvents.map((event) => channelForEvent(event))),
      landingPages: groupCounts(filteredEvents.map((event) => event.landingPage || event.page || "/")),
    },
  };
}

export function buildCustomerLeads(orders: StoreOrder[], events: AnalyticsEvent[]): CustomerLead[] {
  const orderLeads = orders.map((order) => ({
    id: order.id,
    name: order.customer.name || `${order.checkout.firstName} ${order.checkout.lastName}`.trim() || "未知客户",
    email: order.customer.email || order.checkout.contact,
    phone: order.customer.phone,
    country: order.customer.country,
    company: order.customer.company,
    source: "checkout",
    status: order.status === "pending_payment" ? ("Payment Pending" as const) : order.status === "paid" ? ("Paid" as const) : ("Order Created" as const),
    interestedProducts: [order.productName],
    cartItems: [`${order.productName} x ${order.quantity}`],
    lastActiveTime: order.updatedAt || order.createdAt,
    trafficSource: "网站结账",
    notes: order.customer.message || order.logisticsStatus,
  }));
  const eventLeads = events
    .filter((event) => /checkout|commerce_click|contact/i.test(event.type))
    .slice(-50)
    .reverse()
    .map((event) => {
      const payload = event.payload || {};
      const product = String(payload.product || payload.productSlug || event.page || "").trim();
      return {
        id: event.id,
        name: String(payload.name || (event.type === "contact_inquiry" ? "Contact Inquiry" : "匿名访客")),
        email: String(payload.email || ""),
        phone: String(payload.phone || ""),
        country: String(payload.country || event.country || ""),
        company: String(payload.company || ""),
        source: event.type,
        status: event.type.includes("checkout") ? ("Abandoned" as const) : event.type === "contact_inquiry" ? ("Contact Captured" as const) : ("New Lead" as const),
        interestedProducts: [product].filter(Boolean),
        cartItems: [],
        lastActiveTime: event.timestamp,
        trafficSource: event.referrer || "直接访问",
        notes: String(payload.message || `最后访问页面：${event.page}`),
      };
    });
  return [...orderLeads, ...eventLeads].sort((a, b) => b.lastActiveTime.localeCompare(a.lastActiveTime));
}

function buildFunnel(events: AnalyticsEvent[], orders: StoreOrder[]) {
  const pageVisitors = new Set(events.map((event) => event.visitorId)).size;
  const productViewers = new Set(events.filter((event) => event.type === "product_view").map((event) => event.visitorId)).size;
  const checkoutStarters = new Set(events.filter((event) => /checkout_start|begin_checkout|commerce_click|contact_inquiry/.test(event.type)).map((event) => event.visitorId)).size;
  const rows = [
    { label: "访问网站", value: pageVisitors },
    { label: "浏览产品", value: productViewers },
    { label: "进入询盘/结账", value: checkoutStarters },
    { label: "创建订单", value: orders.length },
    { label: "完成付款", value: orders.filter((order) => ["paid", "processing", "shipped", "delivered", "completed"].includes(order.status)).length },
  ];
  return rows.map((row, index) => ({ ...row, conversion: index === 0 ? 100 : rows[index - 1].value ? Math.round((row.value / rows[index - 1].value) * 1000) / 10 : 0 }));
}

function countBy(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) || 0) + 1));
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 10);
}

function createSeedStore(): AdminStore {
  const createdAt = now();
  const categoryNames = [...new Set(productSlugs.map((slug) => products[slug].category))];
  const categories = categoryNames.map((name, index) => {
    const firstProduct = products[productSlugs.find((slug) => products[slug].category === name) || "xceed"];
    return {
      id: `cat-${index + 1}`,
      name,
      slug: slugify(name),
      description: `COWIN ${name} category for retail, dealer and service workflows.`,
      coverImage: firstProduct.image,
      seoTitle: `${name} | COWIN`,
      seoDescription: `Manage COWIN ${name} products, specs, price, stock and SEO fields.`,
      sortOrder: index + 1,
      status: "published" as const,
      parentId: "",
      updatedAt: createdAt,
    };
  });
  const adminProducts = productSlugs.map((slug, index) => {
    const product = products[slug];
    const category = categories.find((item) => item.name === product.category);
    const galleryImages = [product.image];
    return {
      id: `prod-${slug}`,
      slug,
      name: product.name,
      categorySlug: category?.slug || slugify(product.category),
      categoryName: product.category,
      coverImage: product.image,
      galleryImages,
      shortDescription: `${product.name} for COWIN retail, dealer and service sales.`,
      fullDescription: `${product.name} is connected to the COWIN admin system for product CMS, pricing, stock, SEO, media and order workflows.`,
      keyFeatures: product.specs,
      specifications: product.specs.map((value, specIndex) => ({ label: ["System", "Peak Power", "Speed", "Ownership"][specIndex] || `Spec ${specIndex + 1}`, value })),
      applicationScenarios: ["Retail", "Dealer sales", "Service parts", "Fleet support"],
      priceCents: cents(product.priceAmount),
      salePriceCents: 0,
      currency: "USD" as const,
      sku: `CW-${String(slug).toUpperCase()}`,
      stock: 20,
      moq: 1,
      weightDimension: "Confirm by model and export packaging.",
      shippingInfo: "Shipping method can be confirmed after order or dealer quote.",
      seoTitle: `${product.name} | COWIN`,
      seoDescription: `${product.name} for electric mobility retail, dealer and support programs.`,
      status: "published" as const,
      sortOrder: index + 1,
      showOnHome: index < 6,
      allowCart: true,
      allowDirectOrder: true,
      createdAt,
      updatedAt: createdAt,
    };
  });
  const media = adminProducts.flatMap((product) =>
    product.galleryImages.map((url, index) => ({
      id: `media-${product.slug}-${index + 1}`,
      fileName: path.basename(url),
      url,
      alt: `${product.name} image ${index + 1}`,
      mimeType: url.endsWith(".webp") ? "image/webp" : "image/png",
      sizeBytes: 0,
      usage: [product.name],
      createdAt,
    })),
  );
  const posts: ContentPost[] = [
    {
      id: "post-electric-dirt-bike-buying-guide",
      type: "blog",
      slug: "electric-dirt-bike-buying-guide",
      title: "Electric Dirt Bike Buying Guide for COWIN Customers",
      excerpt: "How to compare system voltage, peak power, range, service support and dealer fit.",
      coverImage: "/volt-lab/products/xceed_transparent.png",
      category: "Buying Guide",
      content: "## Compare the platform\n\nUse power, range, torque and ownership support together rather than one spec alone.",
      publishDate: createdAt.slice(0, 10),
      author: "COWIN Editorial Team",
      source: "",
      tags: ["Electric Dirt Bike", "Buying Guide"],
      seoTitle: "Electric Dirt Bike Buying Guide | COWIN",
      seoDescription: "Compare COWIN electric dirt bike platforms by real ownership factors.",
      status: "published",
      createdAt,
      updatedAt: createdAt,
    },
  ];
  return {
    categories,
    products: adminProducts,
    media,
    posts,
    settings: {
      companyName: "COWIN",
      adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "admin@cheerdmotors.com",
      contactEmail: "support@cheerdmotors.com",
      whatsapp: "",
      address: "",
      paymentCurrency: "USD",
      gatewayStatus: process.env.CARD_GATEWAY_ENABLED ? "configured" : "manual quote ready",
      cookieConsentReady: false,
      updatedAt: createdAt,
    },
  };
}
