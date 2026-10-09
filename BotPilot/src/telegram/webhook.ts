
import { Hono } from "hono";
import type { Env } from "../types/env";
import { handleUpdate } from "./update";

const webhook = new Hono<Env>();

webhook.post("/webhook/:botId", async (c) => {
  let botId = 0;
  let update: any;

  try {
    botId = Number(c.req.param("botId"));

    if (!Number.isSafeInteger(botId) || botId <= 0) {
      return c.text("Geçersiz bot ID.", 400);
    }

    update = await c.req.json();

    const bot = await c.env.DB
      .prepare("SELECT * FROM bots WHERE telegram_id = ?")
      .bind(botId)
      .first() as any;

    if (!bot) {
      console.error("WEBHOOK BOT NOT FOUND", {
        botId,
        updateId: update?.update_id
      });

      return c.text("Bot bulunamadı.", 404);
    }

    console.log("WEBHOOK RECEIVED", {
      botId,
      updateId: update?.update_id,
      messageText: update?.message?.text || "",
      telegramUserId: update?.message?.from?.id
    });

    await handleUpdate(
      c.env.DB,
      String(bot.token),
      botId,
      update
    );

    return c.text("OK");
  } catch (e: any) {
    console.error("WEBHOOK ERROR", {
      botId,
      updateId: update?.update_id,
      error: e?.message || String(e),
      stack: e?.stack
    });

    return c.text("Webhook error", 500);
  }
});

export default webhook;
