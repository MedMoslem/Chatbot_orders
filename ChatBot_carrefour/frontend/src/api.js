import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // Adjust if backend port is different
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
