import { Hono } from "hono";

import login from "./auth/login";
import dashboard from "./dashboard/dashboard";
import bots from "./bots";

const app = new Hono();

app.route("/", login);
app.route("/", dashboard);
app.route("/", bots);

app.get("/", (c) => c.redirect("/login"));

export default app;