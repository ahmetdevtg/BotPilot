import { Hono } from "hono";
import {
  getBots,
  deleteBot,
  getBotById,
  updateBotProfile,
  updateBotStatus
} from "../database/bots";
import { addBot } from "../services/bot.service";
import { auth } from "../middleware/auth";
import type { Env } from "../types/env";
import {
  getMe,
  setMyName,
  setMyDescription,
  setMyShortDescription
} from "../telegram/api";

const bots = new Hono<Env>();

bots.use("*", auth);


// =====================================================
// BOT LİSTESİ
// =====================================================

bots.get("/bots", async (c) => {

  const botlar = await getBots(c.env.DB);

  let rows = "";

  for (const bot of botlar as any[]) {

    rows += `
<tr>
<td>${bot.id}</td>
<td>${bot.name}</td>
<td>@${bot.username}</td>
<td>${bot.status ? "🟢 Online" : "🔴 Offline"}</td>
<td>${bot.users ?? 0}</td>
<td>${bot.broadcasts ?? 0}</td>

<td>

<a
href="/bots/edit/${bot.id}"
style="
display:inline-block;
padding:8px 12px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:6px;
margin-right:8px;
">

📝 Düzenle

</a>

<form
method="POST"
action="/bots/delete/${bot.id}"
style="display:inline-block;">

<button
class="delete-btn"
type="submit">

🗑 Sil

</button>

</form>

</td>

</tr>
`;

  }

  if (rows === "") {

    rows = `
<tr>
<td colspan="7" style="text-align:center;">
Henüz bot eklenmedi.
</td>
</tr>
`;

  }

  return c.html(`
<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width,initial-scale=1">

<title>Bot Yönetimi</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial,sans-serif;
padding:40px;
}

h1{
margin-bottom:20px;
}

.back{
display:inline-block;
padding:10px 18px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
margin-bottom:20px;
}

input{
width:420px;
padding:12px;
border:none;
border-radius:8px;
margin-right:10px;
}

button{
padding:12px 20px;
border:none;
border-radius:8px;
background:#2563eb;
color:white;
cursor:pointer;
}

.delete-btn{
background:#dc2626;
}

table{
width:100%;
margin-top:25px;
border-collapse:collapse;
}

th,td{
border:1px solid #334155;
padding:12px;
}

th{
background:#1e293b;
}

tr:nth-child(even){
background:#172033;
}

</style>

</head>

<body>

<h1>🤖 Bot Yönetimi</h1>

<a href="/dashboard" class="back">
🏠 Anasayfaya Dön
</a>

<div style="margin-bottom:20px;">

<form method="POST" action="/bots/add">

<input
name="token"
placeholder="Telegram Bot Token"
required>

<button type="submit">
➕ Bot Ekle
</button>

<a
href="/bots/bulk"
style="
display:inline-block;
padding:12px 18px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:8px;
margin-left:10px;">

📥 Toplu Bot Ekle

</a>

<a
href="/bots/update-all"
style="
display:inline-block;
padding:12px 18px;
background:#16a34a;
color:white;
text-decoration:none;
border-radius:8px;
margin-left:10px;">

🤖 Tüm Botları Güncelle

</a>

<a
href="/bots/check"
style="
display:inline-block;
padding:12px 18px;
background:#f59e0b;
color:white;
text-decoration:none;
border-radius:8px;
margin-left:10px;">

🔄 Botları Kontrol Et

</a>

</form>

</div>

<table>

<tr>

<th>ID</th>
<th>🤖 Bot Adı</th>
<th>👤 Username</th>
<th>🟢 Durum</th>
<th>👥 Kullanıcı</th>
<th>📢 Broadcast</th>
<th>⚙️ İşlemler</th>

</tr>

${rows}

</table>

</body>

</html>
`);

});


// =====================================================
// TEK BOT DÜZENLEME SAYFASI
// =====================================================

bots.get("/bots/edit/:id", async (c) => {

  const id = Number(c.req.param("id"));

  const bot = await getBotById(
    c.env.DB,
    id
  ) as any;

  if (!bot) {

    return c.html("<h2>Bot bulunamadı.</h2>");

  }

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width,initial-scale=1">

<title>Bot Düzenle</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial,sans-serif;
padding:40px;
}

input,textarea{
width:100%;
padding:12px;
margin-top:10px;
margin-bottom:20px;
border:none;
border-radius:8px;
box-sizing:border-box;
}

button{
padding:12px 20px;
background:#2563eb;
border:none;
border-radius:8px;
color:white;
cursor:pointer;
}

.back{
display:inline-block;
margin-bottom:20px;
padding:10px 18px;
background:#475569;
color:white;
text-decoration:none;
border-radius:8px;
}

</style>

</head>

<body>

<a href="/bots" class="back">
⬅ Botlara Dön
</a>

<h1>📝 Bot Düzenle</h1>

<form method="POST" action="/bots/edit/${bot.id}">

<label>Bot Adı</label>

<input
name="name"
value="${bot.name || ""}">

<label>Açıklama</label>

<textarea
name="description"
rows="4">${bot.description || ""}</textarea>

<label>Kısa Açıklama</label>

<textarea
name="shortDescription"
rows="2">${bot.short_description || ""}</textarea>

<button>
💾 Kaydet
</button>

</form>

</body>

</html>

`);

});


// =====================================================
// TOPLU BOT EKLE SAYFASI
// =====================================================

bots.get("/bots/bulk", async (c) => {

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Toplu Bot Ekle</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial,sans-serif;
}

body{
background:#0f172a;
color:white;
padding:40px;
}

.container{
max-width:900px;
margin:auto;
}

.back{
display:inline-block;
margin-bottom:20px;
padding:12px 20px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
}

.card{
background:#1e293b;
padding:25px;
border-radius:12px;
}

h1{
margin-bottom:10px;
}

p{
color:#cbd5e1;
margin-bottom:20px;
}

textarea{
width:100%;
height:350px;
padding:15px;
border:none;
border-radius:8px;
background:#0f172a;
color:white;
resize:vertical;
font-size:15px;
}

button{
margin-top:20px;
padding:14px 24px;
background:#16a34a;
color:white;
border:none;
border-radius:8px;
cursor:pointer;
font-size:16px;
font-weight:bold;
}

</style>

</head>

<body>

<div class="container">

<a href="/bots" class="back">
⬅ Bot Listesine Dön
</a>

<div class="card">

<h1>📥 Toplu Bot Ekle</h1>

<p>
Her satıra bir Telegram Bot Token yapıştır.
</p>

<form method="POST" action="/bots/bulk">

<textarea
name="tokens"
placeholder="123456:AAxxxxxxxxxxxxxxxx

987654:BBxxxxxxxxxxxxxxxx

741852:CCxxxxxxxxxxxxxxxx"></textarea>

<button type="submit">
🚀 Botları Ekle
</button>

</form>

</div>

</div>

</body>

</html>

`);

});


// =====================================================
// TÜM BOTLARIN SADECE ANA SAYFA AÇIKLAMASINI GÜNCELLE
// =====================================================

bots.get("/bots/update-all", async (c) => {

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width,initial-scale=1">

<title>Tüm Botları Güncelle</title>

<style>

*{
box-sizing:border-box;
}

body{
background:#0f172a;
color:white;
font-family:Arial,sans-serif;
padding:40px;
margin:0;
}

.container{
max-width:800px;
margin:auto;
}

.card{
background:#1e293b;
padding:30px;
border-radius:12px;
}

.back{
display:inline-block;
margin-bottom:20px;
padding:12px 20px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
}

h1{
margin-top:0;
}

.info{
background:#0f172a;
border-left:4px solid #22c55e;
padding:16px;
border-radius:8px;
margin:20px 0;
line-height:1.6;
color:#cbd5e1;
}

textarea{
width:100%;
padding:14px;
margin-top:10px;
margin-bottom:20px;
border:none;
border-radius:8px;
background:#0f172a;
color:white;
font-size:15px;
resize:vertical;
}

button{
width:100%;
padding:15px;
background:#16a34a;
color:white;
border:none;
border-radius:8px;
cursor:pointer;
font-size:16px;
font-weight:bold;
}

button:hover{
background:#15803d;
}

</style>

</head>

<body>

<div class="container">

<a class="back" href="/bots">
⬅ Botlara Dön
</a>

<div class="card">

<h1>🤖 Tüm Botları Güncelle</h1>

<div class="info">

<strong>Bu işlem sadece ana sayfa açıklamasını değiştirir.</strong>

<br><br>

🟢 Bot adı: <strong>DEĞİŞMEZ</strong>

<br>

🟢 Profil resmi: <strong>DEĞİŞMEZ</strong>

<br>

🟢 Kısa açıklama: <strong>DEĞİŞMEZ</strong>

<br>

🟢 Ana sayfa açıklaması: <strong>DEĞİŞİR</strong>

<br><br>

⚠️ Telegram açıklama limiti: <strong>512 karakter</strong>

</div>

<form method="POST" action="/bots/update-all">

<label>
<strong>Yeni Ana Sayfa Açıklaması</strong>
</label>

<textarea
name="description"
rows="8"
maxlength="512"
placeholder="Tüm botlarda kullanılacak yeni ana sayfa açıklamasını yazın..."
required></textarea>

<button type="submit">
🚀 Tüm Botların Açıklamasını Güncelle
</button>

</form>

</div>

</div>

</body>

</html>

`);

});


// =====================================================
// BOT EKLE
// =====================================================

bots.post("/bots/add", async (c) => {

  const body = await c.req.parseBody();

  const token = String(body.token || "").trim();

  try {

    await addBot(
      c.env.DB,
      token
    );

    return c.redirect("/bots");

  } catch (e: any) {

    return c.html(`
<h2>${e.message}</h2>

<a href="/bots">
Geri Dön
</a>
`);

  }

});


// =====================================================
// TOPLU BOT EKLE
// =====================================================

bots.post("/bots/bulk", async (c) => {

  const body = await c.req.parseBody();

  const text = String(body.tokens || "");

  const tokens = text
    .split("\n")
    .map(x => x.trim())
    .filter(x => x !== "");

  let success = 0;
  let failed = 0;

  for (const token of tokens) {

    try {

      await addBot(
        c.env.DB,
        token
      );

      success++;

    } catch (e) {

      console.error("BULK ADD ERROR:", e);

      failed++;

    }

  }

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>İşlem Tamamlandı</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

.card{
background:#1e293b;
padding:30px;
border-radius:12px;
max-width:600px;
margin:auto;
text-align:center;
}

a{
display:inline-block;
margin-top:20px;
padding:12px 20px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
}

</style>

</head>

<body>

<div class="card">

<h1>✅ Toplu Bot Ekleme Tamamlandı</h1>

<p>Toplam Token: ${tokens.length}</p>

<p>Başarılı: ${success}</p>

<p>Başarısız: ${failed}</p>

<a href="/bots">
⬅ Botlara Dön
</a>

</div>

</body>

</html>

`);

});


// =====================================================
// TEK BOT DÜZENLE
// =====================================================

bots.post("/bots/edit/:id", async (c) => {

  const id = Number(c.req.param("id"));

  const body = await c.req.parseBody();

  const name = String(body.name || "");
  const description = String(body.description || "");
  const shortDescription = String(body.shortDescription || "");

  const bot = await getBotById(
    c.env.DB,
    id
  ) as any;

  if (!bot) {

    return c.html("<h2>Bot bulunamadı.</h2>");

  }

  try {

    await setMyName(
      bot.token,
      name
    );

    await setMyDescription(
      bot.token,
      description
    );

    await setMyShortDescription(
      bot.token,
      shortDescription
    );

    await updateBotProfile(
      c.env.DB,
      id,
      name,
      description,
      shortDescription
    );

    return c.redirect("/bots");

  } catch (e: any) {

    return c.html(`
<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Telegram API Hatası</title>

</head>

<body style="
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
">

<h2>Telegram API Hatası</h2>

<p>Bot güncellenemedi.</p>

<pre>${e.message}</pre>

<br>

<a
href="/bots/edit/${id}"
style="color:#60a5fa;">

← Geri Dön

</a>

</body>

</html>
`);

  }

});


// =====================================================
// BOTLARI KONTROL ET
// =====================================================

bots.get("/bots/check", async (c) => {

  const botlar = await getBots(c.env.DB) as any[];

  let online = 0;
  let offline = 0;

  for (const bot of botlar) {

    try {

      await getMe(bot.token);

      await updateBotStatus(
        c.env.DB,
        bot.id,
        1
      );

      online++;

    } catch (e: any) {

      console.error(
        "BOT CHECK ERROR:",
        bot.username,
        e
      );

      await updateBotStatus(
        c.env.DB,
        bot.id,
        0
      );

      offline++;

    }

  }

  return c.html(`

<!DOCTYPE html>

<html>

<body style="
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
">

<h2>✅ Bot Kontrolü Tamamlandı</h2>

<p>🟢 Online: ${online}</p>

<p>🔴 Offline: ${offline}</p>

<br>

<a
href="/bots"
style="color:#60a5fa;">

⬅ Botlara Dön

</a>

</body>

</html>

`);

});


// =====================================================
// TÜM BOTLARDA SADECE ANA SAYFA AÇIKLAMASINI GÜNCELLE
// GERÇEK TELEGRAM HATALARINI GÖSTER
// =====================================================

bots.post("/bots/update-all", async (c) => {

  const body = await c.req.parseBody();

  const description = String(
    body.description || ""
  ).trim();


  // ===================================================
  // BOŞ KONTROL
  // ===================================================

  if (!description) {

    return c.html(`

<!DOCTYPE html>

<html lang="tr">

<body style="
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
">

<h2>❌ Açıklama boş olamaz.</h2>

<br>

<a
href="/bots/update-all"
style="color:#60a5fa;">

← Geri Dön

</a>

</body>

</html>

`);

  }


  // ===================================================
  // 512 KARAKTER KONTROLÜ
  // ===================================================

  if (description.length > 512) {

    return c.html(`

<!DOCTYPE html>

<html lang="tr">

<body style="
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
">

<h2>❌ Açıklama çok uzun.</h2>

<p>
Telegram açıklaması en fazla 512 karakter olabilir.
</p>

<p>
Mevcut uzunluk: ${description.length}
</p>

<br>

<a
href="/bots/update-all"
style="color:#60a5fa;">

← Geri Dön

</a>

</body>

</html>

`);

  }


  // ===================================================
  // BOTLARI AL
  // ===================================================

  const botlar = await getBots(
    c.env.DB
  ) as any[];


  let success = 0;
  let failed = 0;

  const successfulBots: any[] = [];
  const failedBots: any[] = [];


  // ===================================================
  // BOTLARI TEK TEK GÜNCELLE
  // ===================================================

  for (const bot of botlar) {

    try {

      /*
       * SADECE setMyDescription ÇALIŞIYOR.
       *
       * setMyName YOK
       * setMyShortDescription YOK
       * updateBotProfile YOK
       *
       * Bu nedenle bot adı,
       * kısa açıklama ve veritabanı profili
       * değiştirilmez.
       */

      await setMyDescription(
        bot.token,
        description
      );

      success++;

      successfulBots.push({
        id: bot.id,
        name: bot.name || "İsimsiz Bot",
        username: bot.username
          ? `@${bot.username}`
          : "Username yok"
      });

    } catch (e: any) {

      let errorCode = "Bilinmiyor";
      let errorMessage = "Bilinmeyen hata";
      let retryAfter: number | null = null;


      // =================================================
      // STRING HATA
      // =================================================

      if (typeof e === "string") {

        errorMessage = e;

      }


      // =================================================
      // NORMAL ERROR
      // =================================================

      else if (e instanceof Error) {

        errorMessage = e.message;

      }


      // =================================================
      // TELEGRAM HATASI
      // =================================================

      if (
        e &&
        typeof e === "object"
      ) {

        if (
          e.error_code !== undefined
        ) {

          errorCode =
            String(e.error_code);

        }

        if (
          e.description
        ) {

          errorMessage =
            String(e.description);

        }

        if (
          e.parameters &&
          e.parameters.retry_after !== undefined
        ) {

          retryAfter =
            Number(
              e.parameters.retry_after
            );

        }


        // API wrapper response
        if (
          e.response &&
          typeof e.response === "object"
        ) {

          if (
            e.response.error_code !== undefined
          ) {

            errorCode =
              String(
                e.response.error_code
              );

          }

          if (
            e.response.description
          ) {

            errorMessage =
              String(
                e.response.description
              );

          }

          if (
            e.response.parameters &&
            e.response.parameters.retry_after !== undefined
          ) {

            retryAfter =
              Number(
                e.response.parameters.retry_after
              );

          }

        }

      }


      failed++;


      failedBots.push({

        id: bot.id,

        name:
          bot.name ||
          "İsimsiz Bot",

        username:
          bot.username
            ? `@${bot.username}`
            : "Username yok",

        errorCode,

        errorMessage,

        retryAfter

      });


      console.error(
        "======================================"
      );

      console.error(
        "BOT AÇIKLAMA GÜNCELLEME HATASI"
      );

      console.error(
        "BOT ID:",
        bot.id
      );

      console.error(
        "BOT:",
        bot.name
      );

      console.error(
        "USERNAME:",
        bot.username
      );

      console.error(
        "ERROR CODE:",
        errorCode
      );

      console.error(
        "ERROR MESSAGE:",
        errorMessage
      );

      console.error(
        "RETRY AFTER:",
        retryAfter
      );

      console.error(
        "ORIGINAL ERROR:",
        e
      );

      console.error(
        "======================================"
      );

    }

  }


  // ===================================================
  // BAŞARILI BOT HTML
  // ===================================================

  let successHtml = "";


  for (
    const bot
    of successfulBots
  ) {

    successHtml += `

<div style="
background:#064e3b;
padding:14px;
border-radius:8px;
margin-bottom:8px;
">

<div style="
font-size:17px;
font-weight:bold;
">

🟢 ${bot.name}

</div>

<div style="
color:#a7f3d0;
margin-top:5px;
">

${bot.username}

</div>

</div>

`;

  }


  if (!successHtml) {

    successHtml = `

<div style="
background:#451a03;
padding:15px;
border-radius:8px;
">

Hiçbir bot başarılı şekilde güncellenemedi.

</div>

`;

  }


  // ===================================================
  // BAŞARISIZ BOT HTML
  // ===================================================

  let failedHtml = "";


  for (
    const bot
    of failedBots
  ) {

    failedHtml += `

<div style="
background:#450a0a;
padding:16px;
border-radius:8px;
margin-bottom:10px;
">

<div style="
font-size:17px;
font-weight:bold;
">

🔴 ${bot.name}

</div>

<div style="
color:#fca5a5;
margin-top:5px;
">

${bot.username}

</div>

<hr style="
border:0;
border-top:1px solid #7f1d1d;
margin:12px 0;
">

<div>

❌ <strong>Telegram Hata Kodu:</strong>

${bot.errorCode}

</div>

<div style="
margin-top:8px;
">

❌ <strong>Telegram Hatası:</strong>

${bot.errorMessage}

</div>

${
  bot.retryAfter !== null
    ? `
<div style="
margin-top:8px;
color:#fbbf24;
">

⏱️ <strong>Tekrar Deneme:</strong>

${bot.retryAfter} saniye sonra

</div>
`
    : ""
}

</div>

`;

  }


  if (!failedHtml) {

    failedHtml = `

<div style="
background:#064e3b;
padding:15px;
b