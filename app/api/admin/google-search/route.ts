import { requireAdminApiSession } from "@/lib/adminAuth";
import { readGoogleSearchSnapshot, syncGoogleSearchConsole } from "@/lib/googleSearchConsole";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;
  return Response.json(await readGoogleSearchSnapshot(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;
  const formData = await request.formData();
  try {
    await syncGoogleSearchConsole(formData);
    return Response.redirect(new URL("/admin/google-rankings?sync=ok", request.url), 303);
  } catch (error) {
    const message = encodeURIComponent(error instanceof Error ? error.message : "Google Search Console sync failed.");
    return Response.redirect(new URL(`/admin/google-rankings?sync=error&message=${message}`, request.url), 303);
  }
}
