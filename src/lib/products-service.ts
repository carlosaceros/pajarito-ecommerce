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

const productsCollection = collection(db, 'productos');

/**
 * Gets all products from Firestore.
 * Caches the result in memory for a few minutes to reduce reads.
 */
export async function getAllProducts(forceRefresh = false): Promise<Product[]> {
    if (!forceRefresh && cachedProducts && Date.now() - lastFetchTime < CACHE_TIME) {
        return cachedProducts;
    }

    const q = query(productsCollection, orderBy('nombre', 'asc'));
    const snapshot = await getDocs(q);
    
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });

    // If database is completely empty, we can return the fallback hardcoded ones
    // But ideally we want to seed the DB.
    if (products.length === 0) {
        return PRODUCTOS;
    }

    cachedProducts = products;
    lastFetchTime = Date.now();
    return products;
}

/**
 * Gets a specific product by its ID (slug)
 */
export async function getProductById(id: string): Promise<Product | null> {
    const docRef = doc(db, 'productos', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
    }

    // Fallback to hardcoded if not found (useful during migration)
    const fallback = PRODUCTOS.find(p => p.id === id);
    return fallback || null;
}

/**
 * Creates or overwrites a product
 */
export async function saveProduct(product: Product): Promise<void> {
    const docRef = doc(db, 'productos', product.id);
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
    const docRef = doc(db, 'productos', id);
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
