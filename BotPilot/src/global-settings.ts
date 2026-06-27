import { Hono } from "hono";
import { auth } from "./middleware/auth";

import {
  getBotSettings,
  updateBotSettings
} from "./database/bot-settings";

import type { Env } from "./types/env";

const globalSettings = new Hono<Env>();

globalSettings.use("*", auth);
globalSettings.get("/global-settings", async (c) => {

  const settings: any = await getBotSettings(c.env.DB);

  return c.html(`
<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>/start Ayarları</title>

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
padding:40px;
}

.back{
display:inline-block;
padding:10px 18px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
margin-bottom:25px;
}

.card{
background:#1e293b;
padding:25px;
border-radius:12px;
margin-bottom:25px;
}

.card h2{
margin-bottom:20px;
}

label{
display:block;
margin-top:12px;
margin-bottom:8px;
font-weight:bold;
}

input,
textarea,
select{
width:100%;
padding:12px;
border:none;
border-radius:8px;
background:#0f172a;
color:white;
margin-bottom:18px;
}

textarea{
resize:vertical;
}

button{
padding:14px 24px;
background:#2563eb;
color:white;
border:none;
border-radius:8px;
cursor:pointer;
font-size:15px;
}

button:hover{
background:#1d4ed8;
}

</style>

</head>

<body>

<a href="/dashboard" class="back">
🏠 Anasayfaya Dön
</a>

<h1 style="margin-bottom:25px;">
🚀 /start Ayarları
</h1>

<form method="POST" action="/global-settings">

<div class="card">

<h2>🚀 Başlangıç Mesajı</h2>
<label>Başlangıç Mesajı</label>

<textarea
name="start_message"
rows="6">${settings?.start_message || ""}</textarea>

<label>Fotoğraf URL</label>

<input
name="photo_url"
value="${settings?.photo_url || ""}">

<label>Video URL</label>

<input
name="video_url"
value="${settings?.video_url || ""}">

<label>Doküman URL</label>

<input
name="document_url"
value="${settings?.document_url || ""}">

<label>Buton Yazısı</label>

<input
name="button_text"
value="${settings?.button_text || ""}">

<label>Buton Linki</label>

<input
name="button_url"
value="${settings?.button_url || ""}">

<label>Parse Mode</label>

<select name="parse_mode">

<option
value="HTML"
${settings?.parse_mode==="HTML"?"selected":""}>
HTML
</option>

<option
value="MarkdownV2"
${settings?.parse_mode==="MarkdownV2"?"selected":""}>
MarkdownV2
</option>

<option
value="None"
${settings?.parse_mode==="None"?"selected":""}>
None
</option>

</select>

</div>

<button type="submit">

💾 Ayarları Kaydet

</button>

</form>

</body>

</html>

`);

});
globalSettings.post("/global-settings", async (c) => {

  const body = await c.req.parseBody();

  const current: any = await getBotSettings(c.env.DB);

  await updateBotSettings(c.env.DB, {
    bot_name: current?.bot_name || "",
    description: current?.description || "",
    short_description: current?.short_description || "",
    start_message: String(body.start_message || ""),
    photo_url: String(body.photo_url || ""),
    video_url: String(body.video_url || ""),
    document_url: String(body.document_url || ""),
    button_text: String(body.button_text || ""),
    button_url: String(body.button_url || ""),
    reply_keyboard: current?.reply_keyboard || "",
    parse_mode: String(body.parse_mode || "HTML")
  });

  return c.redirect("/global-settings");

});

export default globalSettings;