/**
 * orders-admin-service.ts
 * Server-side (Admin SDK) helpers for order mutations from API routes.
 * Use this in API routes and webhooks where firebase-admin is available.
 */

import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDB } from './firebase-admin';
import { OrderStatus } from '@/types/order';

interface TimelineEventInput {
    status: OrderStatus;
    user?: string;
    note?: string;
    // Payment enrichment
    wompiTransactionId?: string;
    wompiStatus?: string;
    wompiPaymentMethod?: string;
    wompiDeclineReason?: string;
    wompiAmountCents?: number;
    wompiEnvironment?: string;
}

/**
 * Appends a timeline event to an order using the Admin SDK.
 * Safe to call from API routes and webhooks (server-side only).
 */
export async function addOrderTimelineEventAdmin(
    orderId: string,
    event: TimelineEventInput
): Promise<void> {
    const db = getAdminDB();
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
        throw new Error(`Order ${orderId} not found`);
    }

    // Filter out undefined/null values so Firestore doesn't reject
    const cleaned: Record<string, unknown> = { timestamp: new Date().toISOString() };
    (Object.entries(event) as [string, unknown][]).forEach(([k, v]) => {
        if (v !== undefined && v !== null) cleaned[k] = v;
    });

    await orderRef.update({
        timeline: FieldValue.arrayUnion(cleaned),
        status: event.status,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Appends a timeline note WITHOUT changing the status.
 * Useful for system notes like "payment rejected - staying in current status".
 */
export async function addOrderNoteAdmin(
    orderId: string,
    note: string,
    user = 'system'
): Promise<void> {
    const db = getAdminDB();
    const orderRef = db.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
        throw new Error(`Order ${orderId} not found`);
    }

    const currentStatus = (orderSnap.data() as Record<string, unknown>).status as OrderStatus || 'pendiente';

    const event: Record<string, unknown> = {
        status: currentStatus,
        timestamp: new Date().toISOString(),
        user,
        note,
    };

    await orderRef.update({
        timeline: FieldValue.arrayUnion(event),
        updatedAt: new Date().toISOString(),
    });
}
