import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { getBots } from "../database/bots";
import {
  createBroadcast,
  finishBroadcast,
  getBroadcasts
} from "../database/broadcast";
import { sendBroadcast } from "./send";

import type { Env } from "../types/env";

const broadcast = new Hono<Env>();

broadcast.use("*", auth);

// Broadcast Panel
broadcast.get("/broadcast", async (c) => {

  const bots = await getBots(c.env.DB);
  const history = await getBroadcasts(c.env.DB);

  let botOptions = "";

  for (const bot of bots as any[]) {

    botOptions += `
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

  if (rows === "") {

    rows = `
<tr>
<td colspan="5" style="text-align:center;">
Henüz yayın yapılmadı.
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

.card{
background:#1e293b;
padding:25px;
border-radius:12px;
margin-bottom:25px;
}

select,
textarea{
width:100%;
padding:14px;
border:none;
border-radius:8px;
margin-top:15px;
margin-bottom:15px;
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
text-align:left;
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

<h1 style="margin-bottom:25px;">
📢 Broadcast
</h1>

<div class="card">

<form method="POST" action="/broadcast/send">

<select
name="botId"
required>

<option value="">
Bot Seçiniz
</option>

${botOptions}

</select>

<textarea
name="message"
placeholder="Göndermek istediğiniz mesaj..."
required></textarea>

<button>

🚀 Yayını Başlat

</button>

</form>

</div>

<div class="card">

<h2 style="margin-bottom:15px;">
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
// Yayın Başlat
broadcast.post("/broadcast/send", async (c) => {

  const body = await c.req.parseBody();

  const botId = Number(body.botId);
  const message = String(body.message || "");

  const bot: any = await c.env.DB
    .prepare(`
      SELECT *
      FROM bots
      WHERE telegram_id=?
    `)
    .bind(botId)
    .first();

  if (!bot) {

    return c.html(`
      <h2>Bot bulunamadı.</h2>
      <a href="/broadcast">Geri Dön</a>
    `);

  }

  const result = await createBroadcast(
    c.env.DB,
    botId,
    message
  );

  const broadcastId =
    Number((result as any).meta?.last_row_id);

  const stats = await sendBroadcast(
    c.env.DB,
    bot.token,
    botId,
    message
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

font-family:Arial;

color:white;

padding:40px;

}

.card{

background:#1e293b;

padding:25px;

border-radius:12px;

max-width:700px;

}

.success{

color:#22c55e;

font-size:22px;

margin-bottom:20px;

}

.info{

margin-top:12px;

font-size:18px;

}

a{

display:inline-block;

margin-top:25px;

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

<div class="success">

✅ Broadcast tamamlandı

</div>

<div class="info">

Başarılı:

<b>${stats.success}</b>

</div>

<div class="info">

Başarısız:

<b>${stats.failed}</b>

</div>

<a href="/broadcast">

← Broadcast'a Dön

</a>

</div>

</body>

</html>

`);

});

export default broadcast;