'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield, ChevronDown, ChevronUp, Info, ListChecks, ShieldAlert, Lightbulb, CheckCircle, HelpCircle, Bot, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product, ProductSize, SIZE_ORDER as GLOBAL_SIZE_ORDER, formatCurrency, calcularAhorro } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import ProductCard from '@/components/ProductCard';
import Toast from '@/components/Toast';

// Fixed size order for product detail page (only main sizes)
const SIZE_ORDER: ProductSize[] = ['3.8L', '10L', '20L'];

// Badge on product image per size
const SIZE_PHOTO_BADGE: Partial<Record<ProductSize, { label: string; bg: string } | null>> = {
    '3.8L': null,
    '10L': { label: '10 Litros', bg: 'bg-blue-600' },
    '20L': { label: '20 Litros 🔥', bg: 'bg-orange-600' },
};

interface ProductPageContentProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductPageContent({ product, relatedProducts }: ProductPageContentProps) {
    const router = useRouter();
    const { addToCart, setIsCartOpen, getTotalItems } = useCart();
    const [selectedSize, setSelectedSize] = useState<ProductSize>('3.8L');
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [expandedSections, setExpandedSections] = useState<string[]>(['descripcion', 'beneficios', 'aeo']);
    const [showStickyBar, setShowStickyBar] = useState(false);
    const ctaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // If CTA is not visible on screen, we show the sticky bar
                setShowStickyBar(!entry.isIntersecting);
            },
            { threshold: 0 }
        );

        if (ctaRef.current) {
            observer.observe(ctaRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const savingsData = calcularAhorro(
        product.precios[selectedSize] ?? 0,
        selectedSize,
        product.competidorPromedio[selectedSize] ?? 0
    );

    const handleAddToCart = () => {
        addToCart(product, selectedSize, product.precios[selectedSize] ?? 0, quantity);
        setShowToast(true);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => 
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    return (
        <>
            <Toast
                show={showToast}
                message="Producto agregado"
                productName={product.nombre}
                size={selectedSize}
                onClose={() => setShowToast(false)}
            />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header with breadcrumb + cart */}
                <header className="bg-white border-b shadow-sm relative z-40">
                    <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                        <nav className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-red-600 transition-colors">Inicio</Link>
                            <span>/</span>
                            <Link href="/#catalogo" className="hover:text-red-600 transition-colors">Productos</Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium truncate max-w-[140px] sm:max-w-none">{product.nombre}</span>
                        </nav>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-md"
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden sm:inline">Ver carrito</span>
                            <AnimatePresence>
                                {getTotalItems() > 0 && (
                                    <motion.span
                                        key={getTotalItems()}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-2 -right-2 bg-white text-red-600 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-600 shadow"
                                    >
                                        {getTotalItems()}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>
                </header>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-medium">Volver</span>
                    </motion.button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
                        {/* Left: Product Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl p-8 shadow-lg"
                        >
                            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                                <Image
                                    src={`/images/${selectedSize === '3.8L' && product.imgFileSmall ? product.imgFileSmall : product.imgFile}`}
                                    alt={`${product.nombre} ${selectedSize}`}
                                    fill
                                    priority
                                    className="object-contain p-8"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                                {product.badge && (
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-4 py-2 rounded-r-full shadow-lg">
                                        {product.badge}
                                    </div>
                                )}
                                {/* Size badge on photo */}
                                {SIZE_PHOTO_BADGE[selectedSize] && (
                                    <motion.div
                                        key={selectedSize}
                                        initial={{ scale: 0.7, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`absolute bottom-4 right-4 ${SIZE_PHOTO_BADGE[selectedSize]!.bg} text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg`}
                                    >
                                        {SIZE_PHOTO_BADGE[selectedSize]!.label}
                                    </motion.div>
                                )}
                                {/* Colombia badge */}
                                <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 text-[10px] font-black px-2.5 py-1.5 rounded-full shadow text-gray-700">
                                    🇨🇴 <span>100% Colombiano</span>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-700">Calidad Garantizada</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <Truck className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-700">Envío Rastreado</p>
                                </div>
                                <div className="text-center p-3 bg-orange-50 rounded-lg">
                                    <Package className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                                    <p className="text-[10px] font-bold text-gray-700">Empaque Seguro</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Product Info + Purchase */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg sticky top-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Poder Industrial • Uso Hogar
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                                    {product.nombre}
                                </h1>
                                <p className="text-gray-600 mb-4 leading-relaxed">
                                    {product.heroText || product.descripcion}
                                </p>
                                {product.heroBullets && product.heroBullets.length > 0 && (
                                    <ul className="space-y-2 mb-6">
                                        {product.heroBullets.map((bullet, idx) => (
                                            <li key={idx} className="flex gap-2 text-sm text-gray-700">
                                                <div className="text-red-500 font-black mt-0.5">•</div>
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {!product.heroBullets && <div className="mb-6"></div>}

                                {/* Size Selector */}
                                <div className="mb-6">
                                    <label className="text-sm font-bold text-gray-700 mb-3 block">
                                        Selecciona Presentación:
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {SIZE_ORDER.filter(size => product.precios[size] !== undefined).map(size => (
                                            <motion.button
                                                key={size}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSelectedSize(size)}
                                                className={`p-4 rounded-xl border-2 transition-all ${selectedSize === size
                                                        ? 'border-red-600 bg-red-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                            >
                                                <div className="text-2xl font-black text-gray-900">{size}</div>
                                                <div className={`text-xs mt-1 ${selectedSize === size ? 'text-red-600' : 'text-gray-500'}`}>
                                                    {formatCurrency(product.precios[size] ?? 0)}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Display */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm text-gray-600 font-medium">Precio por unidad:</span>
                                        <div className="text-right">
                                            <div className="text-3xl font-black text-gray-900" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                                                {formatCurrency(product.precios[selectedSize] ?? 0)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ${savingsData.nuestroPrecioML}/ml
                                            </div>
                                        </div>
                                    </div>
                                    {savingsData.mostrarFOMO && (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <span className="text-sm font-black text-green-600 flex items-center gap-2">
                                                📉 Ahorras {formatCurrency(savingsData.ahorroDinero)} ({savingsData.ahorroPorcentaje}%) vs otras marcas
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                <div className="mb-6">
                                    <label className="text-sm font-bold text-gray-700 mb-3 block">
                                        Cantidad:
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-bold transition-colors"
                                        >
                                            −
                                        </motion.button>
                                        <div className="flex-1 text-center">
                                            <div className="text-2xl font-black">{quantity}</div>
                                            <div className="text-xs text-gray-500">
                                                Total: {formatCurrency((product.precios[selectedSize] ?? 0) * quantity)}
                                            </div>
                                        </div>
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 font-bold transition-colors"
                                        >
                                            +
                                        </motion.button>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="space-y-3" ref={ctaRef}>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddToCart}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ShoppingCart size={20} />
                                        AGREGAR AL CARRITO
                                    </motion.button>
                                    <button
                                        onClick={() => setIsCartOpen(true)}
                                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-xl transition-colors"
                                    >
                                        VER CARRITO
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Envío gratis en Soacha y alrededores desde $100.000
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Expandable Sections */}
                    <div className="max-w-4xl mx-auto mb-16 space-y-4">
                        {/* Product Detailed Information Cards (Always visible) */}
                        <div className="space-y-6">
                            {/* Descripción Card */}
                            {product.descripcionLarga && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Info className="text-red-600 w-6 h-6" />
                                        <h3 className="text-2xl font-black text-gray-900">¿Por qué elegir este producto?</h3>
                                    </div>
                                    <div className="prose max-w-none text-gray-600 space-y-4 whitespace-pre-line text-sm md:text-base leading-relaxed">
                                        {product.descripcionLarga}
                                    </div>
                                </div>
                            )}

                            {/* Beneficios Card */}
                            {product.beneficiosDetallados && product.beneficiosDetallados.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <CheckCircle className="text-green-600 w-6 h-6" />
                                        <h3 className="text-2xl font-black text-gray-900">Beneficios Principales</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {product.beneficiosDetallados.map((ben, i) => (
                                            <div key={i} className="bg-gray-50 p-5 rounded-xl border border-gray-100 transition-colors hover:bg-green-50/50">
                                                <h4 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                                                    <span className="text-green-600 mt-1 mt-0.5">•</span>
                                                    {ben.titulo}
                                                </h4>
                                                <p className="text-sm text-gray-600 ml-4">{ben.texto}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Modo de Uso Card */}
                            {product.modoDeUso && product.modoDeUso.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <ListChecks className="text-blue-600 w-6 h-6" />
                                        <h3 className="text-2xl font-black text-gray-900">Modo de Uso y Dosis</h3>
                                    </div>
                                    <div className="space-y-6">
                                        {product.modoDeUso.map((seccion, i) => (
                                            <div key={i} className="bg-blue-50/30 p-5 rounded-xl">
                                                <h4 className="font-bold text-blue-900 mb-3">{seccion.titulo}</h4>
                                                <ul className="list-none space-y-2">
                                                    {seccion.pasos.map((paso, j) => (
                                                        <li key={j} className="flex gap-3 text-gray-700 text-sm md:text-base">
                                                            <div className="font-black text-blue-500 mt-0.5">✓</div>
                                                            <span>{paso}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Casos de Uso Card */}
                            {product.casosDeUso && product.casosDeUso.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Lightbulb className="text-yellow-500 w-6 h-6" />
                                        <h3 className="text-2xl font-black text-gray-900">Casos de Uso Ideales</h3>
                                    </div>
                                    <p className="font-medium text-gray-800 mb-4">Este producto es ideal si buscas:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {product.casosDeUso.map((caso, i) => (
                                            <li key={i} className="flex gap-3 text-gray-600 text-sm md:text-base items-center bg-gray-50 p-3 rounded-lg">
                                                <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"></div>
                                                <span>{caso}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Precauciones */}
                        {product.precauciones && product.precauciones.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border-l-4 border-red-500">
                                <button
                                    onClick={() => toggleSection('precauciones')}
                                    className="w-full p-6 flex justify-between items-center hover:bg-red-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <ShieldAlert className="text-red-500" />
                                        <h3 className="text-xl font-black text-gray-900">Precauciones Importantes</h3>
                                    </div>
                                    {expandedSections.includes('precauciones') ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                {expandedSections.includes('precauciones') && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-6 pb-6">
                                        <div className="bg-red-50 p-4 rounded-xl text-red-800 text-sm font-medium space-y-2 border border-red-100">
                                            {product.precauciones.map((p, i) => (
                                                <div key={i} className="flex gap-2.5">
                                                    <span>⚠️</span>
                                                    <span>{p}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* FAQs */}
                        {product.faqs && product.faqs.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <button
                                    onClick={() => toggleSection('faqs')}
                                    className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <HelpCircle className="text-indigo-600" />
                                        <h3 className="text-xl font-black text-gray-900">Preguntas Frecuentes</h3>
                                    </div>
                                    {expandedSections.includes('faqs') ? <ChevronUp /> : <ChevronDown />}
                                </button>
                                {expandedSections.includes('faqs') && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-6 pb-6 space-y-4">
                                        {product.faqs.map((faq, i) => (
                                            <div key={i} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                <h4 className="font-bold text-gray-900 mb-1">{faq.q}</h4>
                                                <p className="text-sm text-gray-600">{faq.a}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Ficha Tecnica */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full">
                            <button
                                onClick={() => toggleSection('ficha')}
                                className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="text-xl font-black text-gray-900">Ficha Técnica y Especificaciones</h3>
                                {expandedSections.includes('ficha') ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {expandedSections.includes('ficha') && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    className="px-6 pb-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm w-full">
                                        <div>
                                            <span className="font-bold text-gray-700">Presentaciones:</span>
                                            <p className="text-gray-600">3.8L, 10L, 20L</p>
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-700">Fabricante:</span>
                                            <p className="text-gray-600">Biocambio360 S.A.S.</p>
                                        </div>
                                        <div>
                                            <span className="font-bold text-gray-700">Origen:</span>
                                            <p className="text-gray-600">Soacha, Colombia</p>
                                        </div>
                                        {product.especificaciones && product.especificaciones.map((spec, i) => (
                                            <div key={i}>
                                                <span className="font-bold text-gray-700">{spec.clave}:</span>
                                                <p className="text-gray-600">{spec.valor}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Bloque AEO (Respuestas Rápidas con IA) */}
                        {product.bloqueAEO && product.bloqueAEO.length > 0 && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden border border-indigo-100">
                                <button
                                    onClick={() => toggleSection('aeo')}
                                    className="w-full p-6 flex justify-between items-center hover:bg-indigo-100/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-600 p-2 rounded-xl">
                                            <Bot className="text-white w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-xl font-black text-gray-900">Respuestas Rápidas</h3>
                                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Optimizado para Asistentes de Voz</p>
                                        </div>
                                    </div>
                                    {expandedSections.includes('aeo') ? <ChevronUp className="text-indigo-900" /> : <ChevronDown className="text-indigo-900" />}
                                </button>
                                {expandedSections.includes('aeo') && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="px-6 pb-6 space-y-4">
                                        {product.bloqueAEO.map((item, i) => (
                                            <div key={i} className="bg-white p-5 rounded-xl border border-indigo-50 shadow-sm">
                                                <h4 className="font-bold text-gray-900 mb-2">{item.pregunta}</h4>
                                                <p className="text-sm text-gray-600">{item.respuesta}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* SEO Inter-linking */}
                    {product.enlacesInternos && product.enlacesInternos.length > 0 && (
                        <div className="max-w-4xl mx-auto mb-16 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4 text-gray-800">
                                <LinkIcon size={20} />
                                <h3 className="font-black text-lg">Te puede interesar también...</h3>
                            </div>
                            <div className="flex flex-col gap-3">
                                {product.enlacesInternos.map((enlace, i) => (
                                    <Link key={i} href={`/producto/${enlace.productId}`} className="text-red-600 hover:text-red-800 hover:underline font-medium flex items-center gap-2 transition-colors">
                                        <span className="text-xl">&rarr;</span> {enlace.texto}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 mb-6" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                                Productos Relacionados
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {relatedProducts.map((prod) => (
                                    <ProductCard
                                        key={prod.id}
                                        product={prod}
                                        onAddToCart={(product, size, price, cantidad) => {
                                            addToCart(product, size, price, cantidad);
                                            setShowToast(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Bottom Bar */}
            <AnimatePresence>
                {showStickyBar && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden"
                    >
                        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                            {/* Mobile Price & Size */}
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-sm truncate max-w-[120px]">{product.nombre}</span>
                                <span className="text-xs text-red-600 font-black">{selectedSize} - {formatCurrency(product.precios[selectedSize] ?? 0)}</span>
                            </div>
                            
                            <div className="flex flex-1 items-center justify-end gap-3">
                                {/* Compact quantity */}
                                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center font-bold text-gray-700"
                                    >
                                        −
                                    </button>
                                    <span className="font-bold w-4 text-center text-sm">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 flex items-center justify-center font-bold text-gray-700"
                                    >
                                        +
                                    </button>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAddToCart}
                                    className="bg-red-600 hover:bg-red-700 text-white font-black py-2.5 px-4 rounded-xl shadow text-sm flex items-center gap-2"
                                >
                                    <ShoppingCart size={16} />
                                    AGREGAR
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
