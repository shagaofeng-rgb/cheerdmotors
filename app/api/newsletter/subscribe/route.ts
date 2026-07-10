import { saveNewsletterSubscriber } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries((await request.formData()).entries());
  const result = await saveNewsletterSubscriber(String(payload.email || ""), String(payload.source || "footer"));
  if (!contentType.includes("application/json")) {
    const next = result.ok ? "/?newsletter=1" : "/?newsletter=error";
    return Response.redirect(new URL(next, request.url), 303);
  }
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
