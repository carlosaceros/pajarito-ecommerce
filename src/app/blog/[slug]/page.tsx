import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen, Clock, Tag, ShoppingCart, HelpCircle } from 'lucide-react';
import { BLOG_POSTS } from '@/lib/blog-data';
import { getProductBySlug } from '@/lib/product-utils';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const defaultParams = await params;
    const post = BLOG_POSTS.find(p => p.slug === defaultParams.slug);

    if (!post) {
        return {
            title: 'Artículo no encontrado | Pajarito',
        };
    }

    return {
        title: `${post.tituloSEO} | Pajarito Blog`,
        description: post.metaDescription,
        openGraph: {
            title: post.tituloSEO,
            description: post.metaDescription,
            type: 'article',
            publishedTime: post.fecha,
            images: [
                {
                    url: `https://www.productospajarito.com${post.imagen}`,
                    width: 800,
                    height: 800,
                    alt: post.tituloSEO
                }
            ]
        },
        alternates: {
            canonical: `/blog/${post.slug}`
        }
    };
}

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: Props) {
    const defaultParams = await params;
    const post = BLOG_POSTS.find(p => p.slug === defaultParams.slug);

    if (!post) {
        notFound();
    }

    // Try to get related product URL based on internal ID mapping in products-service
    // We assume the slug is the same as the ID with '-industrial' or similar, but the router allows passing ID directly via getProductBySlug if it partially matches. We'll simply use the link formatting standard.
    // The link should realistically go to `/producto/id-associated` or just `/producto/[id]` which redirects
    const relatedProductUrl = `/producto/${post.relatedProductId}`; // The app handles basic slugs if it's identical to the base
    
    const formattedDate = new Date(post.fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": post.faqs.map(faq => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.a
            }
        }))
    };

    return (
        <div className="bg-white min-h-screen pt-24 pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <article className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="mb-10 text-center">
                    <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-red-600 transition-colors mb-8 font-medium">
                        <ArrowLeft size={20} className="mr-2" />
                        Volver al Blog
                    </Link>
                    <div className="flex justify-center items-center gap-4 text-sm text-gray-500 font-bold uppercase tracking-wider mb-6">
                        <span className="flex items-center gap-1.5"><Clock size={16} /> 3 MIN LECTURA</span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5"><Tag size={16} /> CONSEJOS ASEO</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-8" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                        {post.h1}
                    </h1>
                </div>

                {/* Cover Image */}
                <div className="relative w-full h-[300px] md:h-[450px] bg-gray-50 rounded-3xl overflow-hidden mb-12 shadow-sm border border-gray-100 flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 to-transparent"></div>
                    <Image
                        src={post.imagen}
                        alt={post.tituloSEO}
                        width={600}
                        height={600}
                        className="object-contain h-[90%] drop-shadow-2xl"
                    />
                </div>

                {/* Content */}
                <div className="prose prose-lg prose-red max-w-none mb-16 text-gray-700 leading-relaxed">
                    {post.contenido.map((parrafo, i) => (
                        <p key={i} className="mb-6">{parrafo}</p>
                    ))}
                </div>

                {/* CTA - The Related Product */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 md:p-12 mb-16 border border-red-200 text-center md:text-left flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="flex-1">
                        <h3 className="text-2xl font-black text-gray-900 mb-3" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                            ¿Listo para una limpieza superior?
                        </h3>
                        <p className="text-red-800 mb-6 font-medium">
                            Conoce nuestro <strong>{post.relatedProductAnchor}</strong> y transforma tu hogar hoy mismo con nuestra calidad industrial.
                        </p>
                        <Link 
                            href={relatedProductUrl}
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black py-4 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1"
                        >
                            <ShoppingCart size={20} />
                            Ver Precio y Tamaños
                        </Link>
                    </div>
                    <div className="w-48 h-48 relative shrink-0">
                        <div className="absolute inset-0 bg-white rounded-full opacity-50 blur-2xl"></div>
                        <Image
                            src={post.imagen}
                            alt="Producto relacionado"
                            fill
                            className="object-contain drop-shadow-lg"
                        />
                    </div>
                </div>

                {/* FAQs */}
                <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <HelpCircle className="w-8 h-8 text-indigo-600" />
                        <h2 className="text-2xl font-black text-gray-900" style={{ fontFamily: '"Archivo Black", sans-serif' }}>
                            Preguntas Frecuentes
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {post.faqs.map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </article>
        </div>
    );
}
