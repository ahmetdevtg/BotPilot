import { getReplyButton } from "../database/reply-buttons";
import { handleStart } from "./handlers/start";
import { handleReplyButton } from "./handlers/reply-button";
import { sendMessage } from "./send";

export async function handleUpdate(
  db: D1Database,
  token: string,
  botId: number,
  update: any
) {
  try {
    if (!update?.message) {
      return;
    }

    const message = update.message;
    const text = message.text || "";

    // /start
    if (text === "/start") {
      await handleStart(
        db,
        token,
        botId,
        message
      );
      return;
    }

    // Reply Button Handler
    const handled = await handleReplyButton(
      db,
      token,
      message
    );

    if (handled) {
      return;
    }

    // Veritabanındaki cevap
    const reply: any = await getReplyButton(
      db,
      text
    );

    if (reply) {
      await sendMessage(
        token,
        message.chat.id,
        reply.message || "",
        reply.parse_mode || "HTML",
        reply.reply_keyboard || ""
      );
      return;
    }

    // Sabit menüler
    if (text === "📢 Kanal") {
      await sendMessage(
        token,
        message.chat.id,
        "Kanalımız:\nhttps://t.me/kanaliniz"
      );
      return;
    }

    if (text === "👤 Profil") {
      await sendMessage(
        token,
        message.chat.id,
        `ID: ${message.from.id}\nAd: ${message.from.first_name}`
      );
      return;
    }

    if (text === "ℹ️ Yardım") {
      await sendMessage(
        token,
        message.chat.id,
        "Yardım menüsü yakında eklenecek."
      );
      return;
    }

  } catch (e: any) {

    console.error("HANDLE UPDATE ERROR");
    console.error(e);

    try {

      if (update?.message?.chat?.id) {
        await sendMessage(
          token,
          update.message.chat.id,
          "❌ Bir hata oluştu."
        );
      }

    } catch (err) {
      console.error(err);
    }
}