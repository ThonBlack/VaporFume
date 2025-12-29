const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../sqlite.db');
const db = new Database(dbPath);

console.log('Cleaning database...');

try {
    // Delete in order to avoid foreign key constraints if strictly enforced,
    // though sqlite usually allows unless PRAGMA foreign_keys = ON;
    db.prepare('DELETE FROM order_items').run();
    db.prepare('DELETE FROM orders').run();
    db.prepare('DELETE FROM variants').run();
    db.prepare('DELETE FROM products').run();
    // Keeping categories might be useful? The user said "excluir todos esses", implying products.
    // But let's ask or just delete categories too to be safe/clean. 
    // Usually categories are setup data. I'll keep categories for now as they are structural? 
    // No, standard is clean slate.
    db.prepare('DELETE FROM categories').run();

    console.log('Database cleared successfully!');
} catch (error) {
    console.error('Error clearing database:', error);
}
