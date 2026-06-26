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

table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

td,th{
border:1px solid #334155;
padding:12px;
}

a{
color:#60a5fa;
text-decoration:none;
}

.btn{
display:inline-block;
padding:12px 20px;
background:#2563eb;
color:white;
border-radius:8px;
text-decoration:none;
margin-bottom:20px;
}

</style>

</head>

<body>

<h1>⌨ Reply Keyboard</h1>
<a class="btn" href="/dashboard" class="back">
🏠 Anasayfaya Dön
</a>
<a class="btn" href="/reply-buttons/new">
➕ Yeni Buton
</a>


<table>

<tr>

<th>ID</th>

<th>Buton</th>

<th>Tür</th>

</tr>

${buttons.map((x:any)=>`

<tr>

<td>${x.id}</td>

<td>${x.button_text}</td>

<td>${x.response_type}</td>

</tr>

`).join("")}

</table>

</body>

</html>
`);

});
replyButtons.get("/reply-buttons/new", async (c) => {

return c.html(`

<!DOCTYPE html>

<html>

<head>

<title>Yeni Buton</title>

<style>

body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

input,
textarea,
select{

width:100%;
padding:12px;
margin-top:10px;
margin-bottom:20px;
background:#1e293b;
color:white;
border:none;
border-radius:8px;

}

button{

padding:14px 25px;
background:#2563eb;
color:white;
border:none;
border-radius:8px;

}

</style>

</head>

<body>

<h1>➕ Yeni Reply Button</h1>

<form method="POST" action="/reply-buttons/new">

<label>Buton Yazısı</label>

<input name="button_text">

<label>Cevap Türü</label>

<select name="response_type">

<option value="text">Mesaj</option>

<option value="photo">Fotoğraf</option>

<option value="video">Video</option>

<option value="document">Doküman</option>

</select>

<label>Mesaj</label>

<textarea
name="message"
rows="6"></textarea>

<button>

Kaydet

</button>

</form>

</body>

</html>

`);

});
replyButtons.post("/reply-buttons/new", async (c) => {

  const body = await c.req.parseBody();

  await createReplyButton(c.env.DB, {
    button_text: String(body.button_text || ""),
    response_type: String(body.response_type || "text"),
    message: String(body.message || ""),
    photo_url: "",
    video_url: "",
    document_url: "",
    button_text_url: "",
    button_url: "",
    parse_mode: "HTML",
    reply_keyboard: "",
    sort_order: 0
  });

  return c.redirect("/reply-buttons");

});
replyButtons.get("/reply-buttons/edit/:id", async (c) => {

  const id = Number(c.req.param("id"));

  const button: any = await getReplyButtonById(
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
<title>Buton Düzenle</title>

<style>
body{
background:#0f172a;
color:white;
font-family:Arial;
padding:40px;
}

input,
textarea,
select{
width:100%;
padding:12px;
margin-top:10px;
margin-bottom:20px;
background:#1e293b;
color:white;
border:none;
border-radius:8px;
}

button{
padding:14px 24px;
background:#2563eb;
color:white;
border:none;
border-radius:8px;
}
</style>

</head>

<body>

<h1>✏️ Reply Button Düzenle</h1>

<form method="POST">

<label>Buton Yazısı</label>
<input
name="button_text"
value="${button.button_text}">

<label>Tür</label>

<select name="response_type">

<option value="text" ${button.response_type==="text"?"selected":""}>Mesaj</option>

<option value="photo" ${button.response_type==="photo"?"selected":""}>Fotoğraf</option>

<option value="video" ${button.response_type==="video"?"selected":""}>Video</option>

<option value="document" ${button.response_type==="document"?"selected":""}>Doküman</option>

</select>

<label>Mesaj</label>

<textarea
name="message"
rows="6">${button.message||""}</textarea>

<button>
💾 Kaydet
</button>

</form>

</body>

</html>
`);

});
export default replyButtons;