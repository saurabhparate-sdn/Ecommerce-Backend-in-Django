import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, updateCartItem, removeCartItem } from '../../api/cart';
import { Link } from 'react-router-dom';
import { Loader2, Trash2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CartPage = () => {
    const queryClient = useQueryClient();
    const { data: cartData, isLoading, error } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, quantity }) => updateCartItem(id, quantity),
        onSuccess: () => queryClient.invalidateQueries(['cart']),
        onError: () => toast.error('Failed to update quantity'),
    });

    const removeMutation = useMutation({
        mutationFn: removeCartItem,
        onSuccess: () => {
            toast.success('Item removed');
            queryClient.invalidateQueries(['cart']);
        },
        onError: () => toast.error('Failed to remove item'),
    });

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-primary-500" /></div>;
    // Handle case where user might not have a cart yet or backend returns different structure
    // Typically backend returns empty cart or list. 
    // Serializer: returns { id, items: [...], ... }
    
    // If error (e.g. 404 cart not found for user), handle gracefully
    if (error) return (
        <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
            <Link to="/shop" className="text-primary-600 hover:text-primary-500">Continue Shopping</Link>
        </div>
    );

    const items = cartData?.[0]?.items || []; // Backend returns a list of carts? OneToOne usually means single obj, but ViewSet behavior matters. 
    // Wait, typical ModelViewSet lists objects. If User-Cart is 1:1, it might return list of 1.
    // Let's assume list for now based on typical Django handling, or adjust if it's SingleObjectMixin.
    // Actually, `CartView` likely returns the user's cart. If `list` method used, it returns array.
    
    const cart = Array.isArray(cartData) ? cartData[0] : cartData;
    const cartItems = cart?.items || [];

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                    Start Shopping
                </Link>
            </div>
        );
    }

    const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                <div className="lg:col-span-7">
                    <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item.id} className="flex py-6">
                                <div className="flex-shrink-0">
                                    {/* Handle missing image logic if needed */}
                                    <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-100">
                                        {/* Ideally pass image via serializer, otherwise placeholder */}
                                        <img 
                                            src="https://via.placeholder.com/150" 
                                            alt={item.product_variant.name} 
                                            className="w-full h-full object-center object-cover" 
                                        />
                                    </div>
                                </div>

                                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                        <div>
                                            <div className="flex justify-between">
                                                <h3 className="text-sm">
                                                    <Link to="#" className="font-medium text-gray-700 hover:text-gray-800">
                                                        {item.product_variant.name}
                                                    </Link>
                                                </h3>
                                            </div>
                                            <div className="mt-1 flex text-sm">
                                                <p className="text-gray-500">SKU: {item.product_variant.sku}</p>
                                            </div>
                                            <p className="mt-1 text-sm font-medium text-gray-900">${item.subtotal}</p>
                                        </div>

                                        <div className="mt-4 sm:mt-0 sm:pr-9">
                                            <div className="flex items-center border border-gray-300 rounded-md w-24">
                                                <button
                                                    onClick={() => {
                                                        if (item.quantity > 1) {
                                                            updateMutation.mutate({ id: item.id, quantity: item.quantity - 1 });
                                                        }
                                                    }}
                                                    className="px-2 py-1 text-gray-600 hover:text-primary-600"
                                                >
                                                    -
                                                </button>
                                                <span className="flex-1 text-center text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateMutation.mutate({ id: item.id, quantity: item.quantity + 1 })}
                                                    className="px-2 py-1 text-gray-600 hover:text-primary-600"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <div className="absolute top-0 right-0">
                                                <button 
                                                    onClick={() => removeMutation.mutate(item.id)}
                                                    className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-5 mt-16 lg:mt-0">
                    <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                        <h2 className="text-lg font-medium text-gray-900">Order summary</h2>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-medium text-gray-900">Order total</dt>
                                <dd className="text-base font-medium text-gray-900">${subtotal.toFixed(2)}</dd>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/checkout"
                                className="w-full bg-primary-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center justify-center"
                            >
                                Checkout <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
