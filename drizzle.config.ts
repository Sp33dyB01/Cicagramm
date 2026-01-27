import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './worker/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'd1-http', // This allows Drizzle to talk to D1
});