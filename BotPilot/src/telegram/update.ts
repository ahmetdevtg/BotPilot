import { getReplyButton } from "../database/reply-buttons";
import { handleStart } from "./handlers/start";
import { handleReplyButton } from "./handlers/reply-button";
import { sendMessage } from "./send";

export async function handleUpdate(db: D1Database, token: string, botId: number, update: any) {
  const message = update?.message;
  if (!message?.chat?.id) return;

  const text = String(message.text || "").trim();

  try {
    if (/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+.*)?$/i.test(text)) {
      await handleStart(db, token, botId, message);
      return;
    }

    if (await handleReplyButton(db, token, message)) return;

    const reply: any = await getReplyButton(db, text);
    if (reply) {
      await sendMessage(token, message.chat.id, reply.message || "", reply.parse_mode || "HTML", reply.reply_keyboard || "");
      return;
    }

    if (text === "📢 Kanal") {
      await sendMessage(token, message.chat.id, "Kanalımız:\nhttps://t.me/kanaliniz");
      return;
    }

    if (text === "👤 Profil") {
      await sendMessage(token, message.chat.id, "ID: " + String(message.from?.id || "") + "\nAd: " + String(message.from?.first_name || ""));
      return;
    }

    if (text === "ℹ️ Yardım") {
      await sendMessage(token, message.chat.id, "Yardım menüsü yakında eklenecek.");
    }
  } catch (error: any) {
    console.error("HANDLE UPDATE ERROR", {
      botId,
      updateId: update?.update_id,
      error: error?.message || String(error),
      stack: error?.stack
    });
  }
}
