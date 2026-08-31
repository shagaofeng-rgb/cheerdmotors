import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  pathname: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | undefined>;
};

function href(pathname: string, page: number, query: Props["query"]) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => value && params.set(key, value));
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return `${pathname}${search ? `?${search}` : ""}`;
}

export default function PublicPagination({ pathname, page, totalPages, query }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav className="content-pagination" aria-label="Content pagination">
      {page > 1 ? <Link href={href(pathname, page - 1, query)}><ChevronLeft size={17} />Previous</Link> : <span aria-disabled="true"><ChevronLeft size={17} />Previous</span>}
      <strong>Page {page} of {totalPages}</strong>
      {page < totalPages ? <Link href={href(pathname, page + 1, query)}>Next<ChevronRight size={17} /></Link> : <span aria-disabled="true">Next<ChevronRight size={17} /></span>}
    </nav>
  );
}
