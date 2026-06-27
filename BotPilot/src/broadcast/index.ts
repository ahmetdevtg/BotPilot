import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { getBots } from "../database/bots";
import {
  createBroadcast,
  finishBroadcast,
  getBroadcasts
} from "../database/broadcast";
import {
  sendBroadcast,
  sendBroadcastAllBots
} from "./send";

import type { Env } from "../types/env";

const broadcast = new Hono<Env>();

broadcast.use("*", auth);

broadcast.get("/broadcast", async (c) => {

  const bots = await getBots(c.env.DB);
  const history = await getBroadcasts(c.env.DB);

  let options = `
<option value="all">
🌍 Tüm Botlar
</option>
`;

  for (const bot of bots as any[]) {

    options += `
<option value="${bot.telegram_id}">
${bot.name} (@${bot.username})
</option>
`;

  }

  let rows = "";

  for (const item of history as any[]) {

    rows += `

<tr>

<td>${item.id}</td>

<td>${item.bot_id}</td>

<td>${item.success_count}</td>

<td>${item.failed_count}</td>

<td>${item.created_at}</td>

</tr>

`;

  }

  if(rows===""){

rows=`

<tr>

<td colspan="5">

Henüz yayın yok.

</td>

</tr>

`;

}

return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Broadcast</title>

<style>

body{

background:#0f172a;

color:white;

font-family:Arial,sans-serif;

padding:40px;

}

.card{

background:#1e293b;

padding:25px;

border-radius:12px;

margin-bottom:25px;

}

select,

textarea,

input{

width:100%;

padding:12px;

border:none;

border-radius:8px;

margin-top:12px;

margin-bottom:18px;

}

textarea{

height:220px;

resize:vertical;

}

button{

padding:12px 22px;

background:#2563eb;

border:none;

color:white;

border-radius:8px;

cursor:pointer;

}

button:hover{

background:#1d4ed8;

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

tr:nth-child(even){

background:#172033;

}

</style>

</head>

<body>

<h1>

📢 Broadcast

</h1>
<div style="margin-bottom:20px;">

<a
href="/dashboard"
style="
display:inline-block;
padding:10px 18px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
">

🏠 Anasayfaya Dön

</a>

</div>

<div class="card">

<form method="POST" action="/broadcast/send">

<label>

Bot

</label>

<select
name="botId">

${options}

</select>

<label>

Mesaj

</label>

<textarea
name="message"
required></textarea>

<label>

Fotoğraf URL

</label>

<input
name="photo">

<label>

Video URL

</label>

<input
name="video">

<label>

Doküman URL

</label>

<input
name="document">

<label>

Buton Yazısı

</label>

<input
name="buttonText">

<label>

Buton Linki

</label>

<input
name="buttonUrl">

<label>

Parse Mode

</label>

<select name="parseMode">

<option value="HTML">
HTML
</option>

<option value="MarkdownV2">
MarkdownV2
</option>

</select>

<button>

🚀 Yayını Başlat

</button>

</form>

</div>

<div class="card">

<h2>

Yayın Geçmişi

</h2>

<table>

<tr>

<th>ID</th>

<th>Bot</th>

<th>Başarılı</th>

<th>Başarısız</th>

<th>Tarih</th>

</tr>

${rows}

</table>

</div>

</body>

</html>

`);

});
broadcast.post("/broadcast/send", async (c) => {

  const body = await c.req.parseBody();

  const botId = String(body.botId || "");
  const message = String(body.message || "");
const photo = String(body.photo || "");
const video = String(body.video || "");
const document = String(body.document || "");
const buttonText = String(body.buttonText || "");
const buttonUrl = String(body.buttonUrl || "");
const parseMode = String(body.parseMode || "HTML");

  if (message.trim() === "") {

    return c.html(`
      <h2>Mesaj boş olamaz.</h2>
      <a href="/broadcast">Geri Dön</a>
    `);

  }

  // TÜM BOTLAR
if (botId === "all") {

  const result = await createBroadcast(
    c.env.DB,
    0,
    message
  );

  const broadcastId = Number(
    (result as any).meta?.last_row_id || 0
  );

  const stats = await sendBroadcastAllBots(
    c.env.DB,
    {
      message,
      photo,
      video,
      document,
      buttonText,
      buttonUrl,
      parseMode
    }
  );

  await finishBroadcast(
    c.env.DB,
    broadcastId,
    stats.success,
    stats.failed
  );

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Broadcast Tamamlandı</title>

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

max-width:700px;

}

.ok{

font-size:24px;

color:#22c55e;

margin-bottom:20px;

}

a{

display:inline-block;

margin-top:20px;

padding:12px 22px;

background:#2563eb;

color:white;

text-decoration:none;

border-radius:8px;

}

</style>

</head>

<body>

<div class="card">

<div class="ok">

✅ Yayın tamamlandı

</div>

<p>Başarılı: <b>${stats.success}</b></p>

<p>Başarısız: <b>${stats.failed}</b></p>

<a href="/broadcast">

← Broadcast'a Dön

</a>

</div>

</body>

</html>

`);

  }

  // TEK BOT
  const bot: any = await c.env.DB
    .prepare(`
      SELECT *
      FROM bots
      WHERE telegram_id=?
    `)
    .bind(Number(botId))
    .first();

  if (!bot) {

    return c.html(`
      <h2>Bot bulunamadı.</h2>
      <a href="/broadcast">Geri Dön</a>
    `);

  }

 const result = await createBroadcast(
  c.env.DB,
  Number(botId),
  message
);

const broadcastId =
  Number((result as any).meta?.last_row_id);

const stats = await sendBroadcast(
  c.env.DB,
  bot.token,
  Number(botId),
  {
    message,
    photo,
    video,
    document,
    buttonText,
    buttonUrl,
    parseMode
  }
);

await finishBroadcast(
  c.env.DB,
  broadcastId,
  stats.success,
  stats.failed
);

  return c.html(`

<h2>✅ Broadcast tamamlandı.</h2>

<p>Başarılı: ${stats.success}</p>

<p>Başarısız: ${stats.failed}</p>

<br>

<a href="/broadcast">

← Geri Dön

</a>

`);

});

export default broadcast;