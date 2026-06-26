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
font-family:Arial;
padding:40px;
}

.card{
background:#1e293b;
padding:25px;
border-radius:12px;
max-width:550px;
margin:auto;
}

input{
width:100%;
padding:12px;
margin-top:12px;
margin-bottom:18px;
border:none;
border-radius:8px;
}

button{
width:100%;
padding:12px;
border:none;
border-radius:8px;
background:#2563eb;
color:white;
cursor:pointer;
font-size:16px;
}

button:hover{
background:#1d4ed8;
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
placeholder="Yeni Şifre Tekrar"
required>

<button>

Şifreyi Güncelle

</button>

</form>

</div>

</body>

</html>

`);

});