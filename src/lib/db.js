import * as schema from '../db/schema.js';

let db;

// Verifica se está na Vercel (que usa Turso) ou local (que usa SQLite)
if (process.env.TURSO_DATABASE_URL) {
    // Turso (Vercel)
    const { createClient } = await import('@libsql/client');
    const { drizzle } = await import('drizzle-orm/libsql');

    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
    });

    db = drizzle(client, { schema });
    console.log('[DB] Conectado ao Turso');
} else {
    // SQLite local (VPS)
    const Database = (await import('better-sqlite3')).default;
    const { drizzle } = await import('drizzle-orm/better-sqlite3');

    const sqlite = new Database('sqlite.db');
    sqlite.pragma('journal_mode = WAL');

    db = drizzle(sqlite, { schema });
    console.log('[DB] Conectado ao SQLite local');
}

export { db };
