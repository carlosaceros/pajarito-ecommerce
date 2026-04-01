/**
 * Brevo (ex-Sendinblue) Email Service
 * Uses the Brevo REST API directly — no SDK needed.
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY!;
const FROM_EMAIL = process.env.BREVO_FROM_EMAIL || 'pedidos@productospajarito.com';
const FROM_NAME = 'Pajarito - Aseo Industrial';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'thinktic.thinktic@gmail.com';

interface BrevoEmailPayload {
    sender: { name: string; email: string };
    to: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
}

async function sendEmail(payload: BrevoEmailPayload): Promise<void> {
    if (!BREVO_API_KEY) {
        console.warn('[Brevo] BREVO_API_KEY not set — skipping email send');
        return;
    }

    const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': BREVO_API_KEY,
            'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        console.error('[Brevo] Failed to send email:', res.status, errorBody);
        throw new Error(`Brevo API error: ${res.status}`);
    }

    const data = await res.json();
    console.log('[Brevo] Email sent successfully, messageId:', data.messageId);
}

// ─────────────────────────────────────────────────────────────
// HTML Templates
// ─────────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pajarito</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#e63946 0%,#c1121f 100%);padding:32px;text-align:center;">
                  <img src="https://www.productospajarito.com/images/logo.png" alt="Pajarito" height="48" style="max-height:48px;object-fit:contain;" />
                  <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Aseo Industrial · Biocambio360</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    © 2025 Biocambio360 S.A.S. · Soacha, Cundinamarca<br>
                    <a href="https://www.productospajarito.com" style="color:#e63946;text-decoration:none;">productospajarito.com</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>`;
}

function formatCOP(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
}

// ─────────────────────────────────────────────────────────────
// Email: Order Confirmation → Customer
// ─────────────────────────────────────────────────────────────
interface OrderEmailData {
    orderId: string;
    customerName: string;
    customerEmail: string;
    productos: { product: { nombre: string }; size: string; cantidad: number; price: number }[];
    subtotal: number;
    envio: number;
    total: number;
    metodoPago: 'contraentrega' | 'wompi';
    ciudad?: string;
    direccion?: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
    if (!data.customerEmail) return;

    const itemsHtml = data.productos.map(item => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;color:#374151;">
            ${item.product.nombre} <span style="color:#9ca3af;">${item.size}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:center;color:#374151;">${item.cantidad}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;text-align:right;color:#374151;">${formatCOP(item.price * item.cantidad)}</td>
        </tr>
    `).join('');

    const isContraentrega = data.metodoPago === 'contraentrega';

    const content = `
        <h1 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;">¡Pedido Recibido! 🕊️</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hola <strong>${data.customerName}</strong>, confirmamos que recibimos tu pedido. Aquí tienes el resumen:</p>

        <div style="background:#f9fafb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Número de Pedido</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#e63946;font-family:monospace;">#${data.orderId.slice(-8).toUpperCase()}</p>
        </div>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <th style="text-align:left;padding:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">Producto</th>
            <th style="text-align:center;padding:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">Cant.</th>
            <th style="text-align:right;padding:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e5e7eb;">Total</th>
          </tr>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding:12px 0 4px;color:#6b7280;font-size:14px;">Subtotal</td>
            <td style="padding:12px 0 4px;text-align:right;color:#374151;font-size:14px;">${formatCOP(data.subtotal)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 0;color:#6b7280;font-size:14px;">Envío</td>
            <td style="padding:4px 0;text-align:right;color:#374151;font-size:14px;">${data.envio === 0 ? '¡Gratis!' : formatCOP(data.envio)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding:12px 0 0;font-size:17px;font-weight:800;color:#111827;border-top:2px solid #e5e7eb;">TOTAL</td>
            <td style="padding:12px 0 0;text-align:right;font-size:17px;font-weight:800;color:#e63946;border-top:2px solid #e5e7eb;">${formatCOP(data.total)}</td>
          </tr>
        </table>

        <div style="background:${isContraentrega ? '#fffbeb' : '#f0fdf4'};border:1px solid ${isContraentrega ? '#fde68a' : '#bbf7d0'};border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <p style="margin:0;font-weight:700;color:${isContraentrega ? '#92400e' : '#166534'};font-size:14px;">
            ${isContraentrega ? '📦 Pago Contraentrega' : '💳 Pago en Línea (Wompi)'}
          </p>
          <p style="margin:4px 0 0;color:${isContraentrega ? '#92400e' : '#166534'};font-size:13px;">
            ${isContraentrega
                ? `Pagarás ${formatCOP(data.total)} al recibir tu pedido en ${data.ciudad || 'tu ciudad'}.`
                : 'Tu pago fue procesado exitosamente. ¡Gracias!'
            }
          </p>
        </div>

        <a href="https://www.productospajarito.com" style="display:inline-block;background:linear-gradient(135deg,#e63946,#c1121f);color:#fff;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;">
          Ver Tienda 🕊️
        </a>
    `;

    await sendEmail({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: data.customerEmail, name: data.customerName }],
        subject: `✅ Pedido #${data.orderId.slice(-8).toUpperCase()} confirmado — Pajarito`,
        htmlContent: baseTemplate(content),
    });
}

// ─────────────────────────────────────────────────────────────
// Email: Payment Confirmed → Customer
// ─────────────────────────────────────────────────────────────
export async function sendPaymentConfirmedEmail(data: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    total: number;
}): Promise<void> {
    if (!data.customerEmail) return;

    const content = `
        <h1 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;">¡Pago Confirmado! 💳✅</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hola <strong>${data.customerName}</strong>, tu pago fue procesado exitosamente.</p>

        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#166534;letter-spacing:1px;text-transform:uppercase;">Monto Pagado</p>
          <p style="margin:8px 0 0;font-size:36px;font-weight:800;color:#15803d;">${formatCOP(data.total)}</p>
          <p style="margin:8px 0 0;font-size:13px;color:#166534;">Pedido <strong>#${data.orderId.slice(-8).toUpperCase()}</strong></p>
        </div>

        <p style="color:#6b7280;font-size:14px;line-height:1.6;">Tu pedido está en preparación. Te notificaremos cuando sea despachado. El tiempo de entrega estimado es de <strong>2 a 5 días hábiles</strong>.</p>

        <a href="https://www.productospajarito.com" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;">
          Seguir Comprando 🛒
        </a>
    `;

    await sendEmail({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: data.customerEmail, name: data.customerName }],
        subject: `💳 Pago Confirmado — Pedido #${data.orderId.slice(-8).toUpperCase()}`,
        htmlContent: baseTemplate(content),
    });
}

// ─────────────────────────────────────────────────────────────
// Email: New Order Alert → Admin
// ─────────────────────────────────────────────────────────────
export async function sendNewOrderAdminEmail(data: {
    orderId: string;
    customerName: string;
    total: number;
    metodoPago: string;
    ciudad?: string;
}): Promise<void> {
    const content = `
        <h1 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;">🛒 Nuevo Pedido Recibido</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Tienes un nuevo pedido que requiere atención.</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${[
            ['# Pedido', `#${data.orderId.slice(-8).toUpperCase()}`],
            ['Cliente', data.customerName],
            ['Total', formatCOP(data.total)],
            ['Método de Pago', data.metodoPago === 'wompi' ? '💳 Pago Online' : '📦 Contraentrega'],
            ['Ciudad', data.ciudad || 'N/A'],
          ].map(([label, value]) => `
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:14px;width:40%;">${label}</td>
              <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;color:#111827;font-size:14px;font-weight:600;">${value}</td>
            </tr>
          `).join('')}
        </table>

        <a href="https://www.productospajarito.com/admin/pedidos" style="display:inline-block;background:linear-gradient(135deg,#e63946,#c1121f);color:#fff;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;">
          Ver en Admin Panel →
        </a>
    `;

    await sendEmail({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: ADMIN_EMAIL }],
        subject: `🛒 Nuevo pedido #${data.orderId.slice(-8).toUpperCase()} — ${formatCOP(data.total)}`,
        htmlContent: baseTemplate(content),
    });
}

// ─────────────────────────────────────────────────────────────
// Email: Order Shipped → Customer
// ─────────────────────────────────────────────────────────────
export async function sendOrderShippedEmail(data: {
    orderId: string;
    customerName: string;
    customerEmail: string;
}): Promise<void> {
    if (!data.customerEmail) return;

    const content = `
        <h1 style="margin:0 0 8px;color:#111827;font-size:24px;font-weight:800;">¡Tu pedido va en camino! 🚚</h1>
        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">Hola <strong>${data.customerName}</strong>, tu pedido <strong>#${data.orderId.slice(-8).toUpperCase()}</strong> fue despachado.</p>

        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <p style="margin:0;font-size:40px;">📦</p>
          <p style="margin:8px 0 0;font-weight:700;color:#1e40af;font-size:16px;">En camino a tu dirección</p>
          <p style="margin:4px 0 0;color:#3b82f6;font-size:14px;">Tiempo estimado: 2 a 5 días hábiles</p>
        </div>

        <p style="color:#6b7280;font-size:14px;line-height:1.6;">Si tienes alguna pregunta sobre tu entrega, contáctanos por WhatsApp.</p>

        <a href="https://wa.me/573000000000" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:14px 32px;border-radius:100px;font-weight:700;font-size:15px;">
          Contactar por WhatsApp 💬
        </a>
    `;

    await sendEmail({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: data.customerEmail, name: data.customerName }],
        subject: `🚚 Pedido #${data.orderId.slice(-8).toUpperCase()} en camino — Pajarito`,
        htmlContent: baseTemplate(content),
    });
}
