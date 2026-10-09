import { Hono } from "hono";

import {
  getBots,
  deleteBot,
  getBotById,
  updateBotProfile,
  updateBotStatus,
} from "../database/bots";

import { addBot } from "../services/bot.service";
import { auth } from "../middleware/auth";
import type { Env } from "../types/env";

import {
  getMe,
  setMyName,
  setMyDescription,
  setMyShortDescription,
} from "../telegram/api";

const bots = new Hono<Env>();

bots.use("*", auth);

/* =========================
   YARDIMCI FONKSİYONLAR
========================= */

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readCount(value: unknown): number {
  const number = Number.parseInt(String(value ?? "0"), 10);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function page(title: string, content: string): string {
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#0f172a;color:#f8fafc;font-family:Arial,sans-serif;padding:24px}
.container{max-width:1100px;margin:0 auto}
.card{background:#1e293b;padding:24px;border-radius:12px;margin:18px 0}
h1,h2{margin-top:0}
a{color:#93c5fd}
input,textarea{width:100%;padding:12px;margin:8px 0 16px;border:1px solid #475569;border-radius:8px;background:#0f172a;color:white}
button,.btn{display:inline-block;padding:11px 15px;border:0;border-radius:8px;background:#2563eb;color:white;text-decoration:none;cursor:pointer;font-size:14px}
.green{background:#16a34a}
.orange{background:#d97706}
.red{background:#dc2626}
.muted{color:#cbd5e1}
table{width:100%;border-collapse:collapse;margin-top:18px}
th,td{padding:10px;border:1px solid #334155;text-align:left}
th{background:#334155}
.table-wrap{overflow-x:auto}
.notice{padding:14px;background:#0f172a;border-radius:8px;line-height:1.6;margin:16px 0}
.success{color:#4ade80}
.failed{color:#f87171}
.warning{color:#fbbf24}
.bar{height:12px;background:#334155;border-radius:8px;overflow:hidden}
.fill{height:12px;background:#22c55e}
.actions{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
@media(max-width:600px){body{padding:12px}.card{padding:16px}th,td{padding:7px;font-size:13px}}
</style>
</head>
<body><main class="container">${content}</main></body>
</html>`;
}

/* =========================
   BOT LİSTESİ
========================= */

bots.get("/bots", async (c) => {
  const botlar = await getBots(c.env.DB) as any[];

  const rows = botlar.length
    ? botlar.map((bot) => `
<tr>
<td>${escapeHtml(bot.id)}</td>
<td>${escapeHtml(bot.name || "-")}</td>
<td>@${escapeHtml(bot.username || "-")}</td>
<td>${bot.status ? "🟢 Online" : "🔴 Offline"}</td>
<td>${escapeHtml(bot.users ?? 0)}</td>
<td>${escapeHtml(bot.broadcasts ?? 0)}</td>
<td>
<div class="actions">
<a class="btn green" href="/bots/edit/${encodeURIComponent(String(bot.id))}">📝 Düzenle</a>
<form method="POST" action="/bots/delete/${encodeURIComponent(String(bot.id))}" onsubmit="return confirm('Bu botu silmek istediğine emin misin?')">
<button class="red" type="submit">🗑 Sil</button>
</form>
</div>
</td>
</tr>`).join("")
    : `<tr><td colspan="7">Henüz bot eklenmedi.</td></tr>`;

  return c.html(page("Bot Yönetimi", `
<h1>🤖 Bot Yönetimi</h1>
<a class="btn" href="/dashboard">🏠 Anasayfaya Dön</a>

<div class="card">
<h2>Bot Ekle</h2>
<form method="POST" action="/bots/add">
<label>Telegram Bot Token</label>
<input name="token" placeholder="Telegram Bot Token" required>
<button type="submit">➕ Bot Ekle</button>
</form>

<div class="actions">
<a class="btn green" href="/bots/bulk">📥 Toplu Bot Ekle</a>
<a class="btn green" href="/bots/update-all">🤖 Tüm Botların Açıklamasını Güncelle</a>
<a class="btn orange" href="/bots/check">🔄 Botları Kontrol Et</a>
</div>
</div>

<div class="card">
<h2>Bot Listesi (${botlar.length})</h2>
<div class="table-wrap">
<table>
<thead><tr>
<th>ID</th><th>Bot Adı</th><th>Username</th><th>Durum</th>
<th>Kullanıcı</th><th>Broadcast</th><th>İşlemler</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</div>
</div>`));
});

/* =========================
   BOT DÜZENLEME SAYFASI
========================= */

bots.get("/bots/edit/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    return c.text("Geçersiz bot ID.", 400);
  }

  const bot = await getBotById(c.env.DB, id) as any;

  if (!bot) {
    return c.html(page("Bot Bulunamadı", `
<div class="card"><h2>Bot bulunamadı.</h2><a href="/bots">← Botlara dön</a></div>`), 404);
  }

  return c.html(page("Bot Düzenle", `
<a class="btn" href="/bots">⬅ Botlara Dön</a>
<div class="card">
<h1>📝 Bot Düzenle</h1>
<form method="POST" action="/bots/edit/${id}">
<label>Bot Adı</label>
<input name="name" value="${escapeHtml(bot.name || "")}">

<label>Ana Sayfa Açıklaması</label>
<textarea name="description" rows="4">${escapeHtml(bot.description || "")}</textarea>

<label>Kısa Açıklama</label>
<textarea name="shortDescription" rows="3">${escapeHtml(bot.short_description || "")}</textarea>

<button type="submit">💾 Kaydet</button>
</form>
</div>`));
});

/* =========================
   TOPLU BOT EKLE SAYFASI
========================= */

bots.get("/bots/bulk", async (c) => {
  return c.html(page("Toplu Bot Ekle", `
<a class="btn" href="/bots">⬅ Bot Listesine Dön</a>
<div class="card">
<h1>📥 Toplu Bot Ekle</h1>
<p class="muted">Her satıra bir Telegram bot tokenı yaz.</p>
<form method="POST" action="/bots/bulk">
<textarea name="tokens" rows="14" placeholder="İlk bot tokenı&#10;İkinci bot tokenı&#10;Üçüncü bot tokenı" required></textarea>
<button class="green" type="submit">🚀 Botları Ekle</button>
</form>
</div>`));
});

/* =========================
   TOPLU BOT EKLE
========================= */

bots.post("/bots/bulk", async (c) => {
  const body = await c.req.parseBody();
  const text = String(body.tokens || "");

  const tokens = [...new Set(
    text.split(/\r?\n/).map((token) => token.trim()).filter(Boolean)
  )];

  let success = 0;
  let failed = 0;
  let firstError = "";

  for (const token of tokens) {
    try {
      await addBot(c.env.DB, token);
      success++;
    } catch (e: any) {
      failed++;
      const message = String(e?.message || e || "Bilinmeyen hata");

      console.error("TOPLU BOT EKLEME HATASI:", message);

      if (!firstError) firstError = message;
    }
  }

  return c.html(page("Toplu Ekleme Sonucu", `
<div class="card">
<h1>✅ Toplu Bot Ekleme Tamamlandı</h1>
<p>İşlenen token: ${tokens.length}</p>
<p class="success">🟢 Başarılı: ${success}</p>
<p class="failed">🔴 Başarısız: ${failed}</p>
${firstError ? `<div class="notice"><strong>İlk hata:</strong><pre>${escapeHtml(firstError)}</pre></div>` : ""}
<a class="btn" href="/bots">⬅ Bot Yönetimine Dön</a>
</div>`));
});

/* =========================
   TÜM BOTLARI GÜNCELLE SAYFASI
========================= */

bots.get("/bots/update-all", async (c) => {
  return c.html(page("Toplu Açıklama Güncelle", `
<a class="btn" href="/bots">⬅ Botlara Dön</a>
<div class="card">
<h1>🤖 Tüm Botların Açıklamasını Güncelle</h1>
<div class="notice">
<strong>Bilgi:</strong> Bu işlem yalnızca Telegram botlarının ana sayfa açıklamasını değiştirir.
<br>Bot adı, kısa açıklama ve profil resmi değiştirilmez.
<br>Botlar beşerli gruplar hâlinde işlenir.
</div>
<form method="POST" action="/bots/update-all">
<label>Yeni ana sayfa açıklaması</label>
<textarea name="description" rows="7" placeholder="Botların ana sayfasında görünecek açıklamayı yaz..." required></textarea>
<button class="green" type="submit">🚀 Güncellemeyi Başlat</button>
</form>
</div>`));
});

/* =========================
   TEK BOT EKLE
========================= */

bots.post("/bots/add", async (c) => {
  const body = await c.req.parseBody();
  const token = String(body.token || "").trim();

  if (!token) {
    return c.text("Bot tokenı boş olamaz.", 400);
  }

  try {
    await addBot(c.env.DB, token);
    return c.redirect("/bots");
  } catch (e: any) {
    console.error("BOT EKLEME HATASI:", e?.message || e);

    return c.html(page("Bot Eklenemedi", `
<div class="card">
<h2>❌ Bot eklenemedi</h2>
<pre>${escapeHtml(e?.message || e || "Bilinmeyen hata")}</pre>
<a class="btn" href="/bots">Geri Dön</a>
</div>`), 400);
  }
});

/* =========================
   TEK BOT DÜZENLE
========================= */

bots.post("/bots/edit/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    return c.text("Geçersiz bot ID.", 400);
  }

  const body = await c.req.parseBody();
  const name = String(body.name || "").trim();
  const description = String(body.description || "");
  const shortDescription = String(body.shortDescription || "");

  const bot = await getBotById(c.env.DB, id) as any;

  if (!bot) {
    return c.text("Bot bulunamadı.", 404);
  }

  try {
    await setMyName(bot.token, name);
    await setMyDescription(bot.token, description);
    await setMyShortDescription(bot.token, shortDescription);

    await updateBotProfile(
      c.env.DB,
      id,
      name,
      description,
      shortDescription
    );

    return c.redirect("/bots");
  } catch (e: any) {
    const message = String(e?.message || e || "Bilinmeyen hata");

    console.error("BOT PROFİL GÜNCELLEME HATASI:", {
      botId: id,
      error: message,
    });

    return c.html(page("Profil Güncelleme Hatası", `
<div class="card">
<h2>❌ Bot profili güncellenemedi</h2>
<pre>${escapeHtml(message)}</pre>
<a class="btn" href="/bots/edit/${id}">← Geri Dön</a>
</div>`), 400);
  }
});

/* =========================
   BOTLARI KONTROL ET
========================= */

bots.get("/bots/check", async (c) => {
  try {
    const botlar = await getBots(c.env.DB) as any[];

    const batchSize = 5;
    const offset = readCount(c.req.query("offset"));
    let online = readCount(c.req.query("online"));
    let offline = readCount(c.req.query("offline"));
    let skipped = readCount(c.req.query("skipped"));

    if (offset >= botlar.length && offset !== 0) {
      return c.redirect("/bots/check");
    }

    const batch = botlar.slice(offset, offset + batchSize);

    for (const bot of batch) {
      try {
        await getMe(bot.token);
        await updateBotStatus(c.env.DB, bot.id, 1);
        online++;
      } catch (e: any) {
        const message = String(e?.message || e || "Unknown error");

        console.error("BOT CHECK ERROR:", {
          botId: bot.id,
          username: bot.username || "-",
          error: message,
        });

        const temporaryError =
          /too many subrequests|fetch failed|network|timeout|timed out|rate.?limit|\b429\b|service unavailable|\b5\d\d\b|internal error|connection|socket|temporar/i.test(message);

        if (temporaryError) {
          skipped++;
        } else {
          await updateBotStatus(c.env.DB, bot.id, 0);
          offline++;
        }
      }
    }

    const nextOffset = offset + batch.length;

    if (nextOffset < botlar.length) {
      const nextUrl = "/bots/check?offset=" + nextOffset +
        "&online=" + online +
        "&offline=" + offline +
        "&skipped=" + skipped;

      const progress = Math.round(
        nextOffset / Math.max(1, botlar.length) * 100
      );

      return c.html(page("Botlar Kontrol Ediliyor", `
<div class="card">
<h2>🔄 Botlar kontrol ediliyor</h2>
<p>İlerleme: ${nextOffset} / ${botlar.length} (%${progress})</p>
<div class="bar"><div class="fill" style="width:${progress}%"></div></div>
<p class="success">🟢 Online: ${online}</p>
<p class="failed">🔴 Offline: ${offline}</p>
<p class="warning">🟡 Geçici hata nedeniyle atlanan: ${skipped}</p>
<p>İşlem bitene kadar bu sayfayı açık tut.</p>
<script>setTimeout(function(){location.replace(${JSON.stringify(nextUrl)})},500)</script>
<noscript><a href="${escapeHtml(nextUrl)}">Sonraki gruba geç</a></noscript>
</div>`));
    }

    return c.html(page("Bot Kontrol Sonucu", `
<div class="card">
<h2>✅ Bot kontrolü tamamlandı</h2>
<p class="success">🟢 Online: ${online}</p>
<p class="failed">🔴 Offline: ${offline}</p>
<p class="warning">🟡 Geçici hata nedeniyle atlanan: ${skipped}</p>
<p>Toplam bot: ${botlar.length}</p>
<p>Geçici hata alan botların mevcut durumları korundu.</p>
<a class="btn" href="/bots">⬅ Botlara Dön</a>
</div>`));
  } catch (e: any) {
    console.error("BOT CHECK GENEL HATA:", e?.message || e, e?.stack || "");

    return c.html(page("Kontrol Hatası", `
<div class="card">
<h2>❌ Kontrol tamamlanamadı</h2>
<pre>${escapeHtml(e?.message || e || "Bilinmeyen hata")}</pre>
<a class="btn" href="/bots">Botlara dön</a>
</div>`), 500);
  }
});

/* =========================
   TOPLU AÇIKLAMA GÜNCELLE
   BEŞ BOTLUK GRUPLAR
========================= */

bots.post("/bots/update-all", async (c) => {
  const body = await c.req.parseBody();

  const description = String(body.description || "");
  const offset = readCount(body.offset);
  let success = readCount(body.success);
  let failed = readCount(body.failed);
  let firstError = String(body.firstError || "");

  if (!description.trim()) {
    return c.html(page("Eksik Açıklama", `
<div class="card">
<h2>⚠️ Açıklama boş olamaz.</h2>
<a class="btn" href="/bots/update-all">← Geri Dön</a>
</div>`), 400);
  }

  try {
    const botlar = await getBots(c.env.DB) as any[];

    if (botlar.length === 0) {
      return c.html(page("Bot Bulunamadı", `
<div class="card"><h2>Henüz bot eklenmemiş.</h2><a class="btn" href="/bots">Botlara dön</a></div>`));
    }

    const batchSize = 5;
    const batch = botlar.slice(offset, offset + batchSize);

    if (batch.length === 0 && offset > 0) {
      return c.html(page("İşlem Hatası", `
<div class="card">
<h2>⚠️ Güncelleme konumu geçersiz.</h2>
<a class="btn" href="/bots/update-all">Yeniden başlat</a>
</div>`), 400);
    }

    for (const bot of batch) {
      try {
        await setMyDescription(bot.token, description);

        await c.env.DB
          .prepare("UPDATE bots SET description = ? WHERE id = ?")
          .bind(description, bot.id)
          .run();

        success++;
      } catch (e: any) {
        failed++;

        const message = String(e?.message || e || "Bilinmeyen hata");

        console.error("BOT AÇIKLAMA GÜNCELLEME HATASI:", {
          botId: bot.id,
          username: bot.username || "-",
          error: message,
        });

        if (!firstError) {
          firstError = `Bot ID ${bot.id} (@${bot.username || "-"}): ${message}`;
        }
      }
    }

    const nextOffset = offset + batch.length;

    if (nextOffset < botlar.length) {
      const progress = Math.round(
        nextOffset / Math.max(1, botlar.length) * 100
      );

      const escapedDescription = escapeHtml(description);
      const escapedFirstError = escapeHtml(firstError);

      return c.html(page("Toplu Güncelleme", `
<div class="card">
<h2>🔄 Açıklamalar güncelleniyor</h2>
<p>İlerleme: ${nextOffset} / ${botlar.length} (%${progress})</p>
<div class="bar"><div class="fill" style="width:${progress}%"></div></div>
<p class="success">🟢 Başarılı: ${success}</p>
<p class="failed">🔴 Başarısız: ${failed}</p>
<p>Sonraki grup otomatik olarak işlenecek. Bu sayfayı kapatma.</p>
<form id="next" method="POST" action="/bots/update-all">
<input type="hidden" name="description" value="${escapedDescription}">
<input type="hidden" name="offset" value="${nextOffset}">
<input type="hidden" name="success" value="${success}">
<input type="hidden" name="failed" value="${failed}">
<input type="hidden" name="firstError" value="${escapedFirstError}">
<noscript><button type="submit">Sonraki gruba geç</button></noscript>
</form>
<script>setTimeout(function(){document.getElementById("next").submit()},500)</script>
</div>`));
    }

    return c.html(page("Güncelleme Sonucu", `
<div class="card">
<h1>✅ Güncelleme Tamamlandı</h1>
<p>Toplam bot: ${botlar.length}</p>
<p class="success">🟢 Başarılı: ${success}</p>
<p class="failed">🔴 Başarısız: ${failed}</p>
<p>Sadece ana sayfa açıklaması güncellendi.</p>
<p>🤖 Bot adı korunmuştur.<br>📝 Kısa açıklama korunmuştur.<br>🖼️ Profil resmi korunmuştur.</p>
${firstError ? `<div class="notice"><h3>İlk hata mesajı</h3><pre>${escapeHtml(firstError)}</pre></div>` : ""}
<a class="btn" href="/bots">⬅ Bot Yönetimine Dön</a>
</div>`));
  } catch (e: any) {
    const message = String(e?.message || e || "Bilinmeyen hata");

    console.error("TOPLU AÇIKLAMA GÜNCELLEME GENEL HATA:", message, e?.stack || "");

    return c.html(page("Toplu Güncelleme Hatası", `
<div class="card">
<h2>❌ Toplu güncelleme durdu</h2>
<pre>${escapeHtml(message)}</pre>
<a class="btn" href="/bots">Botlara dön</a>
</div>`), 500);
  }
});

/* =========================
   BOT SİL
========================= */

bots.post("/bots/delete/:id", async (c) => {
  const id = Number(c.req.param("id"));

  if (!Number.isSafeInteger(id) || id <= 0) {
    return c.text("Geçersiz bot ID.", 400);
  }

  try {
    await deleteBot(c.env.DB, id);
    return c.redirect("/bots");
  } catch (e: any) {
    console.error("BOT SİLME HATASI:", e?.message || e);

    return c.html(page("Bot Silinemedi", `
<div class="card">
<h2>❌ Bot silinemedi</h2>
<pre>${escapeHtml(e?.message || e || "Bilinmeyen hata")}</pre>
<a class="btn" href="/bots">Botlara dön</a>
</div>`), 500);
  }
});

export default bots;
