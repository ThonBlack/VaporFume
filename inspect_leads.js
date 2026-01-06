const Database = require('better-sqlite3');
const db = new Database('/root/VaporFume/sqlite.db');

try {
    const rows = db.prepare("SELECT id, name, phone, origin, created_at FROM customers ORDER BY id DESC LIMIT 20").all();
    console.log(JSON.stringify(rows, null, 2));
} catch (e) {
    console.error(e);
}
