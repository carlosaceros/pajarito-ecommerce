'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import FAQSection from '@/components/FAQSection';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';
import HeaderMessage from '@/components/HeaderMessage';
import { PRODUCTOS } from '@/lib/products';
import { useCart } from '@/lib/cart-context';

export default function Home() {
  const { addToCart, setIsCartOpen, getTotalItems } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ name: '', size: '' });

  const handleAddToCart = (product: any, size: string, price: number, cantidad: number) => {
    addToCart(product, size as '3.8L' | '10L' | '20L', price, cantidad);
    setToastData({ name: product.nombre, size });
    setShowToast(true);
    // Carrito se abre solo al hacer clic en el ícono
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Toast Notification */}
      <Toast
        show={showToast}
        message="Producto agregado"
        productName={toastData.name}
        size={toastData.size}
        onClose={() => setShowToast(false)}
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-7xl">
          <img src="/images/logo.png" alt="Pajarito" className="h-20" />
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

      {/* Hero Section - Replica exacta del original */}
      <div className="bg-gray-900 rounded-[2rem] p-8 md:p-16 mb-16 text-white shadow-2xl relative overflow-hidden min-h-[400px] flex items-center mx-4 md:mx-auto max-w-7xl mt-8">
        <div className="relative z-10 max-w-2xl">
          <div className="flex gap-2 mb-6">
            <span className="inline-block bg-red-600 text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase shadow-lg border border-red-500">
              Fábrica Directa
            </span>
            <span className="inline-block bg-white/10 backdrop-blur text-white px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-white/20">
              Envíos Nacionales
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-[0.9] tracking-tight" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
            PRODUCTOS DE LIMPIEZA INDUSTRIAL POR MAYOR
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#Dc1580] to-[#fd1d91]">
              DIRECTO DE FÁBRICA.
            </span>
          </h1>
          <p className="text-gray-300 mb-8 text-lg font-medium max-w-lg leading-relaxed">
            Ahorra hasta un 40% comprando detergentes y aseo por galones. Calidad certificada BioCambio 360.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-gray-900 font-black px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              VER OFERTAS
            </button>
            <div className="flex items-center gap-4 text-sm font-bold text-gray-400 border-l border-gray-700 pl-4">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Compra Segura
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Calidad Premium
              </span>
            </div>
          </div>
        </div>
        {/* Gradient blobs background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-red-600 rounded-full blur-[100px]"></div>
        </div>
      </div>

      {/* Section Header: Catálogo 2026 */}
      <div id="catalogo" className="flex items-end justify-between mb-8 pb-4 border-b border-gray-200 px-4 md:px-0 max-w-7xl mx-auto">
        <div>
          <span className="text-red-600 font-bold uppercase text-xs tracking-widest mb-1 block">Nuestros Productos</span>
          <h2 className="text-3xl font-black text-gray-900" style={{ fontFamily: '"Archivo Black", sans-serif' }}>CATÁLOGO 2026</h2>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto mb-20">
        {PRODUCTOS.map((producto) => (
          <ProductCard
            key={producto.id}
            product={producto}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Trust Section - Replica del original */}
      <div className="bg-white rounded-[2rem] p-12 shadow-xl shadow-gray-200/50 border border-gray-100 mb-16 relative overflow-hidden mx-4 md:mx-auto max-w-7xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-4" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
            TRANQUILIDAD GARANTIZADA
          </h3>
          <p className="text-gray-500 text-lg">
            Pajarito es una marca registrada de BioCambio 360 S.A.S. No improvisamos con tu limpieza.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded-2xl transition-colors">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-3 transform group-hover:rotate-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-black text-gray-900 mb-3 text-lg">Envíos Rastreados</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Operamos con 99Envíos y Droppi. Recibe notificaciones por WhatsApp en cada paso de tu pedido.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded-2xl transition-colors">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm -rotate-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h4 className="font-black text-gray-900 mb-3 text-lg">Pago Contraentrega</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Paga en efectivo al recibir en más de 900 municipios. Sin tarjetas, sin complicaciones.
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded-2xl transition-colors">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm rotate-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h4 className="font-black text-gray-900 mb-3 text-lg">Soporte Humano</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              ¿Dudas sobre cómo usar el desengrasante? Escríbenos. Somos expertos en aseo.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 max-w-7xl mx-auto">
        <FAQSection limit={10} />
      </div>

      {/* Footer - Replica completa del original */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Columna 1: Marca */}
            <div>
              <h3 className="font-black text-xl text-white mb-4 tracking-tight" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                PAJARITO
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Calidad industrial al precio justo. Fabricamos soluciones de limpieza que funcionan de verdad.
              </p>
              <div className="flex items-start gap-2 text-sm text-gray-300">
                <span className="font-bold shrink-0">Fábrica:</span>
                <span>
                  Cra. 7C #44-17 Sur,<br />Soacha, Cundinamarca
                </span>
              </div>
            </div>

            {/* Columna 2: Ayuda al Cliente */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Ayuda al Cliente</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition-colors">Estado de mi pedido</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Cómo comprar</a></li>
                <li><a href="#faqs" className="hover:text-red-500 transition-colors">Preguntas Frecuentes</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Contáctanos</a></li>
              </ul>
            </div>

            {/* Columna 3: Políticas */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Políticas</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-red-500 transition-colors">Política de Envíos</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Política de Devolución</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Garantías BioCambio</a></li>
                <li><a href="#" className="hover:text-red-500 transition-colors">Tratamiento de Datos</a></li>
              </ul>
            </div>

            {/* Columna 4: Métodos de Pago */}
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Métodos de Pago</h4>
              <div className="flex gap-2 mb-4 flex-wrap">
                <div className="h-8 bg-gray-800 px-3 rounded flex items-center text-xs font-bold text-gray-300">
                  Efectivo
                </div>
                <div className="h-8 bg-gray-800 px-3 rounded flex items-center text-xs font-bold text-gray-500 opacity-50">
                  Nequi
                </div>
                <div className="h-8 bg-gray-800 px-3 rounded flex items-center text-xs font-bold text-gray-500 opacity-50">
                  Tarjetas
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Pago contraentrega disponible en el 90% del país.
              </p>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <p>© 2026 BioCambio 360 S.A.S. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300 transition-colors">Términos y Condiciones</a>
              <a href="#" className="hover:text-gray-300 transition-colors">Política de Privacidad</a>
              <a href="#" className="text-gray-700 hover:text-gray-400 transition-colors font-bold uppercase tracking-widest text-[10px]">
                Acceso Admin
              </a>
            </div>
          </div>
        </div>

        {/* Schema.org Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Pajarito - BioCambio 360 S.A.S.",
              "url": "https://pajarito.com",
              "logo": "https://pajarito.com/images/logo.png",
              "description": "Fabricantes de productos de aseo industrial. Detergentes, desengrasantes, suavizantes y blanqueadores al por mayor.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Cra. 7C #44-17 Sur",
                "addressLocality": "Soacha",
                "addressRegion": "Cundinamarca",
                "postalCode": "250051",
                "addressCountry": "CO"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "4.5773",
                "longitude": "-74.2167"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+57-300-XXX-XXXX",
                "contactType": "Customer Service",
                "areaServed": "CO",
                "availableLanguage": "Spanish"
              },
              "sameAs": [
                "https://www.facebook.com/PajaritoAseo",
                "https://www.instagram.com/pajarito.aseo"
              ]
            })
          }}
        />
      </footer>
    </main>
  );
}
