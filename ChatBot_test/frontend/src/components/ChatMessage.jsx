import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';

const ChatMessage = ({ message }) => {
    const isUser = message.sender === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-gray-200' : 'bg-primary text-white'}`}>
                    {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isUser
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                        }`}
                >
                    {message.image && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                            <img
                                src={message.image}
                                alt="Product"
                                className="w-full h-auto max-w-[200px] object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.text}</div>
                </div>
            </div>
        </motion.div>
    );
};

export default ChatMessage;
