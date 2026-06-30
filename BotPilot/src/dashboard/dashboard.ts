import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { getDashboardStats } from "../database/dashboard";
import type { Env } from "../types/env";

const dashboard = new Hono<Env>();

dashboard.use("*", auth);

dashboard.get("/dashboard", async (c) => {

  const stats = await getDashboardStats(c.env.DB);

  let botRows = "";

  for (const bot of stats.lastBots as any[]) {

    botRows += `
<tr>
<td>${bot.name}</td>
<td>@${bot.username}</td>
<td class="${bot.status ? "online" : "offline"}">
${bot.status ? "🟢 Online" : "🔴 Offline"}
</td>
</tr>
`;

  }

  if (botRows === "") {

    botRows = `
<tr>
<td colspan="3">
Henüz bot eklenmedi.
</td>
</tr>
`;

  }

  let broadcastRows = "";

  for (const item of stats.lastBroadcasts as any[]) {

    broadcastRows += `
<tr>
<td>${item.id}</td>
<td>${item.success_count}</td>
<td>${item.failed_count}</td>
<td>${item.created_at}</td>
</tr>
`;

  }

  if (broadcastRows === "") {

    broadcastRows = `
<tr>
<td colspan="4">
Henüz broadcast yapılmadı.
</td>
</tr>
`;

  }

  return c.html(`
<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>BotPilot Dashboard</title>

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
padding:35px;
}

h1{
margin-bottom:20px;
}

.menu{
display:flex;
flex-wrap:wrap;
gap:12px;
margin-bottom:30px;
}

.menu a{
padding:12px 18px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
}

.logout{
background:#dc2626 !important;
}

.cards{
display:grid;
grid-template-columns:repeat(4,1fr);
gap:20px;
margin-bottom:30px;
}

.card{
background:#1e293b;
padding:20px;
border-radius:12px;
}

.card h3{
font-size:15px;
color:#94a3b8;
margin-bottom:10px;
}

.card p{
font-size:34px;
font-weight:bold;
}

.table{
background:#1e293b;
padding:20px;
border-radius:12px;
margin-bottom:25px;
overflow-x:auto;
}

table{
width:100%;
border-collapse:collapse;
margin-top:15px;
}

th,td{
padding:14px;
border-bottom:1px solid #334155;
text-align:left;
}

.online{
color:#22c55e;
font-weight:bold;
}

.offline{
color:#ef4444;
font-weight:bold;
}

</style>

</head>

<body>

<h1>🚀 BotPilot Dashboard</h1>

<div class="menu">

<a href="/bots">🤖 Botlar</a>

<a href="/users">👥 Kullanıcılar</a>

<a href="/broadcast">📢 Broadcast</a>

<a href="/global-settings">🚀 /start Ayarları</a>

<a href="/reply-buttons">⌨️ Reply Keyboard</a>

<a href="/admin">👤 Admin</a>

<a href="/logout" class="logout">🚪 Çıkış Yap</a>

</div>

<div class="cards">

<div class="card">
<h3>Toplam Bot</h3>
<p>${stats.totalBots}</p>
</div>

<div class="card">
<h3>Toplam Kullanıcı</h3>
<p>${stats.totalUsers}</p>
</div>

<div class="card">
<h3>Toplam Broadcast</h3>
<p>${stats.totalBroadcasts}</p>
</div>

<div class="card">
<h3>Online Bot</h3>
<p>${stats.onlineBots}</p>
</div>

</div>

<div class="table">

<h2>🤖 Son Eklenen Botlar</h2>

<table>

<tr>

<th>Bot</th>
<th>Username</th>
<th>Durum</th>

</tr>

${botRows}

</table>

</div>

<div class="table">

<h2>📢 Son Broadcastlar</h2>

<table>

<tr>

<th>ID</th>
<th>Başarılı</th>
<th>Başarısız</th>
<th>Tarih</th>

</tr>

${broadcastRows}

</table>

</div>
</body>

</html>

`);

});

export default dashboard;