import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    const addToCart = (items) => {
        setCartItems(prev => [...prev, ...items]);
        // Simple total calculation if price exists, otherwise just keep existing total logic
        const newTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
        setTotal(prev => prev + newTotal);
    };

    const removeFromCart = (index) => {
        setCartItems(prev => {
            const newItems = [...prev];
            const removedItem = newItems.splice(index, 1)[0];
            if (removedItem) {
                setTotal(current => Math.max(0, current - (removedItem.price || 0) * (removedItem.quantity || 1)));
            }
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setTotal(0);
    };

    return (
        <CartContext.Provider value={{ cartItems, total, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
