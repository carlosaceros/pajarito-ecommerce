'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, Loader, Info, Package, Home } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { validateCedula, validateCelular, formatCurrency } from '@/lib/checkout-utils';
import citiesData from '@/lib/cities-99envios.json';
import { createOrder } from '@/lib/orders-service';
import { Order } from '@/types/order';
import {
    isVecinoSoachuno,
    isVecinoSoachunoByCityName,
    FREE_SHIPPING_LOCAL,
    FREE_SHIPPING_NACIONAL,
    TARIFA_PLANA_NACIONAL,
    PICKUP_ADDRESS,
    PICKUP_DISCOUNT_PCT,
    calcularBultos,
} from '@/lib/shipping-zones';

const ALL_CITIES_99 = Object.entries(citiesData as Record<string, { codigo: string; ciudad: string; departamento: string }>)
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => a.ciudad.localeCompare(b.ciudad));

interface FormData {
    nombre: string;
    cedula: string;
    celular: string;
    email: string;
    departamento: string;
    ciudad: string;
    direccion: string;
    notas: string;
}

interface FormErrors {
    [key: string]: string;
}

type TipoEntrega = 'domicilio' | 'pickup';

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getTotalPrice, getTotalWeightKg, isHydrated, clearCart } = useCart();

    const [formData, setFormData] = useState<FormData>({
        nombre: '', cedula: '', celular: '', email: '',
        departamento: '', ciudad: '', direccion: '', notas: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingInfo, setShippingInfo] = useState<{
        source?: string;
        transportadora?: string | null;
        dias?: string | number;
        sinCobertura?: boolean;
        mensaje?: string;
        subsidioMensaje?: string;
        bultos?: number;
        mensajeBulto?: string;
        esVecino?: boolean;
        loading?: boolean;
    }>({});
    const [destinoCodigo, setDestinoCodigo] = useState('');
    const [citySearch, setCitySearch] = useState('');
    const [citySearchOpen, setCitySearchOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'contraentrega' | 'wompi'>('contraentrega');
    const [tipoEntrega, setTipoEntrega] = useState<TipoEntrega>('domicilio');
    const [showSubsidioTooltip, setShowSubsidioTooltip] = useState(false);

    const subtotal = getTotalPrice();
    const totalKg = getTotalWeightKg();
    const bultos = calcularBultos(totalKg);

    // Detectar si la ciudad seleccionada es de zona Soachuno
    const esVecino = destinoCodigo
        ? isVecinoSoachuno(destinoCodigo)
        : isVecinoSoachunoByCityName(formData.ciudad);

    // Descuento pick-up (solo aplica para vecinos Soachunos)
    const pickupDiscount = tipoEntrega === 'pickup' && esVecino
        ? Math.floor(subtotal * PICKUP_DISCOUNT_PCT)
        : 0;

    const total = subtotal + shippingCost - pickupDiscount;

    // ── Cotizar envío ──────────────────────────────────────────────────────────
    const cotizarEnvio = useCallback(() => {
        if (!destinoCodigo || !formData.ciudad) return;

        setShippingInfo({ loading: true });
        setShippingCost(0);

        fetch('/api/envios/cotizar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                destinoCodigo,
                destinoNombre: formData.ciudad,
                subtotal,
                aplicaContrapago: paymentMethod === 'contraentrega',
                totalWeightKg: totalKg,
            }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.gratis) {
                    setShippingCost(0);
                    setShippingInfo({
                        source: 'free_shipping',
                        esVecino: data.esVecino,
                        bultos: data.bultos,
                        mensaje: data.mensaje,
                    });
                } else if (data.sinCobertura) {
                    setShippingCost(0);
                    setShippingInfo({ sinCobertura: true, mensaje: data.mensaje });
                } else {
                    setShippingCost(data.precio || 0);
                    setShippingInfo({
                        source: data.source,
                        transportadora: data.transportadora,
                        dias: data.dias,
                        mensaje: data.mensaje,
                        subsidioMensaje: data.subsidioMensaje,
                        bultos: data.bultos,
                        mensajeBulto: data.mensajeBulto,
                        esVecino: data.esVecino,
                    });
                }
            })
            .catch(() => {
                setShippingCost(TARIFA_PLANA_NACIONAL);
                setShippingInfo({
                    source: 'fallback',
                    mensaje: '* Precio estimado',
                    subsidioMensaje: 'En Pajarito subsidiamos parte de tu envío nacional para que ahorres comprando directo de fábrica.',
                });
            });
    }, [destinoCodigo, formData.ciudad, paymentMethod, subtotal, totalKg]);

    useEffect(() => {
        const timer = setTimeout(cotizarEnvio, 300);
        return () => clearTimeout(timer);
    }, [cotizarEnvio]);

    // Si selecciona pickup, no hay costo de envío
    useEffect(() => {
        if (tipoEntrega === 'pickup') {
            setShippingCost(0);
            setShippingInfo({ source: 'pickup', mensaje: `Retiro en ${PICKUP_ADDRESS}` });
        } else if (destinoCodigo) {
            cotizarEnvio();
        }
    }, [tipoEntrega]);

    useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, []);

    useEffect(() => {
        if (isHydrated && cart.length === 0) router.push('/');
    }, [isHydrated, cart, router]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (name === 'departamento') setFormData(prev => ({ ...prev, ciudad: '' }));
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.nombre.trim() || formData.nombre.length < 3)
            newErrors.nombre = 'Nombre completo es requerido (mín. 3 caracteres)';
        if (!validateCedula(formData.cedula))
            newErrors.cedula = 'Cédula inválida (6-10 dígitos)';
        if (!validateCelular(formData.celular))
            newErrors.celular = 'Celular inválido (10 dígitos, debe iniciar con 3)';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Email inválido';
        if (!formData.ciudad)
            newErrors.ciudad = 'Ciudad es requerida';
        if (tipoEntrega === 'domicilio' && (!formData.direccion.trim() || formData.direccion.length < 10))
            newErrors.direccion = 'Dirección completa es requerida (mín. 10 caracteres)';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> = {
                cliente: {
                    nombre: formData.nombre,
                    cedula: formData.cedula,
                    celular: formData.celular,
                    email: formData.email || undefined,
                    departamento: formData.departamento,
                    ciudad: formData.ciudad,
                    direccion: tipoEntrega === 'pickup' ? PICKUP_ADDRESS : formData.direccion,
                    notas: tipoEntrega === 'pickup'
                        ? `PICK-UP en San Nicolás. ${formData.notas || ''}`
                        : formData.notas || undefined,
                },
                productos: cart,
                subtotal,
                envio: shippingCost,
                descuento: pickupDiscount > 0 ? pickupDiscount : undefined,
                total,
                metodoPago: paymentMethod,
                tipoEntrega,
                bultos: bultos > 1 ? bultos : undefined,
                status: 'pendiente',
            };

            const orderId = await createOrder(orderData);

            // Notificación push + email
            try {
                await fetch('/api/notifications/new-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId,
                        customerName: formData.nombre,
                        customerEmail: formData.email || null,
                        total,
                        metodoPago: paymentMethod,
                        tipoEntrega,
                        ciudad: tipoEntrega === 'pickup' ? 'PICK-UP Soacha' : formData.ciudad,
                        productos: cart.map(item => ({
                            product: { nombre: item.product.nombre },
                            size: item.size,
                            cantidad: item.cantidad,
                            price: item.price,
                        })),
                        subtotal,
                        envio: shippingCost,
                        descuento: pickupDiscount > 0 ? pickupDiscount : undefined,
                    }),
                });
            } catch (e) {
                console.warn('[Checkout] Notification call failed (non-fatal):', e);
            }

            sessionStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
            sessionStorage.setItem('lastOrderId', orderId);

            if (paymentMethod === 'wompi') {
                const amountInCents = total * 100;
                const sigRes = await fetch('/api/wompi/signature', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reference: orderId, amountInCents, currency: 'COP' }),
                });
                if (!sigRes.ok) throw new Error('Failed to get signature');
                const { signature } = await sigRes.json();
                const baseUrl = window.location.origin;
                const checkout = new (window as any).WidgetCheckout({
                    currency: 'COP',
                    amountInCents,
                    reference: orderId,
                    publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
                    signature: { integrity: signature },
                    redirectUrl: `${baseUrl}/confirmacion/${orderId}`,
                    taxInCents: { vat: 0, consumption: 0 },
                    customerData: {
                        email: formData.email || '',
                        fullName: formData.nombre,
                        phoneNumber: formData.celular,
                        phoneNumberPrefix: '+57',
                        legalId: formData.cedula,
                        legalIdType: 'CC',
                    },
                });
                checkout.open((result: any) => {
                    const transaction = result.transaction;
                    if (transaction) router.push(`/confirmacion/${orderId}?id=${transaction.id}`);
                });
            } else {
                router.push(`/confirmacion/${orderId}`);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
            setIsSubmitting(false);
        }
    };

    // ── Loading state ──────────────────────────────────────────────────────────
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin text-red-500 mx-auto mb-3" size={32} />
                    <p className="text-gray-500 text-sm">Cargando tu carrito...</p>
                </div>
            </div>
        );
    }

    if (cart.length === 0) return null;

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <>
            <script src="https://checkout.wompi.co/widget.js" async></script>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Back button */}
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Volver</span>
                    </motion.button>

                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                        Finalizar Compra
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* ── Checkout Form ───────────────────────────────────── */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-8">

                                {/* ── Vecino Soachuno Banner ─────────────────── */}
                                <AnimatePresence>
                                    {esVecino && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                            className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-5"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="text-3xl">🏘️</div>
                                                <div>
                                                    <p className="font-black text-emerald-800 text-lg leading-tight">
                                                        ¡Hola, Vecino Soachuno!
                                                    </p>
                                                    <p className="text-emerald-700 text-sm mt-1">
                                                        Estás cerca de nuestra fábrica en San Nicolás. Tienes beneficios exclusivos:
                                                    </p>
                                                    <ul className="mt-2 space-y-1 text-sm">
                                                        <li className="flex items-center gap-2 text-emerald-700">
                                                            <span className="text-emerald-500 font-bold">✓</span>
                                                            Envío GRATIS en compras superiores a <strong>{formatCurrency(FREE_SHIPPING_LOCAL)}</strong>
                                                        </li>
                                                        <li className="flex items-center gap-2 text-emerald-700">
                                                            <span className="text-emerald-500 font-bold">✓</span>
                                                            Opción de recoger en fábrica con <strong>5% de descuento extra</strong>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ── Tipo de Entrega (solo vecinos) ────────── */}
                                <AnimatePresence>
                                    {esVecino && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                                <Package className="text-emerald-600" size={24} />
                                                Tipo de Entrega
                                            </h2>
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Domicilio */}
                                                <div
                                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${tipoEntrega === 'domicilio' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                                                    onClick={() => setTipoEntrega('domicilio')}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Home size={18} className="text-blue-600" />
                                                        <span className="font-black text-gray-900 text-sm">A domicilio</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Enviamos a tu puerta con mensajería.</p>
                                                </div>
                                                {/* Pick-up */}
                                                <div
                                                    className={`border-2 rounded-xl p-4 cursor-pointer transition-colors relative overflow-hidden ${tipoEntrega === 'pickup' ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-gray-200 hover:border-emerald-200'}`}
                                                    onClick={() => setTipoEntrega('pickup')}
                                                >
                                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-bl-lg">
                                                        -5%
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MapPin size={18} className="text-emerald-600" />
                                                        <span className="font-black text-gray-900 text-sm">Recoger en fábrica</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">Sin costo de envío + 5% de dcto.</p>
                                                    <p className="text-[10px] text-emerald-700 font-bold mt-1 leading-tight">
                                                        {PICKUP_ADDRESS}
                                                    </p>
                                                </div>
                                            </div>
                                            {tipoEntrega === 'pickup' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800"
                                                >
                                                    <strong>📍 Instrucciones de recogida:</strong> Nos comunicaremos contigo al número celular registrado para coordinar el horario de entrega en fábrica. Lunes a Sábado, 8am–5pm.
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* ── Información Personal ───────────────────── */}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <MapPin className="text-red-600" size={24} />
                                        Información Personal
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Nombre Completo *</label>
                                            <input
                                                type="text" name="nombre" value={formData.nombre}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border-2 ${errors.nombre ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                                placeholder="Juan Pérez"
                                            />
                                            {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Cédula *</label>
                                            <input
                                                type="text" name="cedula" value={formData.cedula}
                                                onChange={handleInputChange} maxLength={10}
                                                className={`w-full px-4 py-3 rounded-lg border-2 ${errors.cedula ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                                placeholder="1234567890"
                                            />
                                            {errors.cedula && <p className="text-red-600 text-xs mt-1">{errors.cedula}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Celular *</label>
                                            <input
                                                type="tel" name="celular" value={formData.celular}
                                                onChange={handleInputChange} maxLength={10}
                                                className={`w-full px-4 py-3 rounded-lg border-2 ${errors.celular ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                                placeholder="3001234567"
                                            />
                                            {errors.celular && <p className="text-red-600 text-xs mt-1">{errors.celular}</p>}
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Email (Opcional)</label>
                                            <input
                                                type="email" name="email" value={formData.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                                placeholder="correo@ejemplo.com"
                                            />
                                            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Dirección de Envío ────────────────────── */}
                                {tipoEntrega === 'domicilio' && (
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                            <ShoppingBag className="text-red-600" size={24} />
                                            Dirección de Envío
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* City search */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Ciudad / Municipio *</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={citySearch || (formData.ciudad ? `${formData.ciudad}${formData.departamento ? ' / ' + formData.departamento : ''}` : '')}
                                                        onChange={e => {
                                                            setCitySearch(e.target.value);
                                                            setCitySearchOpen(true);
                                                            if (!e.target.value) {
                                                                setFormData(prev => ({ ...prev, ciudad: '', departamento: '' }));
                                                                setDestinoCodigo('');
                                                                setShippingInfo({});
                                                                setShippingCost(0);
                                                            }
                                                        }}
                                                        onFocus={() => setCitySearchOpen(true)}
                                                        onBlur={() => setTimeout(() => setCitySearchOpen(false), 200)}
                                                        className={`w-full px-4 py-3 rounded-lg border-2 ${errors.ciudad ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                                        placeholder="Busca tu ciudad (ej: Bogotá, Medellín, Cali...)"
                                                        autoComplete="off"
                                                    />
                                                    {citySearchOpen && citySearch.length >= 2 && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-30 max-h-56 overflow-y-auto">
                                                            {ALL_CITIES_99.filter(c =>
                                                                c.ciudad.includes(citySearch.toUpperCase()) ||
                                                                c.departamento.includes(citySearch.toUpperCase()) ||
                                                                c.codigo.includes(citySearch)
                                                            ).slice(0, 15).map(city => (
                                                                <button
                                                                    key={city.codigo}
                                                                    type="button"
                                                                    className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-0"
                                                                    onMouseDown={() => {
                                                                        setFormData(prev => ({ ...prev, ciudad: city.ciudad, departamento: city.departamento }));
                                                                        setDestinoCodigo(city.codigo);
                                                                        setCitySearch('');
                                                                        setCitySearchOpen(false);
                                                                        if (errors.ciudad) setErrors(prev => ({ ...prev, ciudad: '' }));
                                                                    }}
                                                                >
                                                                    <div>
                                                                        <span className="font-semibold text-gray-900">{city.ciudad}</span>
                                                                        <span className="text-sm text-gray-500 ml-2">{city.departamento}</span>
                                                                    </div>
                                                                    <span className="text-xs text-gray-400 font-mono">{city.codigo}</span>
                                                                </button>
                                                            ))}
                                                            {ALL_CITIES_99.filter(c =>
                                                                c.ciudad.includes(citySearch.toUpperCase()) || c.departamento.includes(citySearch.toUpperCase())
                                                            ).length === 0 && (
                                                                <div className="px-4 py-3 text-gray-500 text-sm">No se encontraron resultados</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {formData.ciudad && (
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                                                        <MapPin size={11} />
                                                        {formData.ciudad}, {formData.departamento}
                                                        {destinoCodigo && <span className="font-mono text-gray-400">· código {destinoCodigo}</span>}
                                                    </p>
                                                )}
                                                {errors.ciudad && <p className="text-red-600 text-xs mt-1">{errors.ciudad}</p>}

                                                {/* ── Shipping info badge ─── */}
                                                {formData.ciudad && (
                                                    <div className={`mt-2 px-3 py-2 rounded-lg text-xs font-medium flex items-start gap-2 ${shippingInfo.loading ? 'bg-gray-100 text-gray-500' :
                                                        shippingInfo.sinCobertura ? 'bg-red-50 text-red-700 border border-red-200' :
                                                        shippingInfo.source === 'free_shipping' ? 'bg-green-50 text-green-700' :
                                                        'bg-blue-50 text-blue-700'
                                                    }`}>
                                                        <span className="text-base leading-none">
                                                            {shippingInfo.loading && '⏳'}
                                                            {shippingInfo.sinCobertura && '⛔'}
                                                            {!shippingInfo.loading && !shippingInfo.sinCobertura && shippingInfo.source === 'free_shipping' && '🎁'}
                                                            {!shippingInfo.loading && !shippingInfo.sinCobertura && shippingInfo.source === '99envios' && '🚚'}
                                                            {!shippingInfo.loading && !shippingInfo.sinCobertura && (shippingInfo.source === 'fallback' || shippingInfo.source === 'free_partial') && '📦'}
                                                        </span>
                                                        <div className="flex-1">
                                                            <span>
                                                                {shippingInfo.loading && 'Cotizando envío...'}
                                                                {!shippingInfo.loading && shippingInfo.sinCobertura && shippingInfo.mensaje}
                                                                {!shippingInfo.loading && !shippingInfo.sinCobertura && shippingInfo.source === 'free_shipping' && shippingInfo.mensaje}
                                                                {!shippingInfo.loading && !shippingInfo.sinCobertura && shippingInfo.source === '99envios' && (
                                                                    <>Envío con {shippingInfo.transportadora} · {shippingInfo.dias} días hábiles</>
                                                                )}
                                                                {!shippingInfo.loading && !shippingInfo.sinCobertura && (shippingInfo.source === 'fallback' || shippingInfo.source === 'free_partial') && (
                                                                    <>Envío estimado{shippingInfo.mensaje ? ` · ${shippingInfo.mensaje}` : ''}</>
                                                                )}
                                                            </span>
                                                            {/* Mensaje de bultos adicionales */}
                                                            {shippingInfo.mensajeBulto && (
                                                                <p className="text-[11px] mt-1 text-amber-700 font-normal">
                                                                    📦 {shippingInfo.mensajeBulto}
                                                                </p>
                                                            )}
                                                            {/* Tooltop subsidio de marca */}
                                                            {shippingInfo.subsidioMensaje && (
                                                                <div className="relative mt-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setShowSubsidioTooltip(v => !v)}
                                                                        className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                                                                    >
                                                                        <Info size={11} />
                                                                        ¿Por qué este precio?
                                                                    </button>
                                                                    <AnimatePresence>
                                                                        {showSubsidioTooltip && (
                                                                            <motion.div
                                                                                initial={{ opacity: 0, y: 4 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                exit={{ opacity: 0, y: 4 }}
                                                                                className="absolute left-0 bottom-full mb-2 w-64 bg-gray-900 text-white text-[11px] rounded-xl p-3 shadow-xl z-50 leading-relaxed"
                                                                            >
                                                                                💙 {shippingInfo.subsidioMensaje}
                                                                                <div className="absolute left-4 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Dirección */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Dirección Completa *</label>
                                                <input
                                                    type="text" name="direccion" value={formData.direccion}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.direccion ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                                    placeholder="Calle 123 #45-67, Apto 301"
                                                />
                                                {errors.direccion && <p className="text-red-600 text-xs mt-1">{errors.direccion}</p>}
                                            </div>

                                            {/* Notas */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Notas Adicionales (Opcional)</label>
                                                <textarea
                                                    name="notas" value={formData.notas}
                                                    onChange={handleInputChange} rows={3}
                                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors resize-none bg-white text-gray-900 placeholder:text-gray-400"
                                                    placeholder="Ej: Casa esquinera, portón verde"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Método de Pago ────────────────────────── */}
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                        <CreditCard className="text-red-600" size={24} />
                                        Método de Pago
                                    </h2>
                                    <div className="space-y-4">
                                        {/* Contraentrega */}
                                        <div
                                            className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'contraentrega' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                                            onClick={() => setPaymentMethod('contraentrega')}
                                        >
                                            <div className="flex items-start gap-3">
                                                <input type="radio" id="contraentrega" name="paymentMethod" value="contraentrega"
                                                    checked={paymentMethod === 'contraentrega'}
                                                    onChange={e => setPaymentMethod(e.target.value as 'contraentrega' | 'wompi')}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <label htmlFor="contraentrega" className="font-bold text-gray-900 cursor-pointer">Pago Contraentrega</label>
                                                    <p className="text-sm text-gray-600 mt-1">Paga cuando recibas tu pedido. Aceptamos efectivo o Nequi al momento de la entrega.</p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Wompi */}
                                        <div
                                            className={`border-2 rounded-xl p-4 cursor-pointer transition-colors relative overflow-hidden ${paymentMethod === 'wompi' ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-200 hover:border-blue-200'}`}
                                            onClick={() => setPaymentMethod('wompi')}
                                        >
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg">SEGURO</div>
                                            <div className="flex items-start gap-3">
                                                <input type="radio" id="wompi" name="paymentMethod" value="wompi"
                                                    checked={paymentMethod === 'wompi'}
                                                    onChange={e => setPaymentMethod(e.target.value as 'contraentrega' | 'wompi')}
                                                    className="mt-1"
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <label htmlFor="wompi" className="font-bold text-gray-900 cursor-pointer">Pago en Línea</label>
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Wompi</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">Tarjetas de crédito, débito, PSE, Nequi y transferencias Bancolombia.</p>
                                                    <div className="flex gap-2 mt-3 opacity-75">
                                                        {['PSE', 'VISA', 'MC', 'NEQUI'].map(m => (
                                                            <div key={m} className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">{m}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sin cobertura warning */}
                                {shippingInfo.sinCobertura && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
                                        <span className="text-base">⛔</span>
                                        <span>{shippingInfo.mensaje || 'No hay cobertura de envío para esta ciudad.'} Por favor elige otra ciudad o contáctanos.</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={isSubmitting || !!shippingInfo.loading || !!shippingInfo.sinCobertura}
                                    className={`w-full text-white font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${paymentMethod === 'wompi' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                                >
                                    {isSubmitting ? (
                                        <><Loader className="animate-spin" size={20} />Procesando...</>
                                    ) : tipoEntrega === 'pickup' ? (
                                        '✅ CONFIRMAR PEDIDO PICK-UP'
                                    ) : paymentMethod === 'wompi' ? (
                                        'IR A PAGAR CON WOMPI'
                                    ) : (
                                        'CONFIRMAR PEDIDO CONTRAENTREGA'
                                    )}
                                </motion.button>
                            </form>
                        </div>

                        {/* ── Order Summary ────────────────────────────────── */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                                <h2 className="text-xl font-black text-gray-900 mb-4">Resumen de Compra</h2>

                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {cart.map(item => (
                                        <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {item.product.nombre} {item.size} x{item.cantidad}
                                            </span>
                                            <span className="font-bold">{formatCurrency(item.price * item.cantidad)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-bold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <div className="flex items-center gap-1">
                                            <span className="text-gray-600">Envío</span>
                                            {shippingInfo.subsidioMensaje && (
                                                <button type="button" onClick={() => setShowSubsidioTooltip(v => !v)} className="text-blue-400 hover:text-blue-600">
                                                    <Info size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <span className={`font-bold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                                            {tipoEntrega === 'pickup' ? 'GRATIS (Pick-up)' : shippingCost === 0 ? 'GRATIS' : formatCurrency(shippingCost)}
                                        </span>
                                    </div>
                                    {pickupDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-emerald-600">
                                            <span>Descuento Pick-up (5%)</span>
                                            <span className="font-bold">-{formatCurrency(pickupDiscount)}</span>
                                        </div>
                                    )}
                                    {/* Umbral gratis info */}
                                    {shippingCost > 0 && (
                                        <p className="text-xs text-gray-500">
                                            {esVecino
                                                ? `🏘️ Envío gratis desde ${formatCurrency(FREE_SHIPPING_LOCAL)} (zona local)`
                                                : `📦 Envío gratis nacional desde ${formatCurrency(FREE_SHIPPING_NACIONAL)}`
                                            }
                                        </p>
                                    )}
                                    {/* Info bultos */}
                                    {bultos > 1 && (
                                        <p className="text-xs text-amber-600 font-bold">
                                            📦 {bultos} bultos · {totalKg.toFixed(1)}kg total
                                        </p>
                                    )}
                                </div>

                                <div className="border-t mt-4 pt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-black">Total</span>
                                        <span className="text-2xl font-black text-red-600">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
