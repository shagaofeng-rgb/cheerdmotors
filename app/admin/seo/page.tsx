import AdminShell from "@/components/AdminShell";
import { zhPublishStatus } from "@/lib/adminZh";
import { listAdminCategories, listAdminPosts, listAdminProducts } from "@/lib/backendStore";

export const dynamic = "force-dynamic";

function seoState(title: string, description: string) {
  if (!title || !description) return { label: "待补齐", className: "unpublished" };
  if (title.length > 70 || description.length > 170 || description.length < 80) return { label: "需优化", className: "scheduled" };
  return { label: "正常", className: "published" };
}

export default async function AdminSeoPage() {
  const [products, categories, posts] = await Promise.all([listAdminProducts(), listAdminCategories(), listAdminPosts()]);
  const rows = [
    ...products.map((item) => ({
      id: item.id,
      type: "产品",
      name: item.name,
      slug: item.slug,
      status: item.status,
      title: item.seoTitle,
      description: item.seoDescription,
      updatedAt: item.updatedAt,
    })),
    ...categories.map((item) => ({
      id: item.id,
      type: "分类",
      name: item.name,
      slug: item.slug,
      status: item.status,
      title: item.seoTitle,
      description: item.seoDescription,
      updatedAt: item.updatedAt,
    })),
    ...posts.map((item) => ({
      id: item.id,
      type: item.type === "blog" ? "博客" : "新闻",
      name: item.title,
      slug: item.slug,
      status: item.status,
      title: item.seoTitle,
      description: item.seoDescription,
      updatedAt: item.updatedAt,
    })),
  ];
  const optimized = rows.filter((row) => seoState(row.title, row.description).className === "published").length;
  const needsWork = rows.length - optimized;

  return (
    <AdminShell active="seo">
      <div className="admin-title">
        <p className="eyebrow">Search Data</p>
        <h1>SEO 数据</h1>
        <p>集中检查产品、分类、博客和新闻的标题、描述、发布状态和 SEO 完整度。</p>
      </div>
      <div className="admin-metrics">
        <article><span>SEO 页面</span><strong>{rows.length}</strong><small>产品 + 分类 + 内容</small></article>
        <article><span>正常</span><strong>{optimized}</strong><small>标题与描述已覆盖</small></article>
        <article><span>待优化</span><strong>{needsWork}</strong><small>缺失或长度不合理</small></article>
        <article><span>内容数</span><strong>{posts.length}</strong><small>博客 / 新闻</small></article>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">SEO 清单</p><h2>页面元数据</h2></div>
        <div className="admin-table-wrap">
          <table>
            <thead><tr><th>页面</th><th>类型</th><th>发布状态</th><th>SEO 状态</th><th>Title</th><th>Description</th><th>更新</th></tr></thead>
            <tbody>
              {rows.length ? rows.map((row) => {
                const state = seoState(row.title, row.description);
                return (
                  <tr key={`${row.type}-${row.id}`}>
                    <td><strong>{row.name}</strong><br /><small>{row.slug}</small></td>
                    <td>{row.type}</td>
                    <td><span className={`admin-status ${row.status}`}>{zhPublishStatus(row.status)}</span></td>
                    <td><span className={`admin-status ${state.className}`}>{state.label}</span></td>
                    <td>{row.title || "-"}</td>
                    <td>{row.description || "-"}</td>
                    <td>{row.updatedAt.slice(0, 10)}</td>
                  </tr>
                );
              }) : <tr><td colSpan={7}>暂无 SEO 数据。</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
