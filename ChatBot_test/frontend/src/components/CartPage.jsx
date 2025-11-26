import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, CreditCard, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

const CartPage = () => {
    const { cartItems, total, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsCheckingOut(true);

        // Simulate payment processing
        setTimeout(async () => {
            try {
                // Create order in backend
                await api.post('/create-order', {
                    product: cartItems.map(i => i.name).join(', '), // Legacy support
                    quantity: cartItems.reduce((acc, i) => acc + i.quantity, 0), // Legacy support
                    items: cartItems,
                    total: total,
                    name: formData.name,
                    // Add other info if needed or collected previously
                });

                setPaymentSuccess(true);
                clearCart();
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } catch (error) {
                console.error("Payment failed", error);
                alert("Payment failed. Please try again.");
            } finally {
                setIsCheckingOut(false);
            }
        }, 2000);
    };

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">Your order has been confirmed. Redirecting you back to chat...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Chat
                </Link>

                <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl shadow-sm text-center">
                                <p className="text-gray-500">Your cart is empty.</p>
                                <Link to="/" className="text-primary font-medium mt-2 inline-block">Start shopping</Link>
                            </div>
                        ) : (
                            cartItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                            🛍️
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="font-bold text-gray-800">${item.price || 0}</span>
                                        <button
                                            onClick={() => removeFromCart(index)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-8">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <CreditCard className="text-primary" />
                                Payment Details
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax (5%)</span>
                                    <span>${(total * 0.05).toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-gray-800">
                                    <span>Total</span>
                                    <span>${(total * 1.05).toFixed(2)}</span>
                                </div>
                            </div>

                            <form onSubmit={handlePayment} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Cardholder Name</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Card Number</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="0000 0000 0000 0000"
                                        value={formData.cardNumber}
                                        onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Expiry</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="MM/YY"
                                            value={formData.expiry}
                                            onChange={e => setFormData({ ...formData, expiry: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">CVC</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            placeholder="123"
                                            value={formData.cvc}
                                            onChange={e => setFormData({ ...formData, cvc: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCheckingOut || cartItems.length === 0}
                                    className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                                >
                                    {isCheckingOut ? 'Processing...' : `Pay $${(total * 1.05).toFixed(2)}`}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
