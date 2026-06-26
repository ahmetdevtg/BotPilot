export async function createBroadcast(
  db: D1Database,
  botId: number,
  message: string
) {
  return await db
    .prepare(`
      INSERT INTO broadcasts
      (
        bot_id,
        message
      )
      VALUES(?,?)
    `)
    .bind(
      botId,
      message
    )
    .run();
}

export async function finishBroadcast(
  db: D1Database,
  id: number,
  success: number,
  failed: number
) {
  return await db
    .prepare(`
      UPDATE broadcasts
      SET
        success_count=?,
        failed_count=?
      WHERE id=?
    `)
    .bind(
      success,
      failed,
      id
    )
    .run();
}

export async function getBroadcasts(
  db: D1Database
) {
  const { results } = await db
    .prepare(`
      SELECT *
      FROM broadcasts
      ORDER BY id DESC
    `)
    .all();

  return results;
}