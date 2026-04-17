'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalFooter() {
    const pathname = usePathname();

    // Ocultar footer en admin y checkout
    if (pathname?.startsWith('/admin') || pathname === '/checkout') {
        return null;
    }

    return (
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
                            <li><Link href="/como-comprar" className="hover:text-red-500 transition-colors">Cómo comprar</Link></li>
                            <li><Link href="/#faqs" className="hover:text-red-500 transition-colors">Preguntas Frecuentes</Link></li>
                            <li><a href="https://wa.me/57300XXXXXXX" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors">Contáctanos</a></li>
                        </ul>
                    </div>

                    {/* Columna 3: Políticas */}
                    <div>
                        <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Políticas</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><Link href="/politica-envios" className="hover:text-red-500 transition-colors">Política de Envíos</Link></li>
                            <li><Link href="/politica-devolucion" className="hover:text-red-500 transition-colors">Política de Devolución</Link></li>
                            <li><Link href="/garantias" className="hover:text-red-500 transition-colors">Garantías BioCambio</Link></li>
                            <li><Link href="/privacidad" className="hover:text-red-500 transition-colors">Tratamiento de Datos</Link></li>
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
                    <div className="flex flex-col items-center md:items-start gap-1">
                        <p>© 2026 Biocambio360 S.A.S. Todos los derechos reservados.</p>
                        <p>
                            Diseñado y desarrollado con ❤️ por{' '}
                            <a
                                href="https://thinktic.co"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors font-semibold"
                            >
                                THINK TIC S.A.S.
                            </a>
                        </p>
                    </div>
                    <div className="flex gap-6">
                        <Link href="/terminos" className="hover:text-gray-300 transition-colors">Términos y Condiciones</Link>
                        <Link href="/privacidad" className="hover:text-gray-300 transition-colors">Política de Privacidad</Link>
                        <Link href="/admin/login" className="text-gray-700 hover:text-gray-400 transition-colors font-bold uppercase tracking-widest text-[10px]">
                            Acceso Admin
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
