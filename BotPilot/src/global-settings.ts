import { Hono } from "hono";
import { auth } from "./middleware/auth";
import type { Env } from "./types/env";

import { getBots } from "./database/bots";

import {
  getBotSettings,
  updateBotSettings
} from "./database/bot-settings";

import {
  setMyName,
  setMyDescription,
  setMyShortDescription
} from "./telegram/api";

const globalSettings = new Hono<Env>();

globalSettings.use("*", auth);

globalSettings.get("/global-settings", async (c) => {

  const settings: any = await getBotSettings(c.env.DB);

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Genel Bot Ayarları</title>

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
margin-bottom:20px;
padding:10px 18px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
}

.card{
background:#1e293b;
padding:20px;
border-radius:12px;
margin-bottom:25px;
}

.card h2{
margin-bottom:20px;
}

input,
textarea,
select{
width:100%;
padding:12px;
border:none;
border-radius:8px;
margin-top:8px;
margin-bottom:18px;
background:#0f172a;
color:white;
}

button{
padding:14px 24px;
background:#2563eb;
color:white;
border:none;
border-radius:8px;
cursor:pointer;
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
⚙ Genel Bot Ayarları
</h1>

<form method="POST" action="/global-settings">

<div class="card">

<h2>🤖 Bot Profili</h2>

<label>Bot Adı</label>

<input
name="bot_name"
value="${settings?.bot_name || ""}">

<label>Açıklama</label>

<textarea
name="description"
rows="4">${settings?.description || ""}</textarea>

<label>Kısa Açıklama</label>

<textarea
name="short_description"
rows="2">${settings?.short_description || ""}</textarea>

</div>

<div class="card">

<h2>🚀 /start Ayarları</h2>

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

</div>

<div class="card">

<h2>🔗 Başlangıç Butonu</h2>

<label>Buton Yazısı</label>

<input
name="button_text"
value="${settings?.button_text || ""}">

<label>Buton Linki</label>

<input
name="button_url"
value="${settings?.button_url || ""}">

</div>

<div class="card">

<h2>⚙ Parse Mode</h2>

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
💾 Kaydet
</button>

<button
type="submit"
formaction="/global-settings/apply"
style="margin-left:10px;background:#16a34a;">
🚀 Tüm Botlara Uygula
</button>

</form>

</body>

</html>

`);

});
globalSettings.post("/global-settings", async (c) => {

  const body = await c.req.parseBody();

  await updateBotSettings(c.env.DB, {
    bot_name: String(body.bot_name || ""),
    description: String(body.description || ""),
    short_description: String(body.short_description || ""),
    start_message: String(body.start_message || ""),
    photo_url: String(body.photo_url || ""),
    video_url: String(body.video_url || ""),
    document_url: String(body.document_url || ""),
    button_text: String(body.button_text || ""),
    button_url: String(body.button_url || ""),
    reply_keyboard: "",
    parse_mode: String(body.parse_mode || "HTML")
  });

  return c.redirect("/global-settings");

});

globalSettings.post("/global-settings/apply", async (c) => {

  const settings: any = await getBotSettings(c.env.DB);
  const bots: any[] = await getBots(c.env.DB);

  let success = 0;
  let failed = 0;

  for (const bot of bots) {

    try {

      await setMyName(
        bot.token,
        settings.bot_name || ""
      );

      await setMyDescription(
        bot.token,
        settings.description || ""
      );

      await setMyShortDescription(
        bot.token,
        settings.short_description || ""
      );

      success++;

    } catch (e: any) {

      failed++;

      return c.html(`
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<title>Hata</title>
</head>
<body style="background:#0f172a;color:white;font-family:Arial;padding:40px;">

<h2>Telegram API Hatası</h2>

<p><b>Bot:</b> ${bot.name}</p>

<pre>${e.message}</pre>

<br>

<a href="/global-settings" style="color:#60a5fa;">
← Geri Dön
</a>

</body>
</html>
`);

    }

  }

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>İşlem Tamamlandı</title>

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
max-width:500px;
margin:auto;
text-align:center;
}

a{
display:inline-block;
margin-top:20px;
padding:12px 20px;
background:#2563eb;
color:white;
text-decoration:none;
border-radius:8px;
font-weight:bold;
}

</style>

</head>

<body>

<div class="card">

<h2>✅ İşlem Tamamlandı</h2>

<p>Başarılı: ${success}</p>

<p>Başarısız: ${failed}</p>

<a href="/global-settings">

← Genel Ayarlara Dön

</a>

</div>

</body>

</html>

`);

});

export default globalSettings;