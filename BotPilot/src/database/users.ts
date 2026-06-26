export async function getUserByUsername(
  db: D1Database,
  username: string
) {

  return await db
    .prepare(
      "SELECT * FROM users WHERE username=?"
    )
    .bind(username)
    .first();

}