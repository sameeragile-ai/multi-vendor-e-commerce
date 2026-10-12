import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Seller } from '../../../types';
import { DemoRoleSwitcher } from '../../../components/common/DemoRoleSwitcher';
import { ToastContainer } from '../../../components/common/ToastContainer';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingBag,
  RotateCcw,
  BarChart3,
  DollarSign,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Store,
  Menu,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const SellerLayout: React.FC = () => {
  const navigate = useNavigate();
  const { activeSellerId, setActiveSellerId } = useStore();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    async function loadSeller() {
      const sellers = await api.getSellers();
      setAllSellers(sellers);
      const current = sellers.find((s) => s.id === activeSellerId) || sellers[0];
      if (current) {
        setSeller(current);
      }
    }
    loadSeller();
  }, [activeSellerId]);

  const navLinks = [
    { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/seller/products', label: 'Products', icon: Package },
    { to: '/seller/inventory', label: 'Inventory & Alerts', icon: Boxes },
    { to: '/seller/orders', label: 'Order Management', icon: ShoppingBag },
    { to: '/seller/returns', label: 'Returns & Refunds', icon: RotateCcw },
    { to: '/seller/reports', label: 'Sales Reports & CSV', icon: BarChart3 },
    { to: '/seller/payouts', label: 'Commissions & Payouts', icon: DollarSign },
    { to: '/seller/kyc', label: 'KYC & Verification', icon: FileCheck2 },
  ];

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-stone-900 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-stone-900 text-white px-4 py-3 flex items-center justify-between border-b border-stone-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1 text-stone-300 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-bold text-sm">{seller?.businessName || 'Seller Portal'}</span>
          </div>
        </div>

        <Link to="/" className="text-xs text-amber-400 font-semibold flex items-center gap-1">
          <span>Customer View</span>
          <ExternalLink size={12} />
        </Link>
      </header>

      {/* Collapsible Sidebar */}
      <aside
        className={`bg-stone-950 text-stone-300 flex flex-col justify-between transition-all duration-300 shrink-0 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileSidebarOpen
            ? 'fixed inset-y-0 left-0 w-64 block'
            : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-4 sm:p-5 border-b border-stone-800/80 flex items-center justify-between">
            <Link to="/seller/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                <Store size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-wider text-teal-400 font-bold">
                    Seller Workspace
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {APP_CONFIG.brandName}
                  </div>
                </div>
              )}
            </Link>

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex p-1 text-stone-500 hover:text-white rounded-lg transition-colors"
              title="Toggle sidebar"
            >
              {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Active Merchant Selector pill */}
          {!isSidebarCollapsed && seller && (
            <div className="p-4 mx-3 my-3 bg-stone-900 rounded-xl border border-stone-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-stone-400 uppercase font-semibold">Storefront</span>
                {seller.status === 'approved' && (
                  <span className="text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <ShieldCheck size={11} /> Approved
                  </span>
                )}
                {seller.status === 'pending' && (
                  <span className="text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <Clock size={11} /> Pending KYC
                  </span>
                )}
                {seller.status === 'rejected' && (
                  <span className="text-[10px] text-red-400 bg-red-950/80 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                    <AlertTriangle size={11} /> Rejected
                  </span>
                )}
              </div>
              <div className="font-bold text-white truncate">{seller.businessName}</div>

              {/* Demo Switch store button */}
              <div className="mt-2 pt-2 border-t border-stone-800">
                <select
                  value={seller.id}
                  onChange={(e) => setActiveSellerId(e.target.value)}
                  className="w-full bg-stone-800 text-stone-300 text-[11px] font-medium py-1 px-2 rounded border border-stone-700 focus:outline-hidden"
                >
                  {allSellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.businessName} ({s.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-900/40'
                        : 'text-stone-400 hover:text-white hover:bg-stone-900'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={link.label}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{link.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom links */}
        <div className="p-3 border-t border-stone-800 text-xs">
          <Link
            to={`/search?seller=${seller?.id}`}
            className={`flex items-center gap-2.5 px-3 py-2 text-stone-400 hover:text-white hover:bg-stone-900 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <ExternalLink size={16} />
            {!isSidebarCollapsed && <span>View Public Storefront</span>}
          </Link>
          <Link
            to="/"
            className={`flex items-center gap-2.5 px-3 py-2 text-amber-400 hover:text-amber-300 hover:bg-stone-900 rounded-xl font-semibold transition-colors mt-1 ${
              isSidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <Store size={16} />
            {!isSidebarCollapsed && <span>Back to Customer Store</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Sticky Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-stone-200/80 px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-stone-900">
              {seller?.businessName || 'Seller Hub'}
            </h2>
            {seller?.status === 'approved' ? (
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} className="text-teal-600" /> Verified Merchant
              </span>
            ) : seller?.status === 'pending' ? (
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={12} className="text-amber-600" /> Pending KYC Review
              </span>
            ) : (
              <span className="text-[11px] font-bold text-red-800 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle size={12} className="text-red-600" /> KYC Rejected
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              to={`/search?seller=${seller?.id}`}
              className="text-stone-600 hover:text-stone-950 flex items-center gap-1.5 font-medium"
            >
              <span>Preview Storefront</span>
              <ExternalLink size={13} />
            </Link>

            <span className="text-stone-300">|</span>

            <div className="flex items-center gap-2">
              <img
                src={seller?.logo || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-stone-200"
              />
              <span className="font-bold text-stone-800">{seller?.email}</span>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <DemoRoleSwitcher />
      <ToastContainer />
    </div>
  );
};
