'use server';

import { getSettings } from '@/app/actions/settings';

export async function calculateShipping(cep) {
    console.log('[Shipping] Calculating for CEP:', cep);

    try {
        const settings = await getSettings();
        const token = settings.melhor_envio_token;

        if (!token) {
            console.warn('[Shipping] Token Melhor Envio not found. Returning fixed fallback.');
            return { price: 25.00, error: 'Token não configurado' }; // Fallback
        }

        // Clean CEP
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return { price: 0, error: 'CEP Inválido' };

        // Melhor Envio API Endpoint (Sandbox or Prod? usually prod for prod token)
        // We will assume Production for the live token.
        // User didn't specify environment, but token is usually prod.

        // Payload for 1 item generic (15x15x15, 0.3kg)
        const payload = {
            from: { postal_code: '38000000' }, // Origin: Uberaba (Generic Central?) - Wait, user is in Uberaba.
            // We should probably use the store's CEP from settings if available, or hardcode Uberaba generic.
            // Let's use a generic Uberaba CEP for origin if not set. 38010-000 is Center.
            to: { postal_code: cleanCep },
            package: {
                height: 15,
                width: 15,
                length: 15,
                weight: 0.3
            },
            options: {
                receipt: false,
                own_hand: false
            },
            services: '1,2' // 1: PAC, 2: SEDEX (Correios) - IDs might change, better to ask for all and filter.
            // Actually, let's just send the payload and see what returns.
        };

        const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'VaporFume/1.0 (rocha@vaporfume.com)'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('[Shipping] MELHOR ENVIO API ERROR:', response.status, errText);
            throw new Error(`Erro API Melhor Envio: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Shipping] Melhor Envio Response:', JSON.stringify(data, null, 2));

        // data is an array of quotes.
        // We want the cheapest one (usually PAC) or MiniEnvio.

        // Filter for valid quotes w/o error
        const validQuotes = data.filter(q => !q.error && q.price);

        if (validQuotes.length === 0) {
            return { price: 25.90, warning: 'Nenhuma cotação disponível' };
        }

        // Sort by price ascending
        validQuotes.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

        const cheapest = validQuotes[0];
        console.log('[Shipping] Cheapest Quote:', cheapest.name, cheapest.price);

        return {
            price: parseFloat(cheapest.price),
            service: cheapest.name,
            days: cheapest.models?.[0]?.delivery_time || '?'
        };

    } catch (error) {
        console.error('[Shipping] Exception:', error);
        return { price: 25.90, error: 'Erro no cálculo' }; // Fallback safety
    }
}
