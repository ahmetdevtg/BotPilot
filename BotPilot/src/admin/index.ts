import { Hono } from "hono";
import { auth } from "../middleware/auth";
import {
  getUsers,
  createUser,
  deleteUser
} from "../database/users";
import { hashPassword } from "../auth/password";

import type { Env } from "../types/env";

const admin = new Hono<Env>();

admin.use("*", auth);

admin.get("/admin", async (c) => {

  const currentUser: any = c.get("user");

  if (currentUser.role !== "super_admin") {
    return c.text("403 - Yetkisiz Erişim", 403);
  }

  const users = await getUsers(c.env.DB);

  let rows = "";

  for (const user of users as any[]) {

    let button = `
<form method="POST" action="/admin/delete/${user.id}">
<button class="delete">
Sil
</button>
</form>
`;

    if (user.id === 1) {
      button = "👑 Super Admin";
    }

    rows += `
<tr>
<td>${user.id}</td>
<td>${user.username}</td>
<td>${user.role}</td>
<td>${button}</td>
</tr>
`;

  }

  if (rows === "") {

    rows = `
<tr>
<td colspan="4">
Henüz admin yok.
</td>
</tr>
`;

  }

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Admin Yönetimi</title>

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
width:100%;
padding:12px;
margin-top:10px;
margin-bottom:15px;
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
margin-top:20px;
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

a{
color:#60a5fa;
text-decoration:none;
}

</style>

</head>

<body>

<h1>👤 Admin Yönetimi</h1>

<p>

<a href="/admin/password">

🔐 Şifre Değiştir

</a>

</p>

<div class="card">

<form method="POST" action="/admin/create">

<input
name="username"
placeholder="Kullanıcı Adı"
required>

<input
type="password"
name="password"
placeholder="Şifre"
required>

<button>

➕ Admin Oluştur

</button>

</form>

</div>

<table>

<tr>

<th>ID</th>

<th>Kullanıcı Adı</th>

<th>Rol</th>

<th>İşlem</th>

</tr>

${rows}

</table>

</body>

</html>

`);

});

admin.post("/admin/create", async (c) => {

  const currentUser: any = c.get("user");

  if (currentUser.role !== "super_admin") {
    return c.text("403 - Yetkisiz Erişim", 403);
  }

  const body = await c.req.parseBody();

  const username = String(body.username || "");
  const password = String(body.password || "");

  if (!username || !password) {
    return c.redirect("/admin");
  }

  const passwordHash = await hashPassword(password);

  await createUser(
    c.env.DB,
    username,
    passwordHash
  );

  return c.redirect("/admin");

});

admin.post("/admin/delete/:id", async (c) => {

  const currentUser: any = c.get("user");

  if (currentUser.role !== "super_admin") {
    return c.text("403 - Yetkisiz Erişim", 403);
  }

  const id = Number(c.req.param("id"));

  if (id === 1) {
    return c.html("<h2>❌ Super Admin silinemez.</h2>");
  }

  if (id === currentUser.id) {
    return c.html("<h2>❌ Kendi hesabınızı silemezsiniz.</h2>");
  }

  await deleteUser(
    c.env.DB,
    id
  );

  return c.redirect("/admin");

});

export default admin;