import { Hono } from "hono";
import { auth } from "../middleware/auth";
import { getDashboardStats } from "../database/dashboard";

import type { Env } from "../types/env";

const dashboard = new Hono<Env>();

dashboard.use("*",auth);

dashboard.get("/dashboard", async (c) => {

  const stats = await getDashboardStats(c.env.DB);

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
display:flex;
height:100vh;
overflow:hidden;
}

.sidebar{

width:250px;

background:#111827;

padding:25px;

color:white;

}

.logo{

font-size:28px;

font-weight:bold;

margin-bottom:40px;

}

.menu{

display:flex;

flex-direction:column;

gap:15px;

}

.menu a{

text-decoration:none;

color:#cbd5e1;

padding:12px;

border-radius:8px;

transition:.2s;

}

.menu a:hover{

background:#2563eb;

color:white;

}

.main{

flex:1;

padding:40px;

overflow:auto;

}

.title{

color:white;

font-size:34px;

margin-bottom:35px;

}

.cards{

display:grid;

grid-template-columns:repeat(4,1fr);

gap:20px;

}

.card{

background:#1e293b;

border-radius:12px;

padding:25px;

color:white;

}

.card h2{

font-size:16px;

color:#94a3b8;

margin-bottom:10px;

}

.card p{

font-size:34px;

font-weight:bold;

}

.table{

margin-top:40px;

background:#1e293b;

border-radius:12px;

padding:20px;

color:white;

}

table{

width:100%;

border-collapse:collapse;

}

th,td{

padding:15px;

text-align:left;

border-bottom:1px solid #334155;

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

<div class="sidebar">

<div class="logo">

🚀 BotPilot

</div>

<div class="menu">

<a href="/dashboard">🏠 Dashboard</a>

<a href="/bots">🤖 Botlar</a>

<a href="/users">👥 Kullanıcılar</a>

<a href="/broadcast">📢 Yayın</a>

<a href="/settings">⚙ Ayarlar</a>

</div>

</div>

<div class="main">

<div class="title">

Dashboard

</div>

<div class="cards">

<div class="card">

<h2>Toplam Bot</h2>

<p>${stats.totalBots}</p>

</div>

<div class="card">

<h2>Toplam Kullanıcı</h2>

<p>0</p>

</div>

<div class="card">

<h2>Gönderilen Mesaj</h2>

<p>0</p>

</div>

<div class="card">

<h2>Online Bot</h2>

<p>0</p>

</div>

</div>

<div class="table">

<h2 style="margin-bottom:20px;">Son Botlar</h2>

<table>

<tr>

<th>Bot</th>

<th>Durum</th>

</tr>

<tr>

<td>Henüz bot eklenmedi</td>

<td class="offline">Offline</td>

</tr>

</table>

</div>

</div>

</body>

</html>

`);

});

export default dashboard;