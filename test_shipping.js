const fetch = require('node-fetch'); // Assuming node-fetch is available. If not, we might need to rely on native fetch (Node 18+)
const Database = require('better-sqlite3');
const path = require('path');

async function testShipping() {
    console.log('Opening database...');
    const db = new Database('/root/VaporFume/sqlite.db');

    const row = db.prepare("SELECT value FROM settings WHERE key = 'melhor_envio_token'").get();
    const token = row ? row.value : null;

    if (!token) {
        console.error('Token Melhor Envio NOT FOUND in DB');
        process.exit(1);
    }

    console.log('Token found:', token.substring(0, 15) + '...');

    const cep = '01001000'; // SP Capital
    const apiUrl = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

    const payload = {
        from: { postal_code: '38010210' }, // Uberaba (Valid Street CEP)
        to: { postal_code: cep },
        package: {
            height: 15,
            width: 15,
            length: 15,
            weight: 0.3
        },
        options: { receipt: false, own_hand: false },
        services: '1,2,3,4' // Added more services just in case
    };

    try {
        const response = await fetch(apiUrl, { // If fetch is global in Node 18, this works. If not, verify node version.
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'VaporFume/1.0 (test)'
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Body:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}

testShipping();
