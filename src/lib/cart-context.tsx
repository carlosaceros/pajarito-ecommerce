'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from './products';

export interface CartItem {
    product: Product;
    size: '3.8L' | '10L' | '20L';
    price: number;
    cantidad: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, size: '3.8L' | '10L' | '20L', price: number, cantidad?: number) => void;
    removeFromCart: (productId: string, size: string) => void;
    updateQuantity: (productId: string, size: string, cantidad: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getTotalPrice: () => number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('pajarito_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Error loading cart:', e);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem('pajarito_cart', JSON.stringify(cart));
        } else {
            localStorage.removeItem('pajarito_cart');
        }
    }, [cart]);

    const addToCart = (product: Product, size: '3.8L' | '10L' | '20L', price: number, cantidad: number = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(
                item => item.product.id === product.id && item.size === size
            );

            if (existingItem) {
                return prevCart.map(item =>
                    item.product.id === product.id && item.size === size
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            }

            return [...prevCart, { product, size, price, cantidad }];
        });
    };

    const removeFromCart = (productId: string, size: string) => {
        setCart(prevCart => prevCart.filter(
            item => !(item.product.id === productId && item.size === size)
        ));
    };

    const updateQuantity = (productId: string, size: string, cantidad: number) => {
        if (cantidad <= 0) {
            removeFromCart(productId, size);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.product.id === productId && item.size === size
                    ? { ...item, cantidad }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.cantidad, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + (item.price * item.cantidad), 0);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getTotalItems,
                getTotalPrice,
                isCartOpen,
                setIsCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
