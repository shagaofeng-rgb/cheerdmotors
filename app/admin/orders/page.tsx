import Link from "next/link";
import AdminShell from "@/components/AdminShell";
import { zhOrderStatus, zhPaymentMethod, zhPaymentStatus } from "@/lib/adminZh";
import { readStoreOrders } from "@/lib/commerceStore";
import { AdminListControls, AdminPagination } from "@/components/AdminListControls";
import { paginate, parseAdminListQuery } from "@/lib/adminList";
import AdminTimeFilter from "@/components/AdminTimeFilter";
import { parseAdminTimeFilter } from "@/lib/adminTimeFilter";

export const dynamic = "force-dynamic";

function money(value: number) {
  return `USD ${value.toLocaleString()}`;
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const query = parseAdminListQuery(params);
  const timeFilter = parseAdminTimeFilter(params);
  const orders = (await readStoreOrders()).slice().reverse().filter((order) => {
    const needle = query.search.toLowerCase();
    const time = new Date(order.createdAt).getTime();
    return time >= timeFilter.from.getTime() && time <= timeFilter.to.getTime() && (!needle || `${order.id} ${order.customer.name} ${order.customer.email} ${order.productName}`.toLowerCase().includes(needle)) && (!query.country || order.customer.country === query.country);
  });
  const page = paginate(orders, query);
  const countries = [...new Set(orders.map((order) => order.customer.country).filter(Boolean))].sort();
  return (
    <AdminShell active="orders">
      <div className="admin-title"><p className="eyebrow">订单管理</p><h1>订单管理</h1><p>前台结账、付款状态、物流、退款和客户信息都会同步到这里。</p><AdminTimeFilter action="/admin/orders" range={timeFilter.range} start={timeFilter.start} end={timeFilter.end} label="订单时间" summary={timeFilter.summary} /></div>
      <section className="admin-panel">
        <AdminListControls action="/admin/orders" query={query} countries={countries} />
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>订单号</th><th>客户</th><th>产品</th><th>金额</th><th>支付</th><th>物流</th><th>日期</th><th>操作</th></tr></thead>
            <tbody>
              {page.items.length ? page.items.map((order) => (
                <tr key={order.id}>
                  <td><strong>{order.id}</strong><br /><small>{zhOrderStatus(order.status)}</small></td>
                  <td>{order.customer.name}<br /><small>{order.customer.email} | {order.customer.country}</small></td>
                  <td>{order.productName} x {order.quantity}</td>
                  <td>{money(order.total)}</td>
                  <td>{zhPaymentMethod(order.paymentMethod)}<br /><small>{zhPaymentStatus(order.gatewayStatus)}</small><br /><small>{order.paymentId || order.transactionId || "Payment ID waiting"}</small></td>
                  <td>{order.logisticsStatus}<br /><small>{order.trackingNumber || "暂无物流单号"}</small></td>
                  <td>{order.createdAt.slice(0, 10)}</td>
                  <td><Link className="button secondary small" href={`/admin/orders/${order.id}`}>查看详情</Link></td>
                </tr>
              )) : <tr><td colSpan={8}>没有符合条件的真实订单。</td></tr>}
            </tbody>
          </table>
        </div>
        <AdminPagination action="/admin/orders" query={query} {...page} />
      </section>
    </AdminShell>
  );
}
