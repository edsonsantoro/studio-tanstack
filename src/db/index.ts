import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// No TanStack Start / Vite, process.env pode não estar disponível em todos os contextos
// Mas 'define' no vite.config.ts injeta no escopo global.
const getRawUrl = () => {
  try {
    return process.env.DATABASE_URL || (globalThis as any).process?.env?.DATABASE_URL;
  } catch (e) {
    return (globalThis as any).process?.env?.DATABASE_URL;
  }
};

const rawUrl = getRawUrl();

function getCleanedUrl(url: any): string | undefined {
  if (typeof url !== 'string') return undefined;
  return url.trim().replace(/^['"]|['"]$/g, '');
}

const databaseUrl = getCleanedUrl(rawUrl);

if (!databaseUrl || !databaseUrl.startsWith('postgres')) {
  console.warn('DB_WARN: DATABASE_URL is missing or invalid in src/db/index.ts');
}

const sql = neon(databaseUrl || 'postgresql://placeholder:placeholder@localhost:5432/placeholder');

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export const db = globalForDb.db ?? drizzle(sql, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}
