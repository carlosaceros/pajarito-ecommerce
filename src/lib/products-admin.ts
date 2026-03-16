import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Product } from './products';

// Initialize Firebase Admin
if (!getApps().length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Required for Firebase Admin SDK.');
    }

    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (error) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', error);
        throw new Error('FIREBASE_SERVICE_ACCOUNT must be a valid JSON string.');
    }
} else {
    getApp();
}

const adminDb = getFirestore();
const productsCollection = adminDb.collection('products');

/**
 * Gets all products using Admin SDK
 */
export async function adminGetAllProducts(): Promise<Product[]> {
    const snapshot = await productsCollection.orderBy('nombre', 'asc').get();
    
    const products: Product[] = [];
    snapshot.forEach((docSnap) => {
        products.push({ id: docSnap.id, ...docSnap.data() } as Product);
    });

    return products;
}

/**
 * Creates or overwrites a product using Admin SDK
 */
export async function adminSaveProduct(product: Product): Promise<void> {
    const docRef = productsCollection.doc(product.id);
    const { id, ...data } = product; // Avoid saving ID twice
    
    await docRef.set(data);
}
