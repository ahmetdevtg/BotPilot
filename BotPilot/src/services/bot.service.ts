import { createBot } from "../database/bots";

import { getMe } from "../telegram/api";

export async function addBot(

db:D1Database,

token:string

){

const me=await getMe(token);

if(!me.ok){

throw new Error("Geçersiz Bot Token");

}

await createBot(

db,

me.result.first_name,

me.result.username,

token,

me.result.id

);

return me.result;

}