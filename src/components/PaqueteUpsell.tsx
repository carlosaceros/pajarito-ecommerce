'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { PRODUCTOS, formatCurrency, ProductSize, PESOS_POR_TALLA } from '@/lib/products';
import { PESO_MAX_PAQUETE_KG } from '@/lib/shipping-zones';

interface PaqueteUpsellProps {
    onAddToCart?: (productId: string, size: ProductSize, price: number) => void;
}

/**
 * PaqueteUpsell — Smart Upselling por espacio disponible en paquete
 * PRD 2026: "Veci, te quedan Xkg en tu paquete. Agrega [producto] y el envío te sigue costando igual."
 */
export default function PaqueteUpsell({ onAddToCart }: PaqueteUpsellProps) {
    const { cart, getTotalWeightKg, addToCart } = useCart();

    const totalKg = getTotalWeightKg();
    const kgRestantes = PESO_MAX_PAQUETE_KG - (totalKg % PESO_MAX_PAQUETE_KG || PESO_MAX_PAQUETE_KG);
    const paquetes = Math.ceil(totalKg / PESO_MAX_PAQUETE_KG);

    // Mostrar sugerencia solo si quedan ≥3kg en el paquete actual y el carrito no está vacío
    if (cart.length === 0 || kgRestantes < 3 || kgRestantes >= PESO_MAX_PAQUETE_KG) return null;

    interface Suggestion {
        productId: string;
        nombre: string;
        size: ProductSize;
        price: number;
        pesoKg: number;
    }

    const suggestions: Suggestion[] = [];

    for (const producto of PRODUCTOS) {
        for (const [size, price] of Object.entries(producto.precios) as [ProductSize, number][]) {
            const peso = PESOS_POR_TALLA[size];
            if (peso <= kgRestantes && !cart.find(i => i.product.id === producto.id && i.size === size)) {
                suggestions.push({ productId: producto.id, nombre: producto.nombre, size, price, pesoKg: peso });
            }
        }
    }

    if (suggestions.length === 0) return null;

    const best = suggestions.sort((a, b) => b.pesoKg - a.pesoKg)[0];
    const producto = PRODUCTOS.find(p => p.id === best.productId)!;

    const handleAdd = () => {
        addToCart(producto, best.size, best.price, 1);
        onAddToCart?.(best.productId, best.size, best.price);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="mx-5 mb-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4"
            >
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl shrink-0">
                        <Package size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black text-amber-800 mb-0.5 uppercase tracking-wide">
                            🚚 ¡Aprovecha el espacio en tu paquete!
                        </p>
                        <p className="text-xs text-amber-700 leading-snug mb-3">
                            Veci, te quedan <span className="font-black">{kgRestantes.toFixed(1)}kg</span> libres
                            {paquetes > 1 ? ` en el paquete ${paquetes}` : ''}.{' '}
                            Agrega <span className="font-bold">{best.size} de {best.nombre}</span> por{' '}
                            <span className="font-black text-amber-900">{formatCurrency(best.price)}</span> y el envío
                            te sigue costando lo mismo.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleAdd}
                            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md shadow-amber-200 transition-colors"
                        >
                            <Plus size={14} />
                            Agregar {best.size} de {best.nombre}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
