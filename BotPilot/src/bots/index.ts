import { Hono } from "hono";
import { getBots } from "../database/bots";
import { addBot } from "../services/bot.service";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const bots = new Hono<Env>();

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
<html>
<head>
<meta charset="UTF-8">
<title>BotPilot</title>

<style>

body{
background:#0f172a;
font-family:Arial;
padding:40px;
color:white;
}

input{
padding:12px;
width:420px;
}

button{
padding:12px;
cursor:pointer;
}

table{
width:100%;
margin-top:30px;
border-collapse:collapse;
}

th,td{
padding:12px;
border:1px solid #334155;
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

<button>

Bot Ekle

</button>

</form>

<table>

<tr>

<th>ID</th>

<th>Bot</th>

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

  try{

      await addBot(c.env.DB,token);

      return c.redirect("/bots");

  }catch(e:any){

      return c.html(`<h1>${e.message}</h1>`);

  }

});

export default bots;