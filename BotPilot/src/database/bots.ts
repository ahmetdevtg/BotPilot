export async function getBots(
  db: D1Database
) {

  const { results } = await db
    .prepare(`
      SELECT
        b.*,

        (
          SELECT COUNT(*)
          FROM telegram_users
          WHERE bot_id = b.telegram_id
        ) AS users,

        (
          SELECT COUNT(*)
          FROM broadcasts
          WHERE bot_id = b.telegram_id
        ) AS broadcasts

      FROM bots b

      ORDER BY b.id DESC
    `)
    .all();

  return results;

}

export async function getBotByTelegramId(
  db: D1Database,
  telegramId: number
) {

  return await db
    .prepare(`
      SELECT *
      FROM bots
      WHERE telegram_id=?
    `)
    .bind(telegramId)
    .first();

}

export async function createBot(
  db: D1Database,
  name: string,
  username: string,
  token: string,
  telegramId: number
) {

  return await db
    .prepare(`
      INSERT INTO bots
      (
        name,
        username,
        token,
        telegram_id,
        status
      )
      VALUES(?,?,?,?,1)
    `)
    .bind(
      name,
      username,
      token,
      telegramId
    )
    .run();

}

export async function deleteBot(
  db: D1Database,
  id: number
) {

  const bot: any = await db
    .prepare(`
      SELECT telegram_id
      FROM bots
      WHERE id=?
    `)
    .bind(id)
    .first();

  if (!bot) {
    return;
  }

  await db
    .prepare(`
      DELETE FROM telegram_users
      WHERE bot_id=?
    `)
    .bind(bot.telegram_id)
    .run();

  await db
    .prepare(`
      DELETE FROM bot_settings
      WHERE bot_id=?
    `)
    .bind(bot.telegram_id)
    .run();

  await db
    .prepare(`
      DELETE FROM broadcasts
      WHERE bot_id=?
    `)
    .bind(bot.telegram_id)
    .run();

  return await db
    .prepare(`
      DELETE FROM bots
      WHERE id=?
    `)
    .bind(id)
    .run();

}

export async function getBotById(
  db: D1Database,
  id: number
) {

  return await db
    .prepare(`
      SELECT *
      FROM bots
      WHERE id=?
    `)
    .bind(id)
    .first();

}
export async function updateBot(
  db: D1Database,
  id: number,
  name: string
) {

  return await db
    .prepare(`
      UPDATE bots
      SET
        name=?
      WHERE id=?
    `)
    .bind(
      name,
      id
    )
    .run();

}

export async function updateBotStatus(
  db: D1Database,
  id: number,
  status: number
) {

  return await db
    .prepare(`
      UPDATE bots
      SET
        status=?
      WHERE id=?
    `)
    .bind(
      status,
      id
    )
    .run();

}

export async function updateBotProfile(
  db: D1Database,
  id: number,
  name: string,
  description: string,
  shortDescription: string
) {

  return await db
    .prepare(`
      UPDATE bots
      SET
        name=?,
        description=?,
        short_description=?
      WHERE id=?
    `)
    .bind(
      name,
      description,
      shortDescription,
      id
    )
    .run();

}

export async function getBotStats(
  db: D1Database,
  telegramId: number
) {

  const users = await db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM telegram_users
      WHERE bot_id=?
    `)
    .bind(telegramId)
    .first();

  const broadcasts = await db
    .prepare(`
      SELECT COUNT(*) AS total
      FROM broadcasts
      WHERE bot_id=?
    `)
    .bind(telegramId)
    .first();

  return {

    users: Number((users as any)?.total || 0),

    broadcasts: Number((broadcasts as any)?.total || 0)

  };

}