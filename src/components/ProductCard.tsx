'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart, Search, Plus, Minus } from 'lucide-react';
import { Product, ProductSize, SIZE_ORDER, calcularAhorro, formatCurrency } from '@/lib/products';
import { generateProductSlug } from '@/lib/product-utils';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product, size: ProductSize, price: number, cantidad: number) => void;
    onViewDetails?: (product: Product) => void;
}

// Badge mostrado en la foto para cada tamaño
const SIZE_PHOTO_BADGE: Partial<Record<ProductSize, { label: string; bg: string } | null>> = {
    '250ml': { label: '250 ml', bg: 'bg-violet-600' },
    '500ml': { label: '500 ml', bg: 'bg-purple-600' },
    '1L': { label: '1 Litro', bg: 'bg-indigo-600' },
    '3.8L': null,
    '10L': { label: '10 Litros', bg: 'bg-blue-600' },
    '20L': { label: '20 Litros 🔥', bg: 'bg-orange-600' },
};

// Imagen de galón aplica para tamaños pequeños también
const SMALL_SIZES: ProductSize[] = ['250ml', '500ml', '1L', '3.8L'];

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    // Determinar el tamaño inicial: preferir 3.8L si existe, sino el primero disponible
    const availableSizes = SIZE_ORDER.filter(s => product.precios[s] !== undefined);
    const defaultSize: ProductSize = availableSizes.includes('3.8L') ? '3.8L' : (availableSizes[0] ?? '3.8L');

    const [selectedSize, setSelectedSize] = useState<ProductSize>(defaultSize);
    const [quantity, setQuantity] = useState(1);

    const currentPrice = product.precios[selectedSize] ?? 0;

    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart(product, selectedSize, currentPrice, quantity);
            setQuantity(1);
        }
    };

    const savingsData = calcularAhorro(
        currentPrice,
        selectedSize,
        product.competidorPromedio[selectedSize] ?? 0
    );

    const productSlug = generateProductSlug(product.id, product.nombre);
    const sizeBadge = SIZE_PHOTO_BADGE[selectedSize];
    const useSmallImage = SMALL_SIZES.includes(selectedSize) && product.imgFileSmall;

    return (
        <motion.div
            layout
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-300 group overflow-hidden"
        >
            {/* Product image */}
            <Link href={`/producto/${productSlug}`} className="block h-56 bg-gray-50 relative flex items-center justify-center p-6 overflow-hidden cursor-pointer">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${product.color}`} />
                <motion.img
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    src={`/images/${useSmallImage ? product.imgFileSmall : product.imgFile}`}
                    alt={`${product.nombre} ${selectedSize}`}
                    className="h-full w-full object-contain drop-shadow-md z-10"
                />

                {/* Badge de oferta */}
                {product.badge && (
                    <motion.div
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-r-full shadow-lg tracking-wider z-20"
                    >
                        {product.badge}
                    </motion.div>
                )}

                {/* Badge de tamaño sobre foto */}
                {sizeBadge && (
                    <motion.div
                        key={selectedSize}
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`absolute bottom-3 right-3 ${sizeBadge.bg} text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg z-20 tracking-wide`}
                    >
                        {sizeBadge.label}
                    </motion.div>
                )}

                {/* Magnifier */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute top-3 right-3 bg-white/80 p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-white transition-all shadow-sm backdrop-blur-sm z-20 opacity-0 group-hover:opacity-100"
                    title="Ver detalles"
                >
                    <Search size={18} />
                </motion.div>

                {/* 🇨🇴 badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[9px] font-black px-2 py-1 rounded-full shadow z-20 text-gray-700">
                    🇨🇴 <span>100% Colombiano</span>
                </div>
            </Link>

            <div className="p-5 flex-1 flex flex-col relative z-20 bg-white">
                <div className="mb-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Línea Industrial</span>
                    <h3 className="text-gray-900 font-black text-xl leading-tight" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                        {product.nombre}
                    </h3>
                </div>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-snug">{product.descripcion}</p>

                {/* Size Selector */}
                <div className="mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Presentación</span>
                    <div className="bg-gray-50 p-1 rounded-lg flex flex-wrap gap-1 border border-gray-100">
                        {availableSizes.map(size => (
                            <motion.button
                                key={size}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedSize(size); }}
                                className={`flex-1 min-w-[42px] py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${selectedSize === size
                                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {size}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Cantidad</span>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100 w-fit">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-red-600"
                        >
                            <Minus size={16} />
                        </motion.button>
                        <motion.span
                            key={quantity}
                            initial={{ scale: 1.3, color: '#dc2626' }}
                            animate={{ scale: 1, color: '#111827' }}
                            className="text-sm font-black w-8 text-center"
                        >
                            {quantity}
                        </motion.span>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setQuantity(quantity + 1)}
                            className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-green-600"
                        >
                            <Plus size={16} />
                        </motion.button>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-auto gap-3 pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase">Precio:</span>
                        <motion.span
                            key={selectedSize}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="text-xl font-black text-gray-900 tracking-tight"
                            style={{ fontFamily: '"Archivo Black", sans-serif' }}
                        >
                            {formatCurrency(currentPrice)}
                        </motion.span>
                        <span className="text-[9px] text-gray-500 font-medium mt-0.5">${savingsData.nuestroPrecioML}/ml</span>
                        {savingsData.mostrarFOMO && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-[9px] font-black text-green-600 mt-1 flex items-center gap-1"
                            >
                                📉 Ahorras {formatCurrency(savingsData.ahorroDinero)} ({savingsData.ahorroPorcentaje}%)
                            </motion.span>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl shadow-lg shadow-red-100 transition-all flex items-center gap-2 pr-4 pl-3"
                    >
                        <ShoppingCart size={18} />
                        <span className="text-xs font-bold hidden sm:inline">AGREGAR</span>
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
