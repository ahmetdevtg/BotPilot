export async function getBots(db: D1Database) {
  const { results } = await db
    .prepare("SELECT * FROM bots ORDER BY id DESC")
    .all();

  return results;
}

export async function getBotByTelegramId(
  db: D1Database,
  telegramId: number
) {
  return await db
    .prepare("SELECT * FROM bots WHERE telegram_id=?")
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