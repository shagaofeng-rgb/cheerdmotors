import AdminShell from "@/components/AdminShell";
import { googleSearchDateRange, googleSearchConsoleStatus, readGoogleSearchSnapshot, type GoogleSearchRow } from "@/lib/googleSearchConsole";

export const dynamic = "force-dynamic";

function number(value: number) {
  return value.toLocaleString("en-US");
}

function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function position(value: number) {
  return value ? value.toFixed(1) : "-";
}

function hostPath(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.pathname === "/" ? parsed.hostname : `${parsed.hostname}${parsed.pathname}`;
  } catch {
    return url;
  }
}

function BarList({ rows, labels }: { rows: GoogleSearchRow[]; labels: [string, string] }) {
  return (
    <div className="admin-table-wrap">
      <table>
        <thead><tr><th>{labels[0]}</th><th>{labels[1]}</th><th>点击</th><th>展现</th><th>CTR</th><th>平均排名</th></tr></thead>
        <tbody>
          {rows.length ? rows.slice(0, 30).map((row) => (
            <tr key={row.keys.join("|")}>
              <td><strong>{row.keys[0] || "-"}</strong></td>
              <td>{row.keys[1] ? hostPath(row.keys[1]) : "-"}</td>
              <td>{number(row.clicks)}</td>
              <td>{number(row.impressions)}</td>
              <td>{percent(row.ctr)}</td>
              <td>{position(row.position)}</td>
            </tr>
          )) : <tr><td colSpan={6}>暂无 Google Search Console 数据，配置凭据后点击同步。</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminGoogleRankingsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const snapshot = await readGoogleSearchSnapshot();
  const status = googleSearchConsoleStatus();
  const defaults = googleSearchDateRange();
  const syncState = Array.isArray(params.sync) ? params.sync[0] : params.sync;
  const message = Array.isArray(params.message) ? params.message[0] : params.message;

  return (
    <AdminShell active="google-rankings">
      <div className="admin-title">
        <p className="eyebrow">Google Search Console</p>
        <h1>谷歌排名数据</h1>
        <p>从 Google Search Console 同步真实自然搜索关键词、页面、点击、展现、CTR 和平均排名。</p>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">同步端口</p><h2>Search Console 数据同步</h2></div>
        <form className="admin-form-grid" action="/api/admin/google-search" method="post">
          <input name="startDate" type="date" defaultValue={snapshot.startDate || defaults.startDate} />
          <input name="endDate" type="date" defaultValue={snapshot.endDate || defaults.endDate} />
          <button type="submit">同步谷歌排名数据</button>
        </form>
        <dl className="admin-config-list">
          <div><dt>站点属性</dt><dd>{status.siteUrl}</dd></div>
          <div><dt>接口状态</dt><dd>{status.configured ? "已配置，可同步 Google Search Console。" : "未配置完整，需要添加 Google 服务账号环境变量。"}</dd></div>
          <div><dt>上次同步</dt><dd>{snapshot.syncedAt ? snapshot.syncedAt.slice(0, 19).replace("T", " ") : "暂未同步"}</dd></div>
          <div><dt>数据范围</dt><dd>{snapshot.startDate} 至 {snapshot.endDate}</dd></div>
        </dl>
        {syncState === "ok" ? <p className="admin-login-notice">Google 排名数据同步完成。</p> : null}
        {syncState === "error" || snapshot.error ? <p className="admin-login-error">{decodeURIComponent(message || snapshot.error || "Google 排名数据同步失败。")}</p> : null}
      </section>
      <div className="admin-metrics">
        <article><span>点击</span><strong>{number(snapshot.totals.clicks)}</strong><small>Google 自然搜索</small></article>
        <article><span>展现</span><strong>{number(snapshot.totals.impressions)}</strong><small>搜索结果曝光</small></article>
        <article><span>CTR</span><strong>{percent(snapshot.totals.ctr)}</strong><small>点击率</small></article>
        <article><span>平均排名</span><strong>{position(snapshot.totals.position)}</strong><small>Search Console position</small></article>
      </div>
      <section className="admin-panel">
        <div><p className="eyebrow">关键词 + 页面</p><h2>排名明细</h2></div>
        <BarList rows={snapshot.queryPages} labels={["关键词", "排名页面"]} />
      </section>
      <section className="admin-panel">
        <div><p className="eyebrow">关键词</p><h2>搜索词表现</h2></div>
        <BarList rows={snapshot.queries} labels={["关键词", "页面"]} />
      </section>
      <section className="admin-panel">
        <div><p className="eyebrow">页面</p><h2>页面自然搜索表现</h2></div>
        <BarList rows={snapshot.pages} labels={["页面", ""]} />
      </section>
      <section className="admin-panel">
        <div><p className="eyebrow">维度拆分</p><h2>国家、设备与日期</h2></div>
        <div className="admin-two-col">
          <div className="admin-bar-list">{snapshot.countries.length ? snapshot.countries.map((row) => <p key={row.keys[0]}><span>{row.keys[0]}</span><strong>{number(row.clicks)} / {position(row.position)}</strong></p>) : <p><span>暂无国家数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">{snapshot.devices.length ? snapshot.devices.map((row) => <p key={row.keys[0]}><span>{row.keys[0]}</span><strong>{number(row.clicks)} / {position(row.position)}</strong></p>) : <p><span>暂无设备数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">{snapshot.dates.length ? snapshot.dates.slice(-14).map((row) => <p key={row.keys[0]}><span>{row.keys[0]}</span><strong>{number(row.clicks)} / {number(row.impressions)}</strong></p>) : <p><span>暂无日期数据</span><strong>0</strong></p>}</div>
          <div className="admin-bar-list">
            <p><span>服务账号邮箱</span><strong>{status.clientEmailConfigured ? "已配置" : "未配置"}</strong></p>
            <p><span>私钥</span><strong>{status.privateKeyConfigured ? "已配置" : "未配置"}</strong></p>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
