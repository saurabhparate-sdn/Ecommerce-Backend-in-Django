import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">LuxeCommerce</h3>
                        <p className="text-gray-400 text-sm">
                            Premium products for your lifestyle. Quality guaranteed.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Shop</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/shop" className="hover:text-white transition">All Products</Link></li>
                            <li><Link to="/shop?category=featured" className="hover:text-white transition">Featured</Link></li>
                            <li><Link to="/shop?category=new" className="hover:text-white transition">New Arrivals</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition">FAQ</Link></li>
                            <li><Link to="/shipping" className="hover:text-white transition">Shipping & Returns</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">Stay Connected</h4>
                        <div className="flex space-x-4">
                            {/* Social Icons Placeholders */}
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                                <span className="sr-only">Facebook</span>
                                <div className="w-5 h-5 bg-gray-500 rounded-full"></div> 
                            </a>
                            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                                <span className="sr-only">Instagram</span>
                                <div className="w-5 h-5 bg-gray-500 rounded-full"></div>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} LuxeCommerce. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
