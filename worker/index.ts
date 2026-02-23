import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { Hono } from "hono";
import cicaRouter from "./cicaRouter";
import { getAuth } from "./auth";
import felhasznaloRouter from './felhasznaloRouter';
import kedvencRouter from './kedvencRouter';
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
app.get('/api/varos/irsz/:irsz', async (c) => {
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
app.get('/api/varos/nev/:varos', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  const varos = c.req.param('varos');
  try {
    const result = await db.query.telepulesek.findMany({
      where: (table, { eq }) => (eq(table.nev, varos))
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
app.get('/api/ipinfo', async (c) => {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'User-Agent': 'Cloudflare-Worker' }
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: "Nem sikerült lekérni az IP adatokat" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return c.json(data);

  } catch (error) {
    console.error("IP API Fetch Error:", error);
    return c.json({ error: "Szerver oldali hiba az IP lekérdezésnél" }, 500);
  }
});
app.route("/api/cica", cicaRouter);
app.route("/api/profile", felhasznaloRouter);
app.route("/api/kedvencek", kedvencRouter);
app.notFound(async (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: "API route nem található" }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});
export default app;