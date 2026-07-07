import AdminShell from "@/components/AdminShell";
import { listAdminMedia } from "@/lib/backendStore";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const media = await listAdminMedia();
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  return (
    <AdminShell active="media">
      <div className="admin-title"><p className="eyebrow">图片与素材</p><h1>媒体库</h1><p>上传产品图、新闻图和页面素材到 Vercel Blob，并统一管理 ALT 文案和使用位置。</p></div>
      <section className="admin-panel">
        <div><p className="eyebrow">Vercel Blob</p><h2>上传新图片</h2><p>{blobReady ? "图片上传存储已连接，上传后会生成可公开访问的 CDN URL。" : "未检测到 BLOB_READ_WRITE_TOKEN，请先连接 Vercel Blob store。"}</p></div>
        <form className="admin-form-grid" action="/api/admin/media" method="post" encType="multipart/form-data">
          <input name="file" type="file" accept="image/avif,image/webp,image/png,image/jpeg,image/gif" />
          <input name="alt" placeholder="图片 ALT 描述" required />
          <input name="usage" placeholder="使用位置，例如产品/新闻" />
          <button type="submit">上传到媒体库</button>
        </form>
      </section>
      <section className="admin-panel"><div><p className="eyebrow">登记素材</p><h2>添加已有图片 URL</h2></div><form className="admin-form-grid" action="/api/admin/media" method="post"><input name="url" placeholder="/volt-lab/products/xceed_transparent.png" required /><input name="alt" placeholder="图片 ALT 描述" required /><input name="usage" placeholder="使用位置，例如产品/新闻" /><button type="submit">加入媒体库</button></form></section>
      <section className="admin-panel"><div className="admin-media-grid">{media.length ? media.map((asset) => <article key={asset.id}><img src={asset.url} alt={asset.alt} /><strong>{asset.alt}</strong><small>{asset.url}</small><span>{asset.usage.join(", ") || "未绑定使用位置"}</span></article>) : <article><strong>暂无媒体数据</strong><small>请先添加已有图片路径或接入上传接口。</small></article>}</div></section>
    </AdminShell>
  );
}
