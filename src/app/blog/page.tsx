import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog-data';

export const metadata: Metadata = {
    title: 'Me lo dijo un pajarito - Blog de Aseo y Hogar | Pajarito',
    description: 'Aprende trucos, mejores prácticas y guías definitivas de limpieza industrial y para el hogar. Descubre el blog de Aseo Pajarito.',
    alternates: {
        canonical: '/blog'
    }
};

export default function BlogIndexPage() {
    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-12">
                    <Link href="/" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors mb-6 font-medium">
                        <ArrowLeft size={20} className="mr-2" />
                        Volver a la tienda
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-red-100 p-3 rounded-2xl">
                            <BookOpen className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                            Me lo dijo un <span className="text-red-600">pajarito</span>
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-2xl">
                        Aprende sobre rendimiento, dosis correctas y trucos para mantener tu hogar impecable sin gastar de más.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {BLOG_POSTS.map((post) => (
                        <Link 
                            key={post.slug} 
                            href={`/blog/${post.slug}`}
                            className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                        >
                            <div className="relative h-64 overflow-hidden bg-gray-100 flex items-center justify-center">
                                <div className="absolute inset-0 bg-red-600/5 group-hover:bg-transparent transition-colors z-10" />
                                <Image
                                    src={post.imagen}
                                    alt={post.tituloSEO}
                                    width={400}
                                    height={400}
                                    className="object-contain h-48 group-hover:scale-105 transition-transform duration-500 drop-shadow-xl"
                                />
                                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-600 flex items-center gap-1.5 shadow-sm">
                                    <Clock size={14} />
                                    <span>3 min de lectura</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-1">
                                <h2 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-red-600 transition-colors leading-tight" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                                    {post.h1}
                                </h2>
                                <p className="text-gray-600 mb-6 flex-1 line-clamp-3">
                                    {post.metaDescription}
                                </p>
                                <div className="flex items-center text-red-600 font-bold uppercase tracking-wider text-sm mt-auto group-hover:gap-2 transition-all">
                                    Leer artículo <span className="text-xl leading-none">&rarr;</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
