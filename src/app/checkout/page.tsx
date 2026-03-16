'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard, Loader } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useCart } from '@/lib/cart-context';
import {
    DEPARTAMENTOS,
    CIUDADES_POR_DEPARTAMENTO,
    calculateShipping,
    validateCedula,
    validateCelular,
    formatCurrency
} from '@/lib/checkout-utils';
import { createOrder } from '@/lib/orders-service';
import { Order } from '@/types/order';

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

export default function CheckoutPage() {
    const router = useRouter();
    const { cart, getTotalPrice } = useCart();
    const [formData, setFormData] = useState<FormData>({
        nombre: '',
        cedula: '',
        celular: '',
        email: '',
        departamento: '',
        ciudad: '',
        direccion: '',
        notas: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [shippingCost, setShippingCost] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'contraentrega' | 'wompi'>('contraentrega');

    const subtotal = getTotalPrice();
    const total = subtotal + shippingCost;

    // Calculate shipping when department/city changes
    useEffect(() => {
        if (formData.departamento && formData.ciudad) {
            const cost = calculateShipping(formData.departamento, formData.ciudad, subtotal);
            setShippingCost(cost);
        }
    }, [formData.departamento, formData.ciudad, subtotal]);

    // Redirect if cart is empty
    useEffect(() => {
        if (cart.length === 0) {
            router.push('/');
        }
    }, [cart, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Reset ciudad when departamento changes
        if (name === 'departamento') {
            setFormData(prev => ({ ...prev, ciudad: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.nombre.trim() || formData.nombre.length < 3) {
            newErrors.nombre = 'Nombre completo es requerido (mín. 3 caracteres)';
        }

        if (!validateCedula(formData.cedula)) {
            newErrors.cedula = 'Cédula inválida (6-10 dígitos)';
        }

        if (!validateCelular(formData.celular)) {
            newErrors.celular = 'Celular inválido (10 dígitos, debe iniciar con 3)';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.departamento) {
            newErrors.departamento = 'Departamento es requerido';
        }

        if (!formData.ciudad) {
            newErrors.ciudad = 'Ciudad es requerida';
        }

        if (!formData.direccion.trim() || formData.direccion.length < 10) {
            newErrors.direccion = 'Dirección completa es requerida (mín. 10 caracteres)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Create order in Firestore
            const orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline'> = {
                cliente: {
                    nombre: formData.nombre,
                    cedula: formData.cedula,
                    celular: formData.celular,
                    email: formData.email || undefined,
                    departamento: formData.departamento,
                    ciudad: formData.ciudad,
                    direccion: formData.direccion,
                    notas: formData.notas || undefined
                },
                productos: cart,
                subtotal,
                envio: shippingCost,
                total,
                metodoPago: paymentMethod,
                status: 'pendiente'
            };

            const orderId = await createOrder(orderData);

            // Fire & forget: send push + emails (non-blocking, never fails checkout)
            fetch('/api/notifications/new-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    customerName: formData.nombre,
                    customerEmail: formData.email || null,
                    total,
                    metodoPago: paymentMethod,
                    ciudad: formData.ciudad,
                    productos: cart,
                    subtotal,
                    envio: shippingCost,
                }),
            }).catch(() => {}); // Completely non-fatal

            // Store order ID in sessionStorage for confirmation page
            sessionStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
            sessionStorage.setItem('lastOrderId', orderId);

            if (paymentMethod === 'wompi') {
                // Handle Wompi Flow
                const amountInCents = total * 100;

                // 1. Get Signature
                const sigRes = await fetch('/api/wompi/signature', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reference: orderId,
                        amountInCents,
                        currency: 'COP'
                    })
                });

                if (!sigRes.ok) throw new Error('Failed to get signature');

                const { signature } = await sigRes.json();
                
                // Get the domain for correct redirect (works dev and prod)
                const baseUrl = window.location.origin;

                // 2. Wompi Checkout Widget Configuration
                const checkout = new (window as any).WidgetCheckout({
                    currency: 'COP',
                    amountInCents: amountInCents,
                    reference: orderId,
                    publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
                    signature: { integrity: signature },
                    redirectUrl: `${baseUrl}/confirmacion/${orderId}`, // Where wompi returns after payment
                    taxInCents: { // Required structure for some bin cards or configurations if any tax applies
                        vat: 0,
                        consumption: 0
                    },
                    customerData: {
                        email: formData.email || '',
                        fullName: formData.nombre,
                        phoneNumber: formData.celular,
                        phoneNumberPrefix: '+57',
                        legalId: formData.cedula,
                        legalIdType: 'CC'
                    }
                });

                // 3. Open Widget
                checkout.open((result: any) => {
                    // Logic here if they use widget modal instead of redirect
                    // This callback fires when they close the modal widget. 
                    // However, we are setting redirectUrl, so this block might not trigger if payment is full redirect.
                    // But if it fires, we can push them to confirmation:
                    const transaction = result.transaction;
                    if (transaction) {
                        router.push(`/confirmacion/${orderId}?id=${transaction.id}`);
                    }
                });
                
                // Keep subitting true while the widget is open
            } else {
                // Contraentrega flow
                // Redirect to confirmation immediately
                router.push(`/confirmacion/${orderId}`);
            }

        } catch (error) {
            console.error('Error creating order:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return null;
    }

    return (
        <>
            {/* Wompi script MUST be loaded for the widget to work */}
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
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
                            {/* Personal Info Section */}
                            <div>
                                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="text-red-600" size={24} />
                                    Información Personal
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Nombre Completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.nombre ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                            placeholder="Juan Pérez"
                                        />
                                        {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Cédula *
                                        </label>
                                        <input
                                            type="text"
                                            name="cedula"
                                            value={formData.cedula}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.cedula ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                            placeholder="1234567890"
                                            maxLength={10}
                                        />
                                        {errors.cedula && <p className="text-red-600 text-xs mt-1">{errors.cedula}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Celular *
                                        </label>
                                        <input
                                            type="tel"
                                            name="celular"
                                            value={formData.celular}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.celular ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                            placeholder="3001234567"
                                            maxLength={10}
                                        />
                                        {errors.celular && <p className="text-red-600 text-xs mt-1">{errors.celular}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Email (Opcional)
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                            placeholder="correo@ejemplo.com"
                                        />
                                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address Section */}
                            <div>
                                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingBag className="text-red-600" size={24} />
                                    Dirección de Envío
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Departamento *
                                        </label>
                                        <select
                                            name="departamento"
                                            value={formData.departamento}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.departamento ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {DEPARTAMENTOS.map(dep => (
                                                <option key={dep} value={dep}>{dep}</option>
                                            ))}
                                        </select>
                                        {errors.departamento && <p className="text-red-600 text-xs mt-1">{errors.departamento}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Ciudad *
                                        </label>
                                        <select
                                            name="ciudad"
                                            value={formData.ciudad}
                                            onChange={handleInputChange}
                                            disabled={!formData.departamento}
                                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.ciudad ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {formData.departamento && CIUDADES_POR_DEPARTAMENTO[formData.departamento]?.map(city => (
                                                <option key={city} value={city}>{city}</option>
                                            ))}
                                        </select>
                                        {errors.ciudad && <p className="text-red-600 text-xs mt-1">{errors.ciudad}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Dirección Completa *
                                        </label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={formData.direccion}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-lg border-2 ${errors.direccion ? 'border-red-500' : 'border-gray-200'} focus:border-red-600 focus:outline-none transition-colors bg-white text-gray-900 placeholder:text-gray-400`}
                                            placeholder="Calle 123 #45-67, Apto 301"
                                        />
                                        {errors.direccion && <p className="text-red-600 text-xs mt-1">{errors.direccion}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            Notas Adicionales (Opcional)
                                        </label>
                                        <textarea
                                            name="notas"
                                            value={formData.notas}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-red-600 focus:outline-none transition-colors resize-none bg-white text-gray-900 placeholder:text-gray-400"
                                            placeholder="Ej: Casa esquinera, portón verde"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <h2 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="text-red-600" size={24} />
                                    Método de Pago
                                </h2>
                                <div className="space-y-4">
                                    {/* Contraentrega */}
                                    <div
                                        className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${paymentMethod === 'contraentrega'
                                                ? 'bg-blue-50 border-blue-400'
                                                : 'bg-white border-gray-200 hover:border-blue-200'
                                            }`}
                                        onClick={() => setPaymentMethod('contraentrega')}
                                    >
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                id="contraentrega"
                                                name="paymentMethod"
                                                value="contraentrega"
                                                checked={paymentMethod === 'contraentrega'}
                                                onChange={(e) => setPaymentMethod(e.target.value as 'contraentrega' | 'wompi')}
                                                className="mt-1"
                                            />
                                            <div>
                                                <label htmlFor="contraentrega" className="font-bold text-gray-900 cursor-pointer">
                                                    Pago Contraentrega
                                                </label>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Paga cuando recibas tu pedido. Aceptamos efectivo o Nequi al momento de la entrega.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Wompi */}
                                    <div
                                        className={`border-2 rounded-xl p-4 cursor-pointer transition-colors relative overflow-hidden ${paymentMethod === 'wompi'
                                                ? 'bg-blue-50 border-blue-400'
                                                : 'bg-white border-gray-200 hover:border-blue-200'
                                            }`}
                                        onClick={() => setPaymentMethod('wompi')}
                                    >
                                        {/* Wompi Badge */}
                                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-bl-lg">
                                            SEGURO
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <input
                                                type="radio"
                                                id="wompi"
                                                name="paymentMethod"
                                                value="wompi"
                                                checked={paymentMethod === 'wompi'}
                                                onChange={(e) => setPaymentMethod(e.target.value as 'contraentrega' | 'wompi')}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <label htmlFor="wompi" className="font-bold text-gray-900 cursor-pointer">
                                                        Pago en Línea
                                                    </label>
                                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                        Wompi
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Tarjetas de crédito, débito, PSE, Nequi y transferencias Bancolombia.
                                                </p>
                                                {/* Logos array */}
                                                <div className="flex gap-2 mt-3 opacity-75">
                                                    <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">PSE</div>
                                                    <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                                                    <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">MC</div>
                                                    <div className="h-6 w-10 bg-gray-200 rounded flex items-center justify-center text-[8px] font-bold">NEQUI</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full text-white font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${paymentMethod === 'wompi'
                                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                        : 'bg-red-600 hover:bg-red-700 shadow-red-200'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="animate-spin" size={20} />
                                        Procesando...
                                    </>
                                ) : (
                                    paymentMethod === 'wompi' ? 'IR A PAGAR CON WOMPI' : 'CONFIRMAR PEDIDO CONTRAENTREGA'
                                )}
                            </motion.button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h2 className="text-xl font-black text-gray-900 mb-4">Resumen de Compra</h2>

                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                {cart.map((item) => (
                                    <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                                        <span className="text-gray-600">
                                            {item.product.nombre} {item.size} x{item.cantidad}
                                        </span>
                                        <span className="font-bold">
                                            {formatCurrency(item.price * item.cantidad)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Envío</span>
                                    <span className="font-bold text-green-600">
                                        {shippingCost === 0 ? 'GRATIS' : formatCurrency(shippingCost)}
                                    </span>
                                </div>
                                {subtotal >= 100000 && (
                                    <p className="text-xs text-green-600 font-bold">
                                        ✓ Envío gratis por compra superior a $100,000
                                    </p>
                                )}
                            </div>

                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-black">Total</span>
                                    <span className="text-2xl font-black text-red-600">
                                        {formatCurrency(total)}
                                    </span>
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
