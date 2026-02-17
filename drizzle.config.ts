import { defineConfig } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';

// 🔍 Smart helper to find your local Wrangler database file
function getLocalD1DB() {
  try {
    const basePath = path.resolve('.wrangler/state/v3/d1/miniflare-D1DatabaseObject');
    const dbFile = fs.readdirSync(basePath).find((f) => f.endsWith('.sqlite'));
    
    if (!dbFile) {
      console.log("⚠️ No local database found. Make sure you have run 'wrangler dev' at least once.");
      return '';
    }
    
    const url = path.resolve(basePath, dbFile);
    console.log(`✅ Found local database at: ${url}`);
    return url;
  } catch (err) {
    console.log("⚠️ Could not locate .wrangler folder.");
    return '';
  }
}
export default defineConfig({
  schema: './worker/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
   dbCredentials: {
    url: getLocalD1DB()
  }
   // This allows Drizzle to talk to D1
});