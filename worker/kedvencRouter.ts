import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import type { Env } from "./index";
import { getAuth } from './auth';
import { eq } from 'drizzle-orm';
const kedvencRouter = new Hono<{ Bindings: Env }>();
kedvencRouter.post("/:cId", async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const auth = getAuth(c.env);
    const cId = c.req.param('cId')
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    });
    if (!session)
        return c.json({ error: "Bejelentkezés szükséges" }, 401);
    try {
        await db.insert(schema.kedvencek).values({
            felId: session.user.id,
            cId: cId
        })
        return c.json({ success: true, message: "Sikeresen likeolt!" }, 200);
    }
    catch (e) {
        console.error(e)
        return c.json({ error: "Hiba történt" }, 500);
    }
});
kedvencRouter.delete("/:cId", async (c) => {
    const db = drizzle(c.env.DB, { schema });
    const auth = getAuth(c.env);
    const cId = c.req.param('cId')
    const session = await auth.api.getSession({
        headers: c.req.raw.headers
    });
    if (!session)
        return c.json({ error: "Bejelentkezés szükséges" }, 401);
    try {
        await db.delete(schema.kedvencek).where(eq(schema.kedvencek.cId, cId))
        return c.json({ success: true, message: "Sikeresen unlikeolt!" }, 200);
    }
    catch (e) {
        console.error(e)
        return c.json({ error: "Hiba történt" }, 500);
    }
})
export default kedvencRouter;