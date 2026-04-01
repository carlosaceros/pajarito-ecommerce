import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Product, PRODUCTOS } from './products';

const CACHE_TIME = 1000 * 60 * 5; // 5 minutes cache
let cachedProducts: Product[] | null = null;
let lastFetchTime = 0;

const productsCollection = collection(db, 'products');

/**
 * Gets all products.
 *
 * STRATEGY (PRD 2026):
 * - Los datos base son los del catálogo hardcoded (`products.ts`) — siempre actualizados.
 * - Si Firestore tiene un override para el mismo ID (editado desde el admin),
 *   se **mezcla** encima del producto base: los campos del admin ganan en caso de conflicto.
 * - Esto garantiza que los precios 2026 se vean de inmediato sin necesidad de un seed.
 */
export async function getAllProducts(forceRefresh = false): Promise<Product[]> {
    if (!forceRefresh && cachedProducts && Date.now() - lastFetchTime < CACHE_TIME) {
        return cachedProducts;
    }

    // Base: catálogo local siempre actualizado
    const localMap = new Map<string, Product>(PRODUCTOS.map(p => [p.id, p]));

    try {
        const q = query(productsCollection, orderBy('nombre', 'asc'));
        const snapshot = await getDocs(q);

        snapshot.forEach((docSnap) => {
            const firestoreData = { id: docSnap.id, ...docSnap.data() } as Product;
            const local = localMap.get(firestoreData.id);
            if (local) {
                // Merge: Firestore solo sobreescribe si tiene campos propios (admin customization)
                // Los precios del local SIEMPRE ganan (fuente de verdad 2026)
                localMap.set(firestoreData.id, {
                    ...firestoreData,
                    precios: local.precios,
                    competidorPromedio: local.competidorPromedio,
                });
            } else {
                // Producto creado solo en Firestore (por el admin), se agrega tal cual
                localMap.set(firestoreData.id, firestoreData);
            }
        });
    } catch (e) {
        // Si Firestore falla (offline, permisos) el local es el fallback
        console.warn('[products-service] Firestore no disponible, usando catálogo local:', e);
    }

    const products = Array.from(localMap.values())
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

    cachedProducts = products;
    lastFetchTime = Date.now();
    return products;
}

/**
 * Gets a specific product by its ID (slug)
 */
export async function getProductById(id: string): Promise<Product | null> {
    // Primero buscar en local (precios 2026 garantizados)
    const local = PRODUCTOS.find(p => p.id === id);

    try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const firestoreData = { id: docSnap.id, ...docSnap.data() } as Product;
            if (local) {
                // Merge igual que getAllProducts: precios locales ganan
                return {
                    ...firestoreData,
                    precios: local.precios,
                    competidorPromedio: local.competidorPromedio,
                };
            }
            return firestoreData;
        }
    } catch (e) {
        console.warn('[products-service] getProductById Firestore error:', e);
    }

    return local || null;
}

/**
 * Creates or overwrites a product
 */
export async function saveProduct(product: Product): Promise<void> {
    const docRef = doc(db, 'products', product.id);
    const { id, ...data } = product; // Avoid saving ID twice
    
    // Using setDoc to allow custom IDs (slugs)
    await setDoc(docRef, data);
    
    // Invalidate cache
    cachedProducts = null;
}

/**
 * Deletes a product
 */
export async function deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, 'products', id);
    await deleteDoc(docRef);
    
    // Invalidate cache
    cachedProducts = null;
}

/**
 * ONE-TIME SCRIPT: Uploads the hardcoded products to Firestore
 */
export async function seedProductsToFirestore(): Promise<void> {
    for (const prod of PRODUCTOS) {
        await saveProduct(prod);
    }
    console.log('Productos migrados a Firestore correctamente.');
}
