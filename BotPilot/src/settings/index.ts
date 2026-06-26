import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { getBots } from "../database/bots";

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

export default settings;