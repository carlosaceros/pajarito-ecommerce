/**
 * POST /api/wompi/webhook
 * 
 * Receives payment status events from Wompi and writes full traceability
 * to the order timeline in Firestore, including:
 *  - Transaction ID
 *  - Payment method (CARD, PSE, NEQUI, etc.)
 *  - Status & decline reason
 *  - Amount
 *  - Environment (test / production)
 */
import { NextResponse } from 'next/server';
import { validateWebhookDynamicSignature } from '@/lib/wompi-service';
import { addOrderTimelineEventAdmin } from '@/lib/orders-admin-service';
import { sendAdminPushNotification } from '@/lib/fcm-service';
import { sendPaymentConfirmedEmail } from '@/lib/email-service';
import { getAdminDB } from '@/lib/firebase-admin';
import { OrderStatus } from '@/types/order';

interface WompiTransaction {
    id: string;
    status: string; // APPROVED | DECLINED | VOIDED | ERROR
    reference: string;
    amount_in_cents: number;
    payment_method_type: string; // CARD | PSE | BANCOLOMBIA_TRANSFER | NEQUI | etc.
    currency: string;
    // Wompi sometimes sends decline_reason
    payment_method?: {
        type?: string;
        extra?: {
            decline_reason?: string;  // insufficient_funds | invalid_cvv | card_blocked, etc.
            brand?: string;           // VISA | MASTERCARD | etc.
            last_four?: string;
            bank_name?: string;
            network?: string;
        };
    };
    error_code?: string;
}

interface WompiWebhookPayload {
    event: string;
    data: {
        transaction: WompiTransaction;
    };
    environment: string;
    signature: {
        properties: string[];
        checksum: string;
    };
    timestamp: number;
    sent_at: string;
}

/** Human-readable labels for Wompi decline reasons */
const DECLINE_REASON_LABELS: Record<string, string> = {
    insufficient_funds: 'Fondos insuficientes',
    invalid_cvv: 'CVV inválido',
    card_blocked: 'Tarjeta bloqueada',
    expired_card: 'Tarjeta vencida',
    card_not_supported: 'Tarjeta no soportada',
    suspected_fraud: 'Transacción sospechosa de fraude',
    contact_issuer: 'Contactar banco emisor',
    unable_to_process: 'No se pudo procesar',
    daily_limit_exceeded: 'Límite diario excedido',
    3ds_failed: 'Autenticación 3DS fallida',
};

/** Human-readable labels for Wompi payment methods */
const PAYMENT_METHOD_LABELS: Record<string, string> = {
    CARD: 'Tarjeta de crédito/débito',
    PSE: 'PSE',
    BANCOLOMBIA_TRANSFER: 'Transferencia Bancolombia',
    NEQUI: 'Nequi',
    BANCOLOMBIA_QR: 'QR Bancolombia',
    CASH: 'Efecty',
};

export async function POST(request: Request) {
    let orderId = 'unknown';
    try {
        const body: WompiWebhookPayload = await request.json();
        const { transaction } = body.data;
        const { signature, timestamp, environment } = body;

        orderId = transaction.reference;

        // 1. Validate signature
        if (!signature?.checksum) {
            console.error('[Wompi] Missing webhook signature');
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const isValid = validateWebhookDynamicSignature(
            signature.checksum,
            signature.properties,
            body.data,
            timestamp
        );

        if (!isValid) {
            console.error('[Wompi] Invalid signature for transaction', transaction.id);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Build human-readable note
        const declineRaw = transaction.payment_method?.extra?.decline_reason;
        const declineLabel = declineRaw
            ? (DECLINE_REASON_LABELS[declineRaw] ?? declineRaw)
            : undefined;

        const methodLabel = PAYMENT_METHOD_LABELS[transaction.payment_method_type]
            ?? transaction.payment_method_type;

        const amountCOP = Math.round(transaction.amount_in_cents / 100);
        const amountFmt = amountCOP.toLocaleString('es-CO', {
            style: 'currency', currency: 'COP', maximumFractionDigits: 0
        });

        let newStatus: OrderStatus | null = null;
        let noteText = '';

        switch (transaction.status) {
            case 'APPROVED':
                newStatus = 'confirmado';
                noteText = `✅ Pago aprobado por ${amountFmt} vía ${methodLabel} (Wompi ID: ${transaction.id})`;
                break;
            case 'DECLINED':
                // For declined payments we log the event but keep order as 'pendiente'
                // so the customer can retry — only cancel if business decides to.
                newStatus = 'pendiente';
                noteText = `❌ Pago rechazado: ${declineLabel ?? 'Motivo no especificado'} · Monto: ${amountFmt} · Método: ${methodLabel} (Wompi ID: ${transaction.id})`;
                break;
            case 'VOIDED':
                newStatus = 'cancelado';
                noteText = `🚫 Pago anulado por ${amountFmt} vía ${methodLabel} (Wompi ID: ${transaction.id})`;
                break;
            case 'ERROR':
                newStatus = 'pendiente';
                noteText = `⚠️ Error en el procesamiento del pago: ${transaction.error_code ?? 'código desconocido'} · ${amountFmt} vía ${methodLabel} (Wompi ID: ${transaction.id})`;
                break;
            default:
                // PENDING, etc. — just log, don't change status
                noteText = `ℹ️ Evento Wompi: estado "${transaction.status}" para transacción ${transaction.id}`;
                console.log(`[Wompi] Unknown status ${transaction.status} for order ${orderId}`);
        }

        // 3. Write rich timeline event
        if (newStatus) {
            try {
                await addOrderTimelineEventAdmin(orderId, {
                    status: newStatus,
                    user: 'webhook:wompi',
                    note: noteText,
                    wompiTransactionId: transaction.id,
                    wompiStatus: transaction.status,
                    wompiPaymentMethod: methodLabel,
                    wompiDeclineReason: declineLabel,
                    wompiAmountCents: transaction.amount_in_cents,
                    wompiEnvironment: environment,
                });

                console.log(`[Wompi] Order ${orderId} → ${newStatus} (${transaction.status})`);

                // 4. Side effects for APPROVED only
                if (transaction.status === 'APPROVED') {
                    const db = getAdminDB();
                    const orderDoc = await db.collection('orders').doc(orderId).get();

                    if (orderDoc.exists) {
                        const orderData = orderDoc.data()!;
                        const customerEmail = orderData.cliente?.email;
                        const customerName = orderData.cliente?.nombre || 'Cliente';
                        const total = orderData.total ?? amountCOP;

                        // Push notification to admin
                        sendAdminPushNotification({
                            title: '💳 ¡Pago Confirmado!',
                            body: `Pedido #${orderId.slice(-6)} · ${amountFmt} aprobado`,
                            data: { orderId, type: 'payment_confirmed' },
                        }).catch(e => console.warn('[FCM] Push failed:', e));

                        // Confirmation email to customer
                        if (customerEmail) {
                            sendPaymentConfirmedEmail({
                                orderId,
                                customerName,
                                customerEmail,
                                total,
                            }).catch(e => console.warn('[Email] Payment email failed:', e));
                        }
                    }
                }

                // 5. Admin notification for DECLINED payments
                if (transaction.status === 'DECLINED') {
                    sendAdminPushNotification({
                        title: '❌ Pago Rechazado',
                        body: `Pedido #${orderId.slice(-6)} — ${declineLabel ?? 'rechazo'} — ${amountFmt}`,
                        data: { orderId, type: 'payment_declined' },
                    }).catch(e => console.warn('[FCM] Declined push failed:', e));
                }

            } catch (err) {
                console.error(`[Wompi] Error writing timeline for order ${orderId}:`, err);
            }
        }

        // Always return 200 to Wompi
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('[Wompi] Unhandled error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
