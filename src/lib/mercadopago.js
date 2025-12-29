import { MercadoPagoConfig, Payment } from 'mercadopago';
import { getSettings } from '@/app/actions/settings';

/**
 * Creates a Pix payment using user credentials from DB
 */
export async function createPixPayment(orderData) {
    const settings = await getSettings();
    const accessToken = settings.mercadopago_access_token;

    if (!accessToken) {
        throw new Error('Access Token do Mercado Pago não configurado.');
    }

    const client = new MercadoPagoConfig({ accessToken: accessToken });
    const payment = new Payment(client);

    try {
        const paymentData = {
            transaction_amount: orderData.total,
            description: `Pedido #${orderData.id} - Vapor Fumê`,
            payment_method_id: 'pix',
            payer: {
                email: orderData.customerEmail,
                first_name: orderData.customerName.split(' ')[0],
                last_name: orderData.customerName.split(' ').slice(1).join(' ') || 'Cliente',
                identification: {
                    type: 'CPF',
                    number: '19119119100' // Placeholder if not collected
                }
            }
        };

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
        throw new Error('Falha ao criar pagamento Pix.');
    }
}
