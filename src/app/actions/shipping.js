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

        // cleanCep
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return { price: 0, error: 'CEP Inválido' };

        // Determine Environment
        const isSandbox = settings.melhor_envio_sandbox === 'true';
        const apiUrl = isSandbox
            ? 'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate'
            : 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

        console.log(`[Shipping] Using ${isSandbox ? 'SANDBOX' : 'PRODUCTION'} URL: ${apiUrl}`);

        // Payload for 1 item generic (15x15x15, 0.3kg)
        const payload = {
            from: { postal_code: '38010210' }, // Uberaba (Centro - Valid CEP)
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
            services: '3,4,33' // Jadlog .Package, Jadlog .Com, JeT Standard
        };

        const response = await fetch(apiUrl, {
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
            console.error('[Shipping] MELHOR ENVIO API ERROR Details:');
            console.error('Status:', response.status);
            console.error('URL:', apiUrl);
            console.error('Token:', token ? `${token.slice(0, 10)}...` : 'NULL');
            console.error('Response Body:', errText);
            throw new Error(`Erro API Melhor Envio: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        console.log('[Shipping] Melhor Envio Response:', JSON.stringify(data, null, 2));

        // data is an array of quotes.
        // We want the cheapest one (usually PAC) or MiniEnvio.

        // Filter for specific services: Jadlog (3, 4) and JeT (33)
        // AND ensure no errors
        const allowedServices = ['3', '4', '33']; // .Package, .Com, Standard (JeT)

        const filteredQuotes = data.filter(q =>
            !q.error &&
            q.price &&
            allowedServices.includes(String(q.id))
        );

        console.log('[Shipping Debug] Total Quotes:', data.length);
        console.log('[Shipping Debug] Filtered Quotes:', filteredQuotes.length);
        if (filteredQuotes.length === 0) {
            console.log('[Shipping Debug] ALL REJECTED. Sample Check:');
            data.slice(0, 3).forEach(q => console.log(`ID: ${q.id} (${typeof q.id}) | Name: ${q.name} | Price: ${q.price}`));
        }

        if (filteredQuotes.length === 0) {
            // If explicit services fail, fallback to any valid ones (e.g. Correios as backup?)
            // Or return warning. Let's try to return at least something.
            const anyValid = data.filter(q => !q.error && q.price);
            if (anyValid.length === 0) {
                return { price: 25.90, warning: 'Nenhuma cotação disponível' };
            }
            // If fallback needed, maybe return top 2 cheapest regardless of carrier?
            // For now, let's stick to user request: "Limit to JET and Jadlog"
            // If they are not available, we might return empty or error.
            return { price: 25.90, warning: 'Jadlog/JeT indisponíveis para este CEP' };
        }

        // Map to cleaner format
        const options = filteredQuotes.map(q => ({
            name: `${q.company.name} (${q.name})`,
            service: q.name,
            carrier: q.company.name,
            price: parseFloat(q.price),
            days: q.days || q.delivery_time || '?',
            id: q.id,
            picture: q.company.picture
        }));

        // Sort by price
        options.sort((a, b) => a.price - b.price);

        return options; // Return Array

    } catch (error) {
        console.error('[Shipping] Exception:', error);
        return { price: 25.90, error: 'Erro no cálculo' }; // Fallback safety
    }
}
