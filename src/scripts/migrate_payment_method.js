const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

try {
    console.log('Migrating database: Adding payment_method to orders table...');

    // Check if column exists first to avoid errors
    const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
    const columnExists = tableInfo.some(col => col.name === 'payment_method');

    if (!columnExists) {
        db.prepare("ALTER TABLE orders ADD COLUMN payment_method TEXT").run();
        console.log('✅ Success: Column payment_method added.');
    } else {
        console.log('ℹ️ Column payment_method already exists.');
    }

} catch (error) {
    console.error('❌ Migration Failed:', error.message);
} finally {
    db.close();
}
