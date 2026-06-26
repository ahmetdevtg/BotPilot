export async function getCommands(
  db: D1Database,
  botId: number
) {
  const { results } = await db
    .prepare(`
      SELECT *
      FROM commands
      WHERE bot_id=?
      ORDER BY id DESC
    `)
    .bind(botId)
    .all();

  return results;
}

export async function createCommand(
  db: D1Database,
  data: any
) {
  return await db
    .prepare(`
      INSERT INTO commands
      (
        bot_id,
        command,
        response,
        parse_mode,
        photo,
        video,
        document_url,
        button_text,
        button_url,
        is_enabled
      )
      VALUES(?,?,?,?,?,?,?,?,?,?)
    `)
    .bind(
      data.bot_id,
      data.command,
      data.response,
      data.parse_mode,
      data.photo,
      data.video,
      data.document_url,
      data.button_text,
      data.button_url,
      data.is_enabled
    )
    .run();
}

export async function findCommand(
  db: D1Database,
  botId: number,
  command: string
) {
  return await db
    .prepare(`
      SELECT *
      FROM commands
      WHERE bot_id=?
      AND command=?
      AND is_enabled=1
      LIMIT 1
    `)
    .bind(botId, command)
    .first();
}

export async function deleteCommand(
  db: D1Database,
  id: number
) {
  return await db
    .prepare(`
      DELETE FROM commands
      WHERE id=?
    `)
    .bind(id)
    .run();
}