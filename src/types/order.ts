import { Timestamp } from 'firebase/firestore';

export type OrderStatus =
    | 'pendiente'
    | 'confirmado'
    | 'preparacion'
    | 'enviado'
    | 'en_camino'
    | 'entregado'
    | 'cancelado';

export interface OrderCustomer {
    nombre: string;
    cedula: string;
    celular: string;
    email?: string;
    departamento: string;
    ciudad: string;
    direccion: string;
    notas?: string;
}

export interface OrderItem {
    product: {
        id: string;
        nombre: string;
        imgFile: string;
    };
    size: string;
    cantidad: number;
    price: number;
}

export interface TimelineEvent {
    status: OrderStatus;
    timestamp: Timestamp;
    user?: string;        // 'system' | 'admin:email@...' | 'webhook:wompi'
    note?: string;
    // --- Enriquecimiento de pago ---
    wompiTransactionId?: string;
    wompiStatus?: string;        // APPROVED | DECLINED | ERROR | VOIDED
    wompiPaymentMethod?: string; // CARD | PSE | NEQUI | etc.
    wompiDeclineReason?: string; // fondos insuficientes, tarjeta bloqueada, etc.
    wompiAmountCents?: number;   // monto en centavos
    wompiEnvironment?: string;   // production | test
}

export interface Order {
    id: string;
    cliente: OrderCustomer;
    productos: OrderItem[];
    subtotal: number;
    envio: number;
    total: number;
    metodoPago: 'contraentrega' | 'wompi';
    tipoEntrega: 'domicilio' | 'pickup';
    /** Número de bultos calculados para el envío */
    bultos?: number;
    /** Descuento aplicado (ej: pick-up 5%) */
    descuento?: number;
    status: OrderStatus;
    timeline: TimelineEvent[];
    whatsappConversation?: string[];
    notas?: string[];
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}> = {
    pendiente: {
        label: 'Pendiente',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: '⏳'
    },
    confirmado: {
        label: 'Confirmado',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '✅'
    },
    preparacion: {
        label: 'En Preparación',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: '📦'
    },
    enviado: {
        label: 'Enviado',
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-100',
        icon: '🚚'
    },
    en_camino: {
        label: 'En Camino',
        color: 'text-orange-700',
        bgColor: 'bg-orange-100',
        icon: '📍'
    },
    entregado: {
        label: 'Entregado',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✓'
    },
    cancelado: {
        label: 'Cancelado',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '✕'
    }
};
