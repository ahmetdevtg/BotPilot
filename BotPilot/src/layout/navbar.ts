export function navbar() {

  return `

<div class="navbar">

<a href="/dashboard">🏠 Dashboard</a>

<a href="/bots">🤖 Botlar</a>

<a href="/users">👥 Kullanıcılar</a>

<a href="/broadcast">📢 Broadcast</a>

<a href="/settings">⚙️ Ayarlar</a>

<a href="/admin">👤 Admin</a>

<a href="/login">🚪 Çıkış</a>

</div>

<style>

.navbar{

display:flex;

gap:12px;

flex-wrap:wrap;

background:#111827;

padding:15px;

border-radius:10px;

margin-bottom:25px;

}

.navbar a{

color:white;

text-decoration:none;

padding:10px 16px;

background:#1e293b;

border-radius:8px;

transition:.2s;

}

.navbar a:hover{

background:#2563eb;

}

</style>

`;

}