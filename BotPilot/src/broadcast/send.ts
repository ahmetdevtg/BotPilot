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