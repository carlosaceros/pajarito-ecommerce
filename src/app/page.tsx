'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import FAQSection from '@/components/FAQSection';
import Toast from '@/components/Toast';
import { Product } from '@/lib/products';
import { getAllProducts } from '@/lib/products-service';
import { useCart } from '@/lib/cart-context';

export default function Home() {
  const { addToCart, setIsCartOpen, getTotalItems } = useCart();
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState({ name: '', size: '' });
  const [productos, setProductos] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProductos(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product: any, size: string, price: number, cantidad: number) => {
    addToCart(product, size as '3.8L' | '10L' | '20L', price, cantidad);
    setToastData({ name: product.nombre, size });
    setShowToast(true);
    // Carrito se abre solo al hacer clic en el ícono
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-6">
      {/* Toast Notification */}
      <Toast
        show={showToast}
        message="Producto agregado"
        productName={toastData.name}
        size={toastData.size}
        onClose={() => setShowToast(false)}
      />

      {/* Hero Section */}
      <div className="rounded-[2rem] mb-10 relative overflow-hidden mx-4 md:mx-auto max-w-7xl">
        {/* Background: banner image — cover on mobile, zoomed on desktop to crop watermark */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-[length:115%] md:bg-[position:left_40%] bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/detergente-pajarito-banner.png)',
          }}
        />
        {/* Gradient overlay — keeps text readable, image subtle */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-900/85 to-gray-900/60 md:from-gray-950/92 md:via-gray-900/80 md:to-gray-900/50" />
        {/* Extra colour blobs */}
        <div className="absolute top-0 right-0 w-full h-full opacity-25 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600 to-purple-600 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[15%] w-[350px] h-[350px] bg-red-600 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-5 sm:p-7 md:p-10 min-h-[220px] md:min-h-[260px]">
          {/* Top: badges + headline */}
          <div className="flex-1">
            <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
              <span className="inline-block bg-red-600 text-white px-2.5 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] font-black tracking-widest uppercase shadow-lg border border-red-500">
                Fábrica Directa
              </span>
              <span className="inline-block bg-white/10 backdrop-blur text-white px-2.5 sm:px-3 py-1 rounded-md text-[9px] sm:text-[10px] font-black tracking-widest uppercase border border-white/20">
                Envíos Nacionales
              </span>
            </div>

            {/* Hero headline — responsive sizing that doesn't clip on mobile */}
            <p className="text-white/70 text-sm sm:text-base font-semibold mb-1 tracking-wide">¡El ahorro que sí limpia!</p>
            <h1 className="font-black leading-[0.85] tracking-tight text-white" style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 'clamp(2.2rem, 8vw, 5.5rem)' }}>
              DETERGENTE
            </h1>
            <h2 className="font-black leading-[0.9] tracking-tight" style={{ fontFamily: '"Archivo Black", sans-serif', fontSize: 'clamp(1.2rem, 5vw, 3.2rem)', color: 'transparent', backgroundImage: 'linear-gradient(90deg, #ec4899, #f43f5e)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
              LÍQUIDO / ROPA
            </h2>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-4 sm:mt-5">
              <button
                onClick={() => document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gray-900 font-black px-6 sm:px-8 py-2.5 rounded-xl hover:bg-gray-100 transition-colors shadow-lg text-sm w-fit"
              >
                VER CATÁLOGO
              </button>
              <div className="hidden sm:flex items-center gap-4 text-sm font-bold text-gray-400 sm:border-l sm:border-gray-700 sm:pl-4">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Compra Segura
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Ahorro que Sí Funciona
                </span>
              </div>
            </div>
          </div>

          {/* Bottom bar — payment methods */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 bg-green-600/90 backdrop-blur-sm rounded-xl px-4 sm:px-5 py-2 sm:py-2.5 text-white text-[11px] sm:text-xs font-bold">
            <span>Compre Poder y Suavidad Hoy</span>
            <span className="hidden sm:block h-4 w-px bg-white/40" />
            <span className="flex items-center gap-1.5">💳 PSE</span>
            <span className="flex items-center gap-1.5">📲 Nequi</span>
            <span className="flex items-center gap-1.5">🚪 Contraentrega</span>
            <span className="hidden md:flex items-center gap-1.5">📦 Pedidos rastreables</span>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto mb-12">
        {isLoadingProducts ? (
            <div className="col-span-full py-20 text-center text-gray-500 font-bold flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mb-4"></div>
                Cargando catálogo...
            </div>
        ) : (
            productos.map((producto) => (
              <ProductCard
                key={producto.id}
                product={producto}
                onAddToCart={handleAddToCart}
              />
            ))
        )}
      </div>

      {/* 🇨🇴 Colombia pride strip — just before Trust section */}
      <div className="mx-4 md:mx-auto max-w-7xl mb-10">
        <div className="bg-gradient-to-r from-yellow-400 via-blue-700 to-red-600 rounded-2xl p-px">
          <div className="bg-gray-900 rounded-2xl px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🇨🇴</span>
              <div>
                <p className="text-white font-black text-base leading-tight" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                  Hecho con manos colombianas
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Formulado y fabricado 100% en Soacha, Cundinamarca · Planta propia</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs font-bold">
              <div className="flex items-center gap-1.5 text-yellow-400">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-white">Calidad INVIMA</p>
                  <p className="text-gray-400 font-normal">Certificado</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-green-400">
                <span className="text-lg">🏭</span>
                <div>
                  <p className="text-white">Fábrica Directa</p>
                  <p className="text-gray-400 font-normal">Sin intermediarios</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 hidden sm:flex">
                <span className="text-lg">🤝</span>
                <div>
                  <p className="text-white">Generamos empleo</p>
                  <p className="text-gray-400 font-normal">Local colombiano</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="bg-white rounded-[2rem] p-12 shadow-xl shadow-gray-200/50 border border-gray-100 mb-16 relative overflow-hidden mx-4 md:mx-auto max-w-7xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h3 className="text-2xl font-black text-gray-900 mb-4" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
            TRANQUILIDAD GARANTIZADA
          </h3>
          <p className="text-gray-500 text-lg">
            Pajarito es una marca registrada de Biocambio360 S.A.S. No improvisamos con tu limpieza.
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
        <FAQSection />
      </div>

    </main>
  );
}
