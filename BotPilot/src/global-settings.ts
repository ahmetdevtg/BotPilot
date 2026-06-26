import { Hono } from "hono";
import { auth } from "./middleware/auth";
import type { Env } from "./types/env";

const globalSettings = new Hono<Env>();

globalSettings.use("*", auth);

globalSettings.get("/global-settings", async (c) => {
  return c.html(`
    <h1>⚙ Genel Bot Ayarları</h1>
    <p>İlk test başarılı.</p>
  `);
});

export default globalSettings;