import AdminShell from "@/components/AdminShell";
import AdminTimeFilter from "@/components/AdminTimeFilter";
import { zhDevice, zhEventType } from "@/lib/adminZh";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";
import { getAdminDashboardData } from "@/lib/backendStore";

export const dynamic = "force-dynamic";

export default async function AdminVisitorsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const timeFilter = parseAdminTimeFilter(await searchParams);
  const data = await getAdminDashboardData({ from: timeFilter.from, to: timeFilter.to });
  const visitorIds = new Set(data.events.map((event) => event.visitorId));
  const sessions = new Set(data.events.map((event) => event.sessionId));
  const latestEvents = data.events.slice(0, 80);

  return (
    <AdminShell active="visitors">
      <div className="admin-title">
        <p className="eyebrow">Visitor Log</p>
        <h1>访客记录</h1>
        <p>按真实前台埋点查看访客 ID、会话、页面路径、设备、地区和来源。</p>
        <AdminTimeFilter action="/admin/visitors" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="访客记录时间" summary={timeFilter.summary} />
      </div>
      <div className="admin-metrics">
        <article><span>访客</span><strong>{visitorIds.size}</strong><small>匿名 visitorId</small></article>
        <article><span>会话</span><strong>{sessions.size}</strong><small>sessionId 去重</small></article>
        <article><span>事件</span><strong>{data.events.length}</strong><small>当前时间范围</small></article>
        <article><span>产品兴趣</span><strong>{data.metrics.productViews}</strong><small>产品访问事件</small></article>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">实时访客</p><h2>最近访问记录</h2></div>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>时间</th><th>访客 / 会话</th><th>事件</th><th>页面</th><th>设备</th><th>地区</th><th>来源</th></tr></thead>
            <tbody>
              {latestEvents.length ? latestEvents.map((event) => (
                <tr key={event.id}>
                  <td>{event.timestamp.slice(0, 19).replace("T", " ")}</td>
                  <td><strong>{event.visitorId.slice(0, 16)}</strong><br /><small>{event.sessionId.slice(0, 16)}</small></td>
                  <td>{zhEventType(event.type)}</td>
                  <td>{event.page}<br /><small>{event.pageTitle}</small></td>
                  <td>{zhDevice(event.device)}<br /><small>{event.browser || event.os}</small></td>
                  <td>{event.country || "-"}<br /><small>{event.city || ""}</small></td>
                  <td>{event.referrer || "直接访问"}</td>
                </tr>
              )) : <tr><td colSpan={7}>暂无访客记录。前台页面打开后会自动采集。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
