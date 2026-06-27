import { getBotSettings } from "../../database/bot-settings";
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

  const settings: any = await getBotSettings(db);

  const buttons: any[] = await getEnabledReplyButtons(db);

  const keyboard = buttons
    .map((x: any) => x.button_text)
    .join("\n");

  // FOTOĞRAF
  if (settings.photo_url) {

    await sendPhotoWithButton(
      token,
      message.chat.id,
      settings.photo_url,
      settings.start_message || "",
      settings.button_text || "",
      settings.button_url || "",
      settings.parse_mode || "HTML",
      keyboard
    );

    return;

  }

  // VİDEO
  if (settings.video_url) {

    await sendVideoWithButton(
      token,
      message.chat.id,
      settings.video_url,
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

  // NORMAL MESAJ
  await sendMessage(
    token,
    message.chat.id,
    settings.start_message || "👋 BotPilot'a hoş geldiniz.",
    settings.parse_mode || "HTML",
    keyboard
  );

}