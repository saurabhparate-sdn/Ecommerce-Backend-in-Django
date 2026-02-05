import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, ShoppingBag, Users, Folder, LogOut, Tags } from 'lucide-react';

const AdminLayout = () => {
    const { logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <span className="text-xl font-bold tracking-tight">Luxe Admin</span>
                </div>
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-2">
                        <li>
                            <Link to="/admin" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                                <LayoutDashboard className="h-5 w-5 mr-3" />
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/products" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                                <ShoppingBag className="h-5 w-5 mr-3" />
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/categories" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                                <Folder className="h-5 w-5 mr-3" />
                                Categories
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/orders" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                                <Folder className="h-5 w-5 mr-3" /> {/* FileText icon fallback */}
                                Orders
                            </Link>
                        </li>
                        <li>
                            <Link to="/admin/users" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                                <Users className="h-5 w-5 mr-3" />
                                Users
                            </Link>
                        </li>
                         <li>
                            <Link to="/admin/coupons" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors">
                                <Tags className="h-5 w-5 mr-3" />
                                Coupons
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-800">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">Admin Mode</span>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">A</div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
