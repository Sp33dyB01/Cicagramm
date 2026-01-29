import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import uploadApp from "./upload_route";
import { getAuth } from "./auth";
const app = new Hono<{ Bindings: Env }>();
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  BUCKET: R2Bucket;
}
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const auth = getAuth(c.env);
  return auth.handler(c.req.raw);
});

app.get('/fajta', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  try {
    const result = await db.query.fajta.findMany();
    return c.json(result);
  } catch (e) {
    return c.json({ error: "Failed to fetch species" }, 500);
  }
});

app.get('/cica/:cId', async (c) => {
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
app.route("/api/cica", uploadApp);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/auth')){
      return app.fetch(request, env, ctx)
    }
  }
};