import { createStoreOrder, appendAnalyticsEvent } from "@/lib/commerceStore";
import { productSlugs, type CheckoutProductSlug } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(value: unknown, limit = 240) {
  return String(value || "").trim().slice(0, limit);
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const productSlug = str(payload.productSlug) as CheckoutProductSlug;
  if (!productSlugs.includes(productSlug)) return Response.json({ message: "Invalid product" }, { status: 400 });
  const order = await createStoreOrder({
    productSlug,
    quantity: Number(payload.quantity || 1),
    paymentMethod: payload.paymentMethod === "card" ? "card" : payload.paymentMethod === "bank_transfer" ? "bank_transfer" : "manual_quote",
    customer: {
      name: str(payload.name),
      email: str(payload.email),
      phone: str(payload.phone),
      company: str(payload.company),
      country: str(payload.country),
      address: str(payload.address, 500),
      message: str(payload.message, 1000),
    },
  });
  await appendAnalyticsEvent({ id: `${Date.now()}-order-created`, type: "order_created", visitorId: str(payload.visitorId) || "checkout", sessionId: order.id, page: "/checkout", pageTitle: "Checkout order created", referrer: "", country: order.customer.country, city: "", device: "Unknown", browser: "Checkout", os: "Unknown", timestamp: new Date().toISOString(), payload: { orderId: order.id, productSlug } });
  return Response.json({ ok: true, order });
}
