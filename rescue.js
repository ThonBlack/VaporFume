const Database = require('better-sqlite3');
const db = new Database('sqlite.db');

function safeRun(query) {
    try {
        db.prepare(query).run();
        console.log('Success:', query);
    } catch (e) {
        console.log('Ignored/Error:', query, e.message);
    }
}

console.log('Starting Emergency Rescue...');

// Orders Table
safeRun("ALTER TABLE orders ADD COLUMN address TEXT");

// Customers Table (Adding marketing fields)
safeRun("ALTER TABLE customers ADD COLUMN origin TEXT DEFAULT 'organic'");
safeRun("ALTER TABLE customers ADD COLUMN tags TEXT");
safeRun("ALTER TABLE customers ADD COLUMN last_interaction TEXT");

// Extras that might have been added by mistake or intentionally:
safeRun("ALTER TABLE customers ADD COLUMN customer_phone TEXT");
safeRun("ALTER TABLE customers ADD COLUMN address TEXT");
safeRun("ALTER TABLE customers ADD COLUMN status TEXT DEFAULT 'active'");

console.log('Rescue Complete.');
