import crypto from 'crypto';

interface WompiSignatureParams {
    reference: string;
    amountInCents: number;
    currency: string;
}

/**
 * Generates the integrity signature required by Wompi WebCheckout
 * Formula: SHA256(reference + amountInCents + currency + integritySecret)
 */
export function generateIntegritySignature({
    reference,
    amountInCents,
    currency
}: WompiSignatureParams): string {
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

    if (!integritySecret) {
        throw new Error('WOMPI_INTEGRITY_SECRET is not configured');
    }

    const stringToHash = `${reference}${amountInCents}${currency}${integritySecret}`;
    
    return crypto
        .createHash('sha256')
        .update(stringToHash)
        .digest('hex');
}

/**
 * Validates the signature received from Wompi Webhooks
 */
export function validateWebhookSignature(
    signature: string,
    transactionId: string,
    status: string,
    amountInCents: number,
    timestamp: number | string,
    reference: string
): boolean {
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET;

    if (!eventsSecret) {
        throw new Error('WOMPI_EVENTS_SECRET is not configured');
    }

    // Wompi webhook signature formula:
    // signature = SHA256(transactionId + status + amountInCents + timestamp + reference + eventsSecret)
    const stringToHash = `${transactionId}${status}${amountInCents}${timestamp}${reference}${eventsSecret}`;
    
    const expectedSignature = crypto
        .createHash('sha256')
        .update(stringToHash)
        .digest('hex');

    return signature === expectedSignature;
}
