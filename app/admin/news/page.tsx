import AdminShell from "@/components/AdminShell";
import { zhPublishStatus } from "@/lib/adminZh";
import { listAdminPosts } from "@/lib/backendStore";
import { AdminListControls, AdminPagination } from "@/components/AdminListControls";
import { paginate, parseAdminListQuery } from "@/lib/adminList";
import { getNewsAutomationRuns } from "@/lib/newsAutomation";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseAdminListQuery(await searchParams);
  const [allPosts, automationRuns] = await Promise.all([listAdminPosts("news"), getNewsAutomationRuns(8)]);
  const posts = allPosts.filter((post) => !query.search || `${post.title} ${post.slug} ${post.source} ${post.category}`.toLowerCase().includes(query.search.toLowerCase()));
  const page = paginate(posts, query);
  const latestRun = automationRuns[0];
  return (
    <AdminShell active="news">
      <div className="admin-title"><p className="eyebrow">Industry News CMS</p><h1>新闻管理</h1><p>发布公司新闻、行业事实、海外市场动态和带来源说明的内容。</p></div>
      <section className="admin-panel">
        <div><p className="eyebrow">News Automation</p><h2>自动发布运行状态</h2><p>生产环境每天北京时间 16:00 自动执行，只发布 News，不会触发 Blog。</p></div>
        <div className="admin-stat-grid">
          <article><span>当前状态</span><strong>{latestRun ? (latestRun.ok ? "运行正常" : "需要检查") : "等待首次运行"}</strong><small>{latestRun?.status || "尚无运行日志"}</small></article>
          <article><span>最近执行</span><strong>{latestRun ? new Date(latestRun.completedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "-"}</strong><small>北京时间</small></article>
          <article><span>最近发布</span><strong>{latestRun?.published ?? 0}</strong><small>目标 {latestRun?.target ?? 4} 篇 / 日</small></article>
          <article><span>来源状态</span><strong>{latestRun ? `${latestRun.sourceResults.filter((source) => source.ok).length}/${latestRun.sourceResults.length}` : "-"}</strong><small>成功来源 / 总来源</small></article>
        </div>
        {automationRuns.length ? <div className="admin-table-wrap"><table><thead><tr><th>执行时间</th><th>结果</th><th>候选</th><th>发布</th><th>来源</th><th>错误摘要</th></tr></thead><tbody>{automationRuns.map((run) => <tr key={`${run.startedAt}-${run.status}`}><td>{new Date(run.completedAt).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}</td><td><span className={`admin-status ${run.ok ? "published" : "unpublished"}`}>{run.ok ? "成功" : "失败"}</span></td><td>{run.candidates}</td><td>{run.published}</td><td>{run.sourceResults.filter((source) => source.ok).length}/{run.sourceResults.length}</td><td>{run.errors[0] || run.skipped[0] || "-"}</td></tr>)}</tbody></table></div> : null}
      </section>
      <section className="admin-panel"><div><p className="eyebrow">新增内容</p><h2>新增新闻</h2></div><form className="admin-form-grid admin-form-wide" action="/api/admin/posts" method="post"><input type="hidden" name="type" value="news" /><input name="title" placeholder="新闻标题" required /><input name="slug" placeholder="新闻链接 slug" required /><select name="status" defaultValue="draft"><option value="draft">草稿</option><option value="published">已发布</option><option value="unpublished">已下架</option><option value="scheduled">定时发布</option><option value="archived">已归档</option></select><input name="publishDate" type="date" /><input name="category" placeholder="分类，例如 Market News / Company News" /><input name="author" placeholder="作者，例如 CHEERDMOTO Editorial Team" /><input name="source" placeholder="来源名称 / URL" /><input name="coverImage" placeholder="/volt-lab/products/xceed_transparent.png" /><input name="tags" placeholder="标签，用英文逗号分隔" /><textarea name="excerpt" placeholder="新闻摘要" /><textarea name="content" placeholder="新闻正文，可用 Markdown" /><input name="seoTitle" placeholder="SEO Title" /><textarea name="seoDescription" placeholder="Meta Description" /><button type="submit">保存新闻</button></form></section>
      <section className="admin-panel"><AdminListControls action="/admin/news" query={query} /><div className="admin-table-wrap"><table><thead><tr><th>标题</th><th>日期</th><th>来源</th><th>状态</th><th>SEO / 摘要</th></tr></thead><tbody>{page.items.length ? page.items.map((post) => <tr key={post.id}><td><strong>{post.title}</strong><br /><small>{post.slug}</small></td><td>{post.publishDate}</td><td>{post.source || "-"}</td><td><span className={`admin-status ${post.status}`}>{zhPublishStatus(post.status)}</span></td><td>{post.seoTitle}<br /><small>{post.excerpt}</small></td></tr>) : <tr><td colSpan={5}>没有符合条件的新闻数据。</td></tr>}</tbody></table></div><AdminPagination action="/admin/news" query={query} {...page} /></section>
    </AdminShell>
  );
}
