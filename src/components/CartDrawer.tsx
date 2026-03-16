'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { formatCurrency } from '@/lib/products';

export default function CartDrawer() {
    const { cart, removeFromCart, updateQuantity, getTotalPrice, isCartOpen, setIsCartOpen } = useCart();

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
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-600 text-lg">Total:</span>
                                    <motion.span
                                        key={getTotalPrice()}
                                        initial={{ scale: 1.3, color: '#dc2626' }}
                                        animate={{ scale: 1, color: '#111827' }}
                                        className="font-black text-3xl"
                                        style={{ fontFamily: '"Archivo Black", sans-serif' }}
                                    >
                                        {formatCurrency(getTotalPrice())}
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
                                    Envío calculado en el siguiente paso
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
