const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

console.log('🚀 Criando tabela de cupons...\n');

try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT NOT NULL UNIQUE,
            type TEXT NOT NULL DEFAULT 'percent',
            value REAL NOT NULL,
            min_order_value REAL DEFAULT 0,
            max_uses INTEGER,
            used_count INTEGER DEFAULT 0,
            expires_at TEXT,
            active INTEGER DEFAULT 1,
            tenant_id INTEGER REFERENCES tenants(id),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tabela coupons criada');
} catch (e) {
    console.log('⚠️ Tabela coupons já existe ou erro:', e.message);
}

console.log('\n🎉 Migração concluída!');
db.close();
