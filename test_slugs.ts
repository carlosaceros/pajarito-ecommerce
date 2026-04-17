import { PRODUCTOS } from './src/lib/products';
import { generateProductSlug } from './src/lib/product-utils';

PRODUCTOS.forEach(p => {
    console.log(`${p.id} -> ${generateProductSlug(p.id, p.nombre)}`);
});
