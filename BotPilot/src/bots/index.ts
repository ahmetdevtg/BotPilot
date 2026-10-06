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
// BOT DÜZENLEME SAYFASI
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
// TOPLU BOT EKLE
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

button:hover{
background:#15803d;
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

<title>Bot Açıklamalarını Güncelle</title>

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

<strong>⚠️ Dikkat:</strong>

<br><br>

Bu işlem yalnızca Telegram botlarının
<strong>ana sayfa açıklamasını</strong> değiştirir.

<br><br>

🟢 Bot adı: <strong>DEĞİŞMEZ</strong>

<br>

🟢 Profil resmi: <strong>DEĞİŞMEZ</strong>

<br>

🟢 Kısa açıklama: <strong>DEĞİŞMEZ</strong>

<br>

🟢 Sadece ana sayfa açıklaması: <strong>DEĞİŞİR</strong>

</div>

<form method="POST" action="/bots/update-all">

<label>

<strong>Yeni Ana Sayfa Açıklaması</strong>

</label>

<textarea
name="description"
rows="8"
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

  const token = String(body.token || "");

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

<body style="background:#0f172a;color:white;font-family:Arial;padding:40px;">

<h2>Telegram API Hatası</h2>

<p>Bot güncellenemedi.</p>

<pre>${e.message}</pre>

<br>

<a href="/bots/edit/${id}" style="color:#60a5fa;">

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

      console.error("================================");
      console.error("BOT:", bot.username);
      console.error("TOKEN:", bot.token);
      console.error("ERROR:", e);
      console.error("================================");

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

<body style="background:#0f172a;color:white;font-family:Arial;padding:40px;">

<h2>✅ Bot Kontrolü Tamamlandı</h2>

<p>🟢 Online: ${online}</p>

<p>🔴 Offline: ${offline}</p>

<br>

<a href="/bots" style="color:#60a5fa;">

⬅ Botlara Dön

</a>

</body>

</html>

`);

});


// =====================================================
// TÜM BOTLARDA SADECE ANA SAYFA AÇIKLAMASINI GÜNCELLE
// =====================================================

bots.post("/bots/update-all", async (c) => {

  const body = await c.req.parseBody();

  const description = String(body.description || "").trim();

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

  const botlar = await getBots(c.env.DB) as any[];

  let success = 0;
  let failed = 0;

  for (const bot of botlar) {

    try {

      // SADECE ANA SAYFA AÇIKLAMASI
      await setMyDescription(
        bot.token,
        description
      );

      /*
       * ÖNEMLİ:
       *
       * setMyName() YOK
       * setMyShortDescription() YOK
       * updateBotProfile() YOK
       *
       * Böylece:
       *
       * Bot adı korunur.
       * Profil resmi korunur.
       * Kısa açıklama korunur.
       * Veritabanındaki diğer bilgiler korunur.
       */

      success++;

    } catch (e: any) {

      console.error(
        "Bot açıklaması güncellenemedi:",
        bot.username,
        e
      );

      failed++;

    }

  }

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width,initial-scale=1">

<title>Güncelleme Tamamlandı</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial,sans-serif;
padding:40px;
}

.card{
max-width:600px;
margin:auto;
background:#1e293b;
padding:30px;
border-radius:12px;
text-align:center;
}

.success{
color:#22c55e;
}

.failed{
color:#ef4444;
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

<h1>✅ Güncelleme Tamamlandı</h1>

<p class="success">
🟢 Başarılı: ${success}
</p>

<p class="failed">
🔴 Başarısız: ${failed}
</p>

<br>

<p style="color:#cbd5e1;">

Sadece ana sayfa açıklaması güncellendi.

</p>

<p style="color:#94a3b8;">

Bot adı, profil resmi ve kısa açıklama değiştirilmedi.

</p>

<a href="/bots">

⬅ Bot Yönetimine Dön

</a>

</div>

</body>

</html>

`);

});


// =====================================================
// BOT SİL
// =====================================================

bots.post("/bots/delete/:id", async (c) => {

  const id = Number(c.req.param("id"));

  await deleteBot(
    c.env.DB,
    id
  );

  return c.redirect("/bots");

});


export default bots;