import AdminShell from "@/components/AdminShell";
import AdminTimeFilter from "@/components/AdminTimeFilter";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";
import { getAdminDashboardData } from "@/lib/backendStore";

export const dynamic = "force-dynamic";

function countRows(values: string[]) {
  const map = new Map<string, number>();
  values.filter(Boolean).forEach((value) => map.set(value, (map.get(value) || 0) + 1));
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 12);
}

export default async function AdminAttributionPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const timeFilter = parseAdminTimeFilter(await searchParams);
  const data = await getAdminDashboardData({ from: timeFilter.from, to: timeFilter.to });
  const pages = countRows(data.events.map((event) => event.page || "未知页面"));
  const devices = countRows(data.events.map((event) => event.device || "Unknown"));
  const productInterest = data.popularProducts;

  return (
    <AdminShell active="attribution">
      <div className="admin-title">
        <p className="eyebrow">Attribution</p>
        <h1>来源归因</h1>
        <p>把访问来源、地区、设备、页面和产品兴趣拆开看，方便判断客户是从哪里来、看了什么。</p>
        <AdminTimeFilter action="/admin/attribution" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="归因统计时间" summary={timeFilter.summary} />
      </div>
      <div className="admin-metrics">
        <article><span>来源数</span><strong>{data.trafficSources.length}</strong><small>referrer 去重</small></article>
        <article><span>国家/地区</span><strong>{data.countries.length}</strong><small>访问 + 订单地区</small></article>
        <article><span>访问页面</span><strong>{pages.length}</strong><small>路径去重</small></article>
        <article><span>产品兴趣</span><strong>{productInterest.length}</strong><small>浏览/订单聚合</small></article>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">流量来源</p><h2>来源、地区与设备</h2></div>
        <div className="admin-two-col">
          <div className="admin-bar-list">{data.trafficSources.length ? data.trafficSources.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无来源数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">{data.countries.length ? data.countries.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无地区数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">{devices.length ? devices.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无设备数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">{productInterest.length ? productInterest.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无产品兴趣数据</span><strong>0</strong></p>}</div>
        </div>
      </section>
      <section className="admin-panel">
        <div><p className="eyebrow">页面归因</p><h2>访问路径排行</h2></div>
        <div className="admin-bar-list">
          {pages.length ? pages.map((row) => <p key={row.label}><span>{row.label}</span><strong>{row.value}</strong></p>) : <p><span>暂无页面数据</span><strong>0</strong></p>}
        </div>
      </section>
    </AdminShell>
  );
}
