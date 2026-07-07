import { requireAdminApiSession } from "@/lib/adminAuth";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";
import { getAdminDashboardData } from "@/lib/backendStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;
  const timeFilter = parseAdminTimeFilter(Object.fromEntries(new URL(request.url).searchParams.entries()));
  const data = await getAdminDashboardData({ from: timeFilter.from, to: timeFilter.to });
  return Response.json({ filter: { range: timeFilter.range, start: timeFilter.start, end: timeFilter.end, timezone: timeFilter.timezone }, funnel: data.funnel });
}
