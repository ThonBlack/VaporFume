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
            transaction_amount: Number(paymentInput.amount),
            description: paymentInput.description,
            payment_method_id: 'pix',
            payer: {
                email: paymentInput.email,
                first_name: paymentInput.payer?.first_name || 'Cliente',
                last_name: paymentInput.payer?.last_name || 'Vapor',
                identification: {
                    type: 'CPF',
                    number: '19119119100' // Placeholder if not collected
                }
            }
        };

        console.log('[MercadoPago] Payload:', JSON.stringify(paymentData, null, 2));

        const result = await payment.create({ body: paymentData });
        return {
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: result.point_of_interaction.transaction_data.qr_code_base64,
            ticket_url: result.point_of_interaction.transaction_data.ticket_url
        };
    } catch (error) {
        console.error('Mercado Pago Error:', error);
        throw new Error('Falha ao criar pagamento Pix: ' + (error.cause || error.message));
    }
}
