export async function getDashboardStats(db: D1Database) {

  const botCount = await db
    .prepare("SELECT COUNT(*) AS total FROM bots")
    .first();

  const onlineCount = await db
    .prepare("SELECT COUNT(*) AS total FROM bots WHERE status=1")
    .first();

  const userCount = await db
    .prepare("SELECT COUNT(*) AS total FROM telegram_users")
    .first();

  const broadcastCount = await db
    .prepare("SELECT COUNT(*) AS total FROM broadcasts")
    .first();

  const lastBots = await db
    .prepare(`
      SELECT
        id,
        name,
        username,
        status
      FROM bots
      ORDER BY id DESC
      LIMIT 5
    `)
    .all();

  const lastBroadcasts = await db
    .prepare(`
      SELECT
        id,
        bot_id,
        success_count,
        failed_count,
        created_at
      FROM broadcasts
      ORDER BY id DESC
      LIMIT 5
    `)
    .all();

  return {

    totalBots: Number((botCount as any)?.total || 0),

    totalUsers: Number((userCount as any)?.total || 0),

    totalBroadcasts: Number((broadcastCount as any)?.total || 0),

    onlineBots: Number((onlineCount as any)?.total || 0),

    lastBots: lastBots.results || [],

    lastBroadcasts: lastBroadcasts.results || []

  };

}