import { Hono } from "hono";
import { auth } from "../middleware/auth";
import {
  getTelegramUsers,
  countTelegramUsers,
  deleteTelegramUser
} from "../database/telegram-users";

import type { Env } from "../types/env";

const users = new Hono<Env>();

users.use("*", auth);

users.get("/users", async (c) => {

  const search = String(c.req.query("q") || "");

  let list = await getTelegramUsers(c.env.DB) as any[];

  if (search !== "") {

    list = list.filter(user => {

      return (
        String(user.username || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        String(user.first_name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        String(user.telegram_id)
          .includes(search)

      );

    });

  }

  const total = await countTelegramUsers(c.env.DB);

  let rows = "";

  for (const user of list) {

    rows += `

<tr>

<td>${user.telegram_id}</td>

<td>@${user.username || "-"}</td>

<td>

${user.first_name || ""}

${user.last_name || ""}

</td>

<td>${user.language_code || "-"}</td>

<td>

${user.is_premium ? "⭐ Premium" : "-"}

</td>

<td>

<form
method="POST"
action="/users/delete/${user.telegram_id}">

<button class="delete">

Sil

</button>

</form>

</td>

</tr>

`;

  }

  if(rows===""){

rows=`

<tr>

<td colspan="6">

Henüz kullanıcı bulunmuyor.

</td>

</tr>

`;

}

return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Kullanıcılar</title>

<style>

body{

background:#0f172a;

color:white;

font-family:Arial;

padding:40px;

}

.card{

background:#1e293b;

padding:20px;

border-radius:12px;

margin-bottom:25px;

}

input{

width:350px;

padding:12px;

border:none;

border-radius:8px;

}

button{

padding:10px 18px;

border:none;

border-radius:8px;

background:#2563eb;

color:white;

cursor:pointer;

}

.delete{

background:#dc2626;

}

table{

width:100%;

border-collapse:collapse;

margin-top:25px;

}

th,td{

padding:12px;

border:1px solid #334155;

}

th{

background:#111827;

}
tr:nth-child(even){

background:#172033;

}

.info{

display:flex;

justify-content:space-between;

align-items:center;

margin-bottom:20px;

}

</style>

</head>

<body>

<h1>👥 Kullanıcı Yönetimi</h1>
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

<div class="info">

<div>

<b>Toplam Kullanıcı:</b> ${total}

</div>


<form>

<input

name="q"

value="${search}"

placeholder="Kullanıcı Ara...">

<button>

Ara

</button>

</form>

</div>

<table>

<tr>

<th>Telegram ID</th>

<th>Username</th>

<th>Ad Soyad</th>

<th>Dil</th>

<th>Premium</th>

<th>İşlem</th>

</tr>

${rows}

</table>

</body>

</html>

`);

});

// KULLANICI SİL
users.post("/users/delete/:id", async (c)=>{

const id=Number(c.req.param("id"));

await deleteTelegramUser(

c.env.DB,

id

);

return c.redirect("/users");

});

export default users;