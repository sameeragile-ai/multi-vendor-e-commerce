import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../../components/common/Header';
import { Footer } from '../../../components/common/Footer';
import { MobileNav } from './MobileNav';
import { CartDrawer } from './CartDrawer';
import { CompareDrawer } from '../components/CompareDrawer';
import { DemoRoleSwitcher } from '../../../components/common/DemoRoleSwitcher';
import { ToastContainer } from '../../../components/common/ToastContainer';

export const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 pb-16 md:pb-0">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Overlays and floating controls */}
      <CartDrawer />
      <CompareDrawer />
      <DemoRoleSwitcher />
      <MobileNav />
      <ToastContainer />
    </div>
  );
};
