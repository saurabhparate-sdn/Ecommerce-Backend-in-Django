import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    // Helper to get image URL safely
    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/300';
        if (img.startsWith('http')) return img;
        return `http://localhost:8000${img}`; 
    };

    const imageUrl = product.images && product.images.length > 0 
        ? getImageUrl(product.images[0].image_url) 
        : 'https://via.placeholder.com/300';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
        >
            <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-100 xl:aspect-w-7 xl:aspect-h-8">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-in-out"
                />
                
                {/* Badges */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    New
                </span>

                {/* Overlay Action Buttons */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                    <button className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-primary-600 hover:text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                         <ShoppingCart size={18} />
                    </button>
                    <Link to={`/product/${product.id}`} className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-primary-600 hover:text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100">
                         <Eye size={18} />
                    </Link>
                    <button className="bg-white text-gray-900 p-3 rounded-full shadow-lg hover:bg-red-500 hover:text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150">
                         <Heart size={18} />
                    </button>
                </div>
            </div>
            
            <div className="p-5">
                <p className="text-secondary-500 text-xs font-semibold tracking-wide uppercase mb-1 text-gray-500">{product.brand}</p>
                <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 truncate hover:text-primary-600 transition-colors">{product.name}</h3>
                </Link>
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-xl font-extrabold text-gray-900">${product.base_price}</p>
                    <div className="flex items-center text-xs text-yellow-500 font-medium">
                        <svg className="w-4 h-4 fill-current mr-1" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                        4.8 (120)
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
