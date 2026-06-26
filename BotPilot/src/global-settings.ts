import { Hono } from "hono";
import { auth } from "./middleware/auth";
import type { Env } from "./types/env";
import {
  getBotSettings,
  updateBotSettings
} from "./database/bot-settings";

const globalSettings = new Hono<Env>();

globalSettings.use("*", auth);

globalSettings.get("/global-settings", async (c) => {
const settings = await getBotSettings(c.env.DB);
  return c.html(`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>Genel Bot Ayarları</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial,sans-serif;
padding:40px;
}

.card{
background:#1e293b;
padding:20px;
border-radius:12px;
margin-bottom:25px;
}

input,
textarea,
select{

width:100%;
padding:12px;
margin-top:8px;
margin-bottom:18px;
border:none;
border-radius:8px;

}

button{

padding:14px 24px;
background:#2563eb;
color:white;
border:none;
border-radius:8px;
cursor:pointer;

}

.back{

display:inline-block;
margin-bottom:20px;
padding:10px 18px;
background:#475569;
color:white;
text-decoration:none;
border-radius:8px;

}

</style>

</head>

<body>

<h1>

⚙ Genel Bot Ayarları

</h1>
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

<h2>🤖 Profil</h2>

<input
name="bot_name"
value="${settings?.bot_name || ""}"
placeholder="Bot Adı">

<textarea
name="description"
placeholder="Açıklama">${settings?.description || ""}</textarea>

<textarea
name="short_description"
placeholder="Kısa Açıklama">${settings?.short_description || ""}</textarea>

</div>

<div class="card">

<h2>🚀 /start</h2>

<textarea placeholder="/start mesajı"></textarea>

<input placeholder="Fotoğraf URL">

<input placeholder="Video URL">

<input placeholder="Dosya URL">

</div>

<div class="card">

<h2>🔘 Buton</h2>

<input placeholder="Buton Yazısı">

<input placeholder="Buton Linki">

</div>

<div class="card">

<h2>⌨ Reply Keyboard</h2>

<textarea placeholder="🌐 Site&#10;🎁 Bonus&#10;💬 Destek"></textarea>

</div>

<button>

💾 Kaydet

</button>

</body>

</html>

`);

});

export default globalSettings;