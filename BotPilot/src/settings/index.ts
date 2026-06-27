import { Hono } from "hono";
import { auth } from "../middleware/auth";
import type { Env } from "../types/env";

import { getBots } from "../database/bots";
import {
  getBotSettings,
  updateBotSettings
} from "../database/settings";

const settings = new Hono<Env>();

settings.use("*", auth);

/* ===========================
   BOT LİSTESİ
=========================== */

settings.get("/settings", async (c) => {

  const bots: any = await getBots(c.env.DB);

  let rows = "";

  if (bots.length === 0) {

    rows = `
<tr>
<td colspan="3">
Henüz bot eklenmemiş.
</td>
</tr>
`;

  } else {

    for (const bot of bots) {

      rows += `
<tr>

<td>${bot.name}</td>

<td>@${bot.username}</td>

<td>

<a
href="/settings/${bot.telegram_id}"
style="
color:#60a5fa;
text-decoration:none;
font-weight:bold;
">

⚙️ Ayarlar

</a>

</td>

</tr>
`;

    }

  }

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Bot Ayarları</title>

<style>

body{

background:#0f172a;

color:white;

font-family:Arial;

padding:40px;

}

table{

width:100%;

border-collapse:collapse;

margin-top:20px;

}

th,td{

padding:14px;

border:1px solid #334155;

}

th{

background:#111827;

}

.btn{

display:inline-block;

padding:12px 18px;

background:#2563eb;

color:white;

border-radius:8px;

text-decoration:none;

margin-bottom:20px;

font-weight:bold;

}

</style>

</head>

<body>

<h1>⚙️ Bot Ayarları</h1>

<a
class="btn"
href="/dashboard">

🏠 Dashboard

</a>

<table>

<tr>

<th>Bot</th>

<th>Username</th>

<th>İşlem</th>

</tr>

${rows}

</table>

</body>

</html>

`);

});
/* ===========================
   BOT AYARLARI SAYFASI
=========================== */

settings.get("/settings/:botId", async (c) => {

  const botId = Number(c.req.param("botId"));

  const bot: any = await c.env.DB
    .prepare(`
      SELECT *
      FROM bots
      WHERE telegram_id=?
    `)
    .bind(botId)
    .first();

  if (!bot) {
    return c.text("Bot bulunamadı.", 404);
  }

  const s: any = await getBotSettings(
    c.env.DB,
    botId
  );

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>${bot.name}</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

.card{
max-width:900px;
margin:auto;
background:#1e293b;
padding:30px;
border-radius:12px;
}

input,
textarea,
select{

width:100%;
padding:12px;
margin-top:8px;
margin-bottom:20px;

background:#0f172a;
color:white;

border:1px solid #334155;
border-radius:8px;

}

textarea{

height:220px;
resize:vertical;

}

button{

width:100%;
padding:15px;

background:#2563eb;
color:white;

border:none;
border-radius:8px;

font-size:16px;
cursor:pointer;

}

.back{

display:inline-block;

margin-bottom:25px;

color:#60a5fa;
text-decoration:none;

}

</style>

</head>

<body>

<div class="card">

<a
class="back"
href="/settings">

⬅ Geri

</a>

<h2>${bot.name}</h2>

<p>@${bot.username}</p>

<form
method="POST"
action="/settings/${botId}">

<label>

Start Mesajı

</label>

<textarea
name="start_message">${s.start_message || ""}</textarea>

<label>

Fotoğraf URL

</label>

<input
name="photo"
value="${s.photo || ""}">

<label>

Video URL

</label>

<input
name="video"
value="${s.video || ""}">

<label>

Doküman URL

</label>

<input
name="document_url"
value="${s.document_url || ""}">

<label>

Inline Buton Yazısı

</label>

<input
name="button_text"
value="${s.button_text || ""}">

<label>

Inline Buton Linki

</label>

<input
name="button_url"
value="${s.button_url || ""}">

<label>

Parse Mode

</label>

<select
name="parse_mode">

<option
value="HTML"
${s.parse_mode==="HTML"?"selected":""}>

HTML

</option>

<option
value="MarkdownV2"
${s.parse_mode==="MarkdownV2"?"selected":""}>

MarkdownV2

</option>

<option
value="None"
${s.parse_mode==="None"?"selected":""}>

None

</option>

</select>

<label>

Bot Durumu

</label>

<select
name="is_enabled">

<option
value="1"
${s.is_enabled ? "selected":""}>

Aktif

</option>

<option
value="0"
${!s.is_enabled ? "selected":""}>

Pasif

</option>

</select>

<button>

💾 Ayarları Kaydet

</button>

</form>

</div>

</body>

</html>

`);

});
/* ===========================
   AYARLARI KAYDET
=========================== */

settings.post("/settings/:botId", async (c) => {

  try {

    const botId = Number(c.req.param("botId"));

    const body = await c.req.parseBody();

    console.log("========== SETTINGS SAVE ==========");
    console.log("BOT ID:", botId);
    console.log("BODY:", JSON.stringify(body));

    const result = await updateBotSettings(
      c.env.DB,
      botId,
      {
        start_message: String(body.start_message || ""),
        photo: String(body.photo || ""),
        video: String(body.video || ""),
        document_url: String(body.document_url || ""),
        button_text: String(body.button_text || ""),
        button_url: String(body.button_url || ""),
        parse_mode: String(body.parse_mode || "HTML"),
        is_enabled: Number(body.is_enabled || 1)
      }
    );

    console.log("UPDATE RESULT");
    console.log(JSON.stringify(result));

    const check = await getBotSettings(
      c.env.DB,
      botId
    );

    console.log("DATABASE AFTER UPDATE");
    console.log(JSON.stringify(check));

    return c.redirect(`/settings/${botId}`);

  } catch (e: any) {

    console.error("SETTINGS SAVE ERROR");
    console.error(e);
    console.error(e?.stack);

    return c.text(
      e?.message || "Kaydetme hatası",
      500
    );

  }

});

export default settings;