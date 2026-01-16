import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../db/schema.js';

const sqlite = new Database('sqlite.db');
sqlite.pragma('journal_mode = WAL'); // Improve concurrency
export const db = drizzle(sqlite, { schema });
