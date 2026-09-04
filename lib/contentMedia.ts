import crypto from "node:crypto";
import dns from "node:dns/promises";
import net from "node:net";
import { put } from "@vercel/blob";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MIN_COVER_WIDTH = 640;
const MIN_COVER_HEIGHT = 360;
const MAX_REDIRECTS = 3;

type StableImage = {
  url: string;
  mirrored: boolean;
  reason?: string;
};

function isPrivateAddress(address: string) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") || normalized.startsWith("fd") || normalized.startsWith("fe80:");
}

async function assertPublicUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("unsupported_url");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) throw new Error("private_host");
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error("private_host");
  } else {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) throw new Error("private_host");
  }
  return url;
}

async function fetchPublicImage(value: string) {
  let url = await assertPublicUrl(value);
  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const response = await fetch(url, {
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/*", "User-Agent": "COWIN-Media/1.0" },
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
      cache: "no-store",
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirect === MAX_REDIRECTS) throw new Error("redirect_failed");
      url = await assertPublicUrl(new URL(location, url).toString());
      continue;
    }
    if (!response.ok) throw new Error(`source_${response.status}`);
    const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
    if (!contentType.startsWith("image/") || contentType === "image/svg+xml") throw new Error("invalid_type");
    const declaredSize = Number(response.headers.get("content-length") || 0);
    if (declaredSize > MAX_IMAGE_BYTES) throw new Error("image_too_large");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error("image_too_large");
    return { bytes, contentType };
  }
  throw new Error("redirect_failed");
}

function jpegDimensions(bytes: Uint8Array) {
  let offset = 2;
  while (offset + 8 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1];
    const length = (bytes[offset + 2] << 8) + bytes[offset + 3];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { width: (bytes[offset + 7] << 8) + bytes[offset + 8], height: (bytes[offset + 5] << 8) + bytes[offset + 6] };
    }
    if (length < 2) return null;
    offset += length + 2;
  }
  return null;
}

function imageDimensions(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/png" && bytes.length >= 24) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }
  if (contentType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8) return jpegDimensions(bytes);
  if (contentType === "image/gif" && bytes.length >= 10) return { width: bytes[6] | (bytes[7] << 8), height: bytes[8] | (bytes[9] << 8) };
  if (contentType === "image/webp" && bytes.length >= 30 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF") {
    const chunk = String.fromCharCode(...bytes.slice(12, 16));
    if (chunk === "VP8X") return { width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16), height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16) };
    if (chunk === "VP8 ") return { width: (bytes[26] | (bytes[27] << 8)) & 0x3fff, height: (bytes[28] | (bytes[29] << 8)) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
  }
  return null;
}

function extensionFor(contentType: string) {
  return ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "image/gif": "gif" } as Record<string, string>)[contentType] || "img";
}

export async function stabilizeContentImage(source: string, fallback: string, stableKey: string): Promise<StableImage> {
  const value = source.trim();
  if (!value) return { url: fallback, mirrored: false, reason: "missing" };
  if (value.startsWith("/")) return { url: value, mirrored: false };
  if (/\.public\.blob\.vercel-storage\.com\//i.test(value)) return { url: value, mirrored: false };
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_OIDC_TOKEN) return { url: value, mirrored: false, reason: "blob_not_configured" };

  try {
    const { bytes, contentType } = await fetchPublicImage(value);
    const dimensions = imageDimensions(bytes, contentType);
    if (dimensions && (dimensions.width < MIN_COVER_WIDTH || dimensions.height < MIN_COVER_HEIGHT)) throw new Error("image_too_small");
    const digest = crypto.createHash("sha256").update(`${stableKey}\n${value}`).digest("hex").slice(0, 24);
    const blob = await put(`content-covers/${digest}.${extensionFor(contentType)}`, Buffer.from(bytes), {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType,
      cacheControlMaxAge: 60 * 60 * 24 * 365,
      maximumSizeInBytes: MAX_IMAGE_BYTES,
    });
    return { url: blob.url, mirrored: true };
  } catch (error) {
    return { url: fallback, mirrored: false, reason: error instanceof Error ? error.message : "mirror_failed" };
  }
}
