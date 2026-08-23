import AdminShell from "@/components/AdminShell";
import { zhLeadStatus } from "@/lib/adminZh";
import { buildCustomerLeads } from "@/lib/backendStore";
import { readAnalyticsEvents, readStoreOrders } from "@/lib/commerceStore";
import { AdminListControls, AdminPagination } from "@/components/AdminListControls";
import { paginate, parseAdminListQuery } from "@/lib/adminList";
import { isRealEvent } from "@/lib/trafficAnalytics";
import AdminTimeFilter from "@/components/AdminTimeFilter";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = parseAdminListQuery(params);
  const timeFilter = parseAdminTimeFilter(params);
  const [orders, events] = await Promise.all([readStoreOrders(), readAnalyticsEvents()]);
  const leads = buildCustomerLeads(orders, events.filter(isRealEvent)).filter((lead) => {
    const needle = query.search.toLowerCase();
    const time = new Date(lead.lastActiveTime).getTime();
    return time >= timeFilter.from.getTime() && time <= timeFilter.to.getTime() && (!needle || `${lead.name} ${lead.email} ${lead.interestedProducts.join(" ")} ${lead.trafficSource}`.toLowerCase().includes(needle));
  });
  const page = paginate(leads, query);
  return (
    <AdminShell active="leads">
      <div className="admin-title"><p className="eyebrow">线索与弃单</p><h1>线索/弃单</h1><p>跟踪真实访问、商业按钮点击、订单创建和待付款客户信号。</p><AdminTimeFilter action="/admin/leads" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="线索活跃时间" summary={timeFilter.summary} /></div>
      <section className="admin-panel"><AdminListControls action="/admin/leads" query={query} /><div className="admin-table-wrap"><table><thead><tr><th>线索</th><th>状态</th><th>关注产品</th><th>来源页面</th><th>流量来源</th><th>备注</th><th>最后活跃</th></tr></thead><tbody>{page.items.length ? page.items.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><br /><small>{lead.email || lead.id}</small></td><td><span className="admin-status draft">{zhLeadStatus(lead.status)}</span></td><td>{lead.interestedProducts.join(", ")}</td><td>{lead.source}</td><td>{lead.trafficSource}</td><td>{lead.notes}</td><td>{lead.lastActiveTime.slice(0, 10)}</td></tr>) : <tr><td colSpan={7}>没有符合条件的真实线索。</td></tr>}</tbody></table></div><AdminPagination action="/admin/leads" query={query} {...page} /></section>
    </AdminShell>
  );
}
