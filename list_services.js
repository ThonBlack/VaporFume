const fetch = require('node-fetch');
const Database = require('better-sqlite3');

async function listServices() {
    console.log('Opening database...');
    const db = new Database('/root/VaporFume/sqlite.db');

    const row = db.prepare("SELECT value FROM settings WHERE key = 'melhor_envio_token'").get();
    const token = row ? row.value : null;

    if (!token) {
        console.error('Token NOT FOUND');
        process.exit(1);
    }

    try {
        const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/services', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'VaporFume/1.0'
            }
        });

        const services = await response.json();
        console.log('Available Services:');
        services.forEach(s => {
            console.log(`${s.id}: ${s.name} (${s.company.name})`);
        });

    } catch (e) {
        console.error('Error:', e);
    }
}

listServices();
