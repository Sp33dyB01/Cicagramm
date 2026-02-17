import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import cicaRouter from "./cicaRouter";
import { getAuth } from "./auth";
import felhasznaloRouter from './felhasznaloRouter';
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
app.get('/api/varos/:irsz', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const irsz = Number(c.req.param('irsz'));
  try {
    const result = await db.query.telepulesek.findMany({
      where: (table, { eq }) => (eq(table.irsz, irsz))
    });
    return c.json(result);
  } catch (e) {
    console.log(e)
    return c.json({ error: "Szerver oldali hiba" }, 500);
  }
});
app.get('/api/fajta', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  try {
    const result = await db.query.fajta.findMany();
    return c.json(result);
  } catch (e) {
    return c.json({ error: "Failed to fetch species" }, 500);
  }
});
app.get('/api/images/:mkepId', async (c) => {
  const mkepId = c.req.param('mkepId');
  const object = await c.env.BUCKET.get(mkepId);
  if (!object) return c.json({ error: "Kép nem található" }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  return new Response(object.body, { headers });
});
app.get('*', async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: "API route nem található" }, 404);
  }
  const url = new URL(c.req.url);
  url.pathname = '/index.html';
  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
});
app.route("/api/cica", cicaRouter);
app.route("/api/profile", felhasznaloRouter);
export default app;
/*{
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/auth')){
      return app.fetch(request, env, ctx)
    }
  }
};*/