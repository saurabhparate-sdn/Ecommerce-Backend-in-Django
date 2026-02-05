import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ShoppingCart, User, Menu, X, LogOut, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileOpen(false);
    };

    return (
        <motion.nav 
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass shadow-sm py-2' : 'bg-transparent py-4'}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center group">
                        <div className="w-10 h-10 bg-primary-600 rounded-br-2xl rounded-tl-2xl flex items-center justify-center mr-2 group-hover:rotate-12 transition-transform duration-300">
                             <span className="text-white font-bold text-xl">L</span>
                        </div>
                        <span className={`text-2xl font-bold tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-gray-900'}`}>
                            Luxe<span className="text-primary-600">Commerce</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex space-x-8">
                        {['Home', 'Shop', 'About'].map((item) => (
                            <Link 
                                key={item}
                                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`} 
                                className="relative text-gray-700 hover:text-primary-600 font-medium transition-colors group"
                            >
                                {item}
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                    </div>

                    {/* Right Side Icons */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button className="text-gray-500 hover:text-primary-600 transition-colors">
                            <Search className="w-5 h-5" />
                        </button>
                        
                        <Link to="/cart" className="relative text-gray-500 hover:text-primary-600 transition-colors">
                            <ShoppingCart className="w-5 h-5" />
                             {/* Badge Placeholder */}
                             {/* <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span> */}
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 py-2 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                                            </div>
                                            <Link to="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                                                <User size={16} className="mr-3 text-gray-400" /> Profile
                                            </Link>
                                            <Link to="/orders" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors">
                                                <ShoppingBag size={16} className="mr-3 text-gray-400" /> Orders
                                            </Link>
                                            <div className="border-t border-gray-100 mt-1"></div>
                                            <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <LogOut size={16} className="mr-3" /> Sign out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="text-gray-700 font-medium hover:text-primary-600 transition-colors">Login</Link>
                                <Link to="/register" className="bg-primary-600 text-white px-5 py-2 rounded-full font-medium hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all hover:scale-105 active:scale-95">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-600 hover:text-primary-600 focus:outline-none"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {['Home', 'Shop', 'About', 'Cart'].map((item) => (
                                <Link 
                                    key={item}
                                    to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                    className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                                >
                                    {item}
                                </Link>
                            ))}
                            <div className="border-t border-gray-100 my-2 pt-2">
                                {isAuthenticated ? (
                                    <>
                                        <Link to="/profile" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">My Profile</Link>
                                        <button onClick={handleLogout} className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Sign Out</button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 mt-2">
                                        <Link to="/login" className="flex justify-center py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium bg-white">Login</Link>
                                        <Link to="/register" className="flex justify-center py-2.5 bg-primary-600 rounded-lg text-white font-medium">Sign Up</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

// Helper for icon
const ShoppingBag = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
);

export default Navbar;
