const Database = require('better-sqlite3');
const db = new Database('./sqlite.db');

console.log('🚀 Iniciando migração para multi-tenancy...\n');

// 1. Criar tabela tenants
try {
    db.exec(`
        CREATE TABLE IF NOT EXISTS tenants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            logo TEXT,
            favicon TEXT,
            primary_color TEXT DEFAULT '#000000',
            secondary_color TEXT DEFAULT '#3b82f6',
            background_color TEXT DEFAULT '#ffffff',
            msg_recovery TEXT,
            msg_winback_15 TEXT,
            msg_winback_30 TEXT,
            msg_winback_45 TEXT,
            msg_restock TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);
    console.log('✅ Tabela tenants criada');
} catch (e) {
    console.log('⚠️ Tabela tenants já existe ou erro:', e.message);
}

// 2. Inserir tenant default
try {
    const existing = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('default');
    if (!existing) {
        db.prepare(`
            INSERT INTO tenants (slug, name, logo, primary_color, secondary_color)
            VALUES ('default', 'Vapor Fumê', '/assets/icon-v2.png', '#000000', '#3b82f6')
        `).run();
        console.log('✅ Tenant default criado');
    } else {
        console.log('⚠️ Tenant default já existe');
    }
} catch (e) {
    console.log('⚠️ Erro ao criar tenant default:', e.message);
}

// 3. Adicionar tenant_id nas tabelas existentes
const tables = ['categories', 'settings', 'products', 'orders'];

for (const table of tables) {
    try {
        db.exec(`ALTER TABLE ${table} ADD COLUMN tenant_id INTEGER REFERENCES tenants(id)`);
        console.log(`✅ Coluna tenant_id adicionada em ${table}`);
    } catch (e) {
        if (e.message.includes('duplicate column')) {
            console.log(`⚠️ Coluna tenant_id já existe em ${table}`);
        } else {
            console.log(`⚠️ Erro em ${table}:`, e.message);
        }
    }
}

// 4. Atualizar registros existentes para usar tenant default
try {
    const tenant = db.prepare('SELECT id FROM tenants WHERE slug = ?').get('default');
    if (tenant) {
        for (const table of tables) {
            const result = db.prepare(`UPDATE ${table} SET tenant_id = ? WHERE tenant_id IS NULL`).run(tenant.id);
            console.log(`✅ ${result.changes} registros atualizados em ${table}`);
        }
    }
} catch (e) {
    console.log('⚠️ Erro ao atualizar registros:', e.message);
}

console.log('\n🎉 Migração concluída!');
db.close();
