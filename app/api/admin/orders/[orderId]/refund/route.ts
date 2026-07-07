import { requireAdminApiSession } from "@/lib/adminAuth";
import { appendAnalyticsEvent, appendRefundRecord, findStoreOrder, updateStoreOrder } from "@/lib/commerceStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const auth = await requireAdminApiSession();
  if (auth.response) return auth.response;
  const { orderId } = await params;
  const order = await findStoreOrder(orderId);
  if (!order) return Response.json({ message: "Order not found" }, { status: 404 });
  const formData = await request.formData();
  const amount = Math.max(0, Math.min(order.total, Number(formData.get("amount") || order.total)));
  if (!amount) return Response.json({ message: "Refund amount is required" }, { status: 400 });
  const now = new Date().toISOString();
  const refund = { id: `refund-${Date.now()}`, orderId, amount, currency: "USD" as const, status: "submitted" as const, reason: String(formData.get("reason") || "Merchant refund request").slice(0, 500), createdAt: now, updatedAt: now };
  await appendRefundRecord(refund);
  const updated = await updateStoreOrder(orderId, (item) => ({ ...item, status: amount >= item.total ? "refunded" : "partial_refunded", refundStatus: amount >= item.total ? "full_refund_submitted" : "partial_refund_submitted", gatewayStatus: amount >= item.total ? "refunded" : "partial_refunded" }));
  await appendAnalyticsEvent({ id: `${Date.now()}-admin-refund-create`, type: "refund_created", visitorId: "admin", sessionId: orderId, page: `/admin/orders/${orderId}`, pageTitle: "Admin refund create", referrer: "", country: order.customer.country, city: "", device: "Desktop", browser: "Admin", os: "Admin", timestamp: now, payload: { orderId, amount } });
  return Response.json({ ok: true, order: updated, refund });
}
