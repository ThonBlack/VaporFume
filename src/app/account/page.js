'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { ShoppingBag, Heart, LogOut, User, Package, Calendar, ChevronRight, Loader2, ArrowRight, Lock, UserPlus } from 'lucide-react';
import { getFavorites, getCustomerOrders } from '@/lib/actions';
import { registerCustomer, loginCustomer } from '@/app/actions/customer';
import ProductCard from '@/components/ProductCard';
import { toast } from 'react-hot-toast';

export default function AccountPage() {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(false);

    // Auth State
    const [authMode, setAuthMode] = useState('login'); // login | register
    const [formData, setFormData] = useState({ phone: '', password: '', name: '' });

    // Data
    const [orders, setOrders] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {
        const savedUser = localStorage.getItem('user_data');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            setUser(parsed);
            fetchData(parsed.phone);
        }
    }, []);

    const fetchData = async (userPhone) => {
        setDataLoading(true);
        try {
            const [ordersData, favoritesData] = await Promise.all([
                getCustomerOrders(userPhone),
                getFavorites(userPhone)
            ]);
            setOrders(ordersData);
            setFavorites(favoritesData);
        } catch (error) {
            console.error(error);
        } finally {
            setDataLoading(false);
        }
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Normalize phone
        const cleanPhone = formData.phone.replace(/\D/g, '');

        if (cleanPhone.length < 10) {
            toast.error('Telefone inválido');
            setLoading(false);
            return;
        }

        try {
            let res;
            if (authMode === 'register') {
                res = await registerCustomer(cleanPhone, formData.password, formData.name);
                if (res.success) {
                    toast.success('Conta criada! Faça login.');
                    setAuthMode('login');
                    setLoading(false);
                    return;
                }
            } else {
                res = await loginCustomer(cleanPhone, formData.password);
                if (res.success) {
                    const userData = { phone: res.user.phone, name: res.user.name };
                    localStorage.setItem('user_data', JSON.stringify(userData));
                    // Check for old simple auth and clear it
                    localStorage.removeItem('user_phone');

                    setUser(userData);
                    await fetchData(res.user.phone);
                    toast.success(`Bem-vindo, ${res.user.name || 'Cliente'}!`);
                }
            }

            if (!res.success) {
                toast.error(res.error);
            }
        } catch (error) {
            console.error(error);
            toast.error('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        if (confirm('Deseja realmente sair?')) {
            localStorage.removeItem('user_data');
            localStorage.removeItem('user_phone'); // Cleanup legacy
            setUser(null);
            setOrders([]);
            setFavorites([]);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const getStatusColor = (status) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            'pending': 'Pendente',
            'processing': 'Em Preparo',
            'shipped': 'Enviado',
            'completed': 'Entregue',
            'cancelled': 'Cancelado'
        };
        return labels[status] || status;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <main className="container pt-6 px-4">

                {/* AUTH STATE */}
                {!user ? (
                    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-sm mt-10">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[var(--primary)] text-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lime-500/20">
                                <Lock size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {authMode === 'login' ? 'Acesse sua Conta' : 'Crie sua Conta'}
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                {authMode === 'login'
                                    ? 'Digite seu WhatsApp e senha para entrar.'
                                    : 'Preencha seus dados para ter acesso exclusivo.'}
                            </p>
                        </div>

                        <form onSubmit={handleAuth} className="flex flex-col gap-4">
                            {authMode === 'register' && (
                                <input
                                    type="text"
                                    placeholder="Seu Nome"
                                    className="p-4 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] transition-colors"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            )}

                            <input
                                type="tel"
                                placeholder="WhatsApp (DDD + Número)"
                                className="p-4 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] transition-colors"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />

                            <input
                                type="password"
                                placeholder="Sua Senha"
                                className="p-4 border border-gray-200 rounded-xl outline-none focus:border-[var(--primary)] transition-colors"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[var(--primary)] text-black font-bold py-4 rounded-xl hover:bg-[#b3e600] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-lime-500/20 mt-2"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (authMode === 'login' ? 'Entrar' : 'Cadastrar')}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                className="text-sm text-gray-600 hover:text-[var(--primary-dim)] font-medium underline"
                            >
                                {authMode === 'login'
                                    ? 'Ainda não tem conta? Cadastre-se'
                                    : 'Já tem conta? Faça login'}
                            </button>
                        </div>
                    </div>
                ) : (
                    // LOGGED IN STATE
                    <div>
                        {/* Header Profile */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {user.name || user.phone}
                                </p>
                            </div>
                            <button onClick={handleLogout} className="text-red-500 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors">
                                <LogOut size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-white rounded-xl shadow-sm mb-6 sticky top-[110px] z-10 mx-auto max-w-fit md:mx-0 md:max-w-none md:w-full">
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'orders'
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Package size={18} /> Pedidos
                            </button>
                            <button
                                onClick={() => setActiveTab('favorites')}
                                className={`flex-1 py-3 px-6 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'favorites'
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <Heart size={18} fill={activeTab === 'favorites' ? 'currentColor' : 'none'} /> Favoritos
                            </button>
                        </div>

                        {dataLoading ? (
                            <div className="text-center py-20">
                                <Loader2 className="animate-spin mx-auto text-gray-400" size={32} />
                                <p className="text-gray-400 mt-2">Carregando seus dados...</p>
                            </div>
                        ) : (
                            <>
                                {/* ORDERS TAB */}
                                {activeTab === 'orders' && (
                                    <div className="space-y-4">
                                        {orders.length === 0 ? (
                                            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                                <Package className="mx-auto text-gray-300 mb-2" size={48} />
                                                <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
                                                <a href="/" className="text-[var(--primary-dim)] font-bold mt-2 inline-block">Começar a comprar</a>
                                            </div>
                                        ) : (
                                            orders.map(order => (
                                                <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group cursor-pointer hover:border-[var(--primary)] transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-gray-900">Pedido #{order.id}</span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                                                                {getStatusLabel(order.status)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                            <div className="font-medium text-gray-900">
                                                                R$ {order.total.toFixed(2)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="text-gray-300 group-hover:text-[var(--primary-dim)]" />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* FAVORITES TAB */}
                                {activeTab === 'favorites' && (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        {favorites.length === 0 ? (
                                            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                                <Heart className="mx-auto text-gray-300 mb-2" size={48} />
                                                <p className="text-gray-500">Sua lista de desejos está vazia.</p>
                                            </div>
                                        ) : (
                                            favorites.map(product => (
                                                <ProductCard key={product.id} product={product} />
                                            ))
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
