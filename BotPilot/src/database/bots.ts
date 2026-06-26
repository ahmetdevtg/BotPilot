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

export async function deleteBot(
  db: D1Database,
  id: number
) {
  return await db
    .prepare("DELETE FROM bots WHERE id=?")
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
      SET name=?
      WHERE id=?
    `)
    .bind(name, id)
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
      SET status=?
      WHERE id=?
    `)
    .bind(status, id)
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