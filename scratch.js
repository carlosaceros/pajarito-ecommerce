const fs = require('fs');

const content = `// Product data types and constants
export interface FAQ {
    q: string;
    a: string;
}

export type ProductSize = '1L' | '3.8L' | '10L' | '20L';

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
    precios: Partial<Record<ProductSize, number>>;
    competidorPromedio: Partial<Record<ProductSize, number>>;
    pesos?: Partial<Record<ProductSize, number>>;
    
    // -- SEO ENRICHMENT FIELDS --
    seoTitle?: string;
    seoDescription?: string;
    heroText?: string;
    heroBullets?: string[];
    descripcionLarga?: string;
    beneficiosDetallados?: { titulo: string; texto: string }[];
    modoDeUso?: { titulo: string; pasos: string[] }[];
    precauciones?: string[];
    casosDeUso?: string[];
    bloqueAEO?: { pregunta: string; respuesta: string }[];
    especificaciones?: { clave: string; valor: string }[];
    enlacesInternos?: { texto: string; productId: string }[];
}

export const SIZE_ORDER: ProductSize[] = ['1L', '3.8L', '10L', '20L'];

export const PESOS_POR_TALLA: Record<ProductSize, number> = {
    '1L': 1.0,
    '3.8L': 3.8,
    '10L': 10.0,
    '20L': 20.0,
};

export const PRODUCTOS: Product[] = [
    {
        id: 'detergente',
        nombre: 'Detergente Ropa',
        slogan: 'Cuida el color y tu bolsillo',
        descripcion: 'Calidad industrial para tu hogar. Fórmula concentrada que protege las fibras de tu ropa mientras rinde el doble que los detergentes comunes.',
        imgFile: 'PAJARITO_DETERGENTE%20ROPA_10L.png',
        imgFileSmall: 'PAJARITO_DETERGENTE ROPA Galón.webp',
        beneficios: ['Protección Color', 'pH Neutro', 'Baja Espuma (Ahorra agua)'],
        badge: 'MÁS VENDIDO',
        color: 'bg-blue-600',
        faqs: [
            { q: '¿Para qué sirve este detergente para ropa?', a: 'Sirve para lavar ropa blanca y de color, ayudando a remover suciedad diaria y manchas comunes, con una fórmula de alto rendimiento y baja espuma.' },
            { q: '¿Se puede usar en lavadoras HE o frontales?', a: 'Sí. La marca indica que su fórmula es de baja espuma y está diseñada específicamente para lavadoras HE y frontales.' },
            { q: '¿Cuánto detergente debo usar por carga?', a: 'Para una carga completa de 15 kg con suciedad normal se recomiendan 60 ml, para ropa muy sucia 100 ml y en lavado semiautomático o manual hasta 120 ml.' },
            { q: '¿Sirve para lavado manual?', a: 'Sí. Puede usarse en lavado manual, ajustando la dosis según la suciedad y asegurando un buen enjuague.' },
            { q: '¿Este detergente rinde más?', a: 'Sí. La marca lo presenta como un detergente más concentrado, por lo que se usa menos producto por lavada en condiciones normales.' },
            { q: '¿Qué pasa si uso un detergente con mucha espuma en una lavadora HE?', a: 'El exceso de espuma en otras fórmulas puede afectar sensores y funcionamiento, por eso esta versión de baja espuma está orientada a evitar ese problema.' },
            { q: '¿Sirve para manchas difíciles?', a: 'Sí, especialmente ajustando la dosis a 100 ml cuando la ropa está muy sucia o presenta manchas más difíciles.' }
        ],
        precios: { '1L': 10000, '3.8L': 27000, '10L': 43000, '20L': 63000 },
        competidorPromedio: { '1L': 16000, '3.8L': 38000, '10L': 58000, '20L': 86000 },
        seoTitle: 'Detergente para Ropa Alto Rendimiento | Baja Espuma y Máxima Limpieza',
        seoDescription: 'Compra detergente para ropa de alto rendimiento con fórmula de baja espuma, ideal para lavadoras HE, frontales y lavado manual. Limpia ropa blanca y de color, rinde más por lavada y ayuda a remover suciedad difícil.',
        heroText: 'Detergente para ropa de alto rendimiento con baja espuma y gran poder de limpieza. Su fórmula está diseñada para lavar ropa blanca y de color, rendir más por carga y funcionar correctamente en lavadoras HE, frontales, semiautomáticas y también en lavado manual.',
        heroBullets: [
            'Baja espuma, ideal para lavadoras de alta eficiencia.',
            'Mayor rendimiento por lavada gracias a su concentración.',
            'Ayuda a remover suciedad diaria y manchas difíciles.',
            'Apto para ropa blanca y de color.',
            'Puede usarse en lavado manual y en diferentes tipos de lavadora.'
        ],
        descripcionLarga: 'Si buscas un detergente para ropa que limpie bien, rinda más y funcione sin generar exceso de espuma, este detergente de alto rendimiento para hogar está diseñado para darte una limpieza efectiva en cada lavado. Su fórmula de baja espuma ayuda a proteger el funcionamiento de lavadoras HE y frontales, evitando los problemas que suelen causar los detergentes con espuma excesiva en sensores y ciclos de lavado.\n\nEste detergente para ropa alto rendimiento es una buena opción para familias que quieren optimizar el consumo por carga sin sacrificar limpieza. Al ser una fórmula concentrada, se necesita menos producto por lavada en comparación con opciones menos eficientes, lo que se traduce en mejor rendimiento y mayor control del gasto en productos de limpieza para el hogar.\n\nTambién es una alternativa versátil para quienes lavan ropa blanca, ropa de color, uniformes, prendas de uso diario, ropa con suciedad normal o prendas con manchas más difíciles. Su formulación está pensada para actuar de forma eficaz en distintos escenarios de lavado, ya sea en máquina automática, semiautomática o incluso en lavado manual.\n\nAdemás de limpiar, este detergente responde a una necesidad muy común en búsquedas de compra: encontrar un detergente de baja espuma que sí funcione bien en lavadoras modernas. En ese punto, su propuesta de valor es clara: limpieza profunda, mejor rendimiento por dosis y compatibilidad con equipos de alta eficiencia.',
        beneficiosDetallados: [
            { titulo: 'Limpieza efectiva en cada lavado', texto: 'Ayuda a remover suciedad diaria, residuos acumulados y manchas comunes en prendas de uso frecuente. Es útil para mantener la ropa limpia sin depender de grandes cantidades de producto en cada ciclo.' },
            { titulo: 'Baja espuma para lavadoras HE y frontales', texto: 'La marca comunica que esta fórmula es Low Foam, diseñada específicamente para lavadoras de alta eficiencia y frontales. Eso ayuda a evitar problemas asociados al exceso de espuma, como afectación en sensores o mal desempeño del ciclo de lavado.' },
            { titulo: 'Más rendimiento por dosis', texto: 'Al ser un detergente concentrado, se usa menos cantidad por carga frente a productos menos eficientes. Esto mejora la relación entre consumo, número de lavadas y costo por uso.' },
            { titulo: 'Versatilidad de uso', texto: 'Puede utilizarse en lavadoras automáticas, semiautomáticas y también en lavado manual. Eso lo convierte en una opción práctica para hogares con distintos hábitos de lavado.' },
            { titulo: 'Ideal para ropa blanca y de color', texto: 'Es útil para el lavado cotidiano de distintos tipos de prendas, siempre siguiendo la separación habitual por color y nivel de suciedad.' }
        ],
        modoDeUso: [
            { titulo: 'Dosis recomendada', pasos: ['Para una carga completa de 15 kg con suciedad normal: 60 ml, equivalente a 4 cucharadas.', 'Para ropa muy sucia o con manchas difíciles: 100 ml.', 'Para lavadoras semiautomáticas o lavado manual: hasta 120 ml, ya que el enjuague suele realizarse más veces.'] },
            { titulo: 'Cómo usarlo en lavadora', pasos: ['Separa la ropa por color y nivel de suciedad.', 'Agrega la dosis recomendada según la carga.', 'Usa el ciclo adecuado para el tipo de prenda.', 'En prendas muy sucias, aumenta la dosis dentro del rango recomendado.'] },
            { titulo: 'Cómo usarlo en lavado manual', pasos: ['Disuelve la cantidad recomendada en suficiente agua.', 'Sumerge la ropa y frota las áreas más sucias.', 'Deja actuar unos minutos si la prenda necesita apoyo extra.', 'Enjuaga completamente.'] }
        ],
        casosDeUso: [
            'Un detergente para ropa de baja espuma.',
            'Un producto compatible con lavadoras HE o frontales.',
            'Mejor rendimiento por cada lavada.',
            'Un detergente funcional para ropa blanca y de color.',
            'Un producto útil tanto para lavado manual como en máquina.'
        ],
        bloqueAEO: [
            { pregunta: '¿Qué es este producto?', respuesta: 'Es un detergente para ropa de alto rendimiento con fórmula de baja espuma, diseñado para lavado eficiente en el hogar.' },
            { pregunta: '¿Para qué sirve?', respuesta: 'Sirve para lavar ropa blanca y de color, remover suciedad y facilitar el uso en lavadoras HE, frontales, semiautomáticas o en lavado manual.' },
            { pregunta: '¿Cuál es su principal beneficio?', respuesta: 'Su principal beneficio es combinar limpieza efectiva con menor generación de espuma y mejor rendimiento por dosis.' },
            { pregunta: '¿Cómo se usa?', respuesta: 'Se dosifica según el tipo de carga y nivel de suciedad: 60 ml para suciedad normal, 100 ml para ropa muy sucia y hasta 120 ml en lavado manual o semiautomático.' }
        ],
        especificaciones: [
            { clave: 'Tipo de producto', valor: 'Detergente para ropa' },
            { clave: 'Uso', valor: 'Hogar' },
            { clave: 'Fórmula', valor: 'Baja espuma' },
            { clave: 'Compatibilidad', valor: 'Lavadoras HE, frontales, semiautomáticas y lavado manual' },
            { clave: 'Aplicación', valor: 'Ropa blanca y de color' },
            { clave: 'Beneficio principal', valor: 'Alto rendimiento por lavada' }
        ],
        enlacesInternos: [
            { texto: 'Suavizante textil máxima suavidad aroma', productId: 'suavizante' },
            { texto: 'Blanqueador desinfección total', productId: 'blanqueador' }
        ]
    },
    {
        id: 'suavizante',
        nombre: 'Suavizante Textil',
        slogan: 'Suavidad que enamora',
        descripcion: 'Suavidad profesional con calidad industrial, ideal para el uso diario en tu hogar. Microcápsulas de aroma que perduran días, facilitando el planchado y cuidando tu ropa favorita.',
        imgFile: 'PAJARITO_SUAVIZANTE_10L.png',
        imgFileSmall: 'PAJARITO_SUAVIZANTE Galón.webp',
        beneficios: ['Fácil Planchado', 'Aroma 48h', 'Desemreda Fibras'],
        badge: 'AROMA PREMIUM',
        color: 'bg-pink-500',
        faqs: [
            { q: '¿Para qué sirve este suavizante textil?', a: 'Sirve para dejar la ropa más suave, con aroma agradable y mejor sensación al tacto después del lavado.' },
            { q: '¿Este suavizante deja residuo blanco en la ropa negra?', a: 'Muchas fórmulas pueden dejarlo, pero este producto usa siliconas solubles "Cero-Grasa" para evitar esa película visible en prendas oscuras.' },
            { q: '¿Se puede usar en ropa de cama y toallas?', a: 'Sí. Es una categoría de uso muy adecuada para este tipo de producto porque la suavidad y la frescura se perciben claramente en esos textiles.' },
            { q: '¿El suavizante reemplaza el detergente?', a: 'No. El detergente limpia y el suavizante complementa el lavado aportando suavidad, frescura y mejor acabado en la ropa.' },
            { q: '¿Por qué elegir un suavizante sin residuos?', a: 'Porque ayuda a mantener el mejor aspecto de las prendas, especialmente en ropa negra o de tonos oscuros.' },
            { q: '¿Qué diferencial tiene este suavizante?', a: 'Su principal diferencial es el uso de siliconas solubles "Cero-Grasa" y la promesa de no dejar residuo blanco en prendas oscuras.' }
        ],
        precios: { '1L': 10000, '3.8L': 27000, '10L': 43000, '20L': 63000 },
        competidorPromedio: { '1L': 17000, '3.8L': 38000, '10L': 58000, '20L': 85000 },
        seoTitle: 'Suavizante para Ropa Máxima Suavidad y Aroma | Pajarito',
        seoDescription: 'Compra suavizante para ropa con máxima suavidad y aroma duradero. Su fórmula ayuda a dejar las prendas suaves, frescas y sin residuo blanco en ropa oscura, ideal para uso diario en el hogar.',
        heroText: 'Suavizante para ropa con máxima suavidad, aroma agradable y mejor cuidado de las fibras. Su fórmula está pensada para dejar la ropa más suave al tacto, con sensación de frescura y sin el residuo blanquecino que algunos suavizantes dejan en prendas oscuras.',
        heroBullets: [
            'Ayuda a dejar la ropa más suave y agradable al tacto.',
            'Aporta aroma y sensación de frescura en cada lavado.',
            'Diseñado para no dejar residuo blanco en prendas oscuras.',
            'Fórmula con siliconas solubles "Cero-Grasa".',
            'Ideal para ropa de uso diario, sábanas, toallas y prendas del hogar.'
        ],
        descripcionLarga: 'El suavizante para ropa es uno de esos productos que cambia la experiencia del lavado cuando realmente funciona bien. No se trata solo de dejar buen olor: un buen suavizante textil debe ayudar a que la ropa se sienta mejor al tacto, facilitar el manejo de las fibras y mantener una sensación de frescura después del lavado. En este caso, la propuesta de valor está centrada en máxima suavidad, aroma agradable y una formulación que evita residuos indeseados en prendas oscuras.\n\nUna de las diferencias más relevantes frente a opciones comunes del mercado es que la marca comunica que muchas fórmulas de supermercado utilizan aceites minerales que pueden dejar residuo blanco en ropa negra, mientras que este suavizante usa siliconas solubles "Cero-Grasa". Ese atributo no solo aporta diferenciación comercial, sino que también abre una ventaja importante para proteger tus prendas favoritas.\n\nEste producto está pensado para hogares que buscan ropa suave, cómoda y con aroma agradable después del lavado, pero que también quieren cuidar el aspecto visual de las prendas. Es especialmente útil en ropa de diario, prendas delicadas, ropa de cama, toallas y textiles del hogar donde la sensación de suavidad tiene un impacto más evidente.\n\nAdemás, un suavizante bien planteado mejora la percepción general del lavado: la ropa se siente más cómoda, más fresca y más cuidada. Cuando esa experiencia viene acompañada de una fórmula que evita residuos visibles en telas oscuras, el producto gana peso.',
        beneficiosDetallados: [
            { titulo: 'Máxima suavidad al tacto', texto: 'Ayuda a que las prendas se sientan más suaves después del lavado, mejorando la experiencia de uso en ropa diaria, ropa de cama y textiles del hogar.' },
            { titulo: 'Aroma agradable y sensación de frescura', texto: 'Aporta aroma a la ropa y deja una sensación de mayor frescura, algo especialmente valorado en prendas de uso continuo, toallas y sábanas.' },
            { titulo: 'Sin residuo blanco en prendas oscuras', texto: 'La marca diferencia esta fórmula al indicar que no deja la película blanca que algunas alternativas generan en ropa negra u oscura. Ese punto es clave para usuarios que cuidan la apariencia de sus prendas.' },
            { titulo: 'Fórmula con siliconas solubles', texto: 'El uso de siliconas solubles "Cero-Grasa" forma parte del diferencial frente a fórmulas basadas en aceites minerales.' },
            { titulo: 'Cuidado textil para uso diario', texto: 'Es una buena opción para complementar el lavado cuando se busca una ropa más suave, con mejor sensación al tacto y con mejor acabado final.' }
        ],
        modoDeUso: [
            { titulo: 'Cómo usar el suavizante para ropa', pasos: ['Lava la ropa con el detergente habitual.', 'Agrega el suavizante en el compartimiento destinado para ello o en el último enjuague.', 'Evita aplicarlo directamente sobre la prenda sin dilución.', 'Usa la cantidad adecuada según la carga y el nivel de suavidad deseado.'] }
        ],
        casosDeUso: [
            'Un suavizante para ropa con aroma agradable.',
            'Mayor suavidad en prendas de uso diario.',
            'Un producto para toallas, sábanas y ropa de cama.',
            'Un suavizante para ropa oscura que no deje residuo blanco.',
            'Un complemento de lavado que mejore la sensación final de la ropa.'
        ],
        precauciones: [
            'No aplicar sin diluir directamente sobre la ropa para evitar manchas puntuales.'
        ],
        bloqueAEO: [
            { pregunta: '¿Qué es este producto?', respuesta: 'Es un suavizante textil para ropa diseñado para aportar suavidad, aroma y mejor acabado después del lavado.' },
            { pregunta: '¿Para qué sirve?', respuesta: 'Sirve para dejar las prendas más suaves, frescas y agradables al tacto, especialmente en ropa de uso diario, sábanas y toallas.' },
            { pregunta: '¿Cuál es su principal beneficio?', respuesta: 'Su principal beneficio es combinar suavidad y aroma con una fórmula que busca evitar residuos blancos en ropa oscura.' },
            { pregunta: '¿Qué lo hace diferente?', respuesta: 'Destacamos que usa siliconas solubles "Cero-Grasa" en lugar de aceites minerales que pueden dejar película visible.' }
        ],
        especificaciones: [
            { clave: 'Tipo de producto', valor: 'Suavizante textil para ropa' },
            { clave: 'Uso', valor: 'Hogar' },
            { clave: 'Beneficio principal', valor: 'Máxima suavidad y aroma' },
            { clave: 'Diferencial', valor: 'Sin residuo blanco visible en ropa oscura' },
            { clave: 'Tecnología de fórmula', valor: 'Siliconas solubles "Cero-Grasa"' },
            { clave: 'Aplicación', valor: 'Prendas diarias, sábanas, toallas y textiles del hogar' }
        ],
        enlacesInternos: [
            { texto: 'Detergente ropa alto rendimiento hogar', productId: 'detergente' },
            { texto: 'Blanqueador desinfección total', productId: 'blanqueador' }
        ]
    },
    {
        id: 'blanqueador',
        nombre: 'Blanqueador',
        slogan: 'Blancura sin dañar',
        descripcion: 'Máxima desinfección doméstica. Hipoclorito estabilizado ideal para ropa blanca, pisos y baños, garantizando un hogar libre de gérmenes.',
        imgFile: 'PAJARITO_BLANQUEADOR%2010L.png',
        imgFileSmall: 'PAJARITO_BLANQUEADOR Galón.webp',
        beneficios: ['Desinfección 99.9%', 'Blancura Total', 'Estabilizado'],
        badge: 'ECONÓMICO',
        color: 'bg-teal-500',
        faqs: [
            { q: '¿Para qué sirve este blanqueador?', a: 'Sirve para apoyar procesos de desinfección, blancura en ropa blanca y control higiénico en superficies y textiles, siempre usando la dilución correcta.' },
            { q: '¿Qué concentración tiene?', a: 'Nuestra fórmula tiene hipoclorito de sodio estabilizado al 5.25%.' },
            { q: '¿Se puede mezclar con detergente?', a: 'No. NUNCA debe mezclarse el detergente con el cloro en el mismo balde y el blanqueador no debe usarse en el lavado principal si ya se agregó detergente.' },
            { q: '¿Se puede mezclar con desengrasantes o ácidos?', a: 'NO. Mezclar hipoclorito con desengrasantes o ácidos libera gas cloro tóxico.' },
            { q: '¿Cómo se usa para desinfectar?', a: 'La dilución clave es de 1 taza por galón de agua y un tiempo de acción de 10 minutos, después de limpiar y enjuagar.' },
            { q: '¿Es seguro para sistemas sépticos?', a: 'Sí, en las dosificaciones recomendadas es seguro.' },
            { q: '¿Se puede aplicar directo sobre la ropa?', a: 'No se recomienda aplicar puro directo para evitar daños en fibras; sugerimos usarlo diluido.' }
        ],
        precios: { '3.8L': 17000, '10L': 36000, '20L': 53000 },
        competidorPromedio: { '3.8L': 24000, '10L': 42000, '20L': 68000 },
        seoTitle: 'Blanqueador Desinfección Total | Hipoclorito 5.25% para Hogar',
        seoDescription: 'Compra blanqueador desinfección total con hipoclorito de sodio estabilizado al 5.25%. Ideal para ropa blanca, desinfección del hogar y control de olores, con uso seguro siguiendo la dilución recomendada.',
        heroText: 'Blanqueador con desinfección total para ropa blanca, superficies del hogar y control higiénico diario. Su fórmula con hipoclorito de sodio estabilizado al 5.25% está diseñada para ayudar en procesos de desinfección, blancura y eliminación de olores, siempre que se utilice con la dilución y las precauciones adecuadas.',
        heroBullets: [
            'Hipoclorito de sodio estabilizado al 5.25%.',
            'Ayuda a desinfectar ropa y superficies del hogar.',
            'Útil para apoyar la blancura en ropa blanca.',
            'Aporta control higiénico y manejo de olores.',
            'Seguro para sistemas sépticos en las dosificaciones recomendadas.'
        ],
        descripcionLarga: 'Cuando un usuario busca un blanqueador para el hogar, normalmente no solo quiere "cloro"; quiere un producto que ayude a desinfectar, apoyar la limpieza de la ropa blanca, controlar olores y hacerlo sin poner en riesgo las prendas, las superficies o la seguridad del hogar. Esta ficha responde a esas necesidades de forma clara y útil, porque el verdadero valor del producto está tanto en su potencia como en su uso correcto.\n\nEste blanqueador desinfección total está formulado con hipoclorito de sodio estabilizado al 5.25%, una concentración que funciona muy bien para uso doméstico en las dosis recomendadas. Eso permite posicionarlo no solo como producto de limpieza, sino como solución de higiene para ropa blanca, baños, pisos, superficies lavables y otros contextos donde la desinfección es relevante.\n\nUno de los puntos más importantes de esta categoría es la educación de uso. **Jamás** debe mezclarse blanqueador con desengrasantes o ácidos, porque la reacción química libera gas cloro tóxico. Tampoco debe usarse en el lavado principal si ya se agregó detergente.\n\nEl producto apoya procesos de desinfección con guía concreta. Recomendamos aplicar una solución diluida a razón de 1 taza por galón de agua y dejar actuar durante 10 minutos. Esa claridad fortalece la seguridad para el hogar.',
        beneficiosDetallados: [
            { titulo: 'Desinfección del hogar', texto: 'Ayuda en procesos de desinfección para ropa y superficies del hogar cuando se usa con la dilución correcta y en el contexto adecuado.' },
            { titulo: 'Apoyo para ropa blanca', texto: 'Es útil para ropa blanca cuando se busca reforzar percepción de blancura y control higiénico en el lavado.' },
            { titulo: 'Control de olores', texto: 'Puede ayudar en situaciones donde, además de limpiar, se necesita apoyar la eliminación de malos olores en textiles o áreas lavables.' },
            { titulo: 'Fórmula estabilizada', texto: 'Utiliza hipoclorito de sodio estabilizado al 5.25%, lo que da una referencia concreta de concentración para uso orientado y seguro.' },
            { titulo: 'Compatible con uso doméstico', texto: 'Nuestros blanqueadores son seguros para sistemas sépticos en las dosificaciones recomendadas, lo que es un atributo importante para muchos hogares.' }
        ],
        modoDeUso: [
            { titulo: 'Para ropa blanca', pasos: ['Úsalo como apoyo en remojo o enjuague final.', 'No lo agregues en el lavado principal si ya usaste detergente.', 'En manchas amarillas por sudor o desodorante, lava primero con detergente y luego añade 50 ml de blanqueador en el agua de enjuague, nunca directo.'] },
            { titulo: 'Para desinfección', pasos: ['Limpia primero la suciedad visible con detergente.', 'Enjuaga para retirar ese producto.', 'Aplica una solución de blanqueador diluida a razón de 1 taza por galón de agua.', 'Deja actuar durante 10 minutos.'] }
        ],
        casosDeUso: [
            'Un blanqueador para ropa blanca.',
            'Un producto de apoyo para desinfección del hogar.',
            'Un blanqueador con concentración definida de hipoclorito.',
            'Una opción útil para control higiénico y manejo de olores.',
            'Una fórmula con instrucciones claras de uso seguro.'
        ],
        precauciones: [
            'JAMÁS mezcles blanqueador con desengrasantes o ácidos.',
            'NUNCA mezclar detergente y cloro en el mismo balde.',
            'No aplicar blanqueador puro sobre textiles, puede generar daño en la fibra.'
        ],
        bloqueAEO: [
            { pregunta: '¿Qué es este producto?', respuesta: 'Es un blanqueador desinfectante para el hogar formulado con hipoclorito de sodio estabilizado al 5.25%.' },
            { pregunta: '¿Para qué sirve?', respuesta: 'Sirve para apoyar la desinfección del hogar, la blancura en ropa blanca y el control higiénico de superficies y textiles.' },
            { pregunta: '¿Cuál es su principal beneficio?', respuesta: 'Su principal beneficio es combinar acción blanqueadora y desinfectante garantizando potencia y dilución.' },
            { pregunta: '¿Cuál es la principal precaución?', respuesta: 'Nunca debe mezclarse con detergente en el mismo balde, ni con desengrasantes o ácidos, por peligro de gas tóxico.' }
        ],
        especificaciones: [
            { clave: 'Tipo de producto', valor: 'Blanqueador desinfectante' },
            { clave: 'Uso', valor: 'Hogar e industrial' },
            { clave: 'Ingrediente activo', valor: 'Hipoclorito de sodio estabilizado' },
            { clave: 'Concentración', valor: '5.25%' },
            { clave: 'Beneficios', valor: 'Desinfección, blancura y control de olores' },
            { clave: 'Seguridad', valor: 'NO mezclar con detergente, ácidos ni desengrasantes' }
        ],
        enlacesInternos: [
            { texto: 'Detergente ropa alto rendimiento hogar', productId: 'detergente' },
            { texto: 'Suavizante textil máxima suavidad aroma', productId: 'suavizante' }
        ]
    },
    {
        id: 'desengrasante',
        nombre: 'Desengrasante Rojo',
        slogan: 'Arranca grasa al instante',
        descripcion: 'Poder industrial, seguro para casa. Arranca la grasa más difícil en cocinas, campanas, juntas y hasta motores con total eficiencia.',
        imgFile: 'PAJARITO_DESENGRASANTE%20ROJO_10L.png',
        imgFileSmall: 'PAJARITO_DESENGRASANTE galón_octubre 2025.webp',
        beneficios: ['Multiusos Potente', 'Acción Inmediata', 'Biodegradable'],
        badge: 'PODER TOTAL',
        color: 'bg-red-600',
        faqs: [
            { q: '¿Para qué sirve este desengrasante?', a: 'Sirve para remover grasa pesada, cochambre, aceite quemado y suciedad extrema en cocinas, pisos y superficies lavables.' },
            { q: '¿Qué significa que tenga pH alcalino?', a: 'Significa que es capaz de romper la grasa a nivel molecular con mayor eficacia que los limpiadores comunes.' },
            { q: '¿Cómo se usa en pisos?', a: 'La recomendación es diluir 100 ml en 5 litros de agua, aplicar, dejar actuar, cepillar y enjuagar.' },
            { q: '¿Se puede usar en aluminio?', a: 'Sí, pero con muchísima precaución: diluido 1 parte en 5, máximo 30 segundos y enjuague súper inmediato.' },
            { q: '¿Se puede usar puro sobre teflón?', a: 'NO. Advertimos que no debe usarse puro sobre teflón ni aluminio.' },
            { q: '¿Sirve para cochambre?', a: 'Sí. Es ideal para grasa pesada, aceite quemado y cochambre rebelde.' },
            { q: '¿Se puede mezclar con cloro?', a: 'No, nunca mezclar con cloro ni con limpiadores ácidos.' }
        ],
        precios: { '3.8L': 27000, '10L': 43000, '20L': 63000 },
        competidorPromedio: { '3.8L': 42000, '10L': 68000, '20L': 98000 },
        seoTitle: 'Desengrasante Rojo Arranca Grasa Extremo | Poder Alcalino para Grasa Pesada',
        seoDescription: 'Compra desengrasante rojo de alto poder para grasa pesada, cochambre y suciedad extrema. Fórmula alcalina pH 11-12 para cocina, pisos y superficies lavables, con uso seguro y dilución recomendada.',
        heroText: 'Desengrasante rojo de alto poder para grasa pesada, cochambre y suciedad extrema. Su fórmula alcalina con pH 11-12 está diseñada para romper enlaces de grasa rápidamente y facilitar la limpieza de cocinas, pisos, acero inoxidable y superficies con suciedad difícil.',
        heroBullets: [
            'pH alcalino 11-12 para acción potente sobre grasa.',
            'Ayuda a remover cochambre, aceite quemado y grasa adherida.',
            'Ideal para cocina, pisos, repisas y superficies lavables gruesas.',
            'Requiere menos esfuerzo mecánico al limpiar.',
            'Tiene indicaciones claras de dilución y uso seguro.'
        ],
        descripcionLarga: 'Cuando una superficie tiene grasa pegada, cochambre o suciedad extrema, un limpiador doméstico común muchas veces no alcanza. Por eso la categoría de desengrasantes alcalinos tiene tanta intención de compra: el usuario no está buscando "limpiar un poco", sino resolver un problema pesado de forma rápida y eficaz. Este desengrasante rojo arranca grasa extremo está formulado para ese escenario.\n\nContamos con un pH alcalino de 11-12, una característica importante porque permite romper enlaces de grasa a nivel molecular con mayor eficacia que productos domésticos de menor intensidad. Esa diferencia química se traduce en mejor desempeño sobre aceite quemado, grasa automotriz, cochambre y suciedad muy adherida, especialmente en cocina, superficies de trabajo gruesas y pisos con acumulación de grasa.\n\nAdemás de su potencia, este producto debe presentarse con educación de uso. No basta con decir que "arranca grasa": hay que explicar cómo usarlo bien. En pisos muy sucios lo ideal es diluir 100 ml en 5 litros de agua, dejar actuar entre 5 y 10 minutos, cepillar suavemente y enjuagar. También advertimos que el pH alcalino puede opacar aluminio, por lo que en ese material debe usarse muy diluido, por poco tiempo y enjuagando de inmediato.\n\nEn superficies delicadas, la explicación de seguridad es fundamental. Recomendamos contundentemente no usarlo puro sobre aluminio o teflón. Esa información protege al cliente y mejora las mejores prácticas de uso.',
        beneficiosDetallados: [
            { titulo: 'Poder alcalino para grasa pesada', texto: 'Su pH 11-12 ayuda a romper grasa difícil con mayor eficacia que limpiadores neutros o multisuperficies.' },
            { titulo: 'Acción sobre cochambre y aceite quemado', texto: 'Es útil en cocinas, hornos, estufas y superficies donde la grasa rancia se acumula y se endurece con el tiempo.' },
            { titulo: 'Menor esfuerzo de limpieza', texto: 'Al actuar químicamente sobre la grasa, disolviéndola, minimiza la necesidad de frotar en exceso con esponja dura.' },
            { titulo: 'Uso versátil en el hogar', texto: 'Puede emplearse en pisos, acero inoxidable pesado (no aluminio brillado) y superficies lavables, siempre con dilución.' },
            { titulo: 'Guía clara de seguridad', texto: 'Pajarito comunica precauciones específicas para metales, lo que te ayuda a usarlo con confianza y sin errores.' }
        ],
        modoDeUso: [
            { titulo: 'Para pisos muy sucios o talleres', pasos: ['Diluir 100 ml en 5 litros de agua.', 'Aplicar sobre la superficie.', 'Dejar actuar entre 5 y 10 minutos.', 'Cepillar.', 'Enjuagar con agua limpia.'] },
            { titulo: 'Para grasa pesada en cocina y estufas', pasos: ['Aplicar directo, o poco diluido.', 'Dejar actuar unos minutos.', 'Retirar con paño o esponja suave.', 'Enjuagar MUY BIEN la superficie.'] },
            { titulo: 'PRECAUCIÓN En aluminio', pasos: ['Diluir al menos 1 parte de producto en 5 partes de agua.', 'Aplicar máximo 30 SEGUNDOS.', 'Enjuagar absolutamente de inmediato. No usar nunca puro.'] }
        ],
        casosDeUso: [
            'Un desengrasante profundo para cocina vieja.',
            'Un producto industrial para grasa pesada y cochambre.',
            'Un desengrasante alcalino de alto poder (pH 11+).',
            'Una opción rentable para pisos grasientos de talleres.',
            'Una fórmula con orientación de uso seguro y contundente.'
        ],
        precauciones: [
            'NO usar puro sobre Aluminio, puede opacarlo y deteriorarlo.',
            'NO usar sobre Teflón antiadherente.',
            'Usar protección de guantes al estar interactuando directamente puro con las manos.'
        ],
        bloqueAEO: [
            { pregunta: '¿Qué es este producto?', respuesta: 'Es un desengrasante rojo de alto poder con fórmula alcalina para remover grasa pesada y suciedad extrema.' },
            { pregunta: '¿Para qué sirve?', respuesta: 'Sirve para limpiar grasa pegada, cochambre, aceite quemado y suciedad difícil en campanas, pisos y superficies.' },
            { pregunta: '¿Cuál es su principal beneficio?', respuesta: 'Su principal beneficio es la potencia alcalina super-fuerte que ayuda a romper la grasa más dura con bajo esfuerzo manual.' },
            { pregunta: '¿Cuál es la principal precaución?', respuesta: 'No usar puro sobre aluminio o teflón y seguir las diluciones de la marca, aparte de usar protección en manos.' }
        ],
        especificaciones: [
            { clave: 'Tipo de producto', valor: 'Desengrasante alcalino industrial' },
            { clave: 'Uso', valor: 'Cocina pesada, pisos de alto tráfico y superficies duras' },
            { clave: 'pH', valor: '11-12' },
            { clave: 'Beneficio principal', valor: 'Arranca grasa y cochambre' },
            { clave: 'Aplicaciones', valor: 'Aceite quemado, grasa industrial, motores' },
            { clave: 'Precauciones', valor: 'Cuidado con aluminio y teflón. NO cloro.' }
        ],
        enlacesInternos: [
            { texto: 'Blanqueador desinfección total', productId: 'blanqueador' },
            { texto: 'Detergente ropa alto rendimiento hogar', productId: 'detergente' }
        ]
    }
];

export interface SavingsData {
    nuestroPrecioML: string;
    ahorroPorcentaje: number;
    ahorroDinero: number;
    mostrarFOMO: boolean;
}

export const calcularAhorro = (
    precioNuestro: number,
    volumen: string,
    competidorPrecioAbsoluto: number
): SavingsData => {
    const volumenML = volumenToML(volumen);
    const nuestroPrecioML = volumenML > 0 ? precioNuestro / volumenML : 0;

    if (!competidorPrecioAbsoluto || competidorPrecioAbsoluto <= precioNuestro) {
        return {
            nuestroPrecioML: nuestroPrecioML.toFixed(2),
            ahorroPorcentaje: 0,
            ahorroDinero: 0,
            mostrarFOMO: false
        };
    }

    const ahorroDinero = competidorPrecioAbsoluto - precioNuestro;
    const ahorroPorcentaje = (ahorroDinero / competidorPrecioAbsoluto) * 100;

    return {
        nuestroPrecioML: nuestroPrecioML.toFixed(2),
        ahorroPorcentaje: Math.round(ahorroPorcentaje),
        ahorroDinero: Math.round(ahorroDinero),
        mostrarFOMO: ahorroDinero > 0
    };
};

function volumenToML(volumen: string): number {
    if (volumen.endsWith('ml')) return parseFloat(volumen);
    if (volumen.endsWith('L')) return parseFloat(volumen) * 1000;
    return parseFloat(volumen) * 1000; 
}

export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(val);
};
`

fs.writeFileSync('/Users/carlosaceros/Documents/pajarito_web/pajarito_nextjs/src/lib/products.ts', content);
