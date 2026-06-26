import { Hono } from "hono";
import { auth } from "../middleware/auth";
import {
  getUsers,
  createUser,
  deleteUser
} from "../database/users";
import { hashPassword } from "../auth/password";

import type { Env } from "../types/env";

const admin = new Hono<Env>();

admin.use("*", auth);

admin.get("/admin", async (c) => {

  const users = await getUsers(c.env.DB);

  let rows = "";

  for (const user of users as any[]) {

    rows += `
<tr>
<td>${user.id}</td>
<td>${user.username}</td>
<td>
<form method="POST" action="/admin/delete/${user.id}">
<button class="delete">
Sil
</button>
</form>
</td>
</tr>
`;

  }

  if (rows === "") {

    rows = `
<tr>
<td colspan="3">
Henüz admin yok.
</td>
</tr>
`;

  }