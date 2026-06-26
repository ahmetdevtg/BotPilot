import { Hono } from "hono";
import { getUserByUsername } from "../database/users";
import { verifyPassword } from "./password";
import { createSession } from "./session";

type Env = {
  Bindings: {
    DB: D1Database;
  };
};

const login = new Hono<Env>();

login.get("/login", (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>BotPilot Login</title>

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
justify-content:center;
align-items:center;
height:100vh;
}

.card{
width:420px;
background:#1e293b;
padding:40px;
border-radius:15px;
box-shadow:0 15px 35px rgba(0,0,0,.35);
}

h1{
color:#fff;
text-align:center;
margin-bottom:30px;
}

input{
width:100%;
padding:15px;
margin-top:15px;
background:#334155;
border:none;
border-radius:8px;
color:#fff;
}

button{
margin-top:20px;
width:100%;
padding:15px;
border:none;
border-radius:8px;
background:#2563eb;
color:#fff;
font-size:16px;
cursor:pointer;
}

button:hover{
background:#1d4ed8;
}

.error{
margin-top:20px;
color:#ef4444;
text-align:center;
}

.footer{
margin-top:25px;
text-align:center;
color:#94a3b8;
font-size:13px;
}

</style>

</head>

<body>

<div class="card">

<h1>🚀 BotPilot</h1>

<form method="POST" action="/login">

<input
name="username"
placeholder="Kullanıcı Adı"
required>

<input
type="password"
name="password"
placeholder="Şifre"
required>

<button type="submit">

Giriş Yap

</button>

</form>

<div class="footer">

BotPilot v1.0

</div>

</div>

</body>

</html>
`);
});

login.post("/login", async (c) => {

  const body = await c.req.parseBody();

  const username = String(body.username || "");

  const password = String(body.password || "");

  const user = await getUserByUsername(
    c.env.DB,
    username
  );

  if (!user) {

    return c.html("<h1>Kullanıcı bulunamadı.</h1>");

  }

  const ok = await verifyPassword(
    password,
    String((user as any).password_hash)
  );

  if (!ok) {

    return c.html("<h1>Şifre yanlış.</h1>");

  }

  // Şimdilik session yok.
  // Bir sonraki adımda cookie oluşturacağız.

const sessionId = await createSession(
  c.env.DB,
  Number((user as any).id)
);

c.header(
  "Set-Cookie",
  `session=${sessionId}; HttpOnly; Path=/; Max-Age=2592000`
);

return c.redirect("/dashboard");

}
);

export default login;