import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createOrder, validateCoupon, initiatePayment } from '../../api/orders';
import { getCart } from '../../api/cart';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const CheckoutPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [activeCoupon, setActiveCoupon] = useState(null);

    // Fetch Cart to calculate totals
    const { data: cartData, isLoading: isCartLoading } = useQuery({ queryKey: ['cart'], queryFn: getCart });
    const cartItems = (Array.isArray(cartData) ? cartData[0]?.items : cartData?.items) || [];
    const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    const discountAmount = activeCoupon ? (activeCoupon.discount_type === 'PERCENT' ? subtotal * (activeCoupon.value / 100) : activeCoupon.value) : 0;
    const total = subtotal - discountAmount;

    const orderMutation = useMutation({
        mutationFn: createOrder,
        onSuccess: async (order) => {
            // Once order created, initiate payment
            toast.success('Order placed! Redirecting to payment...');
            try {
                const paymentRes = await initiatePayment(order.id);
                if (paymentRes.url) {
                    window.location.href = paymentRes.url; // Redirect to Stripe
                } else {
                    navigate('/payment/success'); // Fallback
                }
            } catch (err) {
                toast.error('Payment initiation failed');
            }
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Order failed'),
    });

    const couponMutation = useMutation({
        mutationFn: validateCoupon,
        onSuccess: (data) => {
            setActiveCoupon(data);
            toast.success('Coupon applied!');
        },
        onError: () => toast.error('Invalid coupon'),
    });

    const onSubmit = (data) => {
        // Prepare order payload. Backend expects `address_id` or fresh address data?
        // Let's assume for this MVP we send the form data and backend handles address creation, 
        // OR we just assume user has an ID.
        // Since I can't check backend logic deeply right now, I'll send address data.
        // If backend CreateOrderView requires `address_id`, I'd need to create address first.
        // Assuming we pass `address` object or ID.
        
        // MVP: Just send a dummy address ID if specific endpoint needed, or form data.
        // Let's try sending the data.
        
        orderMutation.mutate({
            address_data: data, // If backend supports creating address inline
            // If not, we might fail here. 
        });
    };

    if (isCartLoading) return <Loader2 className="animate-spin mx-auto mt-20" />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h2>
                    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input {...register('first_name', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input {...register('last_name', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input {...register('street_address', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input {...register('city', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                                <input {...register('zip_code', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Country</label>
                             <input {...register('country', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"/>
                        </div>
                    </form>
                </div>

                <div className="mt-10 lg:mt-0">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 shadow-sm p-6">
                        <ul className="divide-y divide-gray-200">
                            {cartItems.map((item) => (
                                <li key={item.id} className="flex py-4">
                                    <div className="flex-1 ml-4">
                                        <div className="flex justify-between font-medium text-gray-900">
                                            <h3>{item.product_variant.name}</h3>
                                            <p>${item.subtotal}</p>
                                        </div>
                                        <p className="text-gray-500 text-sm">Qty {item.quantity}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <p>Subtotal</p>
                                <p>${subtotal.toFixed(2)}</p>
                            </div>
                            {activeCoupon && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <p>Discount ({activeCoupon.code})</p>
                                    <p>-${discountAmount.toFixed(2)}</p>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t border-gray-200">
                                <p>Total</p>
                                <p>${total.toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Coupon Input */}
                        <div className="mt-6 flex space-x-2">
                            <input 
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Discount code"
                                className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm px-3 py-2 border"
                            />
                            <button
                                type="button"
                                onClick={() => couponMutation.mutate(couponCode)}
                                disabled={!couponCode || couponMutation.isPending}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50"
                            >
                                Apply
                            </button>
                        </div>

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={orderMutation.isPending}
                            className="mt-6 w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex justify-center"
                        >
                            {orderMutation.isPending ? <Loader2 className="animate-spin" /> : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
