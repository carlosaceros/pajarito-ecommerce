// Extended FAQs for SEO - Investigative stage users
export interface FAQItem {
    question: string;
    answer: string;
    category: 'producto' | 'compra' | 'envio' | 'tecnico';
}

export const FAQS_GENERALES: FAQItem[] = [
    // Categoría: Producto (8 preguntas)
    {
        question: "¿Qué hace diferente a Pajarito de otras marcas de aseo?",
        answer: "Somos fabricantes directos (BioCambio 360 S.A.S.) ubicados en Soacha, Cundinamarca. Eliminamos intermediarios vendiéndote al mismo precio que le vendemos a distribuidores mayoristas. Nuestra planta cuenta con certificación INVIMA y formulaciones de grado industrial usadas en hoteles, hospitales y lavanderías.",
        category: 'producto'
    },
    {
        question: "¿Los productos Pajarito tienen registro sanitario?",
        answer: "Sí. Todos nuestros productos cuentan con registro sanitario INVIMA vigente. Cumplimos normativas para productos de aseo de uso doméstico e industrial según Decreto 4725 de 2005 y Resolución 1506 de 2011.",
        category: 'producto'
    },
    {
        question: "¿Cuánto rinde un galón (3.8L) comparado con presentaciones de supermercado?",
        answer: "Un galón de 3.8L equivale aproximadamente a 12 botellas de 300ml de supermercado. Considerando que una botella tradicional cuesta entre $8,000-$12,000, comprar por galón genera un ahorro del 60-75% por mililitro.",
        category: 'producto'
    },
    {
        question: "¿Son productos biodegradables?",
        answer: "Sí. Nuestros tensoactivos se degradan en menos de 28 días según norma OECD 301D. Los Blanqueadores usan Hipoclorito de Sodio estabilizado al 5.25%, seguro para sistemas sépticos en dosificaciones recomendadas.",
        category: 'producto'
    },
    {
        question: "¿Puedo usar los productos industriales en mi hogar sin peligro?",
        answer: "Totalmente. 'Industrial' se refiere a la concentración y rendimiento, no a toxicidad. De hecho, al ser más concentrados, terminas usando menos product por lavada. Incluimos instrucciones de dilución para uso doméstico en cada envase.",
        category: 'producto'
    },
    {
        question: "¿El detergente daña lavadoras de carga frontal?",
        answer: "No. Nuestra fórmula es de baja espuma (Low Foam), diseñada específicamente para lavadoras HE (Alta Eficiencia) y frontales. El exceso de espuma en otras marcas es lo que daña sensores, nosotros evitamos ese problema.",
        category: 'producto'
    },
    {
        question: "¿Qué diferencia hay entre Desengrasante Rojo y desengrasantes de cocina normales?",
        answer: "Nuestro pH alcalino (11-12) rompe enlaces de grasa a nivel molecular instantáneamente. Los desengrasantes de supermercado rondan pH 9-10. Esa diferencia química significa que el nuestro limpia cochambre, aceite quemado y grasa industrial que productos domésticos no pueden.",
        category: 'producto'
    },
    {
        question: "¿Los envases son reciclables?",
        answer: "Sí. Usamos PEAD (Polietileno de Alta Densidad) código 2 de reciclaje. Aceptamos devolución de garrafas vacías en nuestra planta en Soacha con descuento del 10% en tu próxima compra (programa Eco-Retorno).",
        category: 'producto'
    },

    // Categoría: Compra (7 preguntas)
    {
        question: "¿Cómo hago un pedido si no tengo tarjeta de crédito?",
        answer: "El 85% de nuestros clientes pagan contraentrega en efectivo. Seleccionas tus productos, llenas la dirección de envío, y pagas al transportista cuando llegue el paquete. No necesitas cuenta bancaria ni tarjetas.",
        category: 'compra'
    },
    {
        question: "¿Cuál es el pedido mínimo?",
        answer: "No hay pedido mínimo de productos. Sin embargo, el costo de envío contraentrega estándar es $15,000-$18,000 según la ciudad. Para pedidos superiores a $100,000 el envío es GRATIS a capitales.",
        category: 'compra'
    },
    {
        question: "¿Puedo cambiar o cancelar mi pedido después de hacer el pago?",
        answer: "Sí, siempre que no se haya despachado. Contáctanos por WhatsApp al 300-XXX-XXXX con tu número de orden antes de 2 horas hábiles después de la compra. El reembolso toma 3-5 días hábiles.",
        category: 'compra'
    },
    {
        question: "¿Aceptan Nequi, Daviplata o transferencias?",
        answer: "Sí. Puedes pagar el total o solo el envío por adelantado vía Nequi/Daviplata a nuestro número XXX-XXX-XXXX. Esto agiliza el despacho (sale el mismo día) y en algunos casos reduce el costo de flete.",
        category: 'compra'
    },
    {
        question: "¿Dan factura electrónica?",
        answer: "Sí. Emitimos factura electrónica para personas naturales y jurídicas. Solo indícalo en 'Notas' al momento del checkout con tu NIT/CC y razón social. La factura llega a tu email en máximo 48 horas.",
        category: 'compra'
    },
    {
        question: "¿Hay descuentos por volumen?",
        answer: "Sí. Compras superiores a 6 unidades de un mismo producto tienen 5% OFF automático. Negocios (tiendas, lavanderías, hoteles) que compren más de $500,000/mes califican para descuento mayorista del 12-18%.",
        category: 'compra'
    },
    {
        question: "¿Puedo comprar hoy y recoger en fábrica mañana?",
        answer: "Sí. Selecciona 'Retiro en Planta' al finalizar compra (gratis). Te confirmamos por WhatsApp cuando esté listo (usualmente 2-4 horas). Horario: Lunes a Viernes 8AM-5PM, Sábados 8AM-12PM. Dirección: Cra. 7C #44-17 Sur, Soacha.",
        category: 'compra'
    },

    // Categoría: Envío (6 preguntas)
    {
        question: "¿A qué ciudades hacen envíos?",
        answer: "Cubrimos TODO el territorio nacional vía 99Envíos, Droppi, Interrapidísimo y Coordinadora. Principales ciudades llegan en 1-3 días; municipios intermedios 3-7 días; zonas rurales hasta 10-12 días hábiles.",
        category: 'envio'
    },
    {
        question: "¿Cómo sé en qué va mi pedido?",
        answer: "Al despachar tu orden recibes un WhatsApp con el número de guía. Con ese código rastresas el paquete en tiempo real en la web de la transportadora. También enviamos notificaciones automáticas en cada cambio de estado.",
        category: 'envio'
    },
    {
        question: "¿Qué pasa si no estoy en casa cuando llega el pedido?",
        answer: "La transportadora intenta entrega 3 veces. Si no te encuentran, el paquete vuelve a bodega local de la transportadora donde tienes 5 días para recogerlo con tu cédula. Pasado ese tiempo, se devuelve a fábrica (pierdes el flete).",
        category: 'envio'
    },
    {
        question: "¿El envío contraentrega tiene algún costo extra?",
        answer: "El costo del flete YA incluye el servicio de recaudo (contraentrega). No hay comisiones ocultas. El transportista te cobra únicamente: Precio Productos + Costo Envío.",
        category: 'envio'
    },
    {
        question: "¿Puedo programar la entrega para un día específico?",
        answer: "Las transportadoras no garantizan entrega en fecha exacta, pero sí rango de 1-3 días desde que sale de nuestra bodega. Si necesitas fecha específica (cumpleaños, evento), agenda con 5-7 días de anticipación y coordínalo en 'Notas' del pedido.",
        category: 'envio'
    },
    {
        question: "¿Qué hago si mi pedido llega dañado o incompleto?",
        answer: "Toma fotos/video ANTES de firmar la guía del transportista. Si hay daño visible, RECHAZA el paquete. Si el daño es interno, contáctanos en máximo 24 horas con evidencia fotográfica. Reponemos el producto o devolvemos el 100% del dinero.",
        category: 'envio'
    },

    // Categoría: Técnico (4 preguntas)
    {
        question: "¿Cuál es la dosificación correcta del detergente para una lavadora de 15kg?",
        answer: "Para una carga completa (15kg) con suciedad normal: 60ml (4 cucharadas). Ropa muy sucia o con manchas difíciles: 100ml. En lavadoras semiautomáticas o manuales puedes usar hasta 120ml porque se enjuaga más veces.",
        category: 'tecnico'
    },
    {
        question: "¿Se puede mezclar el blanqueador con detergente o desengrasante?",
        answer: "JAMÁS mezcles blanqueador (Hipoclorito) con desengrasantes o ácidos. La reacción química libera gas Cloro (tóxico). Usa blanqueador SOLO en ciclo de remojo o enjuague final, nunca en el lavado principal si ya echaste detergente.",
        category: 'tecnico'
    },
    {
        question: "¿El suavizante mancha ropa oscura?",
        answer: "Nuestro suavizante NO. Muchas marcas de supermercado usan aceites minerazules que dejan residuo blanco en negros. Nosotros usamos siliconas solubles 'Cero-Grasa' que no dejan película aceitosa.",
        category: 'tecnico'
    },
    {
        question: "¿Puedo usar desengrasante en superficies de aluminio?",
        answer: "Con precaución. El pH alcalino (11-12) puede opacar aluminio. Si vas a usarlo: diluye 1 parte de producto en 5 de agua, aplica máximo 30 segundos, y enjuaga inmediatamente. Nunca lo uses puro sobre aluminio o teflón.",
        category: 'tecnico'
    },

    // Extras para llegar a 25+
    {
        question: "¿Hacen entregas el mismo día en Bogotá?",
        answer: "Sí, para pedidos confirmados antes de las 10AM en Bogotá zona urbana. Costo adicional: $8,000. Solo disponible de Lunes a Viernes. Confirma disponibilidad enviando WhatsApp antes de comprar.",
        category: 'compra'
    },
    {
        question: "¿Los productos vienen con etiqueta de instrucciones?",
        answer: "Sí. Cada envase lleva etiqueta con: Nombre del producto, Registro INVIMA, Ingredientes activos, Dosificación recomendada, Precauciones de seguridad, Información de contacto y Fecha de vencimiento.",
        category: 'producto'
    },
    {
        question: "¿Cuál es la vida útil de los productos sin abrir?",
        answer: "Sellados y almacenados en lugar fresco: Detergentes y Desengrasantes 24 meses, Suavizantes 18 meses, Blanqueadores 12 meses (el Hipoclorito se degrada naturalmente con el tiempo).",
        category: 'tecnico'
    },
    {
        question: "¿Puedo devolver un producto si no me gustó?",
        answer: "Sí, dentro de los primeros 7 días calendario si el envase está sellado (más del 90% lleno). Costo de envío de vuelta corre por tu cuenta. Reembolso 100% del valor del producto en 5-10 días hábiles.",
        category: 'compra'
    }
];
