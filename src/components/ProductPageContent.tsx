'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Package, Truck, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Product, formatCurrency, calcularAhorro } from '@/lib/products';
import { useCart } from '@/lib/cart-context';
import ProductCard from '@/components/ProductCard';
import Toast from '@/components/Toast';

interface ProductPageContentProps {
    product: Product;
    relatedProducts: Product[];
}

export default function ProductPageContent({ product, relatedProducts }: ProductPageContentProps) {
    const router = useRouter();
    const { addToCart, setIsCartOpen } = useCart();
    const [selectedSize, setSelectedSize] = useState<'3.8L' | '10L' | '20L'>('10L');
    const [quantity, setQuantity] = useState(1);
    const [showToast, setShowToast] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('ficha');

    const savingsData = calcularAhorro(
        product.precios[selectedSize],
        selectedSize,
        product.competidorPromedio[selectedSize]
    );

    const handleAddToCart = () => {
        addToCart(product, selectedSize, product.precios[selectedSize], quantity);
        setShowToast(true);
    };

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
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
                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <nav className="flex items-center gap-2 text-sm text-gray-500">
                            <Link href="/" className="hover:text-red-600 transition-colors">
                                Inicio
                            </Link>
                            <span>/</span>
                            <Link href="/#catalogo" className="hover:text-red-600 transition-colors">
                                Productos
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">{product.nombre}</span>
                        </nav>
                    </div>
                </div>

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
                                    Línea Industrial
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 mb-4" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                                    {product.nombre}
                                </h1>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {product.descripcion}
                                </p>

                                {/* Size Selector */}
                                <div className="mb-6">
                                    <label className="text-sm font-bold text-gray-700 mb-3 block">
                                        Selecciona Presentación:
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(Object.keys(product.precios) as Array<keyof typeof product.precios>).map(size => (
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
                                                    {formatCurrency(product.precios[size])}
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
                                                {formatCurrency(product.precios[selectedSize])}
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
                                                Total: {formatCurrency(product.precios[selectedSize] * quantity)}
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
                                <div className="space-y-3">
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
                                    Envío gratis en compras superiores a $100,000
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Expandable Sections */}
                    <div className="max-w-4xl mx-auto mb-16 space-y-4">
                        {/* Technical Sheet */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <button
                                onClick={() => toggleSection('ficha')}
                                className="w-full p-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="text-xl font-black text-gray-900">Ficha Técnica</h3>
                                {expandedSection === 'ficha' ? <ChevronUp /> : <ChevronDown />}
                            </button>
                            {expandedSection === 'ficha' && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    className="px-6 pb-6"
                                >
                                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                                        <div>
                                            <span className="font-bold text-gray-700">Uso:</span>
                                            <p className="text-gray-600">Industrial y Doméstico</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

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
                                            addToCart(product, size as '3.8L' | '10L' | '20L', price, cantidad);
                                            setShowToast(true);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
