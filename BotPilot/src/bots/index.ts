import { Hono } from "hono";
import { getBots } from "../database/bots";
import { addBot } from "../services/bot.service";
import { auth } from "../middleware/auth";

import type { Env } from "../types/env";
const bots = new Hono<Env>();

// Giriş yapılmadan erişilemez
bots.use("*", auth);

// Bot listesi
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

<h1>🤖 Bot Yönetimi</h1>

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
</tr>

${rows}

</table>

</body>
</html>
`);
});

// Bot ekle
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

export default bots;