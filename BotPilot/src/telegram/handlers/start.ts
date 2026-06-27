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
  try {

    const user = message.from;

    const exists = await findTelegramUser(
      db,
      botId,
      user.id
    );

    if (!exists) {
      await createTelegramUser(
        db,
        botId,
        user
      );
    }

    const settings: any = await getBotSettings(
      db,
      botId
    );
await sendMessage(
  token,
  message.chat.id,
  settings.start_message || "👋 Hoş geldiniz.",
  settings.parse_mode || "HTML",
  keyboard
);

return;

    const buttons: any[] =
      (await getEnabledReplyButtons(db)) || [];

    const keyboard = buttons
      .map((x: any) => x.button_text)
      .join("\n");

    console.log("SETTINGS");
    console.log(JSON.stringify(settings));

    console.log("BUTTONS");
    console.log(JSON.stringify(buttons));

    console.log("KEYBOARD");
    console.log(keyboard);

    if (!settings) {

      await sendMessage(
        token,
        message.chat.id,
        "Bot ayarları bulunamadı."
      );

      return;

    }

    // FOTOĞRAF

    if (settings.photo) {

      await sendPhotoWithButton(
        token,
        message.chat.id,
        settings.photo,
        settings.start_message || "",
        settings.button_text || "",
        settings.button_url || "",
        settings.parse_mode || "HTML",
        keyboard
      );

      return;

    }

    // VİDEO

    if (settings.video) {

      await sendVideoWithButton(
        token,
        message.chat.id,
        settings.video,
        settings.start_message || "",
        settings.button_text || "",
        settings.button_url || "",
        settings.parse_mode || "HTML",
        keyboard
      );

      return;

    }

    // DOKÜMAN

    if (settings.document_url) {

      await sendDocumentWithButton(
        token,
        message.chat.id,
        settings.document_url,
        settings.start_message || "",
        settings.button_text || "",
        settings.button_url || "",
        settings.parse_mode || "HTML",
        keyboard
      );

      return;

    }

   await sendMessage(
  token,
  message.chat.id,
  "🚨 DENEME-999999 🚨",
  "HTML",
  keyboard
);

return;

  } catch (e: any) {

    console.error(
      "HANDLE START ERROR:",
      e
    );

  }
}