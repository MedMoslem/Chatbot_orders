import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, ShoppingCart, Plus, MessageSquare, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import OrderConfirmationModal from './OrderConfirmationModal';
import UserInfoModal from './UserInfoModal';
import OrderSummarySidebar from './OrderSummarySidebar';
import api from '../api';
import { useCart } from '../context/CartContext';

const ChatPage = () => {
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your AI shopping assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [userInfoModalOpen, setUserInfoModalOpen] = useState(false);
    const [currentOrder, setCurrentOrder] = useState({ items: [], total: 0 });
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);

    // Session state
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);

    const { addToCart, cartItems, total } = useCart();

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch sessions on mount
    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await api.get('/sessions');
            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        }
    };

    const loadSession = async (sessionId) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/sessions/${sessionId}/messages`);
            // Map backend messages to frontend format
            const formattedMessages = response.data.map(msg => ({
                text: msg.message,
                sender: msg.role
            }));
            setMessages(formattedMessages);
            setCurrentSessionId(sessionId);
            setLeftSidebarOpen(false); // Close mobile sidebar on selection
        } catch (error) {
            console.error('Error loading session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewSession = () => {
        setMessages([{ text: "Hello! I'm your AI shopping assistant. How can I help you today?", sender: 'ai' }]);
        setCurrentSessionId(null);
        setLeftSidebarOpen(false);
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const payload = {
                message: input,
                session_id: currentSessionId
            };

            const response = await api.post('/smartchat', payload);
            const data = response.data;

            // Update current session ID if it was a new session
            if (data.session_id && data.session_id !== currentSessionId) {
                setCurrentSessionId(data.session_id);
                fetchSessions(); // Refresh list to show new chat title
            }

            // Add AI response
            const aiMessage = {
                text: data.answer,
                sender: 'ai',
                image: data.image // Add image if present
            };
            setMessages(prev => [...prev, aiMessage]);

            // Check for order triggers
            if (data.order) {
                setCurrentOrder({ items: data.items || [], total: data.total || 0 });
                setOrderModalOpen(true);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleConfirmOrder = () => {
        addToCart(currentOrder.items);
        setOrderModalOpen(false);
        setMessages(prev => [...prev, {
            text: `I've added ${currentOrder.items.length} items to your cart. You can proceed to checkout whenever you're ready.`,
            sender: 'ai'
        }]);
        setCurrentOrder({ items: [], total: 0 });
    };

    const handleUserInfoSubmit = async (userInfo) => {
        try {
            await api.post('/create-order', {
                ...userInfo,
                product: currentOrder.items[0]?.name || 'Unknown Product',
                quantity: currentOrder.items[0]?.quantity || 1,
                items: currentOrder.items,
                total: currentOrder.total
            });

            setUserInfoModalOpen(false);
            setMessages(prev => [...prev, {
                text: `Great! Your order has been placed successfully, ${userInfo.name}. We'll send a confirmation to ${userInfo.phone}.`,
                sender: 'ai'
            }]);
            setCurrentOrder({ items: [], total: 0 });
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Failed to create order. Please try again.');
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Left Sidebar - Chat History */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="font-bold text-gray-800">Chats</h2>
                        <button onClick={() => setLeftSidebarOpen(false)} className="lg:hidden p-1 text-gray-500">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4">
                        <button
                            onClick={createNewSession}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 font-medium"
                        >
                            <Plus size={20} />
                            New Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                        {sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => loadSession(session.id)}
                                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${currentSessionId === session.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 text-gray-700'}`}
                            >
                                <MessageSquare size={18} className={currentSessionId === session.id ? 'text-primary' : 'text-gray-400'} />
                                <span className="truncate text-sm font-medium">{session.title || 'New Chat'}</span>
                            </button>
                        ))}
                        {sessions.length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-8">
                                No previous chats
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Cart (Hidden on mobile unless toggled) */}
            <div className={`fixed inset-y-0 right-0 z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <OrderSummarySidebar items={cartItems} total={total} />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-white shadow-xl lg:shadow-none z-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            AI
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">Shopping Assistant</h1>
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/cart" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                            <ShoppingCart size={24} />
                            {cartItems.length > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
                    {messages.map((msg, index) => (
                        <ChatMessage key={index} message={msg} />
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm ml-4">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="relative max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full pl-4 pr-12 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-primary/20"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        AI can make mistakes. Please review your order before confirming.
                    </p>
                </div>
            </div>

            {/* Modals */}
            <OrderConfirmationModal
                isOpen={orderModalOpen}
                onClose={() => setOrderModalOpen(false)}
                onConfirm={handleConfirmOrder}
                items={currentOrder.items}
                total={currentOrder.total}
            />

            <UserInfoModal
                isOpen={userInfoModalOpen}
                onClose={() => setUserInfoModalOpen(false)}
                onSubmit={handleUserInfoSubmit}
            />
        </div>
    );
};

export default ChatPage;
