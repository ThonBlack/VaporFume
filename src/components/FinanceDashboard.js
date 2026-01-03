'use client';

import { useState, useEffect } from 'react';
import { getFinancialMetrics } from '@/app/actions/finance';
import { Loader2, Calendar, DollarSign, TrendingUp, ShoppingBag, CreditCard } from 'lucide-react';

export default function FinanceDashboard() {
    // Default to "Last 30 Days"
    const [dateRange, setDateRange] = useState('30d');
    const [stats, setStats] = useState({
        revenue: 0,
        profit: 0,
        margin: 0,
        count: 0,
        avgTicket: 0,
        chartData: [],
        topProducts: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [dateRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const range = calculateDateRange(dateRange);
            const data = await getFinancialMetrics(range.start, range.end);
            setStats(data);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
            // Keep zero state on error, maybe toast?
        } finally {
            setLoading(false);
        }
    };

    const calculateDateRange = (range) => {
        const end = new Date();
        const start = new Date();

        switch (range) {
            case 'today':
                start.setHours(0, 0, 0, 0);
                break;
            case '7d':
                start.setDate(end.getDate() - 7);
                break;
            case '30d':
                start.setDate(end.getDate() - 30);
                break;
            case 'month':
                start.setDate(1); // First day of current month
                break;
            default:
                start.setDate(end.getDate() - 30);
        }
        return { start, end };
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Financeiro</h1>
                    <p className="text-gray-500 text-sm">Visão geral do desempenho da loja.</p>
                </div>

                {/* Filters */}
                <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm inline-flex">
                    {[
                        { id: 'today', label: 'Hoje' },
                        { id: '7d', label: '7 Dias' },
                        { id: '30d', label: '30 Dias' },
                        { id: 'month', label: 'Este Mês' },
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setDateRange(f.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${dateRange === f.id
                                ? 'bg-black text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KPICard
                            title="Faturamento"
                            value={formatMoney(stats.revenue)}
                            icon={DollarSign}
                            color="green"
                            subtitle={`${stats.count} pedidos`}
                        />
                        <KPICard
                            title="Lucro Líquido"
                            value={formatMoney(stats.profit)}
                            icon={TrendingUp}
                            color="blue"
                            subtitle={`${stats.margin.toFixed(1)}% Margem`}
                        />
                        <KPICard
                            title="Ticket Médio"
                            value={formatMoney(stats.avgTicket)}
                            icon={CreditCard}
                            color="purple"
                            subtitle="Por pedido"
                        />
                        <KPICard
                            title="Custo Produtos"
                            value={formatMoney(stats.revenue - stats.profit)}
                            icon={ShoppingBag}
                            color="orange"
                            subtitle="Estimado"
                        />
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Desemoenho Diário</h3>
                        <div className="h-64 flex items-end gap-2">
                            {stats.chartData.length === 0 ? (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    Sem dados neste período
                                </div>
                            ) : (
                                stats.chartData.map((day, idx) => {
                                    const maxRev = Math.max(...stats.chartData.map(d => d.revenue));
                                    const height = (day.revenue / maxRev) * 100;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col justify-end group relative">
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                                <br />
                                                <span className="font-bold">{formatMoney(day.revenue)}</span>
                                            </div>

                                            {/* Bar */}
                                            <div
                                                className="w-full bg-black/5 hover:bg-black/80 transition-all rounded-t-sm min-h-[4px]"
                                                style={{ height: `${height}%` }}
                                            ></div>

                                            {/* Label */}
                                            <span className="text-[10px] text-gray-400 text-center mt-2 truncate w-full block">
                                                {new Date(day.date + 'T12:00:00').getDate()}
                                            </span>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 Campeões de Vendas</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-3">Produto</th>
                                        <th className="p-3 text-right">Qtd.</th>
                                        <th className="p-3 text-right">Faturamento</th>
                                        <th className="p-3 text-right hidden sm:table-cell">Lucro</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {stats.topProducts.length === 0 ? (
                                        <tr><td colSpan="4" className="p-4 text-center text-gray-400">Sem vendas no período</td></tr>
                                    ) : (
                                        stats.topProducts.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="p-3 font-medium text-gray-900">{idx + 1}. {p.name}</td>
                                                <td className="p-3 text-right text-gray-600">{p.quantity}</td>
                                                <td className="p-3 text-right font-bold text-gray-900">{formatMoney(p.revenue)}</td>
                                                <td className="p-3 text-right text-green-600 hidden sm:table-cell">{formatMoney(p.profit)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, subtitle }) {
    const colors = {
        green: 'bg-green-50 text-green-700 border-green-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        purple: 'bg-purple-50 text-purple-700 border-purple-100',
        orange: 'bg-orange-50 text-orange-700 border-orange-100',
    };

    return (
        <div className={`p-6 rounded-2xl border ${colors[color]} transition-transform hover:scale-[1.02]`}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-xs font-bold uppercase opacity-70 mb-1">{title}</p>
                    <h3 className="text-2xl font-bold">{value}</h3>
                </div>
                <div className="p-2 bg-white/50 rounded-lg">
                    <Icon size={20} />
                </div>
            </div>
            <p className="text-sm opacity-80 font-medium">{subtitle}</p>
        </div>
    );
}

function formatMoney(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}
