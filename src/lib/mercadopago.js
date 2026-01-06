import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSettings } from '@/app/actions/settings';

/**
 * Creates a Pix payment using user credentials from DB
 */
export async function createPixPayment(paymentInput) {
    const settings = await getSettings();
    const accessToken = settings.mercadopago_access_token;

    // Debug log to confirm token load (masked)
    console.log('[MercadoPago] Loaded Token:', accessToken ? `${accessToken.slice(0, 10)}...` : 'NULL');

    if (!accessToken) {
        throw new Error('Access Token do Mercado Pago não configurado.');
    }

    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const payment = new Payment(client);

    try {
        const paymentData = {
            transaction_amount: Number(parseFloat(paymentInput.amount).toFixed(2)),
            description: paymentInput.description,
            payment_method_id: 'pix',
            external_reference: paymentInput.external_reference, // Linked Order ID
            payer: {
                email: paymentInput.email,
                first_name: paymentInput.payer?.first_name || 'Cliente',
                last_name: paymentInput.payer?.last_name || 'Vapor',
                identification: paymentInput.payer.identification || {
                    type: 'CPF',
                    number: '19119119100'
                }
            }
        };

        console.log('[MercadoPago] Payload:', JSON.stringify(paymentData, null, 2));

        const result = await payment.create({ body: paymentData });

        const qrCode = result.point_of_interaction.transaction_data.qr_code;
        console.log('[MercadoPago] QR Code Generated (Length):', qrCode.length);
        console.log('[MercadoPago] QR Code Start:', qrCode.substring(0, 50));

        return {
            id: result.id,
            status: result.status,
            qr_code: qrCode,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
            ticket_url: result.point_of_interaction.transaction_data.ticket_url
        };
    } catch (error) {
        console.error('Mercado Pago Error:', error);
        if (error.response) {
            console.error('Mercado Pago Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        throw new Error('Falha ao criar pagamento Pix: ' + (error.cause || error.message));
    }
}

/**
 * Get Payment Details by ID
 */
export async function getPayment(id) {
    const settings = await getSettings();
    const accessToken = settings.mercadopago_access_token;

    if (!accessToken) {
        throw new Error('Access Token não configurado.');
    }

    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const payment = new Payment(client);

    try {
        const result = await payment.get({ id });
        return result;
    } catch (error) {
        console.error('Mercado Pago Get Payment Error:', error);
        throw error;
    }
}
