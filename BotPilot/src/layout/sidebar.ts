export function sidebar() {
  return `

<style>

.sidebar{
width:250px;
background:#111827;
padding:25px;
min-height:100vh;
}

.logo{
font-size:28px;
font-weight:bold;
margin-bottom:35px;
}

.menu{
display:flex;
flex-direction:column;
gap:12px;
}

.menu a{
color:#cbd5e1;
text-decoration:none;
padding:12px;
border-radius:8px;
transition:.2s;
}

.menu a:hover{
background:#2563eb;
}

</style>

<div class="sidebar">

<div class="logo">
🚀 BotPilot
</div>

<div class="menu">

<a href="/dashboard">🏠 Dashboard</a>

<a href="/bots">🤖 Botlar</a>

<a href="/users">👥 Kullanıcılar</a>

<a href="/broadcast">📢 Broadcast</a>

<a href="/settings">⚙️ Ayarlar</a>

<a href="/admin">👤 Admin</a>

</div>

</div>

`;
}