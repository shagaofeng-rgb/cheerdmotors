export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; reset?: string }> }) {
  const query = await searchParams;
  return (
    <main className="admin-login-page">
      <form className="admin-login-card" action="/api/admin/login" method="post">
        <p className="eyebrow">CHEERDMOTO 后台</p>
        <h1>后台登录</h1>
        <p>登录后可管理产品、订单、客户线索、访问统计、转化漏斗和内容数据。</p>
        {query.error ? <strong className="admin-login-error">登录失败，请检查邮箱和密码。</strong> : null}
        {query.reset ? <strong className="admin-login-notice">已收到重置请求。生产环境请通过 Vercel 环境变量重置密码。</strong> : null}
        <label>
          邮箱
          <input name="email" type="email" defaultValue="admin@cheerdmotors.com" required />
        </label>
        <label>
          密码
          <input name="password" type="password" placeholder="请输入后台密码" required />
        </label>
        <button className="button primary" type="submit">登录后台</button>
        <small>生产环境密码存放在 Vercel 环境变量中，不写入前端代码。</small>
      </form>
    </main>
  );
}
