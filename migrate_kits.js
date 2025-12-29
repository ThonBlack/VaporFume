const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'sqlite.db');
const db = new Database(dbPath);

try {
    console.log('Migrating database for Product Kits...');

    // Add linked_product_id column
    try {
        db.prepare(`ALTER TABLE products ADD COLUMN linked_product_id INTEGER`).run();
        console.log('✅ Added linked_product_id column');
    } catch (e) {
        if (e.message.includes('duplicate column')) {
            console.log('ℹ️ linked_product_id column already exists');
        } else {
            console.error('❌ Error adding linked_product_id:', e.message);
        }
    }

    // Add bundle_size column
    try {
        db.prepare(`ALTER TABLE products ADD COLUMN bundle_size INTEGER DEFAULT 1`).run();
        console.log('✅ Added bundle_size column');
    } catch (e) {
        if (e.message.includes('duplicate column')) {
            console.log('ℹ️ bundle_size column already exists');
        } else {
            console.error('❌ Error adding bundle_size:', e.message);
        }
    }

    console.log('Migration completed successfully.');
} catch (error) {
    console.error('Migration failed:', error);
} finally {
    db.close();
}
