import { getBotSettings } from "../../database/settings";
import { sendMessage } from "../send";
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

  const settings: any = await getBotSettings(
  db,
  botId
);

if (!settings.is_enabled) {
  return;
}

const settings: any = await getBotSettings(
  db,
  botId
);

if (!settings.is_enabled) {
  return;
}

await sendMessage(
  token,
  message.chat.id,
  settings.start_message ||
    "👋 BotPilot'a hoş geldiniz."
);

}