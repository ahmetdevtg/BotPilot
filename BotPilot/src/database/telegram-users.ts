export async function findTelegramUser(
  db: D1Database,
  botId: number,
  telegramId: number
) {
  return await db
    .prepare(
      "SELECT * FROM telegram_users WHERE bot_id=? AND telegram_id=?"
    )
    .bind(botId, telegramId)
    .first();
}

export async function createTelegramUser(
  db: D1Database,
  botId: number,
  user: any
) {

  return await db.prepare(`
      INSERT INTO telegram_users
      (
        bot_id,
        telegram_id,
        username,
        first_name,
        last_name,
        language_code,
        is_premium,
        is_bot
      )
      VALUES(?,?,?,?,?,?,?,?)
  `)
  .bind(
      botId,
      user.id,
      user.username || "",
      user.first_name || "",
      user.last_name || "",
      user.language_code || "",
      user.is_premium ? 1 : 0,
      user.is_bot ? 1 : 0
  )
  .run();

}