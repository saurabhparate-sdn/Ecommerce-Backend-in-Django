import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../../api/orders';
import { Loader2, ArrowLeft } from 'lucide-react';

const OrderDetailPage = () => {
    const { id } = useParams();
    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => getOrderById(id),
    });

    if (isLoading) return <Loader2 className="animate-spin mx-auto mt-20" />;
    if (!order) return <div className="text-center mt-20">Order not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="mb-6">
                 <Link to="/orders" className="text-primary-600 hover:text-primary-700 flex items-center">
                    <ArrowLeft className="mr-1 h-4 w-4" /> Back to Orders
                </Link>
            </div>
            
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {order.order_status}
                    </span>
                </div>

                <div className="border-t border-gray-200 py-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Shipping Address</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                                {order.address.name}<br />
                                {order.address.street}<br />
                                {order.address.city}, {order.address.state} {order.address.zipcode}<br />
                                {order.address.country}
                            </dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                            <dd className={`mt-1 text-sm font-medium ${order.payment_status === 'PAID' ? 'text-green-600' : 'text-gray-900'}`}>
                                {order.payment_status}
                            </dd>
                        </div>
                    </dl>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Items</h3>
                    <div className="flow-root">
                        <ul className="divide-y divide-gray-200 border-b border-t border-gray-200">
                            {order.items.map((item) => (
                                <li key={item.id} className="py-4 flex">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900">{item.product_variant.name}</h4>
                                            <p className="text-sm font-medium text-gray-900">${item.price}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">Qty {item.quantity}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <div className="w-full sm:w-1/3 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>${order.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Discount</span>
                            <span>-${order.discount}</span>
                        </div>
                        <div className="flex justify-between text-base font-medium text-gray-900 border-t border-gray-200 pt-2">
                            <span>Total</span>
                            <span>${order.grand_total}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
