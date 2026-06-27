import { Hono } from "hono";
import { auth } from "./middleware/auth";
import type { Env } from "./types/env";

import {
  getReplyButtons,
  createReplyButton,
  getReplyButtonById,
  updateReplyButton,
  deleteReplyButton
} from "./database/reply-buttons";

const replyButtons = new Hono<Env>();

replyButtons.use("*", auth);

/*
|--------------------------------------------------------------------------
| LİSTE
|--------------------------------------------------------------------------
*/

replyButtons.get("/reply-buttons", async (c) => {

  const result: any = await getReplyButtons(c.env.DB);

  const buttons = result.results || [];

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Reply Keyboard</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

h1{
margin-bottom:30px;
}

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

th,td{
border:1px solid #334155;
padding:14px;
}

th{
background:#1e293b;
}

tr:hover{
background:#172033;
}

a{
text-decoration:none;
color:#60a5fa;
}

.btn{

display:inline-block;

padding:12px 20px;

background:#2563eb;

color:white;

border-radius:8px;

margin-right:10px;

margin-bottom:20px;

}

.red{

color:#ef4444;

}

</style>

</head>

<body>

<h1>⌨ Reply Keyboard Yönetimi</h1>

<a class="btn" href="/dashboard">

🏠 Dashboard

</a>

<a class="btn" href="/reply-buttons/new">

➕ Yeni Buton

</a>

<table>

<tr>

<th>ID</th>

<th>Buton</th>

<th>Tür</th>

<th>Durum</th>

<th>İşlem</th>

</tr>

${buttons.map((x:any)=>`

<tr>

<td>${x.id}</td>

<td>${x.button_text}</td>

<td>${x.response_type}</td>

<td>

${x.is_enabled ? "🟢 Aktif" : "🔴 Pasif"}

</td>

<td>

<a href="/reply-buttons/edit/${x.id}">

✏️ Düzenle

</a>

&nbsp;&nbsp;

<a

class="red"

href="/reply-buttons/delete/${x.id}"

onclick="return confirm('Silinsin mi?')">

🗑️ Sil

</a>

</td>

</tr>

`).join("")}

</table>

</body>

</html>

`);

});
/*
|--------------------------------------------------------------------------
| YENİ BUTON SAYFASI
|--------------------------------------------------------------------------
*/

replyButtons.get("/reply-buttons/new", async (c) => {

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Yeni Reply Button</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

.card{
max-width:900px;
margin:auto;
background:#1e293b;
padding:30px;
border-radius:12px;
}

input,
textarea,
select{

width:100%;

padding:12px;

margin-top:8px;

margin-bottom:20px;

background:#0f172a;

color:white;

border:1px solid #334155;

border-radius:8px;

}

textarea{

height:180px;

resize:vertical;

}

button{

width:100%;

padding:14px;

background:#2563eb;

color:white;

border:none;

border-radius:8px;

cursor:pointer;

font-size:16px;

}

</style>

</head>

<body>

<div class="card">

<h2>➕ Yeni Reply Button</h2>

<form method="POST" action="/reply-buttons/new">

<label>Buton Yazısı</label>

<input
type="text"
name="button_text"
required>

<label>Cevap Türü</label>

<select name="response_type">

<option value="text">Mesaj</option>

<option value="photo">Fotoğraf</option>

<option value="video">Video</option>

<option value="document">Doküman</option>

</select>

<label>Mesaj</label>

<textarea
name="message"></textarea>

<label>Fotoğraf URL</label>

<input
type="text"
name="photo_url">

<label>Video URL</label>

<input
type="text"
name="video_url">

<label>Doküman URL</label>

<input
type="text"
name="document_url">

<label>Inline Buton Yazısı</label>

<input
type="text"
name="button_text_url">

<label>Inline Buton Linki</label>

<input
type="text"
name="button_url">

<label>Parse Mode</label>

<select name="parse_mode">

<option value="HTML">HTML</option>

<option value="MarkdownV2">MarkdownV2</option>

<option value="None">None</option>

</select>

<label>Reply Keyboard (Her satır bir buton)</label>

<textarea
name="reply_keyboard"
placeholder="📢 Kanal
👤 Profil
ℹ️ Yardım"></textarea>

<label>Sıralama</label>

<input
type="number"
name="sort_order"
value="0">

<label>Durum</label>

<select name="is_enabled">

<option value="1">Aktif</option>

<option value="0">Pasif</option>

</select>

<button type="submit">

💾 Kaydet

</button>

</form>

</div>

</body>

</html>

`);

});
/*
|--------------------------------------------------------------------------
| YENİ BUTON KAYDET
|--------------------------------------------------------------------------
*/

replyButtons.post("/reply-buttons/new", async (c) => {

  try {

    const body = await c.req.parseBody();

    await createReplyButton(
      c.env.DB,
      {
        button_text: String(body.button_text || ""),
        response_type: String(body.response_type || "text"),
        message: String(body.message || ""),
        photo_url: String(body.photo_url || ""),
        video_url: String(body.video_url || ""),
        document_url: String(body.document_url || ""),
        button_text_url: String(body.button_text_url || ""),
        button_url: String(body.button_url || ""),
        parse_mode: String(body.parse_mode || "HTML"),
        reply_keyboard: String(body.reply_keyboard || ""),
        sort_order: Number(body.sort_order || 0),
        is_enabled: Number(body.is_enabled || 1)
      }
    );

    return c.redirect("/reply-buttons");

  } catch (e: any) {

    console.error(e);

    return c.text(
      e?.message || "Kayıt hatası",
      500
    );

  }

});
/*
|--------------------------------------------------------------------------
| DÜZENLEME SAYFASI
|--------------------------------------------------------------------------
*/

replyButtons.get("/reply-buttons/edit/:id", async (c) => {

  const id = Number(c.req.param("id"));

  const button: any =
    await getReplyButtonById(
      c.env.DB,
      id
    );

  if (!button) {
    return c.text("Buton bulunamadı.", 404);
  }

  return c.html(`

<!DOCTYPE html>

<html lang="tr">

<head>

<meta charset="UTF-8">

<title>Reply Button Düzenle</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

.card{
max-width:900px;
margin:auto;
background:#1e293b;
padding:30px;
border-radius:12px;
}

input,
textarea,
select{

width:100%;
padding:12px;
margin-top:8px;
margin-bottom:20px;

background:#0f172a;
color:white;

border:1px solid #334155;

border-radius:8px;

}

textarea{
height:180px;
resize:vertical;
}

button{

width:100%;
padding:14px;

background:#2563eb;

border:none;

border-radius:8px;

color:white;

font-size:16px;

cursor:pointer;

}

</style>

</head>

<body>

<div class="card">

<h2>✏️ Reply Button Düzenle</h2>

<form method="POST">

<label>Buton Yazısı</label>

<input
name="button_text"
value="${button.button_text || ""}">

<label>Cevap Türü</label>

<select name="response_type">

<option value="text"
${button.response_type==="text"?"selected":""}>
Mesaj
</option>

<option value="photo"
${button.response_type==="photo"?"selected":""}>
Fotoğraf
</option>

<option value="video"
${button.response_type==="video"?"selected":""}>
Video
</option>

<option value="document"
${button.response_type==="document"?"selected":""}>
Doküman
</option>

</select>

<label>Mesaj</label>

<textarea
name="message">${button.message || ""}</textarea>

<label>Fotoğraf URL</label>

<input
name="photo_url"
value="${button.photo_url || ""}">

<label>Video URL</label>

<input
name="video_url"
value="${button.video_url || ""}">

<label>Doküman URL</label>

<input
name="document_url"
value="${button.document_url || ""}">

<label>Inline Buton Yazısı</label>

<input
name="button_text_url"
value="${button.button_text_url || ""}">

<label>Inline Buton Linki</label>

<input
name="button_url"
value="${button.button_url || ""}">

<label>Parse Mode</label>

<select name="parse_mode">

<option value="HTML"
${button.parse_mode==="HTML"?"selected":""}>
HTML
</option>

<option value="MarkdownV2"
${button.parse_mode==="MarkdownV2"?"selected":""}>
MarkdownV2
</option>

<option value="None"
${button.parse_mode==="None"?"selected":""}>
None
</option>

</select>

<label>Reply Keyboard</label>

<textarea
name="reply_keyboard">${button.reply_keyboard || ""}</textarea>

<label>Sıralama</label>

<input
type="number"
name="sort_order"
value="${button.sort_order || 0}">

<label>Durum</label>

<select name="is_enabled">

<option value="1"
${button.is_enabled ? "selected" : ""}>
Aktif
</option>

<option value="0"
${!button.is_enabled ? "selected" : ""}>
Pasif
</option>

</select>

<button>

💾 Güncelle

</button>

</form>

</div>

</body>

</html>

`);

});
/*
|--------------------------------------------------------------------------
| DÜZENLEMEYİ KAYDET
|--------------------------------------------------------------------------
*/

replyButtons.post("/reply-buttons/edit/:id", async (c) => {

  try {

    const id = Number(
      c.req.param("id")
    );

    const body = await c.req.parseBody();

    await updateReplyButton(
      c.env.DB,
      id,
      {
        button_text: String(body.button_text || ""),
        response_type: String(body.response_type || "text"),
        message: String(body.message || ""),
        photo_url: String(body.photo_url || ""),
        video_url: String(body.video_url || ""),
        document_url: String(body.document_url || ""),
        button_text_url: String(body.button_text_url || ""),
        button_url: String(body.button_url || ""),
        parse_mode: String(body.parse_mode || "HTML"),
        reply_keyboard: String(body.reply_keyboard || ""),
        sort_order: Number(body.sort_order || 0),
        is_enabled: Number(body.is_enabled || 1)
      }
    );

    return c.redirect(
      "/reply-buttons"
    );

  } catch (e: any) {

    console.error(e);

    return c.text(
      e?.message || "Güncelleme hatası",
      500
    );

  }

});
/*
|--------------------------------------------------------------------------
| SİL
|--------------------------------------------------------------------------
*/

replyButtons.get("/reply-buttons/delete/:id", async (c) => {

  try {

    const id = Number(
      c.req.param("id")
    );

    await deleteReplyButton(
      c.env.DB,
      id
    );

    return c.redirect(
      "/reply-buttons"
    );

  } catch (e: any) {

    console.error(e);

    return c.text(
      e?.message || "Silme hatası",
      500
    );

  }

});

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default replyButtons; 