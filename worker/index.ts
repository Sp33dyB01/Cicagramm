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
async function generateETag(dataString: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `"${hashHex}"`;
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
    const jsonString = JSON.stringify(result)
    const eTag = await generateETag(jsonString)
    const clientEtag = c.req.header('If-None-Match');
    const cleanClientEtag = clientEtag ? clientEtag.replace(/^W\//, '') : null;

    if (cleanClientEtag === eTag) {
      return new Response(null, {
        status: 304,
        headers: {
          'ETag': eTag,
          'Cache-Control': 'no-cache'
        }
      });
    }
    c.header('ETag', eTag);
    c.header('Cache-Control', 'no-cache')
    c.header('Content-Type', 'application/json');
    return c.json(result);
  } catch (e) {
    return c.json({ error: "Failed to fetch species" }, 500);
  }
});
app.get('/api/images/:mkepId', async (c) => {
  const mkepId = c.req.param('mkepId');
  const object = await c.env.BUCKET.get(mkepId);
  if (!object) return c.json({ error: "Kép nem található" }, 404);
  const clientEtag = c.req.header("If-None-Match");
  if (clientEtag && clientEtag == object.httpEtag) {
    return new Response(null, {
      status: 304,
      headers: {
        'etag': object.httpEtag,
        'cache-control': 'public, max-age=604800'
      }
    })
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=604800');
  return new Response(object.body, { headers });
});
app.get('/api/ipinfo', (c) => {
  const cf = c.req.raw.cf;

  if (cf) {
    return c.json({
      city: cf.city,
      lat: cf.latitude,
      lon: cf.longitude,
    });
  }

  return c.json({ error: "Helyadatok nem elérhetők" }, 404);
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