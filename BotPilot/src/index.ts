import { Hono } from "hono";

import login from "./auth/login";
import dashboard from "./dashboard/dashboard";
import bots from "./bots";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{
  Bindings: Bindings;
}>();

app.route("/", login);
app.route("/", dashboard);
app.route("/", bots);

app.get("/", (c) => c.redirect("/login"));

export default app;