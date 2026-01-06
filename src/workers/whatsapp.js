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

    // Listen for incoming messages to update last interaction
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.key.fromMe && m.type === 'notify') {
                const remoteJid = msg.key.remoteJid;
                const phone = remoteJid.split('@')[0];
                const now = new Date().toISOString();

                // Update lastInteraction in customers table
                // Since this worker uses raw SQL, we need to ensure table exists or fail gracefully
                try {
                    // Check if customer exists first
                    const existing = db.prepare("SELECT id FROM customers WHERE phone = ?").get(phone);
                    if (existing) {
                        db.prepare("UPDATE customers SET last_interaction = ? WHERE phone = ?").run(now, phone);
                        console.log(`Updated last_interaction for ${phone}`);
                    }
                } catch (err) {
                    console.error('Error updating last_interaction:', err);
                }
            }
        } catch (e) {
            console.error('Error handling incoming msg:', e);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

// Queue Processor Loop
async function startQueueProcessor(sockPromise) {
    let sock = await sockPromise;

    // Use while(true) to ensure strict sequential processing
    // setInterval DOES NOT wait for async operations to complete
    while (true) {
        try {
            const nowObj = new Date();
            const hour = nowObj.getHours();

            // Strict Window: 09:00 to 17:00
            if (hour < 9 || hour >= 17) {
                await delay(60000); // Sleep 1 min if outside window
                continue;
            }

            const messages = getPendingMessages();

            if (messages.length > 0) {
                const msg = messages[0];

                // --- Smart Win-back Check (Updated to 10 days) ---
                if (msg.type && msg.type.startsWith('winback')) {
                    try {
                        const customer = db.prepare("SELECT last_interaction FROM customers WHERE phone = ?").get(msg.phone);
                        if (customer && customer.last_interaction) {
                            const lastInt = new Date(customer.last_interaction);
                            const daysDiff = (nowObj - lastInt) / (1000 * 60 * 60 * 24);

                            if (daysDiff < 10) {
                                console.log(`Skipping Winback for ${msg.phone} (Interacted ${daysDiff.toFixed(1)} days ago)`);
                                updateMessageStatus(msg.id, 'canceled');
                                continue; // Skip to next iteration immediately (chk queue again)
                            }
                        }
                    } catch (err) {
                        console.error('Error checking winback interaction:', err);
                    }
                }

                // --- FORMATTING & VALIDATION ---
                let cleanPhone = msg.phone.replace(/\D/g, '');
                if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
                    cleanPhone = '55' + cleanPhone;
                }

                const jid = cleanPhone + '@s.whatsapp.net';
                console.log(`Processing Msg ${msg.id} to ${cleanPhone}...`);

                // Check and Send
                const [result] = await sock.onWhatsApp(jid);

                if (result && result.exists) {
                    await sock.sendMessage(result.jid, { text: msg.content });
                    updateMessageStatus(msg.id, 'sent');
                    console.log(`Msg ${msg.id} SENT to ${result.jid}`);
                } else {
                    console.error(`Number not found on WhatsApp: ${cleanPhone}`);
                    updateMessageStatus(msg.id, 'failed');
                }

                // --- SMART DISTRIBUTED DELAY ---
                const pendingCountFn = db.prepare("SELECT count(*) as count FROM message_queue WHERE status = 'pending'");
                const pendingCount = pendingCountFn.get().count;

                const flowEnd = new Date(nowObj);
                flowEnd.setHours(17, 0, 0, 0);
                let remainingMs = flowEnd.getTime() - Date.now();
                if (remainingMs < 0) remainingMs = 0;

                let calculatedDelay = 20000;
                if (pendingCount > 0 && remainingMs > 0) {
                    calculatedDelay = remainingMs / pendingCount;
                }

                const MIN_DELAY = 15000; // 15s absolute minimum
                if (calculatedDelay < MIN_DELAY) calculatedDelay = MIN_DELAY;

                // Jitter
                const jitter = calculatedDelay * 0.1 * (Math.random() > 0.5 ? 1 : -1);
                const finalDelay = Math.floor(calculatedDelay + jitter);

                console.log(`Smart Delay: Pending=${pendingCount}, TimeLeft=${(remainingMs / 60000).toFixed(1)}m, Delay=${(finalDelay / 1000).toFixed(1)}s`);

                await delay(finalDelay); // ACTUAL WAIT
            } else {
                // Empty queue, wait 5s before checking again
                await delay(5000);
            }
        } catch (error) {
            console.error('Error processing queue:', error);
            await delay(5000); // Safety backoff on crash
        }
    }
}

// Start
const sockInstance = startSock();
startQueueProcessor(sockInstance);
