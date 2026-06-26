export async function getBotSettings(
  db: D1Database
) {

  return await db
    .prepare(`
      SELECT *
      FROM bot_settings
      WHERE id=1
    `)
    .first();

}