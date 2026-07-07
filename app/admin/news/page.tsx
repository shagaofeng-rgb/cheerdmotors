import AdminShell from "@/components/AdminShell";
import { zhPublishStatus } from "@/lib/adminZh";
import { listAdminPosts } from "@/lib/backendStore";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const posts = await listAdminPosts("news");
  return (
    <AdminShell active="news">
      <div className="admin-title"><p className="eyebrow">Industry News CMS</p><h1>新闻管理</h1><p>发布公司新闻、行业事实、海外市场动态和带来源说明的内容。</p></div>
      <section className="admin-panel"><div><p className="eyebrow">新增内容</p><h2>新增新闻</h2></div><form className="admin-form-grid admin-form-wide" action="/api/admin/posts" method="post"><input type="hidden" name="type" value="news" /><input name="title" placeholder="新闻标题" required /><input name="slug" placeholder="新闻链接 slug" required /><select name="status" defaultValue="draft"><option value="draft">草稿</option><option value="published">已发布</option><option value="unpublished">已下架</option><option value="scheduled">定时发布</option><option value="archived">已归档</option></select><input name="publishDate" type="date" /><input name="category" placeholder="分类，例如 Market News / Company News" /><input name="author" placeholder="作者，例如 CHEERDMOTO Editorial Team" /><input name="source" placeholder="来源名称 / URL" /><input name="coverImage" placeholder="/volt-lab/products/xceed_transparent.png" /><input name="tags" placeholder="标签，用英文逗号分隔" /><textarea name="excerpt" placeholder="新闻摘要" /><textarea name="content" placeholder="新闻正文，可用 Markdown" /><input name="seoTitle" placeholder="SEO Title" /><textarea name="seoDescription" placeholder="Meta Description" /><button type="submit">保存新闻</button></form></section>
      <section className="admin-panel"><div className="admin-table-wrap"><table><thead><tr><th>标题</th><th>日期</th><th>来源</th><th>状态</th><th>SEO / 摘要</th></tr></thead><tbody>{posts.length ? posts.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><br /><small>{post.slug}</small></td><td>{post.publishDate}</td><td>{post.source || "-"}</td><td><span className={`admin-status ${post.status}`}>{zhPublishStatus(post.status)}</span></td><td>{post.seoTitle}<br /><small>{post.excerpt}</small></td></tr>) : <tr><td colSpan={5}>暂无新闻数据。</td></tr>}</tbody></table></div></section>
    </AdminShell>
  );
}
