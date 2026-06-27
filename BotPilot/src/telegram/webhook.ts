import { Hono } from "hono";
import type { Env } from "../types/env";
import { handleUpdate } from "./update";

const webhook = new Hono<Env>();

webhook.post("/webhook/:botId", async (c) => {

  try {

    const botId = Number(c.req.param("botId"));

    const update = await c.req.json();

    const bot = await c.env.DB
      .prepare("SELECT * FROM bots WHERE telegram_id=?")
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

  } catch (e: any) {

    console.error("WEBHOOK ERROR");
    console.error(e);
    console.error(e?.stack);

    return c.text(e?.message || "Worker Error", 500);

  }

});

export default webhook;