import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="tr">
<head>

<meta charset="UTF-8">

<title>BotPilot</title>

<style>

body{

margin:0;

background:#0f172a;

color:white;

font-family:Arial;

display:flex;

justify-content:center;

align-items:center;

height:100vh;

}

.box{

text-align:center;

}

h1{

font-size:50px;

margin:0;

}

p{

opacity:.7;

}

</style>

</head>

<body>

<div class="box">

<h1>🚀 BotPilot</h1>

<p>Kurulum Başarılı</p>

</div>

</body>

</html>
`);
});

export default app;