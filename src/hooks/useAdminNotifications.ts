'use client';

import { useEffect, useRef, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types/order';

function safeToDate(timestamp: any): Date {
    if (!timestamp) return new Date();
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    if (typeof timestamp === 'string' || typeof timestamp === 'number') return new Date(timestamp);
    return new Date();
}

function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
}

export interface AdminNotification {
    id: string;
    title: string;
    body: string;
    timestamp: Date;
    read: boolean;
    type: 'new_order' | 'payment_confirmed';
    orderId: string;
}

export function useAdminNotifications() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const knownOrderIds = useRef<Set<string>>(new Set());
    const isFirstLoad = useRef(true);

    // Request browser notification permission on mount
    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission === 'granted') {
            setPermissionGranted(true);
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((permission) => {
                setPermissionGranted(permission === 'granted');
            });
        }
    }, []);

    // Subscribe to orders and detect new ones
    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            // On the very first load, just record all existing order IDs (no notifications)
            if (isFirstLoad.current) {
                snapshot.docs.forEach((doc) => knownOrderIds.current.add(doc.id));
                isFirstLoad.current = false;
                return;
            }

            // For every change, detect added documents
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' && !knownOrderIds.current.has(change.doc.id)) {
                    const data = change.doc.data() as Order;
                    knownOrderIds.current.add(change.doc.id);

                    const customerName = data.cliente?.nombre || 'Cliente desconocido';
                    const total = formatPrice(data.total || 0);
                    const isPaid = data.status === 'confirmado' || data.metodoPago === 'wompi';

                    const notification: AdminNotification = {
                        id: change.doc.id + '_' + Date.now(),
                        title: isPaid ? '💳 ¡Pago Confirmado!' : '🛒 ¡Nuevo Pedido!',
                        body: isPaid
                            ? `${customerName} pagó ${total} con tarjeta`
                            : `${customerName} hizo un pedido de ${total} (contraentrega)`,
                        timestamp: safeToDate(data.createdAt),
                        read: false,
                        type: isPaid ? 'payment_confirmed' : 'new_order',
                        orderId: change.doc.id,
                    };

                    // Add to in-app list
                    setNotifications((prev) => [notification, ...prev]);

                    // Show browser notification if permission granted
                    if (permissionGranted || Notification.permission === 'granted') {
                        try {
                            const browserNotif = new Notification(notification.title, {
                                body: notification.body,
                                icon: '/icon.png',
                                badge: '/icon.png',
                                tag: change.doc.id, // Prevents duplicate notifications for the same order
                            });
                            browserNotif.onclick = () => {
                                window.focus();
                                window.location.href = '/admin/pedidos';
                                browserNotif.close();
                            };
                        } catch (e) {
                            console.warn('[Notifications] No se pudo mostrar notificación del navegador', e);
                        }
                    }
                }
            });
        });

        return unsubscribe;
    }, [permissionGranted]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    };

    const requestPermission = async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return false;
        const permission = await Notification.requestPermission();
        const granted = permission === 'granted';
        setPermissionGranted(granted);
        return granted;
    };

    return {
        notifications,
        unreadCount,
        permissionGranted: permissionGranted || (typeof window !== 'undefined' && Notification.permission === 'granted'),
        markAllAsRead,
        markAsRead,
        requestPermission,
    };
}
