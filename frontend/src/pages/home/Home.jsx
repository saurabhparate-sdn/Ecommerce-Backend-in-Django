import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories } from '../../api/products';
import ProductCard from '../../components/products/ProductCard';
import { Link } from 'react-router-dom';
import { Loader2, ArrowRight, Truck, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    // Fetch Featured/Latest Products
    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products', 'latest'],
        queryFn: () => getProducts({ page: 1 }), 
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    if (isLoading) return <div className="h-screen flex justify-center items-center"><Loader2 className="animate-spin h-10 w-10 text-primary-600" /></div>;
    if (error) return <div className="text-center p-20">Error loading data.</div>;

    const featuredProducts = products?.results?.slice(0, 4) || [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        className="w-full h-full object-cover scale-105"
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Hero background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/40" />
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left w-full mt-16">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="block text-primary-400 font-bold tracking-wider uppercase text-sm mb-4">Summer Collection 2026</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                            Elevate Your <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Style Game</span>
                        </h1>
                        <p className="mt-4 text-xl text-gray-300 max-w-2xl mb-10 font-light leading-relaxed">
                            Discover premium essentials crafted for the modern individual. Quality meets aesthetic in our latest drop.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/shop"
                                className="inline-flex justify-center items-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-gray-900 bg-white hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-white/20"
                            >
                                Shop Collection
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex justify-center items-center px-8 py-4 border border-white/30 backdrop-blur-sm text-lg font-bold rounded-full text-white hover:bg-white/10 transition-all duration-300"
                            >
                                View Lookbook
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Banner */}
            <div className="bg-white py-12 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Truck, title: "Free Shipping", desc: "On all orders over $100" },
                            { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected payments" },
                            { icon: RefreshCw, title: "30 Days Return", desc: "No questions asked" },
                            { icon: Clock, title: "24/7 Support", desc: "Dedicated support team" }
                        ].map((feature, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="p-3 bg-primary-50 text-primary-600 rounded-full">
                                    <feature.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{feature.title}</h3>
                                    <p className="text-sm text-gray-500">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Categories Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Shop by Category</h2>
                        <div className="h-1 w-20 bg-primary-500 mx-auto rounded-full"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories?.results?.slice(0, 3).map((cat, idx) => (
                            <motion.div 
                                key={cat.id} 
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.2 }}
                                className={`group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-lg ${idx === 0 ? 'lg:col-span-2' : ''}`}
                            >
                                <div className="absolute inset-0 bg-gray-900/30 group-hover:bg-gray-900/40 transition-colors z-10" />
                                <img 
                                    src={cat.image || `https://source.unsplash.com/random/800x600?${cat.name}`} 
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt={cat.name} 
                                />
                                <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                                    <h3 className="text-3xl font-bold text-white mb-2">{cat.name}</h3>
                                    <Link to={`/shop?category=${cat.id}`} className="inline-flex items-center text-white font-medium hover:underline">
                                        Explore <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        )) || <p>Loading categories...</p>}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Trending Now</h2>
                            <p className="mt-2 text-gray-500">Handpicked items just for you</p>
                        </div>
                        <Link to="/shop" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-bold text-lg transition-colors">
                            View All <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                    
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-8"
                    >
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </motion.div>

                    <div className="mt-12 text-center sm:hidden">
                         <Link to="/shop" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 uppercase tracking-wider">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary-600 opacity-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-600 opacity-20 blur-3xl"></div>
                
                <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay in the loop</h2>
                    <p className="text-gray-400 mb-10 text-lg">Subscribe to our newsletter to get exclusive offers and the latest news delivered right to your inbox.</p>
                    <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
                        <input 
                            type="email" 
                            placeholder="Enter your email" 
                            className="flex-1 px-6 py-4 rounded-full bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary-500 text-white placeholder-gray-500"
                        />
                        <button className="px-8 py-4 bg-primary-600 hover:bg-primary-700 rounded-full font-bold text-white transition-colors shadow-lg shadow-primary-600/30">
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default Home;
