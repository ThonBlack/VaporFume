'use client';

import { useState, useEffect } from 'react';
import { getSettings } from '@/app/actions/settings';
import { Wifi, WifiOff } from 'lucide-react';

export default function WhatsAppStatusBadge() {
    const [status, setStatus] = useState('unknown'); // connected, disconnected, qrcode

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const settings = await getSettings();
            setStatus(settings.whatsapp_status || 'disconnected');
        } catch (e) {
            console.error(e);
        }
    };

    if (status === 'connected') {
        return (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold border border-green-500/20">
                <Wifi size={14} />
                <span className="hidden md:inline">WhatsApp Online</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-bold border border-red-500/20 animate-pulse">
            <WifiOff size={14} />
            <span className="hidden md:inline">WhatsApp Offline</span>
        </div>
    );
}
