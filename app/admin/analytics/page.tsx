import AdminShell from "@/components/AdminShell";
import AdminTimeFilter from "@/components/AdminTimeFilter";
import { zhDevice, zhEventType } from "@/lib/adminZh";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";
import { getAdminDashboardData } from "@/lib/backendStore";
import { durableStoreStatus } from "@/lib/durableStore";
import { AdminListControls, AdminPagination } from "@/components/AdminListControls";
import { paginate, parseAdminListQuery } from "@/lib/adminList";
import { channelForEvent } from "@/lib/trafficAnalytics";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const timeFilter = parseAdminTimeFilter(params);
  const query = parseAdminListQuery(params);
  const data = await getAdminDashboardData({ from: timeFilter.from, to: timeFilter.to });
  const store = durableStoreStatus();
  const rows = data.allEvents.filter((event) => {
    const needle = query.search.toLowerCase();
    return (!needle || `${event.page} ${event.referrer} ${event.visitorId} ${event.browser}`.toLowerCase().includes(needle)) && (!query.country || event.country === query.country) && (!query.channel || channelForEvent(event) === query.channel);
  }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const page = paginate(rows, query);
  const countries = [...new Set(data.allEvents.map((event) => event.country).filter(Boolean))].sort();
  return (
    <AdminShell active="analytics">
      <div className="admin-title"><p className="eyebrow">访问行为</p><h1>访问统计</h1><p>这里显示前台异步埋点采集到的真实访问、产品浏览、CTA 点击和结账行为。</p><AdminTimeFilter action="/admin/analytics" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="访问统计时间" summary={timeFilter.summary} /></div>
      <div className="admin-metrics"><article><span>真实 UV</span><strong>{data.metrics.visitors}</strong><small>已过滤测试/机器人</small></article><article><span>真实 PV</span><strong>{data.metrics.pageViews}</strong><small>页面访问事件</small></article><article><span>产品浏览</span><strong>{data.metrics.productViews}</strong><small>产品相关访问</small></article><article><span>已隔离流量</span><strong>{data.traffic.excluded.length}</strong><small>不计入业务统计</small></article></div>
      {!store.configured ? <section className="admin-panel"><div><p className="eyebrow">数据源状态</p><h2>当前为临时存储</h2><p>生产环境建议配置 KV_REST_API_URL + KV_REST_API_TOKEN 或 Upstash Redis REST 凭据，否则 serverless 重启后统计可能丢失。</p></div></section> : null}
      <section className="admin-panel"><div><p className="eyebrow">来源与国家</p><h2>需求分布</h2></div><div className="admin-two-col"><div className="admin-bar-list">{data.trafficSources.length ? data.trafficSources.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无真实来源数据</span><strong>0</strong></p>}</div><div className="admin-bar-list">{data.countries.length ? data.countries.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无真实国家/地区数据</span><strong>0</strong></p>}</div></div></section>
      <section className="admin-panel"><div><p className="eyebrow">访问趋势</p><h2>真实流量按日变化</h2></div><div className="admin-trend-list">{data.traffic.trend.length ? data.traffic.trend.map((row) => <p key={row.date}><span>{row.date}</span><strong>UV {row.visitors}</strong><small>PV {row.pageViews} · 商业信号 {row.leads}</small></p>) : <p>当前范围暂无真实流量。</p>}</div></section>
      <section className="admin-panel"><div><p className="eyebrow">事件日志</p><h2>真实访问明细</h2></div><AdminListControls action="/admin/analytics" query={query} countries={countries} channels={data.traffic.channels.map((row) => row.label)} /><div className="admin-table-wrap"><table><thead><tr><th>时间</th><th>事件</th><th>页面</th><th>渠道</th><th>设备</th><th>地区</th><th>来源</th></tr></thead><tbody>{page.items.length ? page.items.map((event) => <tr key={event.id}><td>{event.timestamp.slice(0, 19).replace("T", " ")}</td><td>{zhEventType(event.type)}</td><td>{event.page}</td><td>{channelForEvent(event)}</td><td>{zhDevice(event.device)}</td><td>{event.country || "未知"}</td><td>{event.referrer || "直接访问"}</td></tr>) : <tr><td colSpan={7}>没有符合条件的真实访问事件。</td></tr>}</tbody></table></div><AdminPagination action="/admin/analytics" query={query} {...page} /></section>
    </AdminShell>
  );
}
