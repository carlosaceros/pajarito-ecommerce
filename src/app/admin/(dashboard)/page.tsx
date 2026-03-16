'use client';

import { motion } from 'framer-motion';
import {
    TrendingUp,
    ShoppingCart,
    Users,
    DollarSign,
    Package,
    ArrowUpRight,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut();
        router.push('/admin/login');
    };

    // Mock data - will be replaced with real Firestore data
    const stats = {
        today: {
            sales: 850000,
            orders: 23,
            change: '+15%'
        },
        month: {
            sales: 12500000,
            orders: 347,
            change: '+22%'
        },
        metrics: {
            avgTicket: 36900,
            avgTicketChange: '+8%',
            conversion: 4.2,
            conversionChange: '+0.5%',
            ltv: 124000,
            ltvChange: '+12%'
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('es-CO').format(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Top Bar */}
            <header className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                            PAJARITO ADMIN
                        </h1>
                        <span className="hidden md:inline-block text-sm text-gray-500">
                            Dashboard Ejecutivo
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                            <p className="text-xs text-gray-500">Administrador</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSignOut}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut size={20} className="text-gray-600" />
                        </motion.button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                {/* Period Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Today */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold opacity-90">HOY</h2>
                            <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1">
                                <span className="text-sm font-black">{stats.today.change}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl font-black">{formatCurrency(stats.today.sales)}</p>
                            <p className="text-blue-100">{stats.today.orders} pedidos</p>
                        </div>
                    </motion.div>

                    {/* Month */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold opacity-90">ESTE MES</h2>
                            <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-1">
                                <span className="text-sm font-black">{stats.month.change}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-4xl font-black">{formatCurrency(stats.month.sales)}</p>
                            <p className="text-green-100">{stats.month.orders} pedidos</p>
                        </div>
                    </motion.div>
                </div>

                {/* Key Metrics */}
                <div className="mb-8">
                    <h2 className="text-lg font-black text-gray-900 mb-4">MÉTRICAS CRÍTICAS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Avg Ticket */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
                                    <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.metrics.avgTicket)}</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-2">
                                    <TrendingUp className="text-green-600" size={20} />
                                </div>
                            </div>
                            <p className="text-xs text-green-600 font-bold">{stats.metrics.avgTicketChange} vs mes anterior</p>
                        </motion.div>

                        {/* Conversion Rate */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Tasa Conversión</p>
                                    <p className="text-2xl font-black text-gray-900">{stats.metrics.conversion}%</p>
                                </div>
                                <div className="bg-blue-100 rounded-lg p-2">
                                    <ShoppingCart className="text-blue-600" size={20} />
                                </div>
                            </div>
                            <p className="text-xs text-green-600 font-bold">{stats.metrics.conversionChange} vs mes anterior</p>
                        </motion.div>

                        {/* LTV */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">LTV Cliente</p>
                                    <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.metrics.ltv)}</p>
                                </div>
                                <div className="bg-purple-100 rounded-lg p-2">
                                    <Users className="text-purple-600" size={20} />
                                </div>
                            </div>
                            <p className="text-xs text-green-600 font-bold">{stats.metrics.ltvChange} vs mes anterior</p>
                        </motion.div>
                    </div>
                </div>

                {/* Order Pipeline */}
                <div className="mb-8">
                    <h2 className="text-lg font-black text-gray-900 mb-4">PIPELINE DE PEDIDOS</h2>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-xl p-6 shadow-md border border-gray-100"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="bg-yellow-100 text-yellow-700 rounded-lg py-3 px-4 mb-2">
                                    <p className="text-2xl font-black">5</p>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Pendiente</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-blue-100 text-blue-700 rounded-lg py-3 px-4 mb-2">
                                    <p className="text-2xl font-black">12</p>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Confirmado</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-purple-100 text-purple-700 rounded-lg py-3 px-4 mb-2">
                                    <p className="text-2xl font-black">8</p>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Enviado</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-orange-100 text-orange-700 rounded-lg py-3 px-4 mb-2">
                                    <p className="text-2xl font-black">15</p>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">En Camino</p>
                            </div>
                            <div className="text-center">
                                <div className="bg-green-100 text-green-700 rounded-lg py-3 px-4 mb-2">
                                    <p className="text-2xl font-black">234</p>
                                </div>
                                <p className="text-xs text-gray-600 font-medium">Entregado</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg font-black text-gray-900 mb-4">ACCESOS RÁPIDOS</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => router.push('/admin/pedidos')}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-left hover:border-red-200 transition-colors"
                        >
                            <Package className="text-red-600 mb-3" size={24} />
                            <p className="font-black text-gray-900 mb-1">Gestionar Pedidos</p>
                            <p className="text-xs text-gray-600">Ver y actualizar estados</p>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-left hover:border-blue-200 transition-colors"
                        >
                            <Users className="text-blue-600 mb-3" size={24} />
                            <p className="font-black text-gray-900 mb-1">Clientes</p>
                            <p className="text-xs text-gray-600">Base de datos completa</p>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-left hover:border-green-200 transition-colors"
                        >
                            <DollarSign className="text-green-600 mb-3" size={24} />
                            <p className="font-black text-gray-900 mb-1">Reportes</p>
                            <p className="text-xs text-gray-600">Analytics y finanzas</p>
                        </motion.button>
                    </div>
                </div>

                {/* Coming Soon */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-8 text-center"
                >
                    <p className="text-gray-400 text-sm">
                        🚀 Próximamente: Order Management Kanban, Customer Intelligence, AI Assistant y más...
                    </p>
                </motion.div>
            </main>
        </div>
    );
}
