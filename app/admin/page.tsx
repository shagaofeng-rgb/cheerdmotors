import AdminShell from "@/components/AdminShell";
import AdminTimeFilter from "@/components/AdminTimeFilter";
import { zhOrderStatus, zhPaymentStatus } from "@/lib/adminZh";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";
import { getAdminDashboardData } from "@/lib/backendStore";
import { getCommerceSnapshot } from "@/lib/commerceStore";
import { durableStoreConfigured } from "@/lib/durableStore";

export const dynamic = "force-dynamic";

function money(value: number) {
  return `USD ${value.toLocaleString()}`;
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const timeFilter = parseAdminTimeFilter(await searchParams);
  const [snapshot, backend] = await Promise.all([getCommerceSnapshot({ from: timeFilter.from, to: timeFilter.to }), getAdminDashboardData({ from: timeFilter.from, to: timeFilter.to })]);
  const stableStore = durableStoreConfigured();
  return (
    <AdminShell active="dashboard">
      <div className="admin-title">
        <p className="eyebrow">B2B + B2C 后台系统</p>
        <h1>订单、线索、内容与转化数据</h1>
        <p>整体框架按同类商城后台模式搭建：访问事件、订单、CMS 数据和客户线索统一读取。</p>
        <AdminTimeFilter action="/admin" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="数据统计时间" summary={timeFilter.summary} />
      </div>
      <div className="admin-metrics">
        <article><span>订单数</span><strong>{snapshot.metrics.orders}</strong><small>客户提交后生成</small></article>
        <article><span>待付款</span><strong>{snapshot.metrics.pendingPayment}</strong><small>等待支付或人工确认</small></article>
        <article><span>已确认销售额</span><strong>{money(snapshot.metrics.revenue)}</strong><small>已付款/处理中订单</small></article>
        <article><span>真实访客</span><strong>{snapshot.metrics.visitors}</strong><small>前台匿名访客 ID</small></article>
        <article><span>产品数据</span><strong>{backend.metrics.publishedProducts}/{backend.metrics.products}</strong><small>已发布 / 总数</small></article>
        <article><span>内容数据</span><strong>{backend.metrics.posts}</strong><small>博客与新闻</small></article>
        <article><span>客户线索</span><strong>{backend.metrics.leads}</strong><small>订单 + 访问行为</small></article>
        <article><span>转化率</span><strong>{backend.metrics.conversionRate}%</strong><small>订单 / 独立访客</small></article>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">同步状态</p><h2>前台与后台实时同步检查</h2></div>
        <dl className="admin-config-list">
          <div><dt>访问统计</dt><dd>前台 `/api/analytics/track` 写入，后台“访问统计/数据总览”实时读取。</dd></div>
          <div><dt>订单数据</dt><dd>后续购物车/支付写入 `/api/checkout/create-order`，后台订单/客户/线索同步读取。</dd></div>
          <div><dt>CMS 数据</dt><dd>产品、分类、媒体、博客、新闻、设置均写入同一后台数据源。</dd></div>
          <div><dt>当前存储</dt><dd>{stableStore ? "已连接稳定订单库（KV / Upstash Redis）" : "临时存储；建议配置 KV_REST_API_URL + KV_REST_API_TOKEN 或 Upstash Redis REST 凭据"}</dd></div>
        </dl>
      </section>
      <section className="admin-panel">
        <div><p className="eyebrow">转化漏斗</p><h2>客户访问路径</h2></div>
        <div className="admin-grid-list">
          {backend.funnel.map((step) => <article key={step.label}><strong>{step.label}</strong><span>{step.value.toLocaleString()} 人/次</span><small>相对上一步 {step.conversion}%</small></article>)}
        </div>
      </section>
      <section className="admin-panel">
        <div><p className="eyebrow">最新订单</p><h2>订单记录</h2></div>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>订单号</th><th>日期</th><th>产品</th><th>国家/地区</th><th>金额</th><th>订单状态</th><th>支付状态</th></tr></thead>
            <tbody>
              {snapshot.recentOrders.length ? snapshot.recentOrders.map((order) => (
                <tr key={order.id}><td>{order.id}</td><td>{order.createdAt.slice(0, 10)}</td><td>{order.productName} x {order.quantity}</td><td>{order.customer.country}</td><td>{money(order.total)}</td><td>{zhOrderStatus(order.status)}</td><td>{zhPaymentStatus(order.gatewayStatus)}</td></tr>
              )) : <tr><td colSpan={7}>暂无真实订单数据。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
