import { Hono } from "hono";
import { auth } from "../middleware/auth";
import type { Env } from "../types/env";
import { ensureTelegramUserLastSeenColumn } from "../database/telegram-users";

const reports = new Hono<Env>();
reports.use("*", auth);

// Temporary schema guard will be added to the database layer in the next commit.

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(title: string, body: string): string {
  return `<!doctype html><html lang="tr"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} · BotPilot</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#0b1120;color:#e5edf8;font:14px/1.5 Inter,system-ui,Arial,sans-serif}
main{max-width:1400px;margin:auto;padding:26px}.top{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
h1{font-size:28px;margin:0 0 5px}h2{font-size:18px;margin:0 0 16px}.muted{color:#91a2ba}.nav{display:flex;gap:8px;flex-wrap:wrap;margin:20px 0}
a,button{cursor:pointer;text-decoration:none;border:0;border-radius:9px;padding:10px 13px;background:#2563eb;color:#fff;font-weight:650}
a.secondary{background:#1e293b;border:1px solid #334155}.cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:18px 0}
.card{background:#111c2f;border:1px solid #23314a;border-radius:15px;padding:19px;margin:16px 0}
.metric{font-size:30px;font-weight:800;letter-spacing:-.5px}.metric-label{color:#91a2ba;font-size:13px;margin-bottom:7px}
.filters{display:grid;grid-template-columns:2fr 1fr auto;gap:10px;align-items:end}
label{display:block;color:#a9bad0;font-size:12px;margin-bottom:6px}input,select{width:100%;padding:12px;border-radius:9px;border:1px solid #33445f;background:#0b1120;color:#e5edf8}
.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;min-width:760px}th,td{text-align:left;padding:11px;border-bottom:1px solid #26344a;vertical-align:top}
th{color:#9fb2cb;font-size:12px;text-transform:uppercase;letter-spacing:.05em;background:#142036}tbody tr:hover{background:#16243a}
.pill{display:inline-block;padding:4px 8px;border-radius:99px;background:#1e293b;color:#b9c9dc;font-size:12px}.good{color:#4ade80}.bad{color:#fca5a5}
.pagination{display:flex;gap:10px;align-items:center;justify-content:space-between;margin-top:16px;flex-wrap:wrap}
@media(max-width:850px){main{padding:15px}.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.filters{grid-template-columns:1fr}}
@media(max-width:460px){.cards{grid-template-columns:1fr}.metric{font-size:26px}}
</style></head><body><main>${body}</main></body></html>`;
}

reports.get("/reports", async (c) => {
  const db = c.env.DB;
  await ensureTelegramUserLastSeenColumn(db);
  const q = String(c.req.query("q") || "").trim().slice(0, 120);
  const selectedBot = String(c.req.query("bot") || "").trim();
  const pageNumber = Math.max(1, Math.min(100000, Number(c.req.query("page") || 1) || 1));
  const pageSize = 50;
  const offset = (pageNumber - 1) * pageSize;
  const botFilter = /^\d+$/.test(selectedBot) ? Number(selectedBot) : 0;

  const totalResult: any = await db.prepare("SELECT COUNT(*) AS n FROM bots").first();
  const userResult: any = await db.prepare("SELECT COUNT(*) AS n FROM telegram_users").first();
  const todayResult: any = await db.prepare("SELECT COUNT(*) AS n FROM telegram_users WHERE date(last_seen)=date('now')").first();
  const botStats = await db.prepare(`
    SELECT b.id, b.telegram_id, b.name, b.username, b.status,
           COUNT(u.id) AS user_count,
           SUM(CASE WHEN date(u.last_seen)=date('now') THEN 1 ELSE 0 END) AS active_today
    FROM bots b LEFT JOIN telegram_users u ON u.bot_id=b.telegram_id
    GROUP BY b.id, b.telegram_id, b.name, b.username, b.status
    ORDER BY user_count DESC, b.id DESC
  `).all();

  let where = " WHERE 1=1 ";
  const params: (string | number)[] = [];
  if (botFilter > 0) { where += " AND bot_id = ?"; params.push(botFilter); }
  if (q) {
    where += " AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR CAST(telegram_id AS TEXT) LIKE ?)";
    const like = "%" + q.replace(/[\\%_]/g, "\\$&") + "%";
    params.push(like, like, like, like);
  }

  const countQuery: any = await db.prepare("SELECT COUNT(*) AS n FROM telegram_users" + where).bind(...params).first();
  const users = await db.prepare(
    "SELECT id, bot_id, telegram_id, username, first_name, last_name, last_seen FROM telegram_users" +
    where + " ORDER BY datetime(last_seen) DESC, id DESC LIMIT ? OFFSET ?"
  ).bind(...params, pageSize, offset).all();

  const bots = await db.prepare("SELECT telegram_id, name, username FROM bots ORDER BY name ASC").all();
  const botNameById = new Map<number, string>();
  for (const b of bots.results as any[]) botNameById.set(Number(b.telegram_id), String(b.name || b.username || b.telegram_id));

  const statRows = (botStats.results as any[]).map((b) => `<tr>
<td><strong>${esc(b.name || "-")}</strong><div class="muted">@${esc(b.username || "-")} · ID ${esc(b.telegram_id)}</div></td>
<td><span class="pill">${Number(b.status) === 1 ? "🟢 Token geçerli" : Number(b.status) === -1 ? "⛔ Token geçersiz" : "⚪ Kontrol gerekli"}</span></td>
<td><strong>${Number(b.user_count || 0)}</strong></td><td>${Number(b.active_today || 0)}</td>
<td><a class="secondary" href="/reports/bot/${encodeURIComponent(String(b.telegram_id))}">Kullanıcıları gör</a></td></tr>`).join("") ||
    '<tr><td colspan="5">Henüz bot bulunmuyor.</td></tr>';

  const userRows = (users.results as any[]).map((u) => `<tr>
<td>${esc(u.telegram_id)}</td><td>${u.username ? "@" + esc(u.username) : '<span class="muted">Kullanıcı adı yok</span>'}</td>
<td><strong>${esc([u.first_name, u.last_name].filter(Boolean).join(" ") || "-")}</strong></td>
<td>${esc(botNameById.get(Number(u.bot_id)) || u.bot_id)}</td><td>${esc(u.last_seen || "-")}</td>
<td><a class="secondary" href="/reports/user/${encodeURIComponent(String(u.telegram_id))}">İncele</a></td></tr>`).join("") ||
    '<tr><td colspan="6">Bu filtrede kullanıcı bulunamadı.</td></tr>';

  const totalUsers = Number(userResult?.n || 0);
  const matched = Number(countQuery?.n || 0);
  const maxPage = Math.max(1, Math.ceil(matched / pageSize));
  const prev = pageNumber > 1 ? `<a class="secondary" href="/reports?q=${encodeURIComponent(q)}&bot=${encodeURIComponent(selectedBot)}&page=${pageNumber - 1}">← Önceki</a>` : "";
  const next = pageNumber < maxPage ? `<a href="/reports?q=${encodeURIComponent(q)}&bot=${encodeURIComponent(selectedBot)}&page=${pageNumber + 1}">Sonraki →</a>` : "";
  const botOptions = (bots.results as any[]).map((b) => `<option value="${esc(b.telegram_id)}" ${String(b.telegram_id) === selectedBot ? "selected" : ""}>${esc(b.name || b.username || b.telegram_id)} (@${esc(b.username || "-")})</option>`).join("");

  return c.html(layout("Detaylı Raporlar", `
<div class="top"><div><h1>📊 Detaylı Bot & Kullanıcı Raporları</h1><div class="muted">Bot bazlı kayıtlar, günlük aktivite, kullanıcı arama ve dışa aktarma</div></div><a class="secondary" href="/dashboard">← Panele dön</a></div>
<div class="nav"><a href="/bots">🤖 Botlar</a><a href="/users">👥 Kullanıcı yönetimi</a><a href="/broadcast">📢 Yayınlar</a><a href="/reports/export.csv?bot=${encodeURIComponent(selectedBot)}&q=${encodeURIComponent(q)}">⬇️ CSV indir</a></div>
<div class="cards">
<div class="card"><div class="metric-label">Kayıtlı bot</div><div class="metric">${Number(totalResult?.n || 0)}</div></div>
<div class="card"><div class="metric-label">Toplam kullanıcı kaydı</div><div class="metric">${totalUsers}</div></div>
<div class="card"><div class="metric-label">Bugün aktif / /start gönderen</div><div class="metric">${Number(todayResult?.n || 0)}</div></div>
<div class="card"><div class="metric-label">Filtrede bulunan kullanıcı</div><div class="metric">${matched}</div></div>
</div>
<div class="card"><h2>Bot performansı</h2><div class="muted">“Bugün aktif” değeri son_seen alanına göre hesaplanır; Telegram'ın toplam üye sayısı değildir. Kullanıcı botta /start gönderdiğinde güncellenir.</div>
<div class="table-wrap"><table><thead><tr><th>Bot</th><th>Token durumu</th><th>Kayıtlı kullanıcı</th><th>Bugün aktif</th><th>Detay</th></tr></thead><tbody>${statRows}</tbody></table></div></div>
<div class="card"><h2>Kullanıcı kayıtları</h2>
<form method="GET" action="/reports" class="filters">
<div><label>Arama (ID, kullanıcı adı, ad soyad)</label><input name="q" value="${esc(q)}" placeholder="Örn. 123456789 veya kullanıcı adı"></div>
<div><label>Bot filtresi</label><select name="bot"><option value="">Tüm botlar</option>${botOptions}</select></div>
<div><button type="submit">Filtrele</button></div>
</form>
<div class="table-wrap"><table><thead><tr><th>Telegram ID</th><th>Kullanıcı adı</th><th>Ad soyad</th><th>Bot</th><th>Son /start</th><th>Detay</th></tr></thead><tbody>${userRows}</tbody></table></div>
<div class="pagination"><span class="muted">Sayfa ${pageNumber} / ${maxPage} · ${matched} kayıt · sayfa başına ${pageSize}</span><div style="display:flex;gap:8px">${prev}${next}</div></div>
</div>`));
});

reports.get("/reports/bot/:telegramId", async (c) => {
  const db = c.env.DB;
  await ensureTelegramUserLastSeenColumn(db);
  const telegramId = Number(c.req.param("telegramId"));
  if (!Number.isSafeInteger(telegramId) || telegramId <= 0) return c.text("Geçersiz bot ID", 400);
  const bot: any = await db.prepare("SELECT id, telegram_id, name, username, status, description, short_description, created_at FROM bots WHERE telegram_id = ? LIMIT 1").bind(telegramId).first();
  if (!bot) return c.notFound();
  const result = await db.prepare("SELECT telegram_id, username, first_name, last_name, last_seen FROM telegram_users WHERE bot_id = ? ORDER BY datetime(last_seen) DESC, id DESC LIMIT 500").bind(telegramId).all();
  const rows = (result.results as any[]).map((u) => `<tr><td>${esc(u.telegram_id)}</td><td>${u.username ? "@" + esc(u.username) : "-"}</td><td>${esc([u.first_name,u.last_name].filter(Boolean).join(" ") || "-")}</td><td>${esc(u.last_seen || "-")}</td><td><a class="secondary" href="/reports/user/${encodeURIComponent(String(u.telegram_id))}">İncele</a></td></tr>`).join("") || '<tr><td colspan="5">Bu bot için kayıtlı kullanıcı bulunamadı.</td></tr>';
  return c.html(layout("Bot kullanıcıları", `
<div class="top"><div><h1>🤖 ${esc(bot.name || bot.username || telegramId)}</h1><div class="muted">@${esc(bot.username || "-")} · Telegram ID ${esc(telegramId)}</div></div><a class="secondary" href="/reports">← Raporlara dön</a></div>
<div class="cards"><div class="card"><div class="metric-label">Kayıtlı kullanıcı</div><div class="metric">${Number((await db.prepare("SELECT COUNT(*) AS n FROM telegram_users WHERE bot_id = ?").bind(telegramId).first<any>())?.n || 0)}</div></div><div class="card"><div class="metric-label">Durum</div><div class="metric">${Number(bot.status) === 1 ? "🟢" : Number(bot.status) === -1 ? "🔴" : "⚪"}</div><div class="muted">${Number(bot.status) === 1 ? "Token geçerli" : Number(bot.status) === -1 ? "Token geçersiz" : "Kontrol gerekli"}</div></div></div>
<div class="card"><h2>Bu botun kullanıcıları</h2><div class="table-wrap"><table><thead><tr><th>Telegram ID</th><th>Kullanıcı adı</th><th>Ad soyad</th><th>Son /start</th><th>Detay</th></tr></thead><tbody>${rows}</tbody></table></div><div class="muted">En fazla 500 kullanıcı gösterilir.</div></div>`));
});

reports.get("/reports/user/:telegramId", async (c) => {
  const db = c.env.DB;
  await ensureTelegramUserLastSeenColumn(db);
  const telegramId = Number(c.req.param("telegramId"));
  if (!Number.isSafeInteger(telegramId) || telegramId <= 0) return c.text("Geçersiz kullanıcı ID", 400);
  const result = await db.prepare(`SELECT u.telegram_id, u.username, u.first_name, u.last_name, u.language_code, u.is_premium, u.bot_id, u.last_seen, b.name AS bot_name, b.username AS bot_username FROM telegram_users u LEFT JOIN bots b ON b.telegram_id = u.bot_id WHERE u.telegram_id = ? ORDER BY datetime(u.last_seen) DESC`).bind(telegramId).all();
  const entries = result.results as any[];
  if (!entries.length) return c.notFound();
  const first = entries[0];
  const rows = entries.map((u) => `<tr><td>${esc(u.bot_name || u.bot_username || u.bot_id)}</td><td>@${esc(u.bot_username || "-")}</td><td>${esc(u.last_seen || "-")}</td><td><a class="secondary" href="/reports/bot/${encodeURIComponent(String(u.bot_id))}">Botu incele</a></td></tr>`).join("");
  return c.html(layout("Kullanıcı detayı", `
<div class="top"><div><h1>👤 Kullanıcı detayı</h1><div class="muted">Telegram ID: ${esc(telegramId)}</div></div><a class="secondary" href="/reports">← Raporlara dön</a></div>
<div class="card"><h2>${esc([first.first_name, first.last_name].filter(Boolean).join(" ") || "İsimsiz kullanıcı")}</h2><p><span class="muted">Kullanıcı adı:</span> ${first.username ? "@" + esc(first.username) : "Yok"}</p><p><span class="muted">Telegram ID:</span> ${esc(telegramId)}</p><p><span class="muted">Dil:</span> ${esc(first.language_code || "-")}</p><p><span class="muted">Premium:</span> ${Number(first.is_premium) === 1 ? "Evet" : "Bilinmiyor / Hayır"}</p><p><span class="muted">Kayıtlı olduğu bot sayısı:</span> ${entries.length}</p></div>
<div class="card"><h2>Kullanıcının etkileşimde bulunduğu botlar</h2><div class="table-wrap"><table><thead><tr><th>Bot</th><th>Kullanıcı adı</th><th>Son /start</th><th>Detay</th></tr></thead><tbody>${rows}</tbody></table></div></div>`));
});

reports.get("/reports/export.csv", async (c) => {
  await ensureTelegramUserLastSeenColumn(c.env.DB);
  const q = String(c.req.query("q") || "").trim().slice(0, 120);
  const selectedBot = String(c.req.query("bot") || "").trim();
  const botFilter = /^\d+$/.test(selectedBot) ? Number(selectedBot) : 0;
  let where = " WHERE 1=1 ";
  const params: (string | number)[] = [];
  if (botFilter > 0) { where += " AND bot_id = ?"; params.push(botFilter); }
  if (q) {
    where += " AND (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR CAST(telegram_id AS TEXT) LIKE ?)";
    const like = "%" + q + "%";
    params.push(like, like, like, like);
  }
  const result = await c.env.DB.prepare(
    "SELECT bot_id, telegram_id, username, first_name, last_name, last_seen FROM telegram_users" +
    where + " ORDER BY datetime(last_seen) DESC LIMIT 5000"
  ).bind(...params).all();
  const csvCell = (value: unknown) => '"' + String(value ?? "").replace(/"/g, '""') + '"';
  const lines = [["bot_id","telegram_id","username","first_name","last_name","last_seen"],
    ...(result.results as any[]).map((u) => [u.bot_id,u.telegram_id,u.username,u.first_name,u.last_name,u.last_seen])]
    .map((row) => row.map(csvCell).join(","));
  c.header("Content-Type", "text/csv; charset=utf-8");
  c.header("Content-Disposition", 'attachment; filename="botpilot-user-report.csv"');
  return c.body("\uFEFF" + lines.join("\r\n"));
});

export default reports;
