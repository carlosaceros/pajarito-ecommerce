'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';
import { Product } from '@/lib/products';
import { getAllProducts, saveProduct, deleteProduct } from '@/lib/products-service';
import Image from 'next/image';

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getAllProducts(true);
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        
        setIsSaving(true);
        try {
            await saveProduct(editingProduct);
            await loadProducts();
            setEditingProduct(null);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Hubo un error al guardar el producto.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto permanentemente?')) return;
        
        try {
            await deleteProduct(id);
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar producto.');
        }
    };

    const handleEditChange = (field: keyof Product, value: any) => {
        if (!editingProduct) return;
        setEditingProduct({ ...editingProduct, [field]: value });
    };

    const createNewProduct = () => {
        setEditingProduct({
            id: `nuevo-producto-${Date.now()}`,
            nombre: '',
            slogan: '',
            descripcion: '',
            imgFile: '',
            beneficios: ['', '', ''],
            badge: '',
            color: 'bg-blue-600',
            faqs: [],
            precios: { '3.8L': 0, '10L': 0, '20L': 0 },
            competidorPromedio: { '3.8L': 0, '10L': 0, '20L': 0 }
        });
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Cargando inventario...</div>;
    }

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: '"Archivo Black", sans-serif' }}>GESTIÓN DE INVENTARIO</h1>
                    <p className="text-gray-500 text-sm">Administra los productos de tu catálogo</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={createNewProduct}
                        className="flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-bold transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product List */}
                <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pr-2 custom-scrollbar">
                    {products.map(product => (
                        <div 
                            key={product.id}
                            className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${editingProduct?.id === product.id ? 'border-red-500 shadow-md ring-1 ring-red-500' : 'hover:border-gray-300'}`}
                            onClick={() => setEditingProduct(product)}
                        >
                            <div className="flex gap-4">
                                <div className={`relative w-16 h-16 rounded-lg ${product.color} bg-opacity-10 overflow-hidden flex-shrink-0`}>
                                    <Image 
                                        src={`/images/${product.imgFile}`}
                                        alt={product.nombre}
                                        fill
                                        className="object-contain p-2"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2JjYmNiIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIxIDE1djRjMCAxLjA5Ny0uOTAzIDItMiAyaC0xNGMtMS4wOTcgMC0yLS45MDMtMi0yVjVjMC0xLjA5Ny45MDMtMiAyLTJoMTRjMS4wOTcgMCAyIC45MDMgMiAydjQiLz48cGF0aCBkPSJNMTAgOW0tMiAwYTIgMiAwIDEgMCA0IDAgMiAyIDAgMSAwIC00IDAiLz48cGF0aCBkPSJNMjEgMTVMMTYgMTBsLTIuNSAyLjVMOSA4TDMgMTQiLz48L3N2Zz4=';
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.nombre}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{product.id}</p>
                                    <p className="text-xs font-black text-gray-900">
                                        $ {(product.precios['3.8L'] ?? product.precios['10L'] ?? 0).toLocaleString('es-CO')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {products.length === 0 && (
                        <div className="text-center p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <Package className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-500">No hay productos aún.</p>
                            <p className="text-xs text-gray-400 mt-1">Crea un nuevo producto para agregarlo al catálogo.</p>
                        </div>
                    )}
                </div>

                {/* Editor Form */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {editingProduct ? (
                            <motion.form 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                onSubmit={handleSave}
                                className="bg-white border rounded-xl shadow-sm overflow-hidden"
                            >
                                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                                    <h2 className="font-black text-gray-900 flex items-center gap-2">
                                        <Edit size={18} className="text-red-600" />
                                        {editingProduct.id.startsWith('nuevo') ? 'CREAR PRODUCTO' : 'EDITAR PRODUCTO'}
                                    </h2>
                                    <div className="flex gap-2">
                                        {!editingProduct.id.startsWith('nuevo') && (
                                            <button 
                                                type="button" 
                                                onClick={() => handleDelete(editingProduct.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <button 
                                            type="button" 
                                            onClick={() => setEditingProduct(null)}
                                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del producto *</label>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingProduct.nombre} 
                                                onChange={e => handleEditChange('nombre', e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-red-500 focus:outline-none text-gray-900 bg-white placeholder-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">ID / Slug * (url: /producto/slug)</label>
                                            <input 
                                                required
                                                type="text" 
                                                value={editingProduct.id} 
                                                onChange={e => handleEditChange('id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                                disabled={!editingProduct.id.startsWith('nuevo')}
                                                className={`w-full border-2 rounded-lg p-2 focus:outline-none ${editingProduct.id.startsWith('nuevo') ? 'border-gray-200 focus:border-red-500 text-gray-900 bg-white placeholder-gray-400' : 'bg-gray-100 border-transparent text-gray-500 cursor-not-allowed'}`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Eslogan</label>
                                        <input 
                                            type="text" 
                                            value={editingProduct.slogan} 
                                            onChange={e => handleEditChange('slogan', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-red-500 focus:outline-none text-gray-900 bg-white placeholder-gray-400"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                                        <textarea 
                                            rows={3}
                                            value={editingProduct.descripcion} 
                                            onChange={e => handleEditChange('descripcion', e.target.value)}
                                            className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-red-500 focus:outline-none resize-none text-gray-900 bg-white placeholder-gray-400"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Archivo de Imagen (en public/images/)</label>
                                            <input 
                                                type="text" 
                                                value={editingProduct.imgFile} 
                                                onChange={e => handleEditChange('imgFile', e.target.value)}
                                                placeholder="Ej: PAJARITO_DETERGENTE.png"
                                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-red-500 focus:outline-none text-gray-900 bg-white placeholder-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Etiqueta Badge</label>
                                            <input 
                                                type="text" 
                                                value={editingProduct.badge} 
                                                onChange={e => handleEditChange('badge', e.target.value)}
                                                placeholder="Ej: MÁS VENDIDO"
                                                className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-red-500 focus:outline-none text-gray-900 bg-white placeholder-gray-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4">Precios Propios (COP)</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['3.8L', '10L', '20L'].map((size) => (
                                                <div key={size}>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{size}</label>
                                                    <input 
                                                        type="number" 
                                                        value={editingProduct.precios[size as keyof typeof editingProduct.precios]} 
                                                        onChange={e => handleEditChange('precios', { ...editingProduct.precios, [size]: parseInt(e.target.value) || 0 })}
                                                        className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-red-500 focus:outline-none text-gray-900 bg-white placeholder-gray-400"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4">Precios Competencia Promedio (COP)</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {['3.8L', '10L', '20L'].map((size) => (
                                                <div key={size}>
                                                    <label className="block text-xs font-bold text-gray-700 mb-1">{size}</label>
                                                    <input 
                                                        type="number" 
                                                        value={editingProduct.competidorPromedio[size as keyof typeof editingProduct.competidorPromedio]} 
                                                        onChange={e => handleEditChange('competidorPromedio', { ...editingProduct.competidorPromedio, [size]: parseInt(e.target.value) || 0 })}
                                                        className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-red-500 focus:outline-none text-gray-900 bg-white placeholder-gray-400"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={isSaving}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <Save size={20} />
                                            {isSaving ? 'Guardando...' : 'Guardar Producto'}
                                        </button>
                                    </div>
                                </div>
                            </motion.form>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-400 bg-white border border-dashed border-gray-300 rounded-xl">
                                <Package size={48} className="mb-4 text-gray-300" />
                                <p className="font-medium">Selecciona un producto para editarlo</p>
                                <p className="text-sm">o crea uno nuevo para agregarlo al catálogo</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
