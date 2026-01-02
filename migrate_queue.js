const Database = require('better-sqlite3');
const sqlite = new Database('sqlite.db');

try {
    console.log('Migrating message_queue...');
    sqlite.exec(`
    CREATE TABLE IF NOT EXISTS message_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'winback',
      status TEXT DEFAULT 'pending',
      scheduled_at INTEGER NOT NULL,
      sent_at INTEGER,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP
    );
  `);
    console.log('Migration done.');
} catch (e) {
    console.error('Migration failed:', e);
}
