export async function getDashboardStats(db: D1Database) {

  const botCount = await db
    .prepare("SELECT COUNT(*) as total FROM bots")
    .first();

  const onlineCount = await db
    .prepare("SELECT COUNT(*) as total FROM bots WHERE status=1")
    .first();

  return {
    totalBots: Number((botCount as any)?.total || 0),
    onlineBots: Number((onlineCount as any)?.total || 0)
  };

}