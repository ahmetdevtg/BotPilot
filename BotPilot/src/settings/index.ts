import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { getBots } from "../database/bots";
import {
  getBotSettings,
  updateBotSettings
} from "../database/settings";

import type { Env } from "../types/env";

const settings = new Hono<Env>();

settings.use("*", auth);

settings.get("/settings", async (c) => {

  const bots = await getBots(c.env.DB);

  let rows = "";

  for (const bot of bots as any[]) {

    rows += `
      <tr>
        <td>${bot.name}</td>
        <td>@${bot.username}</td>
        <td>
          <a href="/settings/${bot.telegram_id}">
            ⚙️ Ayarlar
          </a>
        </td>
      </tr>
    `;

  }

  if (rows === "") {

    rows = `
      <tr>
        <td colspan="3">
          Henüz bot bulunmuyor.
        </td>
      </tr>
    `;

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
}

th,td{
border:1px solid #334155;
padding:14px;
}

th{
background:#111827;
}

a{
color:#60a5fa;
text-decoration:none;
}

</style>

</head>

<body>

<h1>⚙️ Bot Ayarları</h1>

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
settings.get("/settings/:botId", async (c) => {

  const botId = Number(c.req.param("botId"));

  const bot = await c.env.DB
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

<title>Bot Ayarları</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

.card{
background:#1e293b;
padding:25px;
border-radius:12px;
max-width:900px;
}

textarea,
input,
select{
width:100%;
padding:12px;
margin-top:10px;
margin-bottom:20px;
border:none;
border-radius:8px;
}

textarea{
height:220px;
resize:vertical;
}

button{
padding:12px 22px;
border:none;
border-radius:8px;
background:#2563eb;
color:white;
cursor:pointer;
}

</style>

</head>

<body>

<div class="card">

<h1>${(bot as any).name}</h1>

<p>@${(bot as any).username}</p>

<form method="POST" action="/settings/${botId}">

<label>Start Mesajı</label>

<textarea name="start_message">${s.start_message}</textarea>

<label>Fotoğraf URL</label>

<input name="photo" value="${s.photo}">

<label>Video URL</label>

<input name="video" value="${s.video}">

<label>Doküman URL</label>

<input
name="document_url"
value="${s.document_url}">

<label>Buton Yazısı</label>

<input
name="button_text"
value="${s.button_text}">

<label>Buton Linki</label>

<input
name="button_url"
value="${s.button_url}">

<label>Parse Mode</label>

<select name="parse_mode">

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

</select>
<label>Bot Durumu</label>

<select name="is_enabled">

<option
value="1"
${s.is_enabled ? "selected" : ""}>
Aktif
</option>

<option
value="0"
${!s.is_enabled ? "selected" : ""}>
Pasif
</option>

</select>

<button>

💾 Kaydet

</button>

</form>

</div>

</body>

</html>

`);

});

settings.post("/settings/:botId", async (c) => {

  const botId = Number(c.req.param("botId"));

  const body = await c.req.parseBody();

  await updateBotSettings(
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

  return c.redirect(`/settings/${botId}`);

});

export default settings;