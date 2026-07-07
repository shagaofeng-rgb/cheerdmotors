import { requireAdminApiSession } from "@/lib/adminAuth";
import { appendAnalyticsEvent, appendShipmentRecord, findStoreOrder, updateStoreOrder, type ShipmentStatus } from "@/lib/commerceStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(formData: FormData, key: string, limit = 500) {
  return String(formData.get(key) || "").trim().slice(0, limit);
}

export async function POST(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const auth = await requireAdminApiSession();
  if (auth.response) return auth.response;
  const { orderId } = await params;
  const order = await findStoreOrder(orderId);
  if (!order) return Response.json({ message: "Order not found" }, { status: 404 });
  const formData = await request.formData();
  const logisticsProvider = text(formData, "logisticsProvider", 120);
  const trackingNumber = text(formData, "trackingNumber", 120);
  if (!logisticsProvider || !trackingNumber) return Response.json({ message: "Logistics provider and tracking number are required" }, { status: 400 });
  const now = new Date().toISOString();
  const shipmentStatus = (text(formData, "shipmentStatus", 40) || "shipped") as ShipmentStatus;
  const record = { id: `ship-${Date.now()}`, orderId, logisticsProvider, trackingNumber, trackingUrl: text(formData, "trackingUrl", 260), shipmentStatus, shippedAt: text(formData, "shippedAt", 40), estimatedDeliveryAt: text(formData, "estimatedDeliveryAt", 40), customerVisibleNote: text(formData, "customerVisibleNote", 600), internalNote: text(formData, "internalNote", 600), createdAt: now, updatedAt: now };
  await appendShipmentRecord(record);
  const updated = await updateStoreOrder(orderId, (item) => ({ ...item, status: shipmentStatus === "delivered" ? "delivered" : "shipped", shipmentStatus, logisticsProvider, trackingNumber, trackingUrl: record.trackingUrl, shippedAt: record.shippedAt || now, estimatedDeliveryAt: record.estimatedDeliveryAt, customerVisibleNote: record.customerVisibleNote, logisticsStatus: `Shipment saved: ${logisticsProvider} ${trackingNumber}` }));
  await appendAnalyticsEvent({ id: `${Date.now()}-admin-shipment-save`, type: "shipment_saved", visitorId: "admin", sessionId: orderId, page: `/admin/orders/${orderId}`, pageTitle: "Admin shipment save", referrer: "", country: order.customer.country, city: "", device: "Desktop", browser: "Admin", os: "Admin", timestamp: now, payload: { orderId, trackingNumber, shipmentStatus } });
  return Response.json({ ok: true, order: updated, shipment: record });
}
