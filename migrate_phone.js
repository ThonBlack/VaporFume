const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'sqlite.db');
const db = new Database(dbPath);

try {
    // Check if column exists first
    const columns = db.prepare("PRAGMA table_info(orders)").all();
    const hasPhone = columns.some(r => r.name === 'customer_phone');

    if (!hasPhone) {
        db.prepare("ALTER TABLE orders ADD COLUMN customer_phone text").run();
        console.log("Successfully added customer_phone column.");
    } else {
        console.log("Column customer_phone already exists.");
    }

} catch (err) {
    console.log("Error during migration:", err.message);
}

// Verify
const columnsAfter = db.prepare("PRAGMA table_info(orders)").all();
const hasPhoneAfter = columnsAfter.some(r => r.name === 'customer_phone');
console.log("VERIFICATION_RESULT:", hasPhoneAfter);

db.close();
