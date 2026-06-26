import { Hono } from "hono";
import { auth } from "../middleware/auth";
import type { Env } from "../types/env";

const broadcast = new Hono<Env>();

broadcast.use("*", auth);

broadcast.get("/broadcast", (c) => {

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Broadcast</title>

<style>

body{

background:#0f172a;

color:white;

font-family:Arial,sans-serif;

padding:40px;

}

.card{

background:#1e293b;

padding:25px;

border-radius:12px;

max-width:900px;

}

textarea{

width:100%;

height:220px;

padding:15px;

border:none;

border-radius:10px;

margin-top:15px;

resize:vertical;

}

button{

margin-top:20px;

padding:12px 24px;

background:#2563eb;

color:white;

border:none;

border-radius:8px;

cursor:pointer;

}

button:hover{

background:#1d4ed8;

}

.info{

margin-top:20px;

color:#94a3b8;

}

</style>

</head>

<body>

<h1>📢 Broadcast</h1>

<div class="card">

<form method="POST" action="/broadcast/send">

<textarea

name="message"

placeholder="Göndermek istediğiniz mesajı yazın..."

required></textarea>

<button type="submit">

📨 Yayını Başlat

</button>

</form>

<div class="info">

Bu ekran şimdilik taslak halindedir.
Bir sonraki adımda seçili botlara veya tüm botlara mesaj gönderecek şekilde tamamlanacaktır.

</div>

</div>

</body>

</html>

`);

});

broadcast.post("/broadcast/send", async (c) => {

  const body = await c.req.parseBody();

  const message = String(body.message || "");

  // Bir sonraki adımda tüm kullanıcıları çekip
  // sendBroadcast() fonksiyonunu burada kullanacağız.

  return c.html(`

<h2>✅ Yayın isteği alındı.</h2>

<p><b>Mesaj:</b></p>

<pre>${message}</pre>

<p><a href="/broadcast">← Geri Dön</a></p>

`);

});

export default broadcast;