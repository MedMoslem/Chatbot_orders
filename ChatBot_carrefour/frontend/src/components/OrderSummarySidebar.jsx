import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2 } from 'lucide-react';

const OrderSummarySidebar = ({ items, total, onRemoveItem }) => {
    return (
        <div className="hidden lg:flex flex-col w-80 h-screen bg-white border-l border-gray-100 shadow-sm fixed right-0 top-0 z-10">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <ShoppingBag className="text-primary" size={20} />
                    Current Order
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-center">
                        <ShoppingBag size={48} className="mb-2 opacity-20" />
                        <p className="text-sm">Your cart is empty</p>
                    </div>
                ) : (
                    items.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex justify-between items-start group hover:border-primary/30 transition-colors"
                        >
                            <div>
                                <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                                <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-sm font-semibold text-primary">{item.price ? `$${item.price}` : '-'}</span>
                                {onRemoveItem && (
                                    <button onClick={() => onRemoveItem(index)} className="text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Subtotal</span>
                    <span className="font-medium text-gray-800">{total ? `$${total}` : '-'}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-primary">
                    <span>Total</span>
                    <span>{total ? `$${total}` : '-'}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderSummarySidebar;
