import { Hono } from "hono";
import { auth } from "../middleware/auth";
import {
  getUserById,
  updateUserPassword
} from "../database/users";
import {
  verifyPassword,
  hashPassword
} from "../auth/password";

import type { Env } from "../types/env";

const password = new Hono<Env>();

password.use("*", auth);

password.get("/admin/password", async (c) => {

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Şifre Değiştir</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial,sans-serif;
padding:40px;
}

.card{
background:#1e293b;
padding:30px;
border-radius:12px;
max-width:550px;
margin:auto;
}

h1{
margin-bottom:25px;
}

input{
width:100%;
padding:12px;
margin-top:12px;
margin-bottom:18px;
border:none;
border-radius:8px;
background:#334155;
color:white;
}

button{
width:100%;
padding:12px;
background:#2563eb;
border:none;
border-radius:8px;
color:white;
font-size:16px;
cursor:pointer;
}

button:hover{
background:#1d4ed8;
}

a{
display:inline-block;
margin-top:20px;
color:#60a5fa;
text-decoration:none;
}

</style>

</head>

<body>

<div class="card">

<h1>🔐 Şifre Değiştir</h1>

<form method="POST" action="/admin/password">

<input
type="password"
name="oldPassword"
placeholder="Mevcut Şifre"
required>

<input
type="password"
name="newPassword"
placeholder="Yeni Şifre"
required>

<input
type="password"
name="newPassword2"
placeholder="Yeni Şifre (Tekrar)"
required>

<button type="submit">

💾 Şifreyi Güncelle

</button>

</form>

<a href="/admin">

← Admin Yönetimine Dön

</a>

</div>

</body>

</html>

`);

});

password.post("/admin/password", async (c) => {

  const body = await c.req.parseBody();

  const oldPassword = String(body.oldPassword || "");
  const newPassword = String(body.newPassword || "");
  const newPassword2 = String(body.newPassword2 || "");

  if (newPassword !== newPassword2) {
    return c.html("<h2>❌ Yeni şifreler uyuşmuyor.</h2>");
  }

  const user: any = c.get("user");

  const dbUser: any = await getUserById(
    c.env.DB,
    Number(user.id)
  );

  if (!dbUser) {
    return c.html("<h2>❌ Kullanıcı bulunamadı.</h2>");
  }

  const ok = await verifyPassword(
    oldPassword,
    dbUser.password_hash
  );

  if (!ok) {
    return c.html("<h2>❌ Mevcut şifre yanlış.</h2>");
  }

  const passwordHash = await hashPassword(
    newPassword
  );

  await updateUserPassword(
    c.env.DB,
    Number(user.id),
    passwordHash
  );

  return c.html(`

<h2>✅ Şifreniz başarıyla değiştirildi.</h2>

<br>

<a href="/dashboard">

Dashboard'a Dön

</a>

`);

});

export default password;