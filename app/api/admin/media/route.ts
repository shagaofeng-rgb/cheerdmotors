import path from "node:path";
import { put } from "@vercel/blob";
import { requireAdminApiSession } from "@/lib/adminAuth";
import { listAdminMedia, writeAdminStore } from "@/lib/backendStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function text(formData: FormData, key: string, limit = 500) {
  return String(formData.get(key) || "").trim().slice(0, limit);
}

function safeFileName(value: string) {
  const parsed = path.parse(value || "upload");
  const name = parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "image";
  const ext = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, "") || ".png";
  return `${name}${ext}`;
}

function imageMimeType(url: string, fallback = "image/png") {
  const lower = url.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".avif")) return "image/avif";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return fallback;
}

export async function GET() {
  const { response } = await requireAdminApiSession();
  if (response) return response;
  return Response.json({ media: await listAdminMedia() });
}

export async function POST(request: Request) {
  const { response } = await requireAdminApiSession();
  if (response) return response;
  const formData = await request.formData();
  const file = formData.get("file");
  let url = text(formData, "url");
  let fileName = path.basename(url);
  let mimeType = imageMimeType(url);
  let sizeBytes = 0;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return Response.redirect(new URL("/admin/media?error=type", request.url), 303);
    if (file.size > 15 * 1024 * 1024) return Response.redirect(new URL("/admin/media?error=size", request.url), 303);
    fileName = safeFileName(file.name);
    const blob = await put(`media/${Date.now()}-${fileName}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || imageMimeType(fileName),
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
    url = blob.url;
    mimeType = blob.contentType || file.type || imageMimeType(fileName);
    sizeBytes = file.size;
  }
  if (!url) return Response.redirect(new URL("/admin/media?error=missing", request.url), 303);
  await writeAdminStore((store) => ({
    ...store,
    media: [...store.media, { id: `media-${Date.now()}`, fileName, url, alt: text(formData, "alt", 180), mimeType, sizeBytes, usage: text(formData, "usage", 240).split(",").map((item) => item.trim()).filter(Boolean), createdAt: new Date().toISOString() }],
  }));
  return Response.redirect(new URL("/admin/media", request.url), 303);
}
