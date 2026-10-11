import type { Context, Next } from "hono";
import { getSession } from "../database/sessions";
import type { Env } from "../types/env";

export async function auth(c: Context<Env>, next: Next) {
  // Webhook'lar giriş istemez.
  if (c.req.path.startsWith("/webhook")) {
    await next();
    return;
  }

  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/(?:^|;\\s*)session=([^;]+)/);

  if (!match?.[1]) {
    return c.redirect("/login");
  }

  const session = await getSession(c.env.DB, match[1]);
  if (!session) {
    return c.redirect("/login");
  }

  const user = await c.env.DB
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind((session as any).user_id)
    .first<Record<string, any>>();

  if (!user) {
    return c.redirect("/login");
  }

  c.set("user", user);
  await next();
}
