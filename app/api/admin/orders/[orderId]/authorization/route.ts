import { requireAdminApiSession } from "@/lib/adminAuth";
import { appendAnalyticsEvent, appendAuthorizationRecord, findStoreOrder } from "@/lib/commerceStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const auth = await requireAdminApiSession();
  if (auth.response) return auth.response;
  const { orderId } = await params;
  const order = await findStoreOrder(orderId);
  if (!order) return Response.json({ message: "Order not found" }, { status: 404 });
  const formData = await request.formData();
  const action = String(formData.get("action") || "create").slice(0, 40);
  const amount = Math.max(0, Math.min(order.total, Number(formData.get("amount") || order.total)));
  const now = new Date().toISOString();
  const authorization = { id: `auth-${Date.now()}`, orderId, amount, currency: "USD" as const, status: action === "capture" ? "captured" as const : action === "cancel" ? "cancelled" as const : "created" as const, action, createdAt: now, updatedAt: now };
  await appendAuthorizationRecord(authorization);
  await appendAnalyticsEvent({ id: `${Date.now()}-admin-authorization`, type: "authorization_action", visitorId: "admin", sessionId: orderId, page: `/admin/orders/${orderId}`, pageTitle: "Admin authorization action", referrer: "", country: order.customer.country, city: "", device: "Desktop", browser: "Admin", os: "Admin", timestamp: now, payload: { orderId, action, amount } });
  return Response.json({ ok: true, authorization });
}
