import { sendMessage } from "../telegram/send";

export async function sendBroadcast(
  db: D1Database,
  token: string,
  botId: number,
  message: string
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

      const res: any = await sendMessage(
        token,
        user.telegram_id,
        message
      );

      if (res.ok) {
        success++;
      } else {
        failed++;
      }

    } catch {

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
  message: string
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
      message
    );

    totalSuccess += result.success;
    totalFailed += result.failed;

  }

  return {

    success: totalSuccess,

    failed: totalFailed

  };

}