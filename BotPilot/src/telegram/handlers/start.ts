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

  await sendMessage(
    token,
    message.chat.id,
    "👋 BotPilot'a hoş geldiniz."
  );

}