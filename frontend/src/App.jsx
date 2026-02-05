import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProductListPage from './pages/products/ProductListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import ProfilePage from './pages/profile/ProfilePage';
import OrderDetailPage from './pages/orders/OrderDetailPage';
import Home from './pages/home/Home';
import MainLayout from './layouts/MainLayout';
import PageTransition from './components/layout/PageTransition';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductList from './pages/admin/AdminProductList';

// Separate component to handle location-based animations
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />
        
        {/* Customer Routes */}
        <Route path="/" element={<MainLayout><PageTransition><Home /></PageTransition></MainLayout>} />
        <Route path="/shop" element={<MainLayout><PageTransition><ProductListPage /></PageTransition></MainLayout>} />
        <Route path="/product/:id" element={<MainLayout><PageTransition><ProductDetailPage /></PageTransition></MainLayout>} />
        
        {/* Protected Customer Routes */}
        <Route path="/cart" element={<MainLayout><PageTransition><CartPage /></PageTransition></MainLayout>} />
        <Route path="/checkout" element={<MainLayout><PageTransition><CheckoutPage /></PageTransition></MainLayout>} />
        <Route path="/profile" element={<MainLayout><PageTransition><ProfilePage /></PageTransition></MainLayout>} />
        <Route path="/orders" element={<Navigate to="/profile" replace />} /> 
        <Route path="/orders/:id" element={<MainLayout><PageTransition><OrderDetailPage /></PageTransition></MainLayout>} />

        {/* Admin Routes - AdminLayout handles its own structure, maybe less transiton needed there or internal */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductList />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" />
      <AnimatedRoutes />
    </Router>
  );
};

export default App;
