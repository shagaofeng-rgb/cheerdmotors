import AdminShell from "@/components/AdminShell";
import { readAdminStore } from "@/lib/backendStore";
import { durableStoreConfigured } from "@/lib/durableStore";
import { googleSearchConsoleStatus } from "@/lib/googleSearchConsole";
import { notificationStatus } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { settings } = await readAdminStore();
  const stableStore = durableStoreConfigured();
  const googleSearch = googleSearchConsoleStatus();
  const blobReady = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const notifications = notificationStatus();
  return (
    <AdminShell active="settings">
      <div className="admin-title"><p className="eyebrow">系统配置</p><h1>系统设置</h1><p>管理公司信息、邮箱通知、支付接口和隐私合规准备状态。</p></div>
      <section className="admin-panel"><form className="admin-form-grid" action="/api/admin/settings" method="post"><input name="companyName" defaultValue={settings.companyName} placeholder="公司名称" /><input name="contactEmail" defaultValue={settings.contactEmail} placeholder="联系邮箱" /><input name="adminNotificationEmail" defaultValue={settings.adminNotificationEmail} placeholder="管理员通知邮箱" /><input name="whatsapp" defaultValue={settings.whatsapp} placeholder="WhatsApp" /><textarea name="address" defaultValue={settings.address} placeholder="公司地址" /><input name="paymentCurrency" defaultValue={settings.paymentCurrency} placeholder="支付币种" /><button type="submit">保存设置</button></form></section>
      <section className="admin-panel"><div><p className="eyebrow">环境变量检查</p><h2>生产环境必须配置</h2></div><dl className="admin-config-list"><div><dt>后台登录</dt><dd>ADMIN_EMAIL, ADMIN_PASSWORD_HASH 或 ADMIN_PASSWORD, ADMIN_JWT_SECRET</dd></div><div><dt>订单存储</dt><dd>{stableStore ? "已连接 KV / Upstash Redis，订单和会员数据会稳定保存。" : "待连接 Upstash Redis；需要 KV_REST_API_URL + KV_REST_API_TOKEN，或 UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN。"}</dd></div><div><dt>图片上传</dt><dd>{blobReady ? "已连接 Vercel Blob，媒体库支持图片上传。" : "需要 BLOB_READ_WRITE_TOKEN。"}</dd></div><div><dt>Google 排名数据</dt><dd>{googleSearch.configured ? `已连接 ${googleSearch.siteUrl}` : "需要 GOOGLE_SEARCH_CONSOLE_SITE_URL, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY。"}</dd></div><div><dt>询盘邮件</dt><dd>{notifications.resendConfigured ? `已连接 Resend，询盘会发送到 ${notifications.to}。` : "代码已接好；需要 RESEND_API_KEY，可选 RESEND_FROM, ADMIN_NOTIFICATION_EMAIL 或 INQUIRY_RECEIVER_EMAIL。"}</dd></div><div><dt>支付</dt><dd>后续按 Cheerdmoto 收款通道接入；当前为人工报价/订单记录模式。</dd></div></dl></section>
    </AdminShell>
  );
}
