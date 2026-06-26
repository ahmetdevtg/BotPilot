export async function getTelegramUsers(
  db: D1Database
) {

  const { results } = await db
    .prepare(`
      SELECT *
      FROM telegram_users
      ORDER BY id DESC
    `)
    .all();

  return results;

}

export async function getTelegramUsersByBot(
  db: D1Database,
  botId: number
) {

  const { results } = await db
    .prepare(`
      SELECT *
      FROM telegram_users
      WHERE bot_id=?
      ORDER BY id DESC
    `)
    .bind(botId)
    .all();

  return results;

}

export async function countTelegramUsers(
  db: D1Database
) {

  const result = await db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM telegram_users
    `)
    .first();

  return Number((result as any)?.total || 0);

}

export async function findTelegramUser(
  db: D1Database,
  botId: number,
  telegramId: number
) {

  return await db
    .prepare(`
      SELECT *
      FROM telegram_users
      WHERE bot_id=?
      AND telegram_id=?
    `)
    .bind(botId, telegramId)
    .first();

}

export async function createTelegramUser(
  db: D1Database,
  botId: number,
  user: any
) {

  return await db
    .prepare(`
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

export async function deleteTelegramUser(
  db: D1Database,
  telegramId: number
) {

  return await db
    .prepare(`
      DELETE
      FROM telegram_users
      WHERE telegram_id=?
    `)
    .bind(telegramId)
    .run();

}