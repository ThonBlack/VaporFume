export function generateWhatsAppLink(number, message) {
    // Remove non-numeric characters from number
    const cleanNumber = number.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function generateOrderMessage(order) {
    const itemsList = order.items.map(item =>
        `- ${item.quantity}x ${item.productName} ${item.variantName ? `(${item.variantName})` : ''}`
    ).join('\n');

    return `*Novo Pedido #${order.id}* 🛒
  
*Cliente:* ${order.customerName}
*Total:* R$ ${order.total.toFixed(2)}

*Itens:*
${itemsList}

*Pagamento:* ${order.paymentMethod === 'whatsapp' ? 'A Combinar' : 'Pix/Cartão'}
*Endereço:* ${order.customerAddress ? `${order.customerAddress} - ${order.customerCity}` : 'Não informado'}

Aguardando confirmação!`;
}
