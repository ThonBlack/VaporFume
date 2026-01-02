const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { sqliteTable, text } = require('drizzle-orm/sqlite-core');
const { eq } = require('drizzle-orm');

// Mock specific for this script
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

const settings = sqliteTable('settings', {
    key: text('key').primaryKey(),
    value: text('value'),
});

async function testShipping() {
    console.log('--- Starting Melhor Envio Debug ---');

    try {
        const result = await db.select().from(settings).where(eq(settings.key, 'melhor_envio_token')).get();
        const sandboxRes = await db.select().from(settings).where(eq(settings.key, 'melhor_envio_sandbox')).get();

        const token = result ? result.value : null;
        const isSandbox = sandboxRes ? sandboxRes.value === 'true' : false;

        console.log('Token exists:', !!token);
        console.log('Token Length:', token ? token.length : 0);
        console.log('Is Sandbox:', isSandbox);

        if (!token) {
            console.error('NO TOKEN FOUND');
            return;
        }

        const url = isSandbox
            ? 'https://sandbox.melhorenvio.com.br/api/v2/me'
            : 'https://melhorenvio.com.br/api/v2/me';

        console.log('Testing URL:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'VaporFume/1.0 (rocha@email.com)' // Placeholder
            }
        });

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);

    } catch (e) {
        console.error('Script Error:', e);
    }
}

testShipping();
