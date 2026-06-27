import {
  createBot,
  getBotByTelegramId
} from "../database/bots";

import {
  getMe,
  setWebhook
} from "../telegram/api";

export async function addBot(
  db: D1Database,
  token: string
) {

  const me: any = await getMe(token);

  if (!me.ok) {
    throw new Error("Bot Token geçersiz.");
  }

  const exists = await getBotByTelegramId(
    db,
    me.result.id
  );

  if (exists) {
    throw new Error("Bu bot zaten eklenmiş.");
  }

  await createBot(
    db,
    me.result.first_name,
    me.result.username,
    token,
    me.result.id
  );

  // Global ayarı oku
  const globalSettings: any = await db
    .prepare(`
      SELECT *
      FROM bot_settings
      ORDER BY id ASC
      LIMIT 1
    `)
    .first();
  if (globalSettings) {

    await db
      .prepare(`
        INSERT INTO bot_settings
        (
          bot_id,
          start_message,
          photo,
          video,
          document_url,
          button_text,
          button_url,
          parse_mode,
          is_enabled
        )
        VALUES
        (
          ?,?,?,?,?,?,?,?,?
        )
      `)
      .bind(
        me.result.id,
        globalSettings.start_message,
        globalSettings.photo,
        globalSettings.video,
        globalSettings.document_url,
        globalSettings.button_text,
        globalSettings.button_url,
        globalSettings.parse_mode,
        globalSettings.is_enabled
      )
      .run();

  } else {

    await db
      .prepare(`
        INSERT INTO bot_settings
        (
          bot_id
        )
        VALUES(?)
      `)
      .bind(
        me.result.id
      )
      .run();

  }
  await setWebhook(
    token,
    "https://botpilot.yrdahmets.workers.dev/webhook/" + me.result.id
  );

  return me.result;

}
