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

const app = new Hono<Env>();

app.route("/", login);
app.route("/", dashboard);
app.route("/", settings);
app.route("/", bots);
app.route("/", users);
app.route("/", webhook);
app.route("/", broadcast);
app.route("/", admin);

app.get("/", (c) => c.redirect("/login"));

export default app;