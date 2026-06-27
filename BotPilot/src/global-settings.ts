import { Hono } from "hono";
import { auth } from "./middleware/auth";
import type { Env } from "./types/env";

const globalSettings = new Hono<Env>();

globalSettings.use("*", auth);
/*
|--------------------------------------------------------------------------
| GLOBAL START AYARLARI
|--------------------------------------------------------------------------
*/

globalSettings.get("/global-settings", async (c) => {

  const settings: any = await c.env.DB
    .prepare(`
      SELECT *
      FROM bot_settings
      ORDER BY id ASC
      LIMIT 1
    `)
    .first();

  return c.html(`
<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Global Start Ayarları</title>

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
margin-bottom:25px;
}

.card{
background:#1e293b;
padding:25px;
border-radius:12px;
max-width:900px;
margin:auto;
}

h1{
margin-bottom:25px;
}

label{
display:block;
margin-top:15px;
margin-bottom:8px;
font-weight:bold;
}

input,
textarea,
select{

width:100%;
padding:12px;
background:#0f172a;
color:white;
border:1px solid #334155;
border-radius:8px;
margin-bottom:18px;

}

textarea{
height:220px;
resize:vertical;
}

button{

width:100%;
padding:15px;
background:#2563eb;
color:white;
border:none;
border-radius:8px;
font-size:16px;
cursor:pointer;

}

button:hover{

background:#1d4ed8;

}

</style>

</head>

<body>

<a class="back" href="/dashboard">

🏠 Anasayfaya Dön

</a>

<div class="card">

<h1>🚀 Global Start Ayarları</h1>

<form method="POST" action="/global-settings">

<label>Başlangıç Mesajı</label>

<textarea
name="start_message">${settings?.start_message || ""}</textarea>

<label>Fotoğraf URL</label>

<input
type="text"
name="photo"
value="${settings?.photo || ""}">

<label>Video URL</label>

<input
type="text"
name="video"
value="${settings?.video || ""}">

<label>Doküman URL</label>

<input
type="text"
name="document_url"
value="${settings?.document_url || ""}">

<label>Inline Buton Yazısı</label>

<input
type="text"
name="button_text"
value="${settings?.button_text || ""}">

<label>Inline Buton Linki</label>

<input
type="text"
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

<button type="submit">

💾 Tüm Botlara Kaydet

</button>

</form>

</div>

</body>

</html>

`);
/*
|--------------------------------------------------------------------------
| GLOBAL AYARLARI KAYDET
|--------------------------------------------------------------------------
*/

globalSettings.post("/global-settings", async (c) => {

  try {

    const body = await c.req.parseBody();

    const bots: any[] = await c.env.DB
      .prepare(`
        SELECT telegram_id
        FROM bots
      `)
      .all()
      .then((r: any) => r.results);

    for (const bot of bots) {

      await c.env.DB
        .prepare(`
          UPDATE bot_settings
          SET
            start_message=?,
            photo=?,
            video=?,
            document_url=?,
            button_text=?,
            button_url=?,
            parse_mode=?,
            updated_at=CURRENT_TIMESTAMP
          WHERE bot_id=?
        `)
        .bind(
          String(body.start_message || ""),
          String(body.photo || ""),
          String(body.video || ""),
          String(body.document_url || ""),
          String(body.button_text || ""),
          String(body.button_url || ""),
          String(body.parse_mode || "HTML"),
          bot.telegram_id
        )
        .run();

    }

    return c.redirect("/global-settings");

  } catch (e: any) {

    console.error("GLOBAL SETTINGS ERROR");
    console.error(e);
    console.error(e?.stack);

    return c.text(
      e?.message || "Kayıt sırasında hata oluştu.",
      500
    );

  }

});

export default globalSettings;