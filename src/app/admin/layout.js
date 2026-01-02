'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, DollarSign, LogOut, Settings, Monitor, FolderTree, Mail, Menu, X, Smartphone } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // If we are on the login page, don't show the sidebar
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-[#f5f5f7] flex flex-col md:flex-row">

            {/* Mobile Header */}
            <div className="md:hidden bg-[#111] text-white p-4 flex items-center justify-between sticky top-0 z-50">
                <h2 className="text-xl font-bold">
                    <span className="text-[var(--primary)]">Vapor</span>Admin
                </h2>
                <button onClick={toggleSidebar} className="p-2 text-white">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-[260px] bg-[#111] text-white p-6 flex flex-col transition-transform duration-300 ease-in-out
                md:translate-x-0 md:static md:h-screen md:sticky md:top-0
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}>
                <div className="mb-10 px-2 hidden md:block">
                    <h2 className="text-2xl font-bold">
                        <span className="text-[var(--primary)]">Vapor</span>Admin
                    </h2>
                </div>

                <nav className="flex flex-col gap-2 flex-1 overflow-y-auto">
                    <NavLink href="/admin" icon={<LayoutDashboard size={20} />} label="Visão Geral" active={pathname === '/admin'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/products" icon={<Package size={20} />} label="Produtos" active={pathname === '/admin/products'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/categories" icon={<FolderTree size={20} />} label="Categorias" active={pathname === '/admin/categories'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/orders" icon={<ShoppingCart size={20} />} label="Pedidos" active={pathname === '/admin/orders'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/finance" icon={<DollarSign size={20} />} label="Financeiro" active={pathname === '/admin/finance'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/marketing" icon={<Mail size={20} />} label="Marketing" active={pathname === '/admin/marketing'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/automations" icon={<Smartphone size={20} />} label="Automações" active={pathname === '/admin/automations'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/settings" icon={<Settings size={20} />} label="Configurações" active={pathname === '/admin/settings'} onClick={() => setIsSidebarOpen(false)} />
                    <NavLink href="/admin/pos" icon={<Monitor size={20} />} label="PDV (Caixa)" active={pathname === '/admin/pos'} onClick={() => setIsSidebarOpen(false)} />
                </nav>

                <div className="mt-auto pt-6 border-t border-gray-800">
                    <button className="flex items-center gap-3 w-full p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-10 w-full overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}

function NavLink({ href, icon, label, active, onClick }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${active
                    ? 'bg-[var(--primary)] text-black font-semibold shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
