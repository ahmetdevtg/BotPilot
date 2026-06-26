import { Context, Next } from "hono";
import { getSession } from "../database/sessions";

export async function auth(
  c: Context,
  next: Next
) {

  // Webhook'lar giriş istemez
  if (c.req.path.startsWith("/webhook")) {
    return await next();
  }

  const cookie = c.req.header("Cookie") || "";

  const match = cookie.match(/session=([^;]+)/);

  if (!match) {
    return c.redirect("/login");
  }

  const session = await getSession(
    (c.env as any).DB,
    match[1]
  );

  if (!session) {
    return c.redirect("/login");
  }

  const user = await (c.env as any).DB
    .prepare(`
      SELECT *
      FROM users
      WHERE id=?
    `)
    .bind((session as any).user_id)
    .first();

  if (!user) {
    return c.redirect("/login");
  }

  c.set("user", user);

  await next();

}