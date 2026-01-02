const Database = require('better-sqlite3');
const path = require('path');

// Connect to DB
const dbPath = path.join(process.cwd(), 'sqlite.db');
const sqlite = new Database(dbPath);

console.log('Running Favorites & Notifications Migration...');

try {
    // 1. Create Favorites Table
    sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_phone TEXT NOT NULL,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
    console.log('✅ Created "favorites" table.');

    // 2. Create Restock Subscriptions Table
    sqlite.prepare(`
    CREATE TABLE IF NOT EXISTS restock_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      variant_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      notified INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
    console.log('✅ Created "restock_subscriptions" table.');

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('❌ Migration failed:', error);
}
