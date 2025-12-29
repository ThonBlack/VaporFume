import { getDashboardStats } from '@/app/actions/dashboard';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    return (
        <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '32px', color: '#111' }}>
                Visão Geral
            </h1>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '40px'
            }}>
                <StatCard
                    title="Faturamento (Pago)"
                    value={`R$ ${stats.revenue.toFixed(2)}`}
                    trend={`Lucro Líquido: R$ ${stats.profit.toFixed(2)}`}
                    icon={<DollarSign size={24} color="#166534" />}
                />
                <StatCard
                    title="Margem de Lucro"
                    value={`${stats.margin}%`}
                    trend="Sobre Faturamento"
                    icon={<TrendingUp size={24} color="#10b981" />}
                />
                <StatCard
                    title="Pedidos Pendentes"
                    value={stats.pending}
                    trend="Aguardando Ação"
                    icon={<ShoppingBag size={24} color="#f59e0b" />}
                />
                <StatCard
                    title="Produtos Cadastrados"
                    value={stats.products}
                    trend="Total em Loja"
                    icon={<Package size={24} color="#3b82f6" />}
                />
            </div>

            {/* Recent Orders */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                <div className="flex justify-between items-center mb-6">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Pedidos Recentes</h3>
                    <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">Ver todos</Link>
                </div>

                <div className="overflow-x-auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee', color: '#888', fontSize: '0.9rem' }}>
                                <th style={{ padding: '12px' }}>ID</th>
                                <th style={{ padding: '12px' }}>Cliente</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Total</th>
                                <th style={{ padding: '12px' }}>Data</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.95rem' }}>
                            {stats.recent.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-400">Nenhum pedido recente.</td>
                                </tr>
                            ) : (
                                stats.recent.map(order => (
                                    <OrderRow
                                        key={order.id}
                                        id={`#${order.id}`}
                                        client={order.customerName}
                                        status={order.status}
                                        total={`R$ ${order.total.toFixed(2)}`}
                                        date={new Date(order.createdAt).toLocaleDateString('pt-BR')}
                                        rawId={order.id}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, trend, icon }) {
    return (
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: '#f5f5f7', borderRadius: '12px' }}>
                    {icon}
                </div>
                {/* <span style={{ fontSize: '0.8rem', color: '#888' }}>{trend}</span> */}
            </div>
            <h3 style={{ color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</h3>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#111' }}>{value}</span>
            <p className="text-xs text-gray-500 mt-2">{trend}</p>
        </div>
    );
}

function OrderRow({ id, client, status, total, date, rawId }) {
    const getStatusColor = (s) => {
        // Normalize status
        const norm = s?.toLowerCase() || '';
        if (['pago', 'paid', 'completed'].includes(norm)) return '#dcfce7';
        if (['pendente', 'pending'].includes(norm)) return '#fef3c7';
        if (['enviado', 'shipped'].includes(norm)) return '#dbeafe';
        if (['cancelado', 'canceled'].includes(norm)) return '#fee2e2';
        return '#f3f4f6';
    };

    const getStatusText = (s) => {
        const norm = s?.toLowerCase() || '';
        if (['pago', 'paid', 'completed'].includes(norm)) return '#166534';
        if (['pendente', 'pending'].includes(norm)) return '#d97706';
        if (['enviado', 'shipped'].includes(norm)) return '#1e40af';
        if (['cancelado', 'canceled'].includes(norm)) return '#991b1b';
        return '#374151';
    };

    return (
        <tr style={{ borderBottom: '1px solid #f5f5f7', cursor: 'pointer' }} className="hover:bg-gray-50 transition-colors">
            <td style={{ padding: '0' }}>
                <Link href={`/admin/orders/${rawId}`} className="block p-4 font-semibold text-gray-900 w-full h-full">
                    {id}
                </Link>
            </td>
            <td style={{ padding: '0' }}>
                <Link href={`/admin/orders/${rawId}`} className="block p-4 w-full h-full">
                    {client}
                </Link>
            </td>
            <td style={{ padding: '16px' }}>
                <span style={{
                    background: getStatusColor(status),
                    color: getStatusText(status),
                    padding: '4px 12px',
                    borderRadius: '99px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                }}>
                    {status}
                </span>
            </td>
            <td style={{ padding: '0' }}>
                <Link href={`/admin/orders/${rawId}`} className="block p-4 font-semibold w-full h-full">
                    {total}
                </Link>
            </td>
            <td style={{ padding: '0' }}>
                <Link href={`/admin/orders/${rawId}`} className="block p-4 text-gray-500 w-full h-full">
                    {date}
                </Link>
            </td>
        </tr>
    );
}
