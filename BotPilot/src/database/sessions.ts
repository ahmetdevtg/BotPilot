export async function getSession(
  db: D1Database,
  id: string
) {
  return await db
    .prepare(
      "SELECT * FROM sessions WHERE id = ? AND datetime(expires_at) > datetime('now') LIMIT 1"
    )
    .bind(id)
    .first();
}

export async function deleteSession(
  db: D1Database,
  id: string
) {
  return await db
    .prepare("DELETE FROM sessions WHERE id = ?")
    .bind(id)
    .run();
}