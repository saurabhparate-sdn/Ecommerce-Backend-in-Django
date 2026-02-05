import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, getCategories, getBrands } from '../../api/products';
import ProductCard from '../../components/products/ProductCard';
import { Loader2, Search, Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductListPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || '');
    const [page, setPage] = useState(1);
    
    useEffect(() => {
        setSearch(searchParams.get('search') || '');
        setSelectedCategory(searchParams.get('category') || '');
        setSelectedBrand(searchParams.get('brand') || '');
        setPage(1); 
    }, [searchParams]);

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const { data: productsData, isLoading } = useQuery({
        queryKey: ['products', search, selectedCategory, selectedBrand, page],
        queryFn: () => getProducts({ 
            search, 
            category: selectedCategory, 
            brand: selectedBrand, 
            page 
        }),
        keepPreviousData: true,
    });

    const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories });
    const { data: brands } = useQuery({ queryKey: ['brands'], queryFn: getBrands });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1 
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
                <div className="relative max-w-xs w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar */}
                <div className="w-full lg:w-64 space-y-8 flex-shrink-0">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center border-b pb-2"><Filter size={18} className="mr-2"/> Filters</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select 
                                    value={selectedCategory} 
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                >
                                    <option value="">All Categories</option>
                                    {categories?.results?.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                                <select 
                                    value={selectedBrand} 
                                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                >
                                    <option value="">All Brands</option>
                                    {brands?.results?.map((brand) => (
                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex justify-center h-64 items-center">
                            <Loader2 className="animate-spin h-10 w-10 text-primary-500" />
                        </div>
                    ) : productsData?.results?.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500">No products found matching your criteria.</p>
                            <button 
                                onClick={() => setSearchParams({})} 
                                className="mt-4 text-primary-600 hover:text-primary-500 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {productsData?.results?.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </motion.div>
                    )}
                    
                    {/* Pagination */}
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            disabled={!productsData?.previous}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700 font-medium">Page {page}</span>
                        <button
                            disabled={!productsData?.next}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListPage;
