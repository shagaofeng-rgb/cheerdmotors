import { runNewsAutomation } from "@/lib/newsAutomation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, error: "Unauthorized." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  try {
    const dryRun = new URL(request.url).searchParams.get("dryRun") === "1";
    const result = await runNewsAutomation({ dryRun });
    return Response.json(result, { status: result.ok ? 200 : 503, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("News automation failed", error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : "Unknown News automation failure." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
