import { getBotSettings } from "../../database/bot-settings";
import {
  sendMessage,
  sendPhotoWithButton,
  sendVideoWithButton
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


  // Fotoğraf + Buton
  if (
    settings.photo &&
    settings.button_text &&
    settings.button_url
  ) {

    await sendPhotoWithButton(
      token,
      message.chat.id,
      settings.photo,
      settings.start_message || "",
      settings.button_text,
      settings.button_url
    );

    return;

  }

  // Video + Buton
  if (
    settings.video &&
    settings.button_text &&
    settings.button_url
  ) {

    await sendVideoWithButton(
      token,
      message.chat.id,
      settings.video,
      settings.start_message || "",
      settings.button_text,
      settings.button_url
    );

    return;

  }

  // Normal Mesaj
  await sendMessage(
    token,
    message.chat.id,
    settings.start_message ||
      "👋 BotPilot'a hoş geldiniz."
  );

}