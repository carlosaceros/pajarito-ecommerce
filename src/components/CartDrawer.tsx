'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/products';
import { Truck, Sparkles } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 100000;

export default function CartDrawer() {
    const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalSavings, isCartOpen, setIsCartOpen } = useCart();

    const totalPrice = getTotalPrice();
    const totalSavings = getTotalSavings();
    const progress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);
    const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - totalPrice;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setIsCartOpen(false)}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 300
                        }}
                        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-red-50 to-orange-50">
                            <h2 className="font-black text-xl text-gray-900" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                                TU CARRITO
                            </h2>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-white rounded-lg transition-colors"
                            >
                                <X size={24} className="text-gray-400 hover:text-red-600" />
                            </motion.button>
                        </div>

                        {/* Free Shipping Progress Bar */}
                        {cart.length > 0 && (
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Truck size={18} className={progress >= 100 ? "text-green-600" : "text-gray-500"} />
                                    <p className="text-sm font-bold text-gray-800">
                                        {progress >= 100 ? (
                                            <span className="text-green-600 flex items-center gap-1">
                                                ¡Felicidades! Tienes envío GRATIS 🎉
                                            </span>
                                        ) : (
                                            <span>Te faltan <span className="text-red-600">{formatCurrency(amountToFreeShipping)}</span> para envío GRATIS</span>
                                        )}
                                    </p>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-red-500'}`}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {cart.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-16"
                                >
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                                    </motion.div>
                                    <p className="text-gray-400 text-lg font-medium">Tu carrito está vacío</p>
                                    <p className="text-gray-400 text-sm mt-2">Agrega productos para comenzar</p>
                                </motion.div>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {cart.map((item, idx) => (
                                        <motion.div
                                            key={`${item.product.id}-${item.size}`}
                                            layout
                                            initial={{ opacity: 0, scale: 0.8, x: -50 }}
                                            animate={{ opacity: 1, scale: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.8, x: 50 }}
                                            transition={{
                                                type: "spring",
                                                damping: 20,
                                                stiffness: 300
                                            }}
                                            className="bg-white border-2 border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-red-200 transition-all"
                                        >
                                            <div className="flex gap-4">
                                                {/* Product Image */}
                                                <motion.div
                                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                                    className="w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                                                >
                                                    <img
                                                        src={`/images/${item.size === '3.8L' && item.product.imgFileSmall ? item.product.imgFileSmall : item.product.imgFile}`}
                                                        alt={item.product.nombre}
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                </motion.div>

                                                {/* Product Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-gray-900 text-sm mb-1 truncate">
                                                        {item.product.nombre}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        Presentación: <span className="font-bold text-red-600">{item.size}</span>
                                                    </p>

                                                    {/* Quantity Selector */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-1 border border-gray-200">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => updateQuantity(item.product.id, item.size, item.cantidad - 1)}
                                                                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-red-600"
                                                            >
                                                                <Minus size={16} />
                                                            </motion.button>
                                                            <motion.span
                                                                key={item.cantidad}
                                                                initial={{ scale: 1.5, color: '#dc2626' }}
                                                                animate={{ scale: 1, color: '#111827' }}
                                                                className="text-sm font-black w-8 text-center"
                                                            >
                                                                {item.cantidad}
                                                            </motion.span>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => updateQuantity(item.product.id, item.size, item.cantidad + 1)}
                                                                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-green-600"
                                                            >
                                                                <Plus size={16} />
                                                            </motion.button>
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => removeFromCart(item.product.id, item.size)}
                                                            className="text-xs text-red-600 hover:text-red-700 font-bold px-3 py-1 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            Eliminar
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <motion.div
                                                layout
                                                className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center"
                                            >
                                                <span className="text-xs text-gray-500 font-medium">Subtotal:</span>
                                                <motion.span
                                                    key={item.cantidad}
                                                    initial={{ scale: 1.2, color: '#dc2626' }}
                                                    animate={{ scale: 1, color: '#111827' }}
                                                    className="font-black text-lg"
                                                    style={{ fontFamily: '"Archivo Black", sans-serif' }}
                                                >
                                                    {formatCurrency(item.price * item.cantidad)}
                                                </motion.span>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Footer - Total & Checkout */}
                        {cart.length > 0 && (
                            <motion.div
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                className="border-t-2 bg-gradient-to-r from-gray-50 to-white p-6 space-y-4 shadow-2xl"
                            >
                                {totalSavings > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-2 text-green-800">
                                            <Sparkles size={18} className="text-green-600" />
                                            <span className="font-bold text-sm">Ahorro total estimado:</span>
                                        </div>
                                        <motion.span
                                            key={totalSavings}
                                            initial={{ scale: 1.2, color: '#16a34a' }}
                                            animate={{ scale: 1, color: '#166534' }}
                                            className="font-black text-green-700"
                                        >
                                            {formatCurrency(totalSavings)}
                                        </motion.span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-600 text-lg">Total a pagar:</span>
                                    <motion.span
                                        key={totalPrice}
                                        initial={{ scale: 1.3, color: '#dc2626' }}
                                        animate={{ scale: 1, color: '#111827' }}
                                        className="font-black text-3xl"
                                        style={{ fontFamily: '"Archivo Black", sans-serif' }}
                                    >
                                        {formatCurrency(totalPrice)}
                                    </motion.span>
                                </div>
                                <Link href="/checkout">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setIsCartOpen(false)}
                                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-xl shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        IR AL CHECKOUT
                                        <ArrowRight size={20} />
                                    </motion.button>
                                </Link>
                                <p className="text-xs text-gray-400 text-center">
                                    {progress >= 100 ? '¡El envío a toda Colombia es GRATIS para este pedido!' : 'El costo de envío se calculará en el siguiente paso'}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
