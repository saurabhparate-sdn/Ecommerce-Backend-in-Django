import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../../api/auth';
import { getOrders } from '../../api/orders';
import { Link } from 'react-router-dom';
import { Loader2, User, Package, MapPin, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const ProfilePage = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: getUserProfile,
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'text-green-600 bg-green-100';
            case 'SHIPPED': return 'text-blue-600 bg-blue-100';
            case 'CANCELLED': return 'text-red-600 bg-red-100';
            default: return 'text-yellow-600 bg-yellow-100';
        }
    };

    if (profileLoading) return <Loader2 className="animate-spin mx-auto mt-20" />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Account</h1>
            
            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                {/* Sidebar */}
                <aside className="lg:col-span-3 mb-8 lg:mb-0">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`${activeTab === 'profile' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2 text-sm font-medium w-full rounded-r-md`}
                        >
                            <User className="mr-3 h-5 w-5 flex-shrink-0" />
                            Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`${activeTab === 'orders' ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} group flex items-center px-3 py-2 text-sm font-medium w-full rounded-r-md`}
                        >
                            <Package className="mr-3 h-5 w-5 flex-shrink-0" />
                            Orders
                        </button>
                    </nav>
                </aside>

                {/* Content */}
                <div className="lg:col-span-9">
                    {activeTab === 'profile' && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application status.</p>
                            </div>
                            <div className="border-t border-gray-200">
                                <dl>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Full name</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.first_name} {user?.last_name}</dd>
                                    </div>
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Username</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.username}</dd>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Email address</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user?.email}</dd>
                                    </div>
                                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                        <dt className="text-sm font-medium text-gray-500">Phone number</dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{profile?.phone_number || 'N/A'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-6">
                            <h2 className="text-lg leading-6 font-medium text-gray-900">Order History</h2>
                            {ordersLoading ? <Loader2 className="animate-spin" /> : orders?.length === 0 ? (
                                <p className="text-gray-500">No orders found.</p>
                            ) : (
                                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                                    <ul className="divide-y divide-gray-200">
                                        {orders?.map((order) => (
                                            <li key={order.id}>
                                                <Link to={`/orders/${order.id}`} className="block hover:bg-gray-50">
                                                    <div className="px-4 py-4 sm:px-6">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <p className="text-sm font-medium text-primary-600 truncate">
                                                                    Order #{order.id}
                                                                </p>
                                                                <p className="text-sm text-gray-500 mt-1">
                                                                    Placed on {new Date(order.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.order_status)}`}>
                                                                    {order.order_status}
                                                                </span>
                                                                <ChevronRight className="ml-2 h-5 w-5 text-gray-400" />
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 text-sm text-gray-900">
                                                            Total: <span className="font-medium">${order.grand_total}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
