import { Hono } from "hono";
import { auth } from "./middleware/auth";
import type { Env } from "./types/env";
import { getReplyButtons } from "./database/reply-buttons";

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

<a class="btn" href="/dashboard">
← Dashboard
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

export default replyButtons;