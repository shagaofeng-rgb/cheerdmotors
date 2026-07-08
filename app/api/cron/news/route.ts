import { runNewsAutomation } from "@/lib/newsAutomation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return Response.json({ ok: false, error: "Unauthorized or CRON_SECRET missing." }, { status: 401 });
  const result = await runNewsAutomation();
  return Response.json(result, { status: result.ok ? 200 : 207, headers: { "Cache-Control": "no-store" } });
}
