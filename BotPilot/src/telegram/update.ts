import { getReplyButton } from "../database/reply-buttons";
import { handleStart } from "./handlers/start";
import { sendMessage } from "./send";

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
const reply: any = await getReplyButton(db, text);

if (reply) {

  await sendMessage(
    token,
    update.message.chat.id,
    reply.message || ""
  );

  return;

}

  if (text === "/start") {

    await handleStart(
      db,
      token,
      botId,
      update.message
    );

  }
if (text === "📢 Kanal") {
  await sendMessage(
    token,
    update.message.chat.id,
    "Kanalımız:\nhttps://t.me/kanaliniz"
  );
  return;
}

if (text === "👤 Profil") {
  await sendMessage(
    token,
    update.message.chat.id,
    `ID: ${update.message.from.id}\nAd: ${update.message.from.first_name}`
  );
  return;
}

if (text === "ℹ️ Yardım") {
  await sendMessage(
    token,
    update.message.chat.id,
    "Yardım menüsü yakında eklenecek."
  );
  return;
}

}