const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

console.log('🚀 Criando tabelas para API e Webhooks...\n');

// 1. API Keys
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            tenant_id INTEGER REFERENCES tenants(id),
            last_used_at TEXT,
            active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tabela api_keys criada');
} catch (e) {
    console.log('⚠️ api_keys:', e.message);
}

// 2. Webhooks
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS webhooks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            events TEXT,
            secret TEXT,
            active INTEGER DEFAULT 1,
            tenant_id INTEGER REFERENCES tenants(id),
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tabela webhooks criada');
} catch (e) {
    console.log('⚠️ webhooks:', e.message);
}

console.log('\n🎉 Migração concluída!');
db.close();
