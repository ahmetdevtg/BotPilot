import { Hono } from "hono";

import login from "./auth/login";
import dashboard from "./dashboard/dashboard";
import bots from "./bots";
import type { Env } from "./types/env";
import webhook from "./telegram/webhook";
import broadcast from "./broadcast";
import users from "./users";
import settings from "./settings";
import admin from "./admin";
import password from "./admin/password";
import globalSettings from "./global-settings";
import replyButtons from "./reply-buttons";
import { deleteSession } from "./database/sessions";

const app = new Hono<Env>();

app.route("/", login);
app.route("/", dashboard);
app.route("/", settings);
app.route("/", bots);
app.route("/", users);
app.route("/", webhook);
app.route("/", broadcast);
app.route("/", admin);
app.route("/", password);
app.route("/", globalSettings);
app.route("/", replyButtons);

// Çıkış Yap
app.get("/logout", async (c) => {
  const cookie = c.req.header("Cookie") || "";
  const match = cookie.match(/(?:^|;\\s*)session=([^;]+)/);

  if (match?.[1]) {
    try {
      await deleteSession(c.env.DB, match[1]);
    } catch (error) {
      console.error("LOGOUT SESSION DELETE ERROR", error);
    }
  }

  c.header(
    "Set-Cookie",
    "session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
  );

  return c.redirect("/login");
});

// Ana Sayfa
app.get("/", (c) => c.redirect("/login"));

export default app; 