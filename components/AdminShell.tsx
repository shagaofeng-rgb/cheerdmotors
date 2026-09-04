import { requireAdminSession } from "@/lib/adminAuth";
import AdminRealtimeSync from "@/components/AdminRealtimeSync";

const navGroups = [
  { label: "运营总览", items: [{ key: "dashboard", label: "数据总览", href: "/admin" }, { key: "analytics", label: "流量分析", href: "/admin/analytics" }, { key: "visitors", label: "访客中心", href: "/admin/visitors" }, { key: "attribution", label: "来源归因", href: "/admin/attribution" }, { key: "funnel", label: "转化漏斗", href: "/admin/funnel" }] },
  { label: "客户与订单", items: [{ key: "leads", label: "线索/弃单", href: "/admin/leads" }, { key: "customers", label: "客户管理", href: "/admin/customers" }, { key: "orders", label: "订单管理", href: "/admin/orders" }] },
  { label: "内容与商品", items: [{ key: "products", label: "产品管理", href: "/admin/products" }, { key: "categories", label: "分类管理", href: "/admin/categories" }, { key: "media", label: "媒体库", href: "/admin/media" }, { key: "blog", label: "博客管理", href: "/admin/blog" }, { key: "news", label: "新闻管理", href: "/admin/news" }] },
  { label: "增长与系统", items: [{ key: "seo", label: "SEO 数据", href: "/admin/seo" }, { key: "google-rankings", label: "谷歌排名", href: "/admin/google-rankings" }, { key: "settings", label: "系统设置", href: "/admin/settings" }] },
] as const;

export default async function AdminShell({ active, children }: { active: string; children: React.ReactNode }) {
  const session = await requireAdminSession();
  return (
    <main className="admin-dashboard">
      <aside className="admin-sidebar">
        <a className="admin-logo" href="/admin">
          <span>CW</span>
          <strong>COWIN 后台</strong>
        </a>
        <nav>
          {navGroups.map((group) => <div className="admin-nav-group" key={group.label}><span>{group.label}</span>{group.items.map((item) => <a className={active === item.key || active === item.label ? "is-active" : ""} href={item.href} key={item.href}>{item.label}</a>)}</div>)}
        </nav>
        <div className="admin-sidebar-foot">
          <small>当前账号</small>
          <span>{session.email}</span>
          <form action="/api/admin/logout" method="post">
            <button type="submit">退出登录</button>
          </form>
        </div>
      </aside>
      <section className="admin-main">
        <AdminRealtimeSync />
        {children}
      </section>
    </main>
  );
}
