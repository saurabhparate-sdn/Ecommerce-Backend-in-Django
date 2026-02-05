import React from 'react';
import { Users, ShoppingBag, DollarSign, Activity } from 'lucide-react';

const AdminDashboard = () => {
    // In a real app, fetch stats here
    const stats = [
        { name: 'Total Revenue', value: '$45,231.89', icon: DollarSign, color: 'text-green-600' },
        { name: 'Total Orders', value: '2,345', icon: ShoppingBag, color: 'text-blue-600' },
        { name: 'Active Users', value: '1,230', icon: Users, color: 'text-purple-600' },
        { name: 'Conversion Rate', value: '3.2%', icon: Activity, color: 'text-orange-600' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Overview</h1>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                        <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 bg-white shadow rounded-lg p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="border-t border-gray-200">
                    <p className="py-4 text-gray-500">No recent activity to display.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
