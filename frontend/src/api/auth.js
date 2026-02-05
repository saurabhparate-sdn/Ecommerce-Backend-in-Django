import api from './axios';

export const login = async (credentials) => {
    // credentials: { username, password }
    const response = await api.post('login/', credentials);
    return response.data;
};

export const register = async (userData) => {
    // userData: { username, email, password, first_name, last_name, phone_number, role, etc }
    const response = await api.post('register/', userData);
    return response.data;
};

export const logout = async () => {
    const response = await api.post('logout/');
    return response.data;
};

export const getUserProfile = async () => {
    const response = await api.get('profile/');
    return response.data;
};
