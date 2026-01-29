import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { localization } from 'better-auth-localization';
import * as schema from './schema';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from './index';

export const getAuth = (env: Env) => {
    const db = drizzle(env.DB, { schema });
    return betterAuth({
    basePath: "/api/auth",
    baseURL: env.BETTER_AUTH_URL || "https://localhost:8787",
    secret: env.BETTER_AUTH_SECRET,
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
}