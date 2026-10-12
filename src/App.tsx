import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

// Customer Layout & Pages
import { CustomerLayout } from './features/customer/layout/CustomerLayout';
import { HomePage } from './features/customer/pages/HomePage';
import { SearchPage } from './features/customer/pages/SearchPage';
import { ProductDetailPage } from './features/customer/pages/ProductDetailPage';
import { CartPage } from './features/customer/pages/CartPage';
import { CheckoutPage } from './features/customer/pages/CheckoutPage';
import { OrdersPage } from './features/customer/pages/OrdersPage';
import { OrderDetailPage } from './features/customer/pages/OrderDetailPage';
import { WishlistPage } from './features/customer/pages/WishlistPage';
import { ProfilePage } from './features/customer/pages/ProfilePage';
import { CMSPage } from './features/customer/pages/CMSPage';

// Seller Layout & Pages
import { SellerLayout } from './features/seller/layout/SellerLayout';
import { SellerDashboard } from './features/seller/pages/SellerDashboard';
import { SellerProducts } from './features/seller/pages/SellerProducts';
import { SellerInventory } from './features/seller/pages/SellerInventory';
import { SellerOrders } from './features/seller/pages/SellerOrders';
import { SellerReturns } from './features/seller/pages/SellerReturns';
import { SellerReports } from './features/seller/pages/SellerReports';
import { SellerPayouts } from './features/seller/pages/SellerPayouts';
import { SellerKYC } from './features/seller/pages/SellerKYC';

// Admin Layout & Pages
import { AdminLayout } from './features/admin/layout/AdminLayout';
import { AdminDashboard } from './features/admin/pages/AdminDashboard';
import { AdminSellers } from './features/admin/pages/AdminSellers';
import { AdminCustomers } from './features/admin/pages/AdminCustomers';
import { AdminProducts } from './features/admin/pages/AdminProducts';
import { AdminOrders } from './features/admin/pages/AdminOrders';
import { AdminCommissions } from './features/admin/pages/AdminCommissions';
import { AdminPayouts } from './features/admin/pages/AdminPayouts';
import { AdminCouponsBanners } from './features/admin/pages/AdminCouponsBanners';
import { AdminBroadcast } from './features/admin/pages/AdminBroadcast';

// 404 Fallback Page
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-display font-extrabold text-2xl mb-4">
        404
      </div>
      <h1 className="text-2xl font-bold font-display text-stone-900">Page Not Found</h1>
      <p className="text-xs text-stone-500 mt-2 max-w-sm">
        The destination you are looking for has been moved or does not exist.
      </p>
      <Link to="/" className="mt-6 btn-brand-primary px-6 py-2.5 text-xs inline-flex items-center">
        Return to Marketplace Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* CUSTOMER PORTAL ROUTES */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cms/:page" element={<CMSPage />} />
        </Route>

        {/* SELLER PORTAL ROUTES */}
        <Route path="/seller" element={<SellerLayout />}>
          <Route index element={<Navigate to="/seller/dashboard" replace />} />
          <Route path="dashboard" element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="inventory" element={<SellerInventory />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="returns" element={<SellerReturns />} />
          <Route path="reports" element={<SellerReports />} />
          <Route path="payouts" element={<SellerPayouts />} />
          <Route path="kyc" element={<SellerKYC />} />
        </Route>

        {/* ADMIN PORTAL ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="commissions" element={<AdminCommissions />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="marketing" element={<AdminCouponsBanners />} />
          <Route path="broadcast" element={<AdminBroadcast />} />
        </Route>

        {/* 404 CATCH-ALL */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
