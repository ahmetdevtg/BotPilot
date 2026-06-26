import { Hono } from "hono";
import {
  getBots,
  deleteBot,
  getBotById,
  updateBotProfile
} from "../database/bots";
import { addBot } from "../services/bot.service";
import { auth } from "../middleware/auth";
import type { Env } from "../types/env";
import {
  setMyName,
  setMyDescription,
  setMyShortDescription
} from "../telegram/api";

const bots = new Hono<Env>();

bots.use("*", auth);

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
<td colspan="5" style="text-align:center;">
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

<form method="POST" action="/bots/add">

<input
name="token"
placeholder="Telegram Bot Token"
required>

<button type="submit">

Bot Ekle

</button>

</form>

<table>

<tr>

<th>ID</th>

<th>Bot Adı</th>

<th>Username</th>

<th>Durum</th>

<th>İşlemler</th>

</tr>

${rows}

</table>

</body>

</html>

`);

});
// Bot Ekle
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
// Bot Sil
bots.post("/bots/delete/:id", async (c) => {

  const id = Number(c.req.param("id"));

  await deleteBot(
    c.env.DB,
    id
  );

  return c.redirect("/bots");

});

export default bots;