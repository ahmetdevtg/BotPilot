export function generateSessionId(): string {

  return crypto.randomUUID();

}

export async function createSession(

  db: D1Database,

  userId: number

) {

  const sessionId = generateSessionId();

  const expires = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 30
  ).toISOString();

  await db.prepare(`
    INSERT INTO sessions(
      id,
      user_id,
      expires_at
    )
    VALUES(?,?,?)
  `)
  .bind(
    sessionId,
    userId,
    expires
  )
  .run();

  return sessionId;

}
export async function getSession(
  db: D1Database,
  sessionId: string
) {

  return await db
    .prepare(`
      SELECT *
      FROM sessions
      WHERE id=?
      AND expires_at > datetime('now')
    `)
    .bind(sessionId)
    .first();

}