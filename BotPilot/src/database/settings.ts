export async function getBotSettings(
  db: D1Database,
  botId: number
) {

  let settings = await db
    .prepare(`
      SELECT *
      FROM bot_settings
      WHERE bot_id=?
      LIMIT 1
    `)
    .bind(botId)
    .first();

  if (!settings) {

    await db
      .prepare(`
        INSERT INTO bot_settings(bot_id)
        VALUES(?)
      `)
      .bind(botId)
      .run();

    settings = await db
      .prepare(`
        SELECT *
        FROM bot_settings
        WHERE bot_id=?
        LIMIT 1
      `)
      .bind(botId)
      .first();

  }

  return settings;

}

export async function updateBotSettings(
  db: D1Database,
  botId: number,
  data: any
) {

  return await db
    .prepare(`
      UPDATE bot_settings
      SET
        start_message=?,
        photo=?,
        video=?,
        document_url=?,
        button_text=?,
        button_url=?,
        parse_mode=?,
        is_enabled=?,
        updated_at=CURRENT_TIMESTAMP
      WHERE bot_id=?
    `)
    .bind(
      data.start_message,
      data.photo,
      data.video,
      data.document_url,
      data.button_text,
      data.button_url,
      data.parse_mode,
      data.is_enabled,
      botId
    )
    .run();

}