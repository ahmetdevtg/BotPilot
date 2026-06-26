export async function getReplyButtons(db: D1Database) {
  return await db
    .prepare(`
      SELECT *
      FROM reply_buttons
      WHERE is_enabled=1
      ORDER BY sort_order ASC,id ASC
    `)
    .all();
}

export async function getReplyButton(
  db: D1Database,
  buttonText: string
) {
  return await db
    .prepare(`
      SELECT *
      FROM reply_buttons
      WHERE button_text=?
      LIMIT 1
    `)
    .bind(buttonText)
    .first();
}

export async function createReplyButton(
  db: D1Database,
  data: any
) {
  return await db
    .prepare(`
      INSERT INTO reply_buttons(
        button_text,
        response_type,
        message,
        photo_url,
        video_url,
        document_url,
        button_text_url,
        button_url,
        parse_mode,
        reply_keyboard,
        sort_order
      )
      VALUES(?,?,?,?,?,?,?,?,?,?,?)
    `)
    .bind(
      data.button_text,
      data.response_type,
      data.message,
      data.photo_url,
      data.video_url,
      data.document_url,
      data.button_text_url,
      data.button_url,
      data.parse_mode,
      data.reply_keyboard,
      data.sort_order
    )
    .run();
}

export async function deleteReplyButton(
  db: D1Database,
  id: number
) {
  return await db
    .prepare(`
      DELETE FROM reply_buttons
      WHERE id=?
    `)
    .bind(id)
    .run();
}