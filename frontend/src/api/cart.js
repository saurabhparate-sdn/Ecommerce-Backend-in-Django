import api from './axios';

export const getCart = async () => {
    const response = await api.get('cart/');
    return response.data;
};

export const addToCart = async (data) => {
    // data: { product_variant_id, quantity }
    const response = await api.post('cart/add/', data);
    return response.data;
};

export const updateCartItem = async (id, quantity) => {
    const response = await api.put(`cart/update/${id}/`, { quantity });
    return response.data;
};

export const removeCartItem = async (id) => {
    const response = await api.delete(`cart/remove/${id}/`);
    return response.data;
};
