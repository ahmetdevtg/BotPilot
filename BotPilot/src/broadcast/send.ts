import {
  sendText,
  sendPhoto,
  sendVideo,
  sendDocument,
  sendPhotoWithButton,
  sendVideoWithButton,
  sendDocumentWithButton,
  sendMessageWithButton
} from "../telegram/api";

export interface BroadcastOptions {
  message: string;
  photo?: string;
  video?: string;
  document?: string;
  parseMode?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export async function sendBroadcast(
  db: D1Database,
  token: string,
  botId: number,
  options: BroadcastOptions
) {

  const { results } = await db
    .prepare(`
      SELECT telegram_id
      FROM telegram_users
      WHERE bot_id=?
    `)
    .bind(botId)
    .all();

  let success = 0;
  let failed = 0;

  for (const user of results as any[]) {

    try {

      if (
  options.photo &&
  options.buttonText &&
  options.buttonUrl
) {

  await sendPhotoWithButton(
    token,
    user.telegram_id,
    options.photo,
    options.message,
    options.buttonText,
    options.buttonUrl,
    options.parseMode || "HTML"
  );

} else if (
  options.video &&
  options.buttonText &&
  options.buttonUrl
) {

  await sendVideoWithButton(
    token,
    user.telegram_id,
    options.video,
    options.message,
    options.buttonText,
    options.buttonUrl,
    options.parseMode || "HTML"
  );

} else if (
  options.document &&
  options.buttonText &&
  options.buttonUrl
) {

  await sendDocumentWithButton(
    token,
    user.telegram_id,
    options.document,
    options.message,
    options.buttonText,
    options.buttonUrl,
    options.parseMode || "HTML"
  );

} else if (
  options.buttonText &&
  options.buttonUrl
) {

  await sendMessageWithButton(
    token,
    user.telegram_id,
    options.message,
    options.buttonText,
    options.buttonUrl,
    options.parseMode || "HTML"
  );

} else if (options.photo) {

  await sendPhoto(
    token,
    user.telegram_id,
    options.photo,
    options.message,
    options.parseMode || "HTML"
  );

} else if (options.video) {

  await sendVideo(
    token,
    user.telegram_id,
    options.video,
    options.message,
    options.parseMode || "HTML"
  );

} else if (options.document) {

  await sendDocument(
    token,
    user.telegram_id,
    options.document,
    options.message,
    options.parseMode || "HTML"
  );

} else {

  await sendText(
    token,
    user.telegram_id,
    options.message,
    options.parseMode || "HTML"
  );

}

      success++;

    } catch (e) {

  console.log("Broadcast Error:", e);

  failed++;

}

  }

  return {
    success,
    failed
  };

}

export async function sendBroadcastAllBots(
  db: D1Database,
  options: BroadcastOptions
) {

  const { results } = await db
    .prepare(`
      SELECT *
      FROM bots
      WHERE status=1
    `)
    .all();

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const bot of results as any[]) {

    const result = await sendBroadcast(
      db,
      bot.token,
      bot.telegram_id,
      options
    );

    totalSuccess += result.success;
    totalFailed += result.failed;

  }

  return {
    success: totalSuccess,
    failed: totalFailed
  };

}