import { getAllTenants, getGlobalStats } from '@/app/actions/superadmin';
import { Building2, DollarSign, ShoppingBag, Package, Users } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuperAdminPage() {
    const tenants = await getAllTenants();
    const stats = await getGlobalStats();

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-gray-900 text-white py-6 px-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-2xl font-bold">🛡️ Super Admin</h1>
                    <p className="text-gray-400 text-sm">Gerenciamento de todas as lojas</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-8">
                {/* Global Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        icon={<Building2 className="w-5 h-5 text-indigo-600" />}
                        label="Lojas"
                        value={stats.totalTenants}
                    />
                    <StatCard
                        icon={<DollarSign className="w-5 h-5 text-green-600" />}
                        label="Faturamento Total"
                        value={`R$ ${stats.totalRevenue.toFixed(2)}`}
                    />
                    <StatCard
                        icon={<ShoppingBag className="w-5 h-5 text-amber-600" />}
                        label="Pedidos"
                        value={stats.totalOrders}
                    />
                    <StatCard
                        icon={<ShoppingBag className="w-5 h-5 text-teal-600" />}
                        label="Pedidos Pagos"
                        value={stats.paidOrders}
                    />
                    <StatCard
                        icon={<Package className="w-5 h-5 text-blue-600" />}
                        label="Produtos"
                        value={stats.totalProducts}
                    />
                </div>

                {/* Tenants List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Lojas Cadastradas</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {tenants.map((tenant) => (
                            <div key={tenant.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                <div className="flex items-center gap-4">
                                    {tenant.logo ? (
                                        <img src={tenant.logo} alt={tenant.name} className="w-12 h-12 rounded-lg object-cover border" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <div className="font-semibold text-gray-900">{tenant.name}</div>
                                        <div className="text-sm text-gray-500">/{tenant.slug}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900">{tenant.stats.paidOrders}</div>
                                        <div className="text-gray-500">pedidos</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-green-600">R$ {tenant.stats.revenue.toFixed(2)}</div>
                                        <div className="text-gray-500">faturado</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-semibold text-gray-900">{tenant.stats.productCount}</div>
                                        <div className="text-gray-500">produtos</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-sm text-gray-500">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
        </div>
    );
}
