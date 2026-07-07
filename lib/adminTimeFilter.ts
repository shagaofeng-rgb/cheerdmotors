export type AdminTimeRange = "day" | "week" | "month" | "year" | "custom";

const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
const rangeLabels: Record<AdminTimeRange, string> = {
  day: "今天",
  week: "本周",
  month: "本月",
  year: "今年",
  custom: "自定义",
};

function shanghaiNow() {
  return new Date(Date.now() + SHANGHAI_OFFSET_MS);
}

function toUtcFromShanghai(year: number, month: number, day: number, hour = 0, minute = 0, second = 0, ms = 0) {
  return new Date(Date.UTC(year, month, day, hour, minute, second, ms) - SHANGHAI_OFFSET_MS);
}

function dateInputValue(date: Date) {
  return new Date(date.getTime() + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
}

function parseDateParts(value: string | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

function startOfShanghaiDate(value: string | undefined, fallback: Date) {
  const parts = parseDateParts(value);
  return parts ? toUtcFromShanghai(parts.year, parts.month, parts.day) : fallback;
}

function endOfShanghaiDate(value: string | undefined, fallback: Date) {
  const parts = parseDateParts(value);
  return parts ? toUtcFromShanghai(parts.year, parts.month, parts.day, 23, 59, 59, 999) : fallback;
}

export function parseAdminTimeFilter(searchParams: Record<string, string | string[] | undefined>) {
  const now = shanghaiNow();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();
  const dayOfWeek = now.getUTCDay() || 7;
  const rangeParam = Array.isArray(searchParams.range) ? searchParams.range[0] : searchParams.range;
  const range = (["day", "week", "month", "year", "custom"].includes(rangeParam || "") ? rangeParam : "month") as AdminTimeRange;
  let from = toUtcFromShanghai(year, month, day);
  let to = toUtcFromShanghai(year, month, day, 23, 59, 59, 999);
  if (range === "week") from = toUtcFromShanghai(year, month, day - dayOfWeek + 1);
  if (range === "month") from = toUtcFromShanghai(year, month, 1);
  if (range === "year") from = toUtcFromShanghai(year, 0, 1);
  if (range === "custom") {
    const startParam = Array.isArray(searchParams.start) ? searchParams.start[0] : searchParams.start;
    const endParam = Array.isArray(searchParams.end) ? searchParams.end[0] : searchParams.end;
    from = startOfShanghaiDate(startParam, from);
    to = endOfShanghaiDate(endParam, to);
    if (from > to) [from, to] = [to, from];
  }
  const start = dateInputValue(from);
  const end = dateInputValue(to);
  return { range, start, end, from, to, timezone: "Asia/Shanghai", summary: `${rangeLabels[range]} | ${start} 至 ${end} | 北京时间` };
}
