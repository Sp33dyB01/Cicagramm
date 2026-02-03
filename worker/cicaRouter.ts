import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import type { Env } from "./index";
import { getAuth } from './auth';
import { eq } from 'drizzle-orm';
const cicaRouter = new Hono<{ Bindings: Env }>();

cicaRouter.post('/:cId/upload', async (c) =>{
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

cicaRouter.delete('/:cId', async (c) => {
    const cId = c.req.param('cId');
    const db = drizzle(c.env.DB, { schema });
    const auth = getAuth(c.env)
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    });
    if (!session){
        return c.json({ error: "Bejelentkezés szükséges"}, 401)
    }
    try{
    const result = await db.query.cica.findFirst({
        where: (table, {eq, and}) => and(eq(table.cId, cId)),
        with: {
            images: true
        }
    });
    if (!result){
        return c.json({error: "Nincs ilyen cica"}, 404)
    }
    const isOwner = result.felId === session.user.id;
    const isAdmin = session.user.admin === 1;
    if (!isOwner && !isAdmin){
        return c.json({ error: "Nincsen Jogosultsága"},403)
    }
    if (result.images && result.images.length > 0){
        const deletePromises = result.images.map(img => 
            c.env.BUCKET.delete(img.mkepId)
        )
        await Promise.all(deletePromises)
    }
    await db.delete(schema.macskakepek).where(eq(schema.macskakepek.cId, cId));
    await db.delete(schema.cica).where(eq(schema.cica.cId, cId));
    return c.json({success: true, message: "Sikeres törlés"})
    }
    catch (e){
        console.error(e)
        return c.json({error: "Nem sikerült a törlés"}, 500);
    }
});
cicaRouter.get('/:cId', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const cId = c.req.param("cId")
  try {
    const result = await db.query.cica.findFirst({
      where: (table, {eq}) => eq(table.cId, cId),
      with: {
        species: true,
        images: true,
        owner:  true
      },
    });
    if (!result)
      return c.json({error: "Nincs ilyen macska!"}, 404);
    return c.json(result);
  } catch (e) {
    console.error(e);
    return c.json({ error: "Szerver oldali hiba" }, 500);
  }
});
export default cicaRouter;