import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import type { Env } from "./index";
import { getAuth } from './auth';
import { eq } from 'drizzle-orm';
const cicaRouter = new Hono<{ Bindings: Env }>();

cicaRouter.post('/', async (c) => {
  const db = drizzle(c.env.DB, { schema } );
  const auth = getAuth(c.env);
  
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });
  if (!session)
    return c.json({ error: "Bejelentkezés szükséges"}, 401);
  try{
    const formData = await c.req.parseBody();
    const nev = formData['nev'] as string;
    const kor = Number(formData['kor']);
    const tomeg = Number(formData['tomeg']);
    const fajId = Number(formData['fajId']);
    const ivartalanitott = Number(formData['ivartalanitott']);
    const rBemutat = formData['rBemutat'] as string || null;
    const pKepFile = formData['pKep'] as File;
    const mKepek = formData['mKepek[]'];
    if (!nev || !kor || !tomeg || !ivartalanitott || !fajId || !pKepFile)
      return c.json({ error: "Hiáynzó adatok!"}, 400);
    const pkepKey = `pfp-${crypto.randomUUID()}-${pKepFile.name}`
    await c.env.BUCKET.put(pkepKey,pKepFile);
    const newcId = crypto.randomUUID();
    await db.insert(schema.cica).values({
      cId: newcId,
      felId: session.user.id,
      nev: nev,
      kor: kor,
      tomeg: tomeg,
      fajId: fajId,
      ivartalanitott: ivartalanitott,
      rBemutat: rBemutat,
      pKep: pkepKey,
    });
    let filesUpload: File[] = [];
    if (Array.isArray(mKepek))
      filesUpload = mKepek as File[];
    else if (mKepek instanceof File)
      filesUpload = [mKepek];
    if (filesUpload.length > 0){
      const mKepekPromise = filesUpload.map(async (file) => {
        const kepKey = crypto.randomUUID();
        await c.env.BUCKET.put(kepKey, file);
        await db.insert(schema.macskakepek).values({
          mkepId: kepKey,
          cId: newcId,
          feltoltDatum: new Date()
        });
      });
      await Promise.all(mKepekPromise);
    }
    return c.json({succes: true, cId: newcId, message: "Cica sikeresen létrehozva!" }, 200)
  }
  catch (e){
    console.log(e);
    return c.json({ error: "szerver oldali hiba"},500)
  }
})

cicaRouter.delete('/:cId', async (c) => {
    const cId = c.req.param('cId');
    const db = drizzle(c.env.DB, { schema });
    const auth = getAuth(c.env);
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