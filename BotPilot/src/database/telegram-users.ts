
 // BotPilot/src/database/telegram-users.ts

export async function ensureTelegramUserLastSeenColumn(db: D1Database) {
  const columns: any = await db.prepare("PRAGMA table_info(telegram_users)").all();
  if ((columns.results as any[]).some((column) => column.name === "last_seen")) return;
  await db.prepare("ALTER TABLE telegram_users ADD COLUMN last_seen TEXT").run();
}

export async function getTelegramUsers(db: D1Database) {
  const result = await db.prepare(
    "SELECT * FROM telegram_users ORDER BY id DESC"
  ).all();
  return result.results;
}

export async function getTelegramUsersByBot(db: D1Database, botId: number) {
  const result = await db.prepare(
    "SELECT * FROM telegram_users WHERE bot_id = ? ORDER BY id DESC"
  ).bind(botId).all();
  return result.results;
}

export async function countTelegramUsers(db: D1Database) {
  const result: any = await db.prepare(
    "SELECT COUNT(*) AS total FROM telegram_users"
  ).first();
  return Number(result?.total ?? 0);
}

export async function findTelegramUser(
  db: D1Database,
  botId: number,
  telegramId: number
) {
  return await db.prepare(
    "SELECT * FROM telegram_users WHERE bot_id = ? AND telegram_id = ? LIMIT 1"
  ).bind(botId, telegramId).first();
}

export async function createTelegramUser(
  db: D1Database,
  botId: number,
  user: any
) {
  const numericBotId = Number(botId);
  const numericUserId = Number(user?.id);

  if (!Number.isSafeInteger(numericBotId) || numericBotId <= 0) {
    throw new Error("Geçersiz bot ID");
  }

  if (!Number.isSafeInteger(numericUserId) || numericUserId <= 0) {
    throw new Error("Geçersiz Telegram kullanıcı ID");
  }

  return await db.prepare(
    "INSERT INTO telegram_users " +
    "(bot_id, telegram_id, username, first_name, last_name, last_seen) " +
    "SELECT ?, ?, ?, ?, ?, CURRENT_TIMESTAMP " +
    "WHERE NOT EXISTS (" +
    "SELECT 1 FROM telegram_users WHERE bot_id = ? AND telegram_id = ?" +
    ")"
  ).bind(
    numericBotId,
    numericUserId,
    user.username || "",
    user.first_name || "",
    user.last_name || "",
    numericBotId,
    numericUserId
  ).run();
}

export async function deleteTelegramUser(
  db: D1Database,
  userRecordId: number
) {
  if (!Number.isSafeInteger(userRecordId) || userRecordId <= 0) {
    throw new Error("Geçersiz kullanıcı kayıt ID");
  }

  // Aynı Telegram kullanıcısı birden fazla botu kullanabilir.
  // Yalnızca seçilen veritabanı satırını sil; diğer botlardaki kayıtları koru.
  return await db.prepare(
    "DELETE FROM telegram_users WHERE id = ?"
  ).bind(userRecordId).run();
}
