import { Context, Next } from "hono";
import { getSession } from "../database/sessions";

export async function auth(

c:Context,

next:Next

){

const cookie=c.req.header("Cookie") || "";

const match=cookie.match(/session=([^;]+)/);

if(!match){

return c.redirect("/login");

}

const session=await getSession(

(c.env as any).DB,

match[1]

);

if(!session){

return c.redirect("/login");

}

await next();

}