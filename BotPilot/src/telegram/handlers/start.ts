
import { getBotSettings } from "../../database/settings";
import { getEnabledReplyButtons } from "../../database/reply-buttons";
import {
  sendMessage,
  sendPhotoWithButton,
  sendVideoWithButton,
  sendDocumentWithButton
} from "../send";
import {
  findTelegramUser,
  createTelegramUser
} from "../../database/telegram-users";

export async function handleStart(
  db: D1Database,
  token: string,
  botId: number,
  message: any
) {
  const user = message?.from;
  const chatId = message?.chat?.id;

  if (!user?.id || !chatId) {
    console.error("START: Kullanıcı veya sohbet bilgisi eksik", { botId });
    return;
  }

  try {
    const exists = await findTelegramUser(db, botId, Number(user.id));

    if (!exists) {
      await createTelegramUser(db, botId, user);
    } else {
      await db.prepare(
        "UPDATE telegram_users SET username = ?, first_name = ?, last_name = ? WHERE bot_id = ? AND telegram_id = ?"
      ).bind(
        user.username || "",
        user.first_name || "",
        user.last_name || "",
        Number(botId),
        Number(user.id)
      ).run();
    }

    console.log("TELEGRAM USER SAVE OK", {
      botId,
      telegramUserId: user.id
    });
  } catch (e: any) {
    console.error("TELEGRAM USER SAVE ERROR", {
      botId,
      telegramUserId: user.id,
      error: e?.message || String(e)
    });
  }

  try {
    const settings: any = await getBotSettings(db, botId);

    if (!settings) {
      await sendMessage(token, chatId, "Bot ayarları bulunamadı.");
      return;
    }

    const buttons: any[] = await getEnabledReplyButtons(db) || [];
    const keyboard = buttons
      .map((item: any) => String(item.button_text || "").trim())
      .filter(Boolean)
      .join("\n");

    let result: any;

    if (settings.photo && String(settings.photo).trim()) {
      result = await sendPhotoWithButton(
        token, chatId, settings.photo,
        settings.start_message || "",
        settings.button_text || "",
        settings.button_url || "",
        settings.parse_mode || "HTML",
        keyboard
      );
    } else if (settings.video && String(settings.video).trim()) {
      result = await sendVideoWithButton(
        token, chatId, settings.video,
        settings.start_message || "",
        settings.button_text || "",
        settings.button_url || "",
        settings.parse_mode || "HTML",
        keyboard
      );
    } else if (settings.document_url && String(settings.document_url).trim()) {
      result = await sendDocumentWithButton(
        token, chatId, settings.document_url,
        settings.start_message || "",
        settings.button_text || "",
        settings.button_url || "",
        settings.parse_mode || "HTML",
        keyboard
      );
    } else {
      result = await sendMessage(
        token, chatId,
        settings.start_message || "👋 Hoş geldiniz.",
        settings.parse_mode || "HTML",
        keyboard
      );
    }

    if (result?.ok === false) {
      console.error("START MESSAGE TELEGRAM API ERROR", {
        botId,
        errorCode: result.error_code,
        description: result.description
      });
    }
  } catch (e: any) {
    console.error("HANDLE START MESSAGE ERROR", {
      botId,
      error: e?.message || String(e)
    });
  }
}
