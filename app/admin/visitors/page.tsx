import AdminShell from "@/components/AdminShell";
import AdminTimeFilter from "@/components/AdminTimeFilter";
import { zhDevice, zhEventType } from "@/lib/adminZh";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";
import { getAdminDashboardData } from "@/lib/backendStore";
import { AdminListControls, AdminPagination } from "@/components/AdminListControls";
import { paginate, parseAdminListQuery } from "@/lib/adminList";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const query = parseAdminListQuery(params);
  const data = await getAdminDashboardData({ from: timeFilter.from, to: timeFilter.to });
  const profiles = data.traffic.profiles.filter((profile) => {
    const needle = query.search.toLowerCase();
    return (!needle || `${profile.visitorId} ${profile.lastPage} ${profile.country} ${profile.interestedProducts.join(" ")}`.toLowerCase().includes(needle)) && (!query.country || profile.country === query.country) && (!query.channel || profile.channel === query.channel) && (!query.classification || profile.classification === query.classification);
  });
  const page = paginate(profiles, query);
  const countries = [...new Set(data.traffic.profiles.map((profile) => profile.country).filter(Boolean))].sort();

  return (
    <AdminShell active="visitors">
      <div className="admin-title">
        <p className="eyebrow">Visitor Log</p>
        <h1>访客记录</h1>
        <p>按真实前台埋点查看访客 ID、会话、页面路径、设备、地区和来源。</p>
        <AdminTimeFilter action="/admin/visitors" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="访客记录时间" summary={timeFilter.summary} />
      </div>
      <div className="admin-metrics">
        <article><span>真实访客</span><strong>{data.traffic.profiles.length}</strong><small>已排除测试与机器人</small></article>
        <article><span>回访访客</span><strong>{data.traffic.profiles.filter((item) => item.visitCount > 1).length}</strong><small>多次会话访问</small></article>
        <article><span>高意向/留资</span><strong>{data.traffic.profiles.filter((item) => item.classification === "高意向" || item.classification === "已留资").length}</strong><small>浏览产品、结账或询盘</small></article>
        <article><span>产品兴趣</span><strong>{data.metrics.productViews}</strong><small>产品访问事件</small></article>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">真实访客</p><h2>访客画像与访问路径</h2></div>
        <AdminListControls action="/admin/visitors" query={query} countries={countries} channels={["Direct", "Google", "Bing", "Other Search", "Social", "Referral", "Email"]} classifications={["新访客", "回访客", "高意向", "已留资"]} />
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>最近访问</th><th>访客</th><th>客户分类</th><th>访问次数</th><th>最后页面</th><th>地区 / IP</th><th>渠道</th><th>产品兴趣</th></tr></thead>
            <tbody>
              {page.items.length ? page.items.map((visitor) => (
                <tr key={visitor.visitorId}>
                  <td>{visitor.lastSeen.slice(0, 19).replace("T", " ")}</td>
                  <td><strong>{visitor.visitorId.slice(0, 18)}</strong><br /><small>{visitor.device}</small></td>
                  <td><span className="admin-status published">{visitor.classification}</span></td>
                  <td>{visitor.visitCount} 次会话<br /><small>{visitor.pageViews} PV</small></td>
                  <td>{visitor.lastPage}</td>
                  <td>{visitor.country}{visitor.city ? ` / ${visitor.city}` : ""}<br /><small>{visitor.maskedIp || "IP 未提供"}</small></td>
                  <td>{visitor.channel}</td>
                  <td>{visitor.interestedProducts.join(", ") || "-"}</td>
                </tr>
              )) : <tr><td colSpan={8}>暂无符合条件的真实访客记录。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination action="/admin/visitors" query={query} {...page} />
      </section>
    </AdminShell>
  );
}
