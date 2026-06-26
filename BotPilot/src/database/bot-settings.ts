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
export async function updateBotSettings(
  db: D1Database,
  settings: {
    bot_name: string;
    description: string;
    short_description: string;
    start_message: string;
    photo_url: string;
    video_url: string;
    document_url: string;
    button_text: string;
    button_url: string;
    reply_keyboard: string;
    parse_mode: string;
  }
) {

  return await db
    .prepare(`
      UPDATE bot_settings
      SET
        bot_name=?,
        description=?,
        short_description=?,
        start_message=?,
        photo_url=?,
        video_url=?,
        document_url=?,
        button_text=?,
        button_url=?,
        reply_keyboard=?,
        parse_mode=?,
        updated_at=CURRENT_TIMESTAMP
      WHERE id=1
    `)
    .bind(
      settings.bot_name,
      settings.description,
      settings.short_description,
      settings.start_message,
      settings.photo_url,
      settings.video_url,
      settings.document_url,
      settings.button_text,
      settings.button_url,
      settings.reply_keyboard,
      settings.parse_mode
    )
    .run();

}