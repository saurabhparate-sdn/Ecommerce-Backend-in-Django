import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/auth/', // Matches backend URL prefix
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration (optional basic setup)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Handle token refresh logic here if implemented in backend
            // For now, logout on 401
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;
