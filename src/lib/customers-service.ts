import {
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    increment,
    Timestamp,
    query,
    orderBy,
    getDocs,
    limit,
    serverTimestamp // Import serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase'; // Adjust import path if needed
import { Customer } from '@/types/customer';
import { OrderCustomer } from '@/types/order';

const customersCollection = collection(db, 'customers');

/**
 * Upsert customer data from a new order
 * Uses phone number as the unique document ID
 */
export async function upsertCustomerFromOrder(orderCustomer: OrderCustomer, orderTotal: number) {
    // Clean phone number to use as ID (remove non-digits)
    const customerId = orderCustomer.celular.replace(/\D/g, '');
    const customerRef = doc(customersCollection, customerId);

    const customerSnap = await getDoc(customerRef);
    const now = Timestamp.now(); // Create a client-side Timestamp.

    if (customerSnap.exists()) {
        // Update existing customer
        await updateDoc(customerRef, {
            nombre: orderCustomer.nombre, // Update name in case of typo fix
            email: orderCustomer.email || customerSnap.data().email, // Update email if provided
            direccion: orderCustomer.direccion, // Update address to latest
            ciudad: orderCustomer.ciudad,
            departamento: orderCustomer.departamento,

            totalSpent: increment(orderTotal),
            ordersCount: increment(1),
            lastOrderDate: now,
            updatedAt: now
        });
    } else {
        // Create new customer
        const newCustomer: Customer = {
            id: customerId,
            nombre: orderCustomer.nombre,
            cedula: orderCustomer.cedula,
            celular: orderCustomer.celular,
            email: orderCustomer.email,
            direccion: orderCustomer.direccion,
            ciudad: orderCustomer.ciudad,
            departamento: orderCustomer.departamento,

            totalSpent: orderTotal,
            ordersCount: 1,
            lastOrderDate: now,
            firstOrderDate: now,

            createdAt: now,
            updatedAt: now
        };

        await setDoc(customerRef, newCustomer);
    }
}

/**
 * Get all customers
 */
export async function getCustomers(): Promise<Customer[]> {
    const q = query(customersCollection, orderBy('lastOrderDate', 'desc'), limit(100)); // Limit for performance
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data() as Customer);
}

/**
 * Get customer by ID (Phone)
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
    const docRef = doc(customersCollection, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as Customer;
    }
    return null;
}


/**
 * Sync customers from existing orders (Backfill)
 * This is useful for migrating old data or fixing inconsistencies
 */
export async function syncCustomersFromOrders(): Promise<{ processed: number, updated: number }> {
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);

    let processed = 0;
    let updated = 0;

    console.log(`Starting sync for ${snapshot.size} orders...`);

    for (const orderDoc of snapshot.docs) {
        const order = orderDoc.data() as any; // Use any to avoid strict type checking on old data

        if (order.cliente && order.cliente.celular) {
            try {
                // We use the upsert function logic but we need to be careful not to double count metrics
                // if we run this multiple times.
                // The current upsertCustomerFromOrder implementation increments stats (totalSpent, ordersCount).
                // If we run this on existing customers, it will double count!
                // SO WE CANNOT REUSE upsertCustomerFromOrder AS IS for a full sync if data already exists.

                // STRATEGY for Idempotency:
                // 1. Reset all customers? Too risky.
                // 2. Check if order ID is already processed? We don't track processed order IDs in customer.
                // 3. For this specific case (missing customers), we can check if customer exists. 
                //    If exists, SKIP (assuming it's up to date or we accept minor drift).
                //    If NOT exists, CREATE.

                const customerId = order.cliente.celular.replace(/\D/g, '');
                const customerRef = doc(customersCollection, customerId);
                const customerSnap = await getDoc(customerRef);

                if (!customerSnap.exists()) {
                    // Only create if missing to avoid double counting
                    await upsertCustomerFromOrder(order.cliente, order.total || 0);
                    updated++;
                }

                processed++;
            } catch (error) {
                console.error(`Error processing order ${orderDoc.id}:`, error);
            }
        }
    }

    return { processed, updated };
}
