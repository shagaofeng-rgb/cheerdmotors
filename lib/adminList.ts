export type AdminListQuery = {
  page: number;
  pageSize: number;
  search: string;
  country: string;
  channel: string;
  quality: string;
  classification: string;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function parseAdminListQuery(params: Record<string, string | string[] | undefined>): AdminListQuery {
  const size = Number(first(params.pageSize));
  return {
    page: Math.max(1, Number(first(params.page)) || 1),
    pageSize: [25, 50, 100].includes(size) ? size : 25,
    search: first(params.search).trim().slice(0, 120),
    country: first(params.country).trim().slice(0, 80),
    channel: first(params.channel).trim().slice(0, 80),
    quality: first(params.quality).trim().slice(0, 40),
    classification: first(params.classification).trim().slice(0, 40),
  };
}

export function paginate<T>(items: T[], query: AdminListQuery) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(query.page, pages);
  return { items: items.slice((page - 1) * query.pageSize, page * query.pageSize), page, pages, total };
}

export function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== 1) params.set(key, String(value));
  });
  const result = params.toString();
  return result ? `?${result}` : "";
}
