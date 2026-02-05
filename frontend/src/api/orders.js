import api from './axios';

export const createOrder = async (orderData) => {
    // orderData: { address_id, ... }
    const response = await api.post('orders/create/', orderData);
    return response.data;
};

export const getAddresses = async () => {
    const response = await api.get('profile/');
    return response.data?.addresses || []; 
};

export const validateCoupon = async (code) => {
    const response = await api.post(`coupons/${code}/validate/`);
    return response.data;
};

export const initiatePayment = async (orderId) => {
    const response = await api.post('payments/', { order_id: orderId });
    return response.data; // Should return { id: session_id, url: stripe_url }
};

export const getOrders = async () => {
    const response = await api.get('orders/');
    return response.data;
};

export const getOrderById = async (id) => {
    const response = await api.get(`orders/${id}/`);
    return response.data;
};

// Admin Order Logic
export const getAllOrdersAdmin = async () => {
    // Admin list might use same endpoint or filtered? 
    // Usually `OrderListView` returns user's orders.
    // Admin URL might be different or `OrderListView` manages permission.
    // If backend restricts to `get_queryset` filtering `self.request.user`, admin needs special logic.
    // Let's assume standard orders endpoint serves logic based on role, OR we use specific admin endpoint if present.
    // Actually, backend has `OrderListView`. If user is superuser, it should return all.
    const response = await api.get('orders/');
    return response.data;
};

export const updateOrderStatus = async (id, status) => {
    const response = await api.put(`orders/${id}/update-status/`, { status });
    return response.data;
};

export const approveOrder = async (id) => {
    const response = await api.post(`orders/${id}/approve/`);
    return response.data;
};
