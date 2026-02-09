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
    if (!nev || !kor || !tomeg || isNaN(ivartalanitott) || !fajId || !pKepFile){
      return c.json({ error: "Hiányzó adatok!"}, 400);
    }
      
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
    if (!isOwner && !isAdmin)
        return c.json({ error: "Nincsen Jogosultsága"},403)
      
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
cicaRouter.get('/', async (c) =>{
  const db = drizzle(c.env.DB, { schema });
  try {
    const result = await db.query.cica.findMany({
      with: {
        species: true,
        images: true,
        owner: true
      }
    })
    if (!result)
      return c.json({ error: "Nincs ilyen cica"}, 400)
    return c.json(result)
  }
  catch (e) {
    console.error(e);
    return c.json({ error: "Szerver oldali hiba"},500)
  }
});
cicaRouter.patch('/:cId', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const cId = c.req.param("cId");
  const auth = getAuth(c.env);
  const session = await auth.api.getSession({
    headers: c.req.raw.headers
  });
  if (!session)
    return c.json({ error: "Bejelentkezés szükséges"}, 401);
  const existingCat = await db.query.cica.findFirst({
    where: (table, { eq }) => eq(table.cId, cId)
  });
  if (!existingCat) 
    return c.json({ error: "Nincs ilyen macska!"},404);
  if (existingCat.felId !== session.user.id && session.user.admin !== 1)
    return c.json({ error: "Nincs jogosultságod" }, 403);
  try{
    const formData = await c.req.parseBody();
    const updateData: any = {};
    if (formData['nev']) updateData.nev = formData['nev'];
    if (formData['kor']) updateData.kor = Number(formData['kor']);
    if (formData['tomeg']) updateData.tomeg = Number(formData['tomeg']);
    if (formData['fajId']) updateData.fajId = Number(formData['fajId']);
    if (formData['ivartalanitott'] !== undefined)
       updateData.ivartalanitott = Number(formData['ivartalanitott']);
    if (formData['rBemutat'] !== undefined) updateData.rBemutat = formData['rBemutat'];
    const pKepFile = formData['pKep'] as File;
    if (pKepFile && pKepFile.size > 0) {
      await c.env.BUCKET.delete(existingCat.pKep);
      const newPkepKey = `pfp-${crypto.randomUUID()}-${pKepFile.name}`;
      await c.env.BUCKET.put(newPkepKey, pKepFile);
      updateData.pKep = newPkepKey;
    }
    const newImages = formData['newImages[]'];
    let filesToUpload: File[] = [];
    if (Array.isArray(newImages)) filesToUpload = newImages as File[];
    else if (newImages instanceof File) filesToUpload = [newImages];
    if (filesToUpload.length > 0) {
      const promises = filesToUpload.map(async (file) => {
        const key = crypto.randomUUID();
        await c.env.BUCKET.put(key, file);
        await db.insert(schema.macskakepek).values({
          mkepId: key,
          cId: cId,
          feltoltDatum: new Date()
        });
      });
      await Promise.all(promises);
    }
    const deleteImageIds = formData['deleteImages[]'];
    let idsToDelete: string[] = [];
    if (Array.isArray(deleteImageIds)) idsToDelete = deleteImageIds as string[];
    else if (typeof deleteImageIds === 'string') idsToDelete = [deleteImageIds];

    if (idsToDelete.length > 0) {
      const deletePromises = idsToDelete.map(async (imgId) => {
        await c.env.BUCKET.delete(imgId);
        await db.delete(schema.macskakepek).where(eq(schema.macskakepek.mkepId, imgId));
      });
      await Promise.all(deletePromises);
    }
    await db.update(schema.cica).set(updateData).where(eq(schema.cica.cId, cId));
    return c.json({ success: true, message: "Cica adatai frissítve!" });
  }
  catch (e){
    console.log(e)
    return c.json({error:"Szerver oldali hiba"},500)
  }
});
export default cicaRouter;