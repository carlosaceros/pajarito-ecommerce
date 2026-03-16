import { NextResponse } from 'next/server';
import { validateWebhookDynamicSignature } from '@/lib/wompi-service';
import { updateOrderStatus } from '@/lib/orders-service';
import { OrderStatus } from '@/types/order';

interface WompiWebhookPayload {
    event: string;
    data: {
        transaction: {
            id: string;
            status: string; // APPROVED, DECLINED, VOIDED, ERROR
            reference: string;
            amount_in_cents: number;
            payment_method_type: string;
            currency: string;
        };
    };
    environment: string;
    signature: {
        properties: string[];
        checksum: string;
    };
    timestamp: number;
    sent_at: string;
}

export async function POST(request: Request) {
    try {
        const body: WompiWebhookPayload = await request.json();

        // 1. Validate the Webhook Signature
        const { transaction } = body.data;
        const { signature, timestamp } = body;

        if (!signature || !signature.checksum) {
            console.error('Missing Wompi webhook signature');
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const isValid = validateWebhookDynamicSignature(
            signature.checksum,
            signature.properties,
            body.data,
            timestamp
        );

        if (!isValid) {
            console.error('Invalid Wompi webhook signature for transaction', transaction.id);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 2. Map Wompi Status to System Order Status
        let newStatus: OrderStatus | null = null;
        let internalNote = `Wompi Webhook: Transacción ${transaction.id} - Estado: ${transaction.status}`;

        switch (transaction.status) {
            case 'APPROVED':
                newStatus = 'confirmado'; // Assuming approved means we start prep
                break;
            case 'DECLINED':
            case 'ERROR':
            case 'VOIDED':
                newStatus = 'cancelado';
                break;
            // 'PENDING' usually shouldn't trigger a final webhook, but just in case
            default:
                console.log(`Received unknown status ${transaction.status} for order ${transaction.reference}`);
        }

        // 3. Update Firestore Order
        if (newStatus) {
            try {
                // The reference is assumed to be the Firestore orderId
                await updateOrderStatus(transaction.reference, newStatus, internalNote);
                console.log(`Successfully updated order ${transaction.reference} to ${newStatus}`);
            } catch (firestoreError) {
                console.error(`Failed to update order ${transaction.reference} in Firestore:`, firestoreError);
                // Return 200 anyway to prevent Wompi from retrying endlessly if the order ID doesn't exist
                // Or you could return 500 to force Wompi to retry.
                // For an MVP, logging and 200 is safer to avoid webhook queue blockage.
            }
        }

        // Always return 200 OK to Wompi so they know we received the webhook
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Error processing Wompi webhook:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
