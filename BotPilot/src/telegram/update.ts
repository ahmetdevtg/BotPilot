import { handleStart } from "./handlers/start";

export async function handleUpdate(
  db: D1Database,
  token: string,
  botId: number,
  update: any
) {

  if (!update.message) {
    return;
  }

  const text = update.message.text || "";

  if (text === "/start") {

    await handleStart(
      db,
      token,
      botId,
      update.message
    );

  }

}