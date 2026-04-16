'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import HeaderMessage from '@/components/HeaderMessage';
import CartDrawer from '@/components/CartDrawer';
import { useCart } from '@/lib/cart-context';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function GlobalHeader() {
  const { setIsCartOpen, getTotalItems } = useCart();
  const pathname = usePathname();

  // Ocultar header en admin y checkout
  if (pathname?.startsWith('/admin') || pathname === '/checkout') {
    return null;
  }

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between max-w-7xl">
          <Link href="/">
            <img src="/images/logo.png" alt="Pajarito" className="h-32 object-contain" />
          </Link>
          <HeaderMessage />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="relative p-3 text-gray-600 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded-xl shadow-sm"
          >
            <ShoppingCart size={28} />
            <AnimatePresence>
              {getTotalItems() > 0 && (
                <motion.span
                  key={getTotalItems()}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 15
                  }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black min-w-[28px] h-7 rounded-full flex items-center justify-center border-3 border-white shadow-lg px-2"
                  style={{ fontFamily: '"Archivo Black", sans-serif' }}
                >
                  <motion.span
                    key={`count-${getTotalItems()}`}
                    initial={{ scale: 1.5, rotate: 10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {getTotalItems()}
                  </motion.span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
}
