import api from './axios';

// Products
export const getProducts = async (params) => {
    // params: { search, category, brand, min_price, max_price, page }
    const response = await api.get('products/', { params });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`products/${id}/`);
    return response.data;
};

export const getProductVariants = async (id) => {
    const response = await api.get(`products/${id}/variants/`);
    return response.data;
};

// Categories & Brands
export const getCategories = async () => {
    const response = await api.get('categories/');
    return response.data;
};

export const getBrands = async () => {
    const response = await api.get('brands/');
    return response.data;
};

// Reviews
export const getProductReviews = async (id) => {
    const response = await api.get(`product/${id}/reviews/`);
    return response.data;
};

export const createReview = async (id, data) => {
    const response = await api.post(`product/${id}/reviews/`, data);
    return response.data;
};
