import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart } from 'lucide-react';

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm, items, total }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <ShoppingCart size={18} className="text-primary" />
                            Confirm Order
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-6">
                        <p className="text-gray-600 mb-4 text-sm">Please review your order details below:</p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                            {items.map((item, index) => (
                                <div key={index} className="flex justify-between py-2 border-b border-gray-200 last:border-0 text-sm">
                                    <span className="text-gray-800 font-medium">{item.name} <span className="text-gray-400 text-xs">x{item.quantity}</span></span>
                                    <span className="text-gray-600">{item.price ? `$${item.price}` : '-'}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mb-6 text-lg font-bold text-gray-800">
                            <span>Total</span>
                            <span>{total ? `$${total}` : 'Calculated at checkout'}</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                            >
                                Confirm Order
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default OrderConfirmationModal;
