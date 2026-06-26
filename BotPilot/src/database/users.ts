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
export async function getUsers(
  db: D1Database
) {
  const { results } = await db
    .prepare(`
      SELECT *
      FROM users
      ORDER BY id ASC
    `)
    .all();

  return results;
}

export async function createUser(
  db: D1Database,
  username: string,
  passwordHash: string
) {
  return await db
    .prepare(`
      INSERT INTO users
      (
        username,
        password_hash
      )
      VALUES(?,?)
    `)
    .bind(
      username,
      passwordHash
    )
    .run();
}

export async function updatePassword(
  db: D1Database,
  id: number,
  passwordHash: string
) {
  return await db
    .prepare(`
      UPDATE users
      SET password_hash=?
      WHERE id=?
    `)
    .bind(
      passwordHash,
      id
    )
    .run();
}

export async function deleteUser(
  db: D1Database,
  id: number
) {
  return await db
    .prepare(`
      DELETE FROM users
      WHERE id=?
    `)
    .bind(id)
    .run();
}