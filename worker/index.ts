import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { betterAuth } from "better-auth";
import { Hono } from "hono";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { localization } from 'better-auth-localization';
import uploadApp from "./upload_route";
const app = new Hono<{ Bindings: Env }>();
export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  BUCKET: R2Bucket;
}
app.on(["POST", "GET"], "/api/auth/*", async (c) => {
  const db = drizzle(c.env.DB, { schema }); // Initialize Drizzle with D1
  
  const auth = betterAuth({
    basePath: "/api/auth",
    baseURL: c.env.BETTER_AUTH_URL || "https://localhost:8787",
    secret: c.env.BETTER_AUTH_SECRET,
    logger: {
    level: "debug",
    enabled: true,
    },
    plugins: [
      localization({
        defaultLocale: "hu",
        fallbackLocale: "default",
        translations: {
          hu: {
            USER_ALREADY_EXISTS: "Ez az e-mail cím már regisztrálva van.",
            INVALID_EMAIL: "Érvénytelen e-mail cím formátum.",
            PASSWORD_TOO_SHORT: "A jelszó túl rövid (minimum 8 karakter).",
            INVALID_EMAIL_OR_PASSWORD: "Helytelen e-mail vagy jelszó.",
            INVALID_PASSWORD: "Helytelen jelszó",
            USER_NOT_FOUND: "Nem található felhasználó ezzel az e-mail címmel.",
            INTERNAL_SERVER_ERROR: "Szerver hiba történt, próbáld újra később!",
            TOO_MANY_REQUESTS: "Túl sok próbálkozás. Kérlek várj egy kicsit.",
          }
        }
      })
    ],
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
            pKep: { type: "string" },
          },
          fields: {
            name: "nev",
            image: "pKep",
            email: "email",
            irsz: "irsz",
            utca: "utca",
            hazszam: "hazszam"
        },
        defaultValue: {
          pKep: "default.jpg", 
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
    });
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

app.get('/cica', async (c) => {
  const db = drizzle(c.env.DB, { schema });
  try {
    const result = await db.query.cica.findMany({
      with: {
        species: true,
        images: true
      },
    });
    return c.json(result);
  } catch (e) {
    return c.json({ error: "Failed to fetch cats" }, 500);
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