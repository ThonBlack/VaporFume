import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/db/schema';
import { desc, eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    // Fetch all paid/completed orders
    const paidOrders = await db.query.orders.findMany({
        where: inArray(orders.status, ['Pago', 'paid', 'completed']),
        with: {
            items: {
                with: {
                    product: true
                }
            }
        },
        orderBy: [desc(orders.createdAt)]
    });

    let totalRevenue = 0;
    let totalCost = 0;

    const financialData = paidOrders.map(order => {
        const orderRevenue = order.total;

        // Calculate Cost for this order
        const orderCost = order.items.reduce((acc, item) => {
            // Priority: Item saved cost (if we saved it, currently we rely on product current cost)
            // Ideally we should snapshot cost at time of purchase. For now we use current product cost.
            const unitCost = item.product?.costPrice || 0;
            return acc + (unitCost * item.quantity);
        }, 0);

        const orderProfit = orderRevenue - orderCost;
        const orderMargin = orderRevenue > 0 ? (orderProfit / orderRevenue) * 100 : 0;

        totalRevenue += orderRevenue;
        totalCost += orderCost;

        return {
            id: order.id,
            date: new Date(order.createdAt).toLocaleDateString('pt-BR'),
            customer: order.customerName,
            revenue: orderRevenue,
            cost: orderCost,
            profit: orderProfit,
            margin: orderMargin
        };
    });

    const netProfit = totalRevenue - totalCost;
    const totalMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Financeiro</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <p className="text-sm text-green-600 font-medium mb-1">Faturamento Total (Pago)</p>
                    <p className="text-3xl font-bold text-green-700">R$ {totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium mb-1">Lucro Líquido</p>
                    <p className="text-3xl font-bold text-blue-700">R$ {netProfit.toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-600 font-medium mb-1">Margem Geral</p>
                    <p className="text-3xl font-bold text-purple-700">{totalMargin.toFixed(1)}%</p>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Detalhamento por Pedido</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-sm">
                            <tr>
                                <th className="p-4 font-medium">Pedido</th>
                                <th className="p-4 font-medium">Data</th>
                                <th className="p-4 font-medium">Cliente</th>
                                <th className="p-4 font-medium">Faturamento</th>
                                <th className="p-4 font-medium">Custo (Estimado)</th>
                                <th className="p-4 font-medium">Lucro</th>
                                <th className="p-4 font-medium">Margem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {financialData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-400">
                                        Nenhum pedido pago encontrado.
                                    </td>
                                </tr>
                            ) : (
                                financialData.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">#{row.id}</td>
                                        <td className="p-4 text-gray-600">{row.date}</td>
                                        <td className="p-4 text-gray-600">{row.customer}</td>
                                        <td className="p-4 font-medium text-green-600">R$ {row.revenue.toFixed(2)}</td>
                                        <td className="p-4 text-gray-500">R$ {row.cost.toFixed(2)}</td>
                                        <td className="p-4 font-bold text-blue-600">R$ {row.profit.toFixed(2)}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.margin > 30 ? 'bg-green-100 text-green-700' :
                                                row.margin > 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {row.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
