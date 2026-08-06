import crypto from "node:crypto";
import { writeAdminStore, type ContentPost } from "@/lib/backendStore";
import { cleanText, slugify } from "@/lib/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FALLBACK_COVER_IMAGE = "/volt-lab/products/xceed_transparent.png";
const MAX_CONTENT_LENGTH = 30_000;

type ArticlePayload = {
  sign: string;
  classId: string;
  title: string;
  content: string;
  authorId: string;
  imageUrl: string;
};

function response(code: 0 | 1, msg: string) {
  return Response.json({ code, msg }, { headers: { "Cache-Control": "no-store" } });
}

function equalSecret(received: string, expected: string) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}

function value(record: Record<string, unknown>, key: string, limit: number) {
  return String(record[key] || "").trim().slice(0, limit);
}

function firstValue(record: Record<string, unknown>, keys: string[], limit: number) {
  for (const key of keys) {
    const found = value(record, key, limit);
    if (found) return found;
  }
  return "";
}

async function parsePayload(request: Request): Promise<ArticlePayload> {
  const contentType = request.headers.get("content-type") || "";
  let raw: Record<string, unknown>;

  if (contentType.includes("application/json")) {
    const json = await request.json();
    raw = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  } else {
    const formData = await request.formData();
    raw = Object.fromEntries(formData.entries());
  }

  return {
    // Some webhook clients label the configured API key differently. The documented `sign` name remains primary.
    sign: firstValue(raw, ["sign", "api_key", "apiKey", "API_KEY"], 256),
    classId: value(raw, "class_id", 80).toLowerCase(),
    title: value(raw, "title", 220),
    content: value(raw, "content", MAX_CONTENT_LENGTH),
    authorId: value(raw, "author_id", 120),
    imageUrl: value(raw, "image_url", 1_000),
  };
}

export function GET(request: Request) {
  const search = new URL(request.url).searchParams;
  const sign = search.get("sign") || search.get("api_key") || search.get("apiKey") || search.get("API_KEY") || "";
  if (sign && !equalSecret(sign, process.env.BLOG_WEBHOOK_API_KEY || "")) return response(0, "API KEY错误");
  return response(1, "Webhook endpoint ready");
}

function validImageUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function stableId(payload: ArticlePayload) {
  return crypto
    .createHash("sha256")
    .update([payload.classId, payload.title, payload.content, payload.authorId, payload.imageUrl].join("\n"))
    .digest("hex");
}

export async function POST(request: Request) {
  let payload: ArticlePayload;
  try {
    payload = await parsePayload(request);
  } catch {
    return response(0, "请求参数格式错误");
  }

  if (!equalSecret(payload.sign, process.env.BLOG_WEBHOOK_API_KEY || "")) return response(0, "API KEY错误");
  if (payload.classId !== "blog") return response(0, "class_id仅支持blog");
  if (payload.title.length < 2) return response(0, "文章标题至少需要2个字符");
  if (!payload.content) return response(0, "文章内容不能为空");
  if (!validImageUrl(payload.imageUrl)) return response(0, "image_url必须是http、https或站内相对地址");

  const now = new Date().toISOString();
  const hash = stableId(payload);
  const canonicalUrl = `webhook:blog:${hash}`;
  const post: ContentPost = {
    id: `webhook-blog-${hash.slice(0, 16)}`,
    type: "blog",
    slug: `${slugify(payload.title)}-${hash.slice(0, 10)}`.slice(0, 120),
    title: payload.title,
    excerpt: cleanText(payload.content, 260),
    coverImage: payload.imageUrl || FALLBACK_COVER_IMAGE,
    category: "Plugin Blog",
    content: payload.content,
    publishDate: now.slice(0, 10),
    author: payload.authorId ? `Plugin author ${payload.authorId}` : "CHEERDMOTO Editorial Team",
    source: "External Blog Webhook",
    tags: ["Blog", "Plugin Publish"],
    seoTitle: `${payload.title.slice(0, 180)} | CHEERDMOTO`,
    seoDescription: cleanText(payload.content, 155),
    status: "published",
    createdAt: now,
    updatedAt: now,
    canonicalUrl,
    automationStatus: "manual",
    imageAlt: payload.title,
    imageSourceUrl: payload.imageUrl || undefined,
  };

  try {
    let created = false;
    await writeAdminStore((store) => {
      if (store.posts.some((item) => item.canonicalUrl === canonicalUrl)) return store;
      created = true;
      return { ...store, posts: [...store.posts, post] };
    });
    return response(1, created ? "发布成功" : "文章已存在，未重复发布");
  } catch {
    return response(0, "数据录入失败，请重试");
  }
}
