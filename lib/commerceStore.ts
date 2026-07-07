import { appendStoreLine, readStoreLines, writeStoreLines } from "@/lib/durableStore";
import { products, type CheckoutProductSlug } from "@/lib/site";

const ORDERS_FILE = "orders.jsonl";
const EVENTS_FILE = "analytics-events.jsonl";
const REFUNDS_FILE = "refunds.jsonl";
const SHIPMENTS_FILE = "shipments.jsonl";
const AUTHORIZATIONS_FILE = "payment-authorizations.jsonl";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded"
  | "partial_refunded"
  | "failed";

export type GatewayStatus = "not_submitted" | "pending" | "processing" | "success" | "failed" | "refunded" | "partial_refunded";
export type ShipmentStatus = "unshipped" | "shipped" | "in_transit" | "delivered" | "returned";
export type PaymentMethod = "card" | "bank_transfer" | "manual_quote";

export type StoreOrder = {
  id: string;
  productSlug: CheckoutProductSlug;
  productName: string;
  quantity: number;
  unitPrice: number;
  currency: "USD";
  subtotal: number;
  shippingEstimate: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentGateway: string;
  gatewayStatus: GatewayStatus;
  paymentId: string;
  transactionId: string;
  refundStatus: string;
  trackingNumber: string;
  logisticsStatus: string;
  shipmentStatus: ShipmentStatus;
  logisticsProvider: string;
  trackingUrl: string;
  shippedAt: string;
  estimatedDeliveryAt: string;
  deliveredAt: string;
  customerVisibleNote: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    company: string;
    country: string;
    address: string;
    message: string;
  };
  checkout: {
    contact: string;
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    zip: string;
    shippingMethod: string;
    marketingOptIn: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type AnalyticsEvent = {
  id: string;
  type: string;
  visitorId: string;
  sessionId: string;
  page: string;
  pageTitle: string;
  referrer: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  timestamp: string;
  payload: Record<string, unknown>;
};

export type RefundRecord = {
  id: string;
  orderId: string;
  amount: number;
  currency: "USD";
  status: "pending" | "submitted" | "success" | "failed";
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export type ShipmentRecord = {
  id: string;
  orderId: string;
  logisticsProvider: string;
  trackingNumber: string;
  trackingUrl: string;
  shipmentStatus: ShipmentStatus;
  shippedAt: string;
  estimatedDeliveryAt: string;
  customerVisibleNote: string;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthorizationRecord = {
  id: string;
  orderId: string;
  amount: number;
  currency: "USD";
  status: "created" | "captured" | "cancelled" | "failed";
  action: string;
  createdAt: string;
  updatedAt: string;
};

function compactTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [date.getUTCFullYear(), pad(date.getUTCMonth() + 1), pad(date.getUTCDate()), pad(date.getUTCHours()), pad(date.getUTCMinutes()), pad(date.getUTCSeconds())].join("");
}

async function generateStoreOrderId() {
  const existing = new Set((await readStoreOrders()).map((order) => order.id));
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = `CM${compactTimestamp(new Date())}${Math.floor(100000 + Math.random() * 900000)}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `CM${compactTimestamp(new Date())}${Date.now().toString().slice(-6)}`;
}

function withOrderDefaults(order: StoreOrder): StoreOrder {
  return {
    ...order,
    refundStatus: order.refundStatus || "",
    shipmentStatus: order.shipmentStatus || "unshipped",
    logisticsProvider: order.logisticsProvider || "",
    trackingUrl: order.trackingUrl || "",
    shippedAt: order.shippedAt || "",
    estimatedDeliveryAt: order.estimatedDeliveryAt || "",
    deliveredAt: order.deliveredAt || "",
    customerVisibleNote: order.customerVisibleNote || "",
  };
}

export async function createStoreOrder(input: {
  productSlug: CheckoutProductSlug;
  quantity: number;
  paymentMethod?: PaymentMethod;
  customer: StoreOrder["customer"];
  checkout?: Partial<StoreOrder["checkout"]>;
}) {
  const product = products[input.productSlug];
  const quantity = Math.max(1, Math.min(99, Number(input.quantity || 1)));
  const subtotal = product.priceAmount * quantity;
  const now = new Date().toISOString();
  const order: StoreOrder = {
    id: await generateStoreOrderId(),
    productSlug: input.productSlug,
    productName: product.name,
    quantity,
    unitPrice: product.priceAmount,
    currency: "USD",
    subtotal,
    shippingEstimate: 0,
    total: subtotal,
    status: "pending_payment",
    paymentMethod: input.paymentMethod || "manual_quote",
    paymentGateway: input.paymentMethod === "card" ? "card_gateway" : "manual",
    gatewayStatus: "not_submitted",
    paymentId: "",
    transactionId: "",
    refundStatus: "",
    trackingNumber: "",
    logisticsStatus: "Order received. Waiting for payment confirmation.",
    shipmentStatus: "unshipped",
    logisticsProvider: "",
    trackingUrl: "",
    shippedAt: "",
    estimatedDeliveryAt: "",
    deliveredAt: "",
    customerVisibleNote: "",
    customer: input.customer,
    checkout: {
      contact: input.checkout?.contact || input.customer.email,
      firstName: input.checkout?.firstName || "",
      lastName: input.checkout?.lastName || "",
      city: input.checkout?.city || "",
      state: input.checkout?.state || "",
      zip: input.checkout?.zip || "",
      shippingMethod: input.checkout?.shippingMethod || "quote_after_order",
      marketingOptIn: Boolean(input.checkout?.marketingOptIn),
    },
    createdAt: now,
    updatedAt: now,
  };
  await appendStoreLine(ORDERS_FILE, order);
  return order;
}

export async function readStoreOrders() {
  return (await readStoreLines<StoreOrder>(ORDERS_FILE)).map(withOrderDefaults);
}

export async function findStoreOrder(orderId: string) {
  return (await readStoreOrders()).find((order) => order.id === orderId) || null;
}

export async function updateStoreOrder(orderId: string, updater: (order: StoreOrder) => StoreOrder) {
  const orders = await readStoreOrders();
  let updated: StoreOrder | null = null;
  const next = orders.map((order) => {
    if (order.id !== orderId) return order;
    updated = updater({ ...order, updatedAt: new Date().toISOString() });
    return updated;
  });
  await writeStoreLines(ORDERS_FILE, next);
  return updated;
}

export async function appendAnalyticsEvent(event: AnalyticsEvent) {
  await appendStoreLine(EVENTS_FILE, event);
}

export async function readAnalyticsEvents() {
  return readStoreLines<AnalyticsEvent>(EVENTS_FILE);
}

export async function readRefundRecords() {
  return readStoreLines<RefundRecord>(REFUNDS_FILE);
}

export async function appendRefundRecord(record: RefundRecord) {
  await appendStoreLine(REFUNDS_FILE, record);
}

export async function readShipmentRecords() {
  return readStoreLines<ShipmentRecord>(SHIPMENTS_FILE);
}

export async function appendShipmentRecord(record: ShipmentRecord) {
  await appendStoreLine(SHIPMENTS_FILE, record);
}

export async function readAuthorizationRecords() {
  return readStoreLines<AuthorizationRecord>(AUTHORIZATIONS_FILE);
}

export async function appendAuthorizationRecord(record: AuthorizationRecord) {
  await appendStoreLine(AUTHORIZATIONS_FILE, record);
}

export async function getCommerceSnapshot(filter?: { from?: Date; to?: Date }) {
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const inside = (timestamp: string) => {
    const time = new Date(timestamp).getTime();
    if (Number.isNaN(time)) return false;
    if (filter?.from && time < filter.from.getTime()) return false;
    if (filter?.to && time > filter.to.getTime()) return false;
    return true;
  };
  const scopedOrders = orders.filter((order) => inside(order.createdAt));
  const scopedEvents = events.filter((event) => inside(event.timestamp));
  const paidOrders = scopedOrders.filter((order) => ["paid", "processing", "shipped", "delivered", "completed"].includes(order.status));
  return {
    metrics: {
      orders: scopedOrders.length,
      pendingPayment: scopedOrders.filter((order) => order.status === "pending_payment").length,
      paidOrders: paidOrders.length,
      revenue: paidOrders.reduce((sum, order) => sum + order.total, 0),
      visitors: new Set(scopedEvents.map((event) => event.visitorId)).size,
      pageViews: scopedEvents.filter((event) => event.type === "page_view").length,
    },
    recentOrders: scopedOrders.slice(-12).reverse(),
    recentEvents: scopedEvents.slice(-24).reverse(),
    paymentGateway: {
      provider: "Manual Quote / Card Gateway",
      status: process.env.CARD_GATEWAY_ENABLED ? "configured" : "manual quote ready",
      createEndpoint: "/api/checkout/create-order",
      notifyEndpoint: "pending gateway integration",
    },
  };
}
