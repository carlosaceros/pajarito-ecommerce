'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Tag, RefreshCw, Download, Search, Printer, Truck, MapPin,
    Calendar, TrendingUp, Package, Shield, FileText, CheckCircle2,
    AlertCircle, ArrowLeft, BarChart3, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { subscribeToOrders } from '@/lib/orders-service';
import { Order } from '@/types/order';

const fmtCurrency = (n: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function AdminGuiasPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<(Order & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [carrierFilter, setCarrierFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        const unsubscribe = subscribeToOrders((fetchedOrders) => {
            setOrders(fetchedOrders);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Filter only orders that have a shipping label generated
    const ordersWithLabel = useMemo(() => {
        return orders.filter(o => !!o.guiaEnvio);
    }, [orders]);

    // Apply search and filter
    const filteredLabels = useMemo(() => {
        return ordersWithLabel.filter(o => {
            const label = o.guiaEnvio!;
            const matchSearch =
                !searchQuery ||
                label.guiaNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.cliente.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.cliente.ciudad.toLowerCase().includes(searchQuery.toLowerCase()) ||
                label.transportadora.toLowerCase().includes(searchQuery.toLowerCase());

            const matchCarrier = carrierFilter === 'all' || label.transportadora.toLowerCase() === carrierFilter.toLowerCase();
            const matchStatus = statusFilter === 'all' || label.estadoGuia === statusFilter;

            return matchSearch && matchCarrier && matchStatus;
        });
    }, [ordersWithLabel, searchQuery, carrierFilter, statusFilter]);

    // ── Business Intelligence (BI) Metrics ──
    const biMetrics = useMemo(() => {
        const totalGuias = ordersWithLabel.length;
        let totalPesoKg = 0;
        let totalBultos = 0;
        let totalFletes = 0;
        const carrierCounts: Record<string, number> = {};
        const cityCounts: Record<string, { count: number; totalFlete: number }> = {};

        ordersWithLabel.forEach(o => {
            const label = o.guiaEnvio!;
            totalPesoKg += label.pesoKg || 5;
            totalBultos += label.bultos || 1;
            totalFletes += o.envio || 0;

            const carrier = label.transportadora.toLowerCase();
            carrierCounts[carrier] = (carrierCounts[carrier] || 0) + 1;

            const city = o.cliente.ciudad || 'Desconocida';
            if (!cityCounts[city]) cityCounts[city] = { count: 0, totalFlete: 0 };
            cityCounts[city].count += 1;
            cityCounts[city].totalFlete += o.envio || 0;
        });

        const topCities = Object.entries(cityCounts)
            .map(([ciudad, data]) => ({ ciudad, count: data.count, avgFlete: Math.round(data.totalFlete / data.count) }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return {
            totalGuias,
            totalPesoKg,
            totalBultos,
            totalFletes,
            avgFlete: totalGuias > 0 ? Math.round(totalFletes / totalGuias) : 0,
            carrierCounts,
            topCities,
        };
    }, [ordersWithLabel]);

    // Export to CSV for logistics reconciliation
    const exportCSV = () => {
        const headers = ['ID Pedido', 'Número Guía', 'Transportadora', 'Cliente', 'Cédula', 'Celular', 'Ciudad', 'Departamento', 'Código DANE', 'Dirección', 'Peso (kg)', 'Bultos', 'Total Pedido', 'Costo Envío', 'Fecha Creación'];
        const rows = filteredLabels.map(o => {
            const l = o.guiaEnvio!;
            return [
                o.id,
                l.guiaNumber,
                l.transportadora.toUpperCase(),
                `"${o.cliente.nombre}"`,
                o.cliente.cedula,
                o.cliente.celular,
                `"${o.cliente.ciudad}"`,
                `"${o.cliente.departamento}"`,
                o.cliente.codigoDane || '',
                `"${o.cliente.direccion}"`,
                l.pesoKg,
                l.bultos,
                o.total,
                o.envio,
                l.fechaCreacion,
            ].join(',');
        });

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `guias_99envios_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Top Bar */}
            <header className="bg-white border-b sticky top-0 z-20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Tag className="text-indigo-600" size={22} />
                                Administrador de Guías 99 Envíos & BI
                            </h1>
                            <p className="text-xs text-slate-500">
                                CRUD completo, impresión en 2 tamaños y métricas logísticas en tiempo real
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            <Download size={14} /> Exportar CSV
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
                {/* ── Business Intelligence (BI) Cards ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Guías Generadas</span>
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <Tag size={16} className="text-indigo-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900">{biMetrics.totalGuias}</div>
                        <p className="text-xs text-slate-400 mt-1">Guías asociadas en Firestore</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Volumen Despachado</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Package size={16} className="text-blue-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black text-slate-900">{biMetrics.totalPesoKg} kg</div>
                        <p className="text-xs text-slate-400 mt-1">{biMetrics.totalBultos} bultos totales</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Flete Total Facturado</span>
                            <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                                <Truck size={16} className="text-green-600" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{fmtCurrency(biMetrics.totalFletes)}</div>
                        <p className="text-xs text-slate-400 mt-1">Promedio: {fmtCurrency(biMetrics.avgFlete)} / envío</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase">Top Destino</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                                <MapPin size={16} className="text-amber-600" />
                            </div>
                        </div>
                        <div className="text-xl font-bold text-slate-900 truncate">
                            {biMetrics.topCities[0]?.ciudad || 'N/A'}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {biMetrics.topCities[0] ? `${biMetrics.topCities[0].count} envíos realizados` : 'Sin datos'}
                        </p>
                    </div>
                </div>

                {/* ── Geographic & Carrier BI Section ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Carrier Share */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-indigo-600" />
                            Distribución por Transportadora
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(biMetrics.carrierCounts).map(([carrier, count]) => {
                                const pct = biMetrics.totalGuias > 0 ? Math.round((count / biMetrics.totalGuias) * 100) : 0;
                                return (
                                    <div key={carrier} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span className="uppercase">{carrier}</span>
                                            <span>{count} guías ({pct}%)</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {Object.keys(biMetrics.carrierCounts).length === 0 && (
                                <p className="text-xs text-slate-400 italic text-center py-4">No hay datos de transportadoras</p>
                            )}
                        </div>
                    </div>

                    {/* Top Destinations */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-indigo-600" />
                            Top Ciudades Destino (BI Logístico)
                        </h2>
                        <div className="space-y-3">
                            {biMetrics.topCities.map((item, idx) => (
                                <div key={item.ciudad} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                                            #{idx + 1}
                                        </span>
                                        <span className="font-bold text-slate-800 text-sm">{item.ciudad}</span>
                                    </div>
                                    <div className="text-right text-xs">
                                        <span className="font-bold text-slate-900 block">{item.count} envíos</span>
                                        <span className="text-slate-400">Prom: {fmtCurrency(item.avgFlete)}</span>
                                    </div>
                                </div>
                            ))}
                            {biMetrics.topCities.length === 0 && (
                                <p className="text-xs text-slate-400 italic text-center py-4">No hay envíos registrados aún</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Search & Filter Controls ── */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar por guía, orden, cliente, ciudad o transportadora..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400 text-slate-900"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={carrierFilter}
                            onChange={e => setCarrierFilter(e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-700 focus:outline-none"
                        >
                            <option value="all">Todas las Transportadoras</option>
                            <option value="interrapidisimo">Interrapidísimo</option>
                            <option value="tcc">TCC</option>
                            <option value="servientrega">Servientrega</option>
                            <option value="coordinadora">Coordinadora</option>
                            <option value="envia">Envía</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-700 focus:outline-none"
                        >
                            <option value="all">Todos los Estados</option>
                            <option value="generada">Generada</option>
                            <option value="en_transito">En Tránsito</option>
                            <option value="entregada">Entregada</option>
                        </select>
                    </div>
                </div>

                {/* ── Labels & Orders CRUD Table ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                                <tr>
                                    <th className="p-4">Guía & Transportadora</th>
                                    <th className="p-4">Orden</th>
                                    <th className="p-4">Cliente & Destino</th>
                                    <th className="p-4">Detalles Envío</th>
                                    <th className="p-4">Total & Flete</th>
                                    <th className="p-4 text-center">Imprimir Guía</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium">
                                {filteredLabels.map(o => {
                                    const l = o.guiaEnvio!;
                                    return (
                                        <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-slate-900 font-mono text-sm">{l.guiaNumber}</div>
                                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">
                                                    {l.transportadora}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-bold text-slate-800">#{o.id.slice(-8)}</div>
                                                <div className="text-slate-400 text-[11px]">
                                                    {new Date(l.fechaCreacion).toLocaleDateString('es-CO')}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">{o.cliente.nombre}</div>
                                                <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin size={12} className="text-slate-400" />
                                                    {o.cliente.ciudad}, {o.cliente.departamento}
                                                </div>
                                                {o.cliente.codigoDane && (
                                                    <div className="text-[10px] font-mono text-slate-400">DANE: {o.cliente.codigoDane}</div>
                                                )}
                                            </td>

                                            <td className="p-4">
                                                <div><strong>Bultos:</strong> {l.bultos}</div>
                                                <div><strong>Peso:</strong> {l.pesoKg} kg</div>
                                                <div className="text-slate-500 text-[10px] truncate max-w-[150px]">
                                                    Obs: {l.observaciones || 'FRÁGIL - LÍQUIDOS'}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="font-bold text-slate-900">{fmtCurrency(o.total)}</div>
                                                <div className="text-emerald-600 text-[11px] font-semibold">
                                                    Flete: {fmtCurrency(o.envio)}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5 items-center">
                                                    <a
                                                        href={`/api/envios/pdf-guia?guia=${l.guiaNumber}&tipo=sticker`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg text-[11px] text-center flex items-center justify-center gap-1 shadow-sm transition-all"
                                                    >
                                                        🏷️ Sticker 10x15cm
                                                    </a>
                                                    <a
                                                        href={`/api/envios/pdf-guia?guia=${l.guiaNumber}&tipo=estandar`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-full bg-white border border-slate-300 hover:border-indigo-400 text-slate-800 font-bold py-1.5 px-3 rounded-lg text-[11px] text-center flex items-center justify-center gap-1 shadow-sm transition-all"
                                                    >
                                                        📄 Estándar Normal
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredLabels.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-slate-400">
                                            <Tag size={36} className="mx-auto mb-2 opacity-50 text-indigo-400" />
                                            <p className="font-bold text-slate-600">No se encontraron guías registradas</p>
                                            <p className="text-xs mt-1">Genera guías físicas desde el panel de Pedidos para verlas aquí</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
