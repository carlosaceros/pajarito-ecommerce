'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function WhatsAppButton() {
  const pathname = usePathname();

  // Ocultar botón en checkout u admin si se desea
  if (pathname?.startsWith('/admin') || pathname === '/checkout') {
    return null;
  }

  // Número de soporte de Pajarito
  const WHATSAPP_NUMBER = '57300XXXXXXX'; 
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20interesa%20comprar%20productos%20Pajarito.`;

  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-colors"
      style={{ boxShadow: '0 4px 14px 0 rgba(34, 197, 94, 0.39)' }}
    >
      <MessageCircle size={32} />
      {/* Red dot that animates (ping) */}
      <span className="absolute top-0 right-0 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>
    </motion.a>
  );
}
