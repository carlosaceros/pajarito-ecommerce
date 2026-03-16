'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TruckIcon, Factory, Percent, Droplet } from 'lucide-react';

const MESSAGES = [
    {
        icon: Percent,
        textFull: 'Ahorra hasta 60% vs marcas comerciales',
        textMobile: 'Ahorra hasta 60%',
        color: 'text-green-600'
    },
    {
        icon: TruckIcon,
        textFull: 'Envío GRATIS en compras +$100k',
        textMobile: 'Envío GRATIS +$100k',
        color: 'text-blue-600'
    },
    {
        icon: Factory,
        textFull: 'Calidad industrial directo de fábrica',
        textMobile: 'Directo de fábrica',
        color: 'text-orange-600'
    },
    {
        icon: Droplet,
        textFull: 'Productos concentrados que rinden el doble',
        textMobile: 'Rinde el doble',
        color: 'text-purple-600'
    },
    {
        icon: Sparkles,
        textFull: 'Más de 1,000 familias ahorrando con nosotros',
        textMobile: '+1,000 familias',
        color: 'text-pink-600'
    }
];

export default function HeaderMessage() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % MESSAGES.length);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const currentMessage = MESSAGES[currentIndex];
    const Icon = currentMessage.icon;

    return (
        <div className="flex items-center justify-center gap-2 min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center gap-2"
                >
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 ${currentMessage.color} flex-shrink-0`} />
                    {/* Mobile text */}
                    <span className="text-xs font-bold text-gray-700 md:hidden">
                        {currentMessage.textMobile}
                    </span>
                    {/* Desktop text */}
                    <span className="hidden md:block text-sm lg:text-base font-bold text-gray-700">
                        {currentMessage.textFull}
                    </span>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
