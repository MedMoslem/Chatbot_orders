import axios from 'axios';

const api = axios.create({
    baseURL: 'https://chatbot-orders.onrender.com', // Adjust if backend port is different
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
