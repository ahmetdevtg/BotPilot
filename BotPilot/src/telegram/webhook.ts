import { Hono } from "hono";
import type { Env } from "../types/env";
import { handleUpdate } from "./update";

const webhook = new Hono<Env>();

webhook.post("/webhook/:botId", async (c) => {

  console.log("WEBHOOK CALLED");

  try {

    const botId = Number(c.req.param("botId"));

    const update = await c.req.json();

    console.log("UPDATE:", JSON.stringify(update));

    const bot = await c.env.DB
      .prepare("SELECT * FROM bots WHERE telegram_id=?")
      .bind(botId)
      .first();

    if (!bot) {
      console.log("BOT NOT FOUND");
      return c.text("Bot bulunamadı.", 404);
    }

    console.log("BOT FOUND:", (bot as any).name);

    console.log("BEFORE HANDLE UPDATE");

    await handleUpdate(
      c.env.DB,
      String((bot as any).token),
      botId,
      update
    );

    console.log("AFTER HANDLE UPDATE");

    return c.text("OK");

  } catch (e: any) {

    console.error("WEBHOOK ERROR");
    console.error(e);
    console.error(e?.stack);

    return c.text(e?.message || "Worker Error", 500);

  }

});

export default webhook;