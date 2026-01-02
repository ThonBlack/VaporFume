import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    delay
} from '@whiskeysockets/baileys';
import pino from 'pino';
import Database from 'better-sqlite3';

// Initialize DB Connection (Standalone)
const db = new Database('sqlite.db');

// Ensure tables exist (redundant but safe)
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Helpers to update DB
function updateSetting(key, value) {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, value);
}

function getPendingMessages() {
    const now = Math.floor(Date.now() / 1000);
    // Select pending messages scheduled for now or past, limited to 1 for safety per tick
    return db.prepare("SELECT * FROM message_queue WHERE status = 'pending' AND scheduled_at <= ? LIMIT 1").all(now);
}

function updateMessageStatus(id, status) {
    const now = Math.floor(Date.now() / 1000);
    const stmt = db.prepare("UPDATE message_queue SET status = ?, sent_at = ? WHERE id = ?");
    stmt.run(status, status === 'sent' ? now : null, id);
}

import path from 'path';

// ... other imports

async function startSock() {
    // Force absolute path for stability
    const authPath = path.resolve('/root/VaporFume/wa_auth_credentials');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Vapor Fume", "Chrome", "1.0"],
        connectTimeoutMs: 60000, // Increase timeout
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        emitOwnEvents: true,
        retryRequestDelayMs: 250,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('QR Code generated');
            updateSetting('whatsapp_qr', qr);
            updateSetting('whatsapp_status', 'qrcode');
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed due to ', lastDisconnect.error, ', reconnecting: ', shouldReconnect);
            updateSetting('whatsapp_status', 'disconnected');
            updateSetting('whatsapp_qr', ''); // Clear QR
            if (shouldReconnect) {
                startSock();
            }
        } else if (connection === 'open') {
            console.log('WhatsApp Connected!');
            updateSetting('whatsapp_status', 'connected');
            updateSetting('whatsapp_qr', '');
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

// Queue Processor Loop
async function startQueueProcessor(sockPromise) {
    let sock = await sockPromise;

    setInterval(async () => {
        // If we lost connection, maybe wait or reload sock? 
        // For now assume sock handles reconnects internally or via the event handler updates reference if we structured it differently.
        // Actually, startSock returns a promise that resolves once. If it reconnects, the `sock` reference *might* need refreshing if the old one died completely.
        // But Baileys usually keeps the event loop alive.
        // Let's implement a simple check.

        try {
            const messages = getPendingMessages();
            if (messages.length > 0) {
                const msg = messages[0];
                console.log(`Sending to ${msg.phone}: ${msg.content.substring(0, 20)}...`);

                // Format phone: 5567999999999 -> 5567999999999@s.whatsapp.net
                const jid = msg.phone + '@s.whatsapp.net';

                await sock.sendMessage(jid, { text: msg.content });

                updateMessageStatus(msg.id, 'sent');
                console.log(`Msg ${msg.id} SENT`);

                // Random delay between messages to be safe (5-15s)
                // Since this loop runs fast, we use 'await delay' inside
                await delay(Math.floor(Math.random() * 10000) + 5000);
            }
        } catch (error) {
            console.error('Error processing queue:', error);
        }
    }, 10000); // Check every 10 seconds
}

// Start
const sockInstance = startSock();
startQueueProcessor(sockInstance);
