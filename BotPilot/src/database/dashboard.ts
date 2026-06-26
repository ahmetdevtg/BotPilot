export async function getDashboardStats(db: D1Database) {

  const botCount = await db
    .prepare("SELECT COUNT(*) AS total FROM bots")
    .first();

  const onlineCount = await db
    .prepare("SELECT COUNT(*) AS total FROM bots WHERE status = 1")
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

  return {
    totalBots: Number((botCount as any)?.total || 0),
    onlineBots: Number((onlineCount as any)?.total || 0),
    lastBots: lastBots.results || []
  };

}