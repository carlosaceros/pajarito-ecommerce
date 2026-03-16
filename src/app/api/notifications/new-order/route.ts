import { NextResponse } from 'next/server';
import { sendAdminPushNotification } from '@/lib/fcm-service';

/**
 * POST /api/notifications/new-order
 * Called from the checkout client-side after a contraentrega order is created.
 * Sends a push notification to all registered admin devices.
 *
 * Body: { orderId: string, customerName: string, total: number, metodoPago: string }
 */
export async function POST(request: Request) {
    try {
        const { orderId, customerName, total, metodoPago } = await request.json();

        if (!orderId || !customerName) {
            return NextResponse.json({ error: 'orderId and customerName are required' }, { status: 400 });
        }

        const formattedTotal = total?.toLocaleString('es-CO', {
            style: 'currency', currency: 'COP', maximumFractionDigits: 0
        }) || '';

        const isOnline = metodoPago === 'wompi';

        await sendAdminPushNotification({
            title: isOnline ? '💳 ¡Pago Online!' : '🛒 ¡Nuevo Pedido!',
            body: isOnline
                ? `${customerName} · ${formattedTotal} con tarjeta — Pedido #${orderId.slice(-6)}`
                : `${customerName} · ${formattedTotal} contraentrega — Pedido #${orderId.slice(-6)}`,
            data: { orderId, type: 'new_order' },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[FCM] Error sending new-order push:', error);
        // Non-fatal: return success anyway so the checkout flow isn't blocked
        return NextResponse.json({ success: true, warning: 'Push failed, order still created' });
    }
}
