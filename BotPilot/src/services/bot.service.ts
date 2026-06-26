import {
  createBot,
  getBotByTelegramId
} from "../database/bots";

import { getMe } from "../telegram/api";
import { setWebhook } from "../telegram/api";

export async function addBot(
  db: D1Database,
  token: string
) {

  const me: any = await getMe(token);

  if (!me.ok) {
    throw new Error("Bot Token geçersiz.");
  }

  const exists = await getBotByTelegramId(
    db,
    me.result.id
  );

  if (exists) {
    throw new Error("Bu bot zaten eklenmiş.");
  }

  await createBot(
    db,
    me.result.first_name,
    me.result.username,
    token,
    me.result.id
  );
  await setWebhook(
    token,
    "https://botpilot.yrdahmets.workers.dev/webhook/" + me.result.id
);

  return me.result;

}