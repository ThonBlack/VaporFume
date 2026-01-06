const Database = require('better-sqlite3');
const db = new Database('/root/VaporFume/sqlite.db');

try {
    // Target the specific bad import batch based on the timestamp seen in inspection
    // Timestamp seen: 2026-01-05T17:24:46.780Z
    const timestampTarget = '2026-01-05T17:24:%';

    const info = db.prepare("DELETE FROM customers WHERE created_at LIKE ?").run(timestampTarget);
    console.log(`DELETED ${info.changes} corrupted customers from the bad import batch.`);
} catch (e) {
    console.error('Error cleaning up:', e);
}
