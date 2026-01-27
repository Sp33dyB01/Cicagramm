import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { betterAuth } from "better-auth";
import { Hono } from "hono";
import { hashPassword } from 'better-auth/crypto';
import { drizzleAdapter } from "better-auth/adapters/drizzle";
const app = new Hono<{ Bindings: { DB: D1Database; BETTER_AUTH_SECRET: string } }>();
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}
interface RegisterBody {
  email: string;
  nev: string;
  jelszo: string;
  irsz: string | number;
  utca?: string;
  hazszam?: string | number;
  pKep?: string;
  rBemutat: string;
}
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  try{
  const db = drizzle(c.env.DB, { schema }); // Initialize Drizzle with D1
  
  const auth = betterAuth({
    basePath: "/api/auth",
    baseURL: "http://localhost:8787",
    logger: {
    level: "debug",
    enabled: true,
  },
    trustedOrigins: ["http://localhost:5173"],
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.felhasznalo,
        session: schema.session,
        account: schema.account
      },
    }),
        user: {
          additionalFields: {
      irsz: { type: "number" },
      utca: { type: "string" },
      hazszam: { type: "number" },
      jelszo: { type: "string" }, // Maps to your User table password column
      pKep: { type: "string" },
    },
          fields: {
            password: "jelszo",
            name: "nev",
            image: "pKep",
            email: "email",
            irsz: "irsz",
    utca: "utca",
    hazszam: "hazszam"
        },
        defaultValue: {
    pKep: "default.jpg", // This fixes the NOT NULL constraint!
    admin: 0,
    irsz: 0,
    rBemutat: "",
    emailVerified: false,
  }
      },
    emailAndPassword: { 
      enabled: true,
      autoSignIn: true
     },
     secret: c.env.BETTER_AUTH_SECRET
  });
  if (c.req.path === "/api/auth/me") {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });
    return c.json(session);
}
  return auth.handler(c.req.raw);
}
catch (e: any) {
    console.error("AUTH_ERROR:", e.message); // This shows up in your terminal/Wrangler logs
    return c.json({ error: e.message, stack: e.stack }, 500);
  }
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/auth')){
      return app.fetch(request, env, ctx)
    }
    if (url.pathname.startsWith('/fajta')){
      const db = drizzle(env.DB, { schema });
      try{
      const result = await db.query.fajta.findMany();
      return Response.json(result);
      }
      catch(e){
        return Response.json({ error: "Failed to fetch species"}, {status: 500})
      }
    }
    if (url.pathname.startsWith('/cica')) {
  // Pass the schema object to the drizzle constructor
  const db = drizzle(env.DB, { schema });

  const result = await db.query.cica.findMany({
    with: {
      species: true, // This "includes" the fajta data automatically
    },
  });

  return Response.json(result);
}

    return env.ASSETS.fetch(request);
  },
  
};