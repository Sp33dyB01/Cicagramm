import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import type { Env } from "./index";
import { getAuth } from './auth';
const uploadApp = new Hono<{ Bindings: Env }>();

uploadApp.post('/:cId/upload', async (c) =>{
  const cId = c.req.param('cId');
  const db = drizzle(c.env.DB, { schema });
  const body = await c.req.parseBody();
  const file = body['file'];
  const auth = getAuth(c.env)
  const session = await auth.api.getSession({
     headers: c.req.raw.headers
    });
  if (!session){
    return c.json({ error: "Bejelentkezés szükséges"}, 401)
  }
  if (!(file instanceof File))
    return c.json({ error: "Érvénytelen Fájl!"}, 400)
  const mkepId = crypto.randomUUID();
  try{
    await c.env.BUCKET.put(mkepId, file.stream(), {
      httpMetadata: {contentType: file.type}
    });
    await db.insert(schema.macskakepek).values({
      mkepId: mkepId,
      cId: cId,
      leiras: "",
      feltoltDatum: new Date(),
    });
    
    return c.json({ success: true, mkepId: mkepId});
  }
  catch (e){
    console.error(e)
    return c.json({error: "Nem sikerült a feltöltés"}, 500);
  }
});

export default uploadApp;