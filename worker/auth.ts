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
    trustedOrigins: ["http://localhost:5173", "http://127.0.0.1:8787"],
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
        hazszam: { type: "number", required: false },
        pKep: { type: "string", required: false },
        admin: { type: "number", required: false },
        lat: { type: "number", required: false },
        lon: { type: "number", required: false },
        varos: { type: "string" },
        rBemutat: { type: "string", required: false }
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
        pKep: "",
        admin: 0,
        irsz: 0,
        rBemutat: "",
        emailVerified: false,
      }
    },
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      password: {
        hash: async (password) => {
          const encoder = new TextEncoder();
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const keyMaterial = await crypto.subtle.importKey(
            "raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
          );
          const key = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 5000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
          );
          const hashBuffer = await crypto.subtle.exportKey("raw", key) as ArrayBuffer;

          const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
          const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");

          return `${saltHex}:${hashHex}`;
        },
        verify: async ({ hash, password }) => {
          const [saltHex, originalHash] = hash.split(":");
          const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

          const encoder = new TextEncoder();
          const keyMaterial = await crypto.subtle.importKey(
            "raw", encoder.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]
          );
          const key = await crypto.subtle.deriveKey(
            { name: "PBKDF2", salt: salt, iterations: 5000, hash: "SHA-256" },
            keyMaterial, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]
          );
          const attemptHashBuffer = await crypto.subtle.exportKey("raw", key) as ArrayBuffer;

          const attemptHash = Array.from(new Uint8Array(attemptHashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

          return attemptHash === originalHash;
        }
      }
    },
  });
}

export type Auth = ReturnType<typeof getAuth>;