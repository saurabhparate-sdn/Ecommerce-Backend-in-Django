import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductById, getProductReviews } from '../../api/products';
import { useAuthStore } from '../../store/authStore';
import { Loader2, Star, ShoppingCart, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios'; // Direct API for cart add to avoid circular dep for now

const ProductDetailPage = () => {
    const { id } = useParams();
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();
    
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(0);

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', id],
        queryFn: () => getProductById(id),
    });

    const { data: reviews } = useQuery({
        queryKey: ['reviews', id],
        queryFn: () => getProductReviews(id),
        enabled: !!id
    });

    const addToCartMutation = useMutation({
        mutationFn: async (data) => {
            // data: { product_variant_id, quantity }
            const res = await api.post('cart/add/', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Added to cart!');
            queryClient.invalidateQueries(['cart']);
        },
        onError: (err) => {
            toast.error(err.response?.data?.error || 'Failed to add to cart');
        }
    });

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10" /></div>;
    if (error || !product) return <div className="text-center p-20">Product not found</div>;

    // Helper to handle variants
    // Assuming product.variants is array of { id, name, price, stock, sku }
    const variants = product.variants || [];
    const currentVariant = selectedVariant || (variants.length > 0 ? variants[0] : null);
    
    // Determine price dynamically based on variant
    const currentPrice = currentVariant ? currentVariant.price : product.base_price;
    const isOutOfStock = currentVariant ? currentVariant.stock < 1 : product.stock < 1;

    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast.error('Please login to add to cart');
            return;
        }
        if (!currentVariant && variants.length > 0) {
            toast.error('Please select a variant'); // Should be pre-selected though
            return;
        }
        
        // If product has no variants, backend might need handling or just use product ID? 
        // Based on models, CartItem needs `product_variant`. So products MUST have variants? 
        // Reading models: `cart_item` matches `product_variant`. 
        // So every product must have at least one variant (e.g. 'Default').
        
        if (!currentVariant) {
            toast.error('No variant available for this product');
            return;
        }

        addToCartMutation.mutate({
            product_variant_id: currentVariant.id,
            quantity
        });
    };

    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/500';
        if (img.startsWith('http')) return img;
        return `http://localhost:8000${img}`; 
    };

    const images = product.images && product.images.length > 0 ? product.images : [{ image_url: null }];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                {/* Image Gallery */}
                <div className="flex flex-col">
                    <div className="aspect-w-1 aspect-h-1 w-full bg-gray-100 rounded-lg overflow-hidden sm:aspect-h-3 sm:aspect-w-4">
                         <img
                            src={getImageUrl(images[activeImage]?.image_url)}
                            alt={product.name}
                            className="w-full h-full object-center object-cover"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-2">
                            {images.map((img, idx) => (
                                <button
                                    key={img.id || idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative rounded-md overflow-hidden aspect-w-1 aspect-h-1 ${activeImage === idx ? 'ring-2 ring-primary-500' : ''}`}
                                >
                                    <img src={getImageUrl(img.image_url)} alt="" className="object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product.name}</h1>
                    <div className="mt-3">
                        <h2 className="sr-only">Product information</h2>
                        <p className="text-3xl text-gray-900">${currentPrice}</p>
                    </div>

                    {/* Reviews Summary */}
                    <div className="mt-3">
                         {/* Placeholder for star rating UI */}
                         <div className="flex items-center">
                             <div className="flex items-center text-yellow-400">
                                 {[0, 1, 2, 3, 4].map((rating) => (
                                     <Star key={rating} className="h-5 w-5 fill-current" />
                                 ))}
                             </div>
                             <p className="sr-only">4 out of 5 stars</p>
                             <span className="ml-3 text-sm text-gray-500">{reviews?.length || 0} reviews</span>
                         </div>
                    </div>

                    <div className="mt-6">
                        <div className="space-y-6 text-base text-gray-700" dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>

                    <div className="mt-8 border-t border-gray-200 pt-8">
                        {/* Variant Selector */}
                        {variants.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-900">Options</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => setSelectedVariant(v)}
                                            className={`px-4 py-2 border rounded-md text-sm font-medium ${
                                                (selectedVariant?.id === v.id || (!selectedVariant && v === variants[0]))
                                                ? 'border-primary-500 text-primary-600 bg-primary-50'
                                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            {v.name} - ${v.price}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center border border-gray-300 rounded-md">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2 text-gray-600 hover:text-primary-600"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="px-4 py-2 text-gray-900 font-medium">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="p-2 text-gray-600 hover:text-primary-600"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || addToCartMutation.isPending}
                                className="flex-1 bg-primary-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {addToCartMutation.isPending ? <Loader2 className="animate-spin" /> : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
