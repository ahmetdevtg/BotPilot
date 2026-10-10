```ts
export async function getTelegramUsers(db: D1Database) {
  const result = await db
    .prepare("SELECT * FROM telegram_users ORDER BY id DESC")
    .all();

  return result.results;
}

export async function getTelegramUsersByBot(
  db: D1Database,
  botId: number
) {
  const result = await db
    .prepare(
      "SELECT * FROM telegram_users WHERE bot_id = ? ORDER BY id DESC"
    )
    .bind(botId)
    .all();

  return result.results;
}

export async function countTelegramUsers(db: D1Database) {
  const result: any = await db
    .prepare("SELECT COUNT(*) AS total FROM telegram_users")
    .first();

  return Number(result?.total ?? 0);
}

export async function findTelegramUser(
  db: D1Database,
  botId: number,
  telegramId: number
) {
  return db
    .prepare(
      "SELECT * FROM telegram_users WHERE bot_id = ? AND telegram_id = ? LIMIT 1"
    )
    .bind(botId, telegramId)
    .first();
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

  return db
    .prepare(`
      INSERT INTO telegram_users (
        bot_id, telegram_id, username, first_name,
        last_name, language_code, is_premium, is_bot
      )
      SELECT ?, ?, ?, ?, ?, ?, ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM telegram_users
        WHERE bot_id = ? AND telegram_id = ?
      )
    `)
    .bind(
      numericBotId,
      numericUserId,
      user.username || "",
      user.first_name || "",
      user.last_name || "",
      user.language_code || "",
      user.is_premium ? 1 : 0,
      user.is_bot ? 1 : 0,
      numericBotId,
      numericUserId
    )
    .run();
}

export async function deleteTelegramUser(
  db: D1Database,
  telegramId: number
) {
  return db
    .prepare("DELETE FROM telegram_users WHERE telegram_id = ?")
    .bind(telegramId)
    .run();
}
```
