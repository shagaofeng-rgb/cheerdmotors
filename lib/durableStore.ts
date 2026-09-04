import fs from "node:fs/promises";
import path from "node:path";

type RedisResult<T> = { result?: T; error?: string };

class DurableStoreRequestError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message);
  }
}

const LOCAL_DATA_DIR = process.env.VERCEL ? path.join("/tmp", "cheerdmotors-commerce") : path.join(process.cwd(), ".data");
const KV_URL = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, "");
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const STORE_PREFIX = process.env.COMMERCE_STORE_PREFIX || "cheerdmotors-commerce";

export function durableStoreConfigured() {
  return Boolean(KV_URL && KV_TOKEN);
}

export function durableStoreStatus() {
  return {
    configured: durableStoreConfigured(),
    provider: durableStoreConfigured() ? "kv_rest" : process.env.VERCEL ? "serverless_tmp_fallback" : "local_file",
    storePrefix: STORE_PREFIX,
  };
}

function storeKey(fileName: string) {
  return `${STORE_PREFIX}:${fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
}

function localFile(fileName: string) {
  return path.join(LOCAL_DATA_DIR, fileName);
}

function safeJson<T>(value: string | null | undefined): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

async function kvPipeline<T>(commands: string[][]) {
  const body = JSON.stringify(commands);
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${KV_URL}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}`, "Content-Type": "application/json" },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        throw new DurableStoreRequestError(`Durable store request failed: ${response.status}`, retryable);
      } else {
        const payload = (await response.json()) as RedisResult<T>[];
        const error = payload.find((item) => item.error)?.error;
        if (error) throw new DurableStoreRequestError(`Durable store command failed: ${error}`, false);
        return payload.map((item) => item.result);
      }
    } catch (error) {
      lastError = error;
      if ((error instanceof DurableStoreRequestError && !error.retryable) || attempt === 3) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
  }

  throw lastError instanceof Error ? lastError : new Error("Durable store request failed");
}

export async function appendStoreLine(fileName: string, value: unknown) {
  if (durableStoreConfigured()) {
    await kvPipeline([["RPUSH", storeKey(fileName), JSON.stringify(value)]]);
    return;
  }
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.appendFile(localFile(fileName), `${JSON.stringify(value)}\n`, "utf8");
}

export async function appendStoreLineLimited(fileName: string, value: unknown, limit = 100) {
  const safeLimit = Math.max(1, Math.min(1000, Math.floor(limit)));
  if (durableStoreConfigured()) {
    const key = storeKey(fileName);
    await kvPipeline([
      ["RPUSH", key, JSON.stringify(value)],
      ["LTRIM", key, String(-safeLimit), "-1"],
    ]);
    return;
  }
  const existing = await readStoreLines<unknown>(fileName);
  await writeStoreLines(fileName, [...existing, value].slice(-safeLimit));
}

export async function readStoreLines<T>(fileName: string) {
  if (durableStoreConfigured()) {
    const [items] = await kvPipeline<string[]>([["LRANGE", storeKey(fileName), "0", "-1"]]);
    return (Array.isArray(items) ? items : []).map((item) => safeJson<T>(item)).filter(Boolean) as T[];
  }
  try {
    const text = await fs.readFile(localFile(fileName), "utf8");
    return text.split(/\r?\n/).map((line) => safeJson<T>(line)).filter(Boolean) as T[];
  } catch {
    return [];
  }
}

export async function writeStoreLines(fileName: string, values: unknown[]) {
  if (durableStoreConfigured()) {
    const key = storeKey(fileName);
    await kvPipeline(values.length ? [["DEL", key], ["RPUSH", key, ...values.map((value) => JSON.stringify(value))]] : [["DEL", key]]);
    return;
  }
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(localFile(fileName), `${values.map((value) => JSON.stringify(value)).join("\n")}${values.length ? "\n" : ""}`, "utf8");
}

export async function readStoreObject<T>(fileName: string) {
  if (durableStoreConfigured()) {
    const [value] = await kvPipeline<string | null>([["GET", storeKey(fileName)]]);
    return safeJson<T>(value);
  }
  try {
    return JSON.parse(await fs.readFile(localFile(fileName), "utf8")) as T;
  } catch {
    return null;
  }
}

export async function writeStoreObject(fileName: string, value: unknown) {
  if (durableStoreConfigured()) {
    await kvPipeline([["SET", storeKey(fileName), JSON.stringify(value)]]);
    return;
  }
  await fs.mkdir(LOCAL_DATA_DIR, { recursive: true });
  await fs.writeFile(localFile(fileName), JSON.stringify(value, null, 2), "utf8");
}
