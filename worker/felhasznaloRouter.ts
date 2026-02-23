import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import type { Env } from "./index";
import { getAuth } from './auth';
import { eq } from 'drizzle-orm';
import { getCoordinates } from './tavolsag';
const felhasznaloRouter = new Hono<{ Bindings: Env }>();

felhasznaloRouter.delete("/:felId", async (c) => {
    const felId = c.req.param('felId');
    const db = drizzle(c.env.DB, { schema });
    const auth = getAuth(c.env);
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    });
    if (!session)
        return c.json({ error: "Bejelentkezés szükséges" }, 401);
    try {
        const result = await db.query.felhasznalo.findFirst({
            where: (table, { eq }) => (eq(table.id, felId)),
            with: {
                cats: {
                    with: {
                        images: true,
                    }
                }
            }
        })
        if (!result)
            return c.json({ error: "Nincs ilyen felhasználó" }, 404);
        const isOwner = result.id === session.user.id;
        const isAdmin = session.user.admin === 1;
        if (!isOwner && !isAdmin)
            return c.json({ error: "Nincsen Jogosultsága" }, 403)
        const deletePromises: Promise<void>[] = [];
        if (result.cats && result.cats.length > 0) {
            for (const cat of result.cats) {
                if (cat.images && cat.images.length > 0)
                    for (const img of cat.images)
                        deletePromises.push(c.env.BUCKET.delete(img.mkepId))
                if (cat.pKep)
                    deletePromises.push(c.env.BUCKET.delete(cat.pKep))
            }
        }
        if (result.pKep)
            deletePromises.push(c.env.BUCKET.delete(result.pKep))
        await Promise.all(deletePromises)
        await db.delete(schema.felhasznalo).where(eq(schema.felhasznalo.id, felId));
        return c.json({ success: true, message: "Sikeres törlés" })
    }
    catch (e) {
        console.log(e);
        return c.json({ error: "Szerver oldali hiba" }, 500);
    }
});
felhasznaloRouter.get("/:felId", async (c) => {
    const felId = c.req.param('felId');
    const db = drizzle(c.env.DB, { schema });
    try {
        const result = await db.query.felhasznalo.findFirst({
            where: (table, { eq }) => (eq(table.id, felId)),
            with: {
                fav: true,
                cats:
                {
                    with: {
                        images: true,
                        species: true
                    }
                },

            }
        }
        );
        if (!result)
            return c.json({ error: "Nincs ilyen felhasználó" }, 404)
        return c.json(result);
    }
    catch (e) {
        console.log(e)
        return c.json({ error: "Szerver oldali hiba" }, 500)
    }
});
felhasznaloRouter.patch("/:felId", async (c) => {
    const felId = c.req.param("felId");
    const db = drizzle(c.env.DB, { schema });
    const auth = getAuth(c.env);
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    });
    if (!session)
        return c.json({ error: "Bejelentkezés szükséges" }, 401);
    try {
        const result = await db.query.felhasznalo.findFirst({
            where: (table, { eq }) => (eq(table.id, felId))
        })
        if (!result)
            return c.json({ error: "Nincs ilyen felhasználó" }, 404);
        const isOwner = result.id === session.user.id;
        const isAdmin = session.user.admin === 1;
        if (!isOwner && !isAdmin)
            return c.json({ error: "Nincsen Jogosultsága" }, 403)
        const formData = await c.req.parseBody();
        const updateData: any = {};
        if (formData['nev']) updateData.nev = formData['nev'];
        if (formData['email']) updateData.email = formData['email'];
        if (formData['rBemutat']) updateData.rBemutat = formData['rBemutat'];
        if (formData['irsz']) updateData.irsz = Number(formData['irsz'])
        if (formData['utca']) updateData.utca = formData['utca'];
        if (formData['varos']) updateData.varos = formData['varos'];
        const pKepFile = formData['pKep'] as File;
        if (pKepFile && pKepFile.size > 0) {
            await c.env.BUCKET.delete(result.pKep);
            const newPkepKey = `pfp-${crypto.randomUUID()}-${pKepFile.name}`;
            await c.env.BUCKET.put(newPkepKey, pKepFile);
            updateData.pKep = newPkepKey;
        }
        if (formData['irsz'] || formData['utca']) {
            const newCoords = await getCoordinates(updateData.irsz || result.irsz, updateData.varos || result.varos, updateData.utca || result.utca);
            if (newCoords?.displayName) {
                updateData.lat = newCoords?.lat;
                updateData.lon = newCoords?.lon;
            }
        }
        await db.update(schema.felhasznalo).set(updateData).where(eq(schema.felhasznalo.id, felId));
        return c.json({ success: true, message: "Felhasználó adatai frissítve!" });
    }
    catch (e) {
        console.log(e)
        return c.json({ error: "Szerver oldali hiba" }, 500)
    }
})
felhasznaloRouter.get("/", async (c) => {
    const db = drizzle(c.env.DB, { schema });
    try {
        const result = await db.query.felhasznalo.findMany({
            with: {
                fav: true,
                cats:
                {
                    with: {
                        images: true,
                        species: true
                    }
                }
            }
        }
        );
        if (!result)
            return c.json({ error: "Nincs ilyen felhasználó" }, 404)
        return c.json(result);
    }
    catch (e) {
        console.log(e)
        return c.json({ error: "Szerver oldali hiba" }, 500)
    }
});
export default felhasznaloRouter;