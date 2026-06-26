import { Hono } from "hono";
import type { Env } from "../types/env";
import { handleUpdate } from "./update";

const webhook = new Hono<Env>();

webhook.post("/webhook/:botId", async (c) => {

  const botId = Number(c.req.param("botId"));

  const update = await c.req.json();

  const bot = await c.env.DB
    .prepare(
      "SELECT * FROM bots WHERE telegram_id=?"
    )
    .bind(botId)
    .first();

  if (!bot) {
    return c.text("Bot bulunamadı.", 404);
  }

  await handleUpdate(
    c.env.DB,
    String((bot as any).token),
    botId,
    update
  );

  return c.text("OK");

});

export default webhook;