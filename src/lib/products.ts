// Product data types and constants
export interface FAQ {
    q: string;
    a: string;
}

export interface Product {
    id: string;
    nombre: string;
    slogan: string;
    descripcion: string;
    imgFile: string;
    imgFileSmall?: string;
    beneficios: string[];
    badge: string;
    color: string;
    faqs: FAQ[];
    precios: {
        '3.8L': number;
        '10L': number;
        '20L': number;
    };
    competidorPromedio: {
        '3.8L': number;
        '10L': number;
        '20L': number;
    };
}

export const PRODUCTOS: Product[] = [
    {
        id: 'detergente',
        nombre: 'Detergente Ropa',
        slogan: 'Cuida el color y tu bolsillo',
        descripcion: 'Fórmula concentrada industrial. Protege las fibras de ropa blanca y color. Rinde el doble gracias a su viscosidad optimizada.',
        imgFile: 'PAJARITO_DETERGENTE%20ROPA_10L.png',
        imgFileSmall: 'PAJARITO_DETERGENTE ROPA Galón.webp',
        beneficios: ['Protección Color', 'pH Neutro', 'Baja Espuma (Ahorra agua)'],
        badge: 'MÁS VENDIDO',
        color: 'bg-blue-600',
        faqs: [
            { q: '¿Sirve para lavadora frontal?', a: 'Sí, nuestra fórmula de baja espuma protege los sensores de lavadoras HE (Alta Eficiencia) y carga frontal.' },
            { q: '¿Necesito usar suavizante?', a: 'El detergente limpia profundamente, pero recomendamos usar nuestro Suavizante Textil para restaurar la suavidad de las fibras.' },
            { q: '¿Es biodegradable?', a: 'Totalmente. Nuestros tensoactivos se degradan en menos de 28 días según norma OECD 301D, siendo seguros para vertimientos.' },
            { q: '¿Cuál es la dosificación correcta?', a: 'Para una carga completa (15kg) de ropa muy sucia, use 100ml. Para suciedad normal, 60ml son suficientes.' }
        ],
        precios: { '3.8L': 25000, '10L': 39000, '20L': 59000 },
        competidorPromedio: { '3.8L': 8500, '10L': 4800, '20L': 3400 }
    },
    {
        id: 'desengrasante',
        nombre: 'Desengrasante Rojo',
        slogan: 'Arranca grasa al instante',
        descripcion: 'El terror de la grasa. Fórmula activa para cocinas industriales, motores, pisos de taller y juntas de cerámica.',
        imgFile: 'PAJARITO_DESENGRASANTE%20ROJO_10L.png',
        imgFileSmall: 'PAJARITO_DESENGRASANTE galón_octubre 2025.webp',
        beneficios: ['Multiusos Potente', 'Acción Inmediata', 'Biodegradable'],
        badge: 'PODER TOTAL',
        color: 'bg-red-600',
        faqs: [
            { q: '¿Daña el aluminio?', a: 'El producto es alcalino. Para aluminio o teflón, diluir 1 parte de producto en 5 de agua y enjuagar rápido.' },
            { q: '¿Sirve para ropa?', a: 'Excelente para cuellos y puños o grasa mecánica en overoles. Aplicar directo 5 min antes del lavado.' },
            { q: '¿Tiene registro sanitario?', a: 'Sí, cumplimos con normatividad INVIMA para productos de aseo industrial y doméstico línea desengrasante.' },
            { q: '¿Quita cochambre de estufas?', a: 'Es su especialidad. Aplique puro sobre la plancha o estufa caliente (60°C), deje actuar 10 min y retire con esponja.' }
        ],
        precios: { '3.8L': 25000, '10L': 39000, '20L': 59000 },
        competidorPromedio: { '3.8L': 9200, '10L': 5100, '20L': 3600 }
    },
    {
        id: 'suavizante',
        nombre: 'Suavizante Textil',
        slogan: 'Suavidad que enamora',
        descripcion: 'Microcápsulas de aroma importado que perduran en las fibras. Facilita el planchado y elimina la estática.',
        imgFile: 'PAJARITO_SUAVIZANTE_10L.png',
        imgFileSmall: 'PAJARITO_SUAVIZANTE Galón.webp',
        beneficios: ['Fácil Planchado', 'Aroma 48h', 'Desemreda Fibras'],
        badge: 'AROMA PREMIUM',
        color: 'bg-pink-500',
        faqs: [
            { q: '¿Mancha la ropa?', a: 'No. Nuestra fórmula "Cero-Grasa" hidrata la fibra sin dejar residuos aceitosos que manchan la ropa oscura.' },
            { q: '¿Qué aroma es?', a: 'Floral-Oceánico con tecnología de microcápsulas que liberan aroma por fricción hasta por 48 horas.' },
            { q: '¿Es hipoalergénico?', a: 'Formulado para minimizar riesgos de alergia, libre de colorantes agresivos. Apto para ropa de bebé.' }
        ],
        precios: { '3.8L': 25000, '10L': 39000, '20L': 59000 },
        competidorPromedio: { '3.8L': 8800, '10L': 4900, '20L': 3500 }
    },
    {
        id: 'blanqueador',
        nombre: 'Blanqueador',
        slogan: 'Blancura sin dañar',
        descripcion: 'Hipoclorito de sodio estabilizado. Desinfección hospitalaria para baños, pisos y ropa blanca percudida.',
        imgFile: 'PAJARITO_BLANQUEADOR%2010L.png',
        imgFileSmall: 'PAJARITO_BLANQUEADOR Galón.webp',
        beneficios: ['Desinfección 99.9%', 'Blancura Total', 'Estabilizado'],
        badge: 'ECONÓMICO',
        color: 'bg-teal-500',
        faqs: [
            { q: '¿Qué concentración tiene?', a: 'Hipoclorito de Sodio al 5.25% a la salida de fábrica. Estabilizado para durar más tiempo activo.' },
            { q: '¿Sirve para purificar agua?', a: 'Sí. Aplique 4 gotas por litro de agua clara, espere 30 minutos. Elimina 99.9% de bacterias y virus.' },
            { q: '¿Daña la ropa blanca?', a: 'El uso excesivo puede amarillentar. Use la dosis recomendada (1/2 taza por carga) para mantener el blanco brillante.' },
            { q: '¿Se puede mezclar con otros productos?', a: 'PELIGRO: NUNCA mezcle blanqueador con desengrasantes, ácidos o amoníaco. Libera gases tóxicos.' }
        ],
        precios: { '3.8L': 15000, '10L': 32000, '20L': 49000 },
        competidorPromedio: { '3.8L': 5500, '10L': 4000, '20L': 3100 }
    }
];

// Helper function: Calculate savings
export interface SavingsData {
    nuestroPrecioML: string;
    ahorroPorcentaje: number;
    mostrarFOMO: boolean;
}

export const calcularAhorro = (
    precioNuestro: number,
    volumen: string,
    competidorPrecioPorLitro: number
): SavingsData => {
    const litros = parseFloat(volumen);
    const nuestroPrecioML = precioNuestro / (litros * 1000);
    const competidorPrecioML = competidorPrecioPorLitro / 1000;
    const ahorroPorcentaje = ((competidorPrecioML - nuestroPrecioML) / competidorPrecioML) * 100;

    return {
        nuestroPrecioML: nuestroPrecioML.toFixed(2),
        ahorroPorcentaje: Math.round(ahorroPorcentaje),
        mostrarFOMO: ahorroPorcentaje > 15
    };
};

// Format currency helper
export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val);
};
