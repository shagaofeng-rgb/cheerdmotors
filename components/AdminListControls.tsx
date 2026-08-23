import Link from "next/link";
import { queryString, type AdminListQuery } from "@/lib/adminList";

export function AdminListControls({ action, query, countries = [], channels = [], classifications = [] }: { action: string; query: AdminListQuery; countries?: string[]; channels?: string[]; classifications?: string[] }) {
  return (
    <form className="admin-list-controls" action={action} method="get">
      <input name="search" defaultValue={query.search} placeholder="搜索访客、页面、来源或产品" />
      {countries.length ? <select name="country" defaultValue={query.country}><option value="">全部国家/地区</option>{countries.map((value) => <option key={value}>{value}</option>)}</select> : null}
      {channels.length ? <select name="channel" defaultValue={query.channel}><option value="">全部渠道</option>{channels.map((value) => <option key={value}>{value}</option>)}</select> : null}
      {classifications.length ? <select name="classification" defaultValue={query.classification}><option value="">全部客户分类</option>{classifications.map((value) => <option key={value}>{value}</option>)}</select> : null}
      <select name="pageSize" defaultValue={query.pageSize}><option value="25">25 条/页</option><option value="50">50 条/页</option><option value="100">100 条/页</option></select>
      <button type="submit">筛选</button>
      <Link className="admin-link-button" href={action}>清除</Link>
    </form>
  );
}

export function AdminPagination({ action, query, page, pages, total }: { action: string; query: AdminListQuery; page: number; pages: number; total: number }) {
  const href = (next: number) => `${action}${queryString({ ...query, page: next })}`;
  return <div className="admin-pagination"><span>共 {total} 条 · 第 {page}/{pages} 页</span><div><Link className={page <= 1 ? "is-disabled" : ""} aria-disabled={page <= 1} href={page <= 1 ? "#" : href(page - 1)}>上一页</Link><Link className={page >= pages ? "is-disabled" : ""} aria-disabled={page >= pages} href={page >= pages ? "#" : href(page + 1)}>下一页</Link></div></div>;
}
