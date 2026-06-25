export async function getBots(db: D1Database) {

  const { results } = await db
    .prepare("SELECT * FROM bots ORDER BY id DESC")
    .all();

  return results;

}

export async function getBot(db: D1Database, id:number){

  return await db
  .prepare("SELECT * FROM bots WHERE id=?")
  .bind(id)
  .first();

}

export async function createBot(

db:D1Database,

name:string,

username:string,

token:string,

telegram_id:number

){

return await db

.prepare(`

INSERT INTO bots

(name,username,token,telegram_id,status,created_at)

VALUES(?,?,?,?,1,datetime('now'))

`)

.bind(

name,

username,

token,

telegram_id

)

.run();

}

export async function deleteBot(

db:D1Database,

id:number

){

return await db

.prepare("DELETE FROM bots WHERE id=?")

.bind(id)

.run();

}

export async function updateBot(

db:D1Database,

id:number,

name:string

){

return await db

.prepare("UPDATE bots SET name=? WHERE id=?")

.bind(name,id)

.run();

}