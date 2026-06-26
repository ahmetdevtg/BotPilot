import { Hono } from "hono";
import { getBots, deleteBot } from "../database/bots";
import { addBot } from "../services/bot.service";
import { auth } from "../middleware/auth";

import type { Env } from "../types/env";

const bots = new Hono<Env>();

bots.use("*", auth);

// Bot Listesi
bots.get("/bots", async (c) => {

  const botlar = await getBots(c.env.DB);

  let rows = "";

  for (const bot of botlar as any[]) {

    rows += `
      <tr>
        <td>${bot.id}</td>
        <td>${bot.name}</td>
        <td>@${bot.username}</td>
        <td>${bot.status == 1 ? "🟢 Online" : "🔴 Offline"}</td>
        <td>
          <form method="POST" action="/bots/delete/${bot.id}">
            <button class="delete-btn" type="submit">
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

<title>BotPilot - Bot Yönetimi</title>

<style>


body{
background:#0f172a;
color:white;
font-family:Arial,sans-serif;
padding:40px;
}

h1{
margin-bottom:25px;
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

button:hover{
background:#1d4ed8;
}

.delete-btn{
background:#dc2626;
}

.delete-btn:hover{
background:#b91c1c;
}

table{
width:100%;
margin-top:30px;
border-collapse:collapse;
}

th,td{
border:1px solid #334155;
padding:12px;
text-align:left;
}

th{
background:#1e293b;
}

tr:nth-child(even){
background:#162033;
}

</style>

</head>

<body>


<h1 style="margin-bottom:25px;">
🤖 Bot Yönetimi
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
">

🏠 Anasayfaya Dön

</a>

</div>

<form method="POST" action="/bots/add">

<input
name="token"
placeholder="Telegram Bot Token"
required>



</body>

</html>

`);

});

// Bot Ekle
bots.post("/bots/add", async (c) => {

  const body = await c.req.parseBody();

  const token = String(body.token || "");

  try {

    await addBot(c.env.DB, token);

    return c.redirect("/bots");

  } catch (e: any) {

    return c.html(`
      <h2>${e.message}</h2>
      <a href="/bots">Geri Dön</a>
    `);

  }

});

// Bot Sil
bots.post("/bots/delete/:id", async (c) => {

  const id = Number(c.req.param("id"));

  await deleteBot(c.env.DB, id);

  return c.redirect("/bots");

});

export default bots;