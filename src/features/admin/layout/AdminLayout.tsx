import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../../store';
import { DemoRoleSwitcher } from '../../../components/common/DemoRoleSwitcher';
import { ToastContainer } from '../../../components/common/ToastContainer';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Store,
  Package,
  ShoppingBag,
  Percent,
  DollarSign,
  TicketPercent,
  Radio,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Menu,
  Lock,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const { adminTier, setAdminTier, addToast } = useStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Define nav links with minimum required role permission
  const navItems = [
    {
      to: '/admin/dashboard',
      label: 'Overview & Health',
      icon: LayoutDashboard,
      allowed: ['super_admin', 'ops', 'support'],
    },
    {
      to: '/admin/sellers',
      label: 'Sellers & KYC Audits',
      icon: Store,
      allowed: ['super_admin', 'ops'],
    },
    {
      to: '/admin/customers',
      label: 'Customer Accounts',
      icon: Users,
      allowed: ['super_admin', 'ops', 'support'],
    },
    {
      to: '/admin/products',
      label: 'Products & Moderation',
      icon: Package,
      allowed: ['super_admin', 'ops', 'support'],
    },
    {
      to: '/admin/orders',
      label: 'Platform Orders',
      icon: ShoppingBag,
      allowed: ['super_admin', 'ops', 'support'],
    },
    {
      to: '/admin/commissions',
      label: 'Commission Rules',
      icon: Percent,
      allowed: ['super_admin'],
    },
    {
      to: '/admin/payouts',
      label: 'Seller Payouts',
      icon: DollarSign,
      allowed: ['super_admin'],
    },
    {
      to: '/admin/marketing',
      label: 'Coupons & Banners',
      icon: TicketPercent,
      allowed: ['super_admin', 'ops'],
    },
    {
      to: '/admin/broadcast',
      label: 'Broadcast Alerts',
      icon: Radio,
      allowed: ['super_admin', 'ops'],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F4F0] text-stone-900 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-stone-950 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1 text-stone-300 hover:text-white"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="font-bold text-sm">Governance Console</span>
          </div>
        </div>

        <Link to="/" className="text-xs text-amber-400 font-semibold flex items-center gap-1">
          <span>Exit Admin</span>
          <ExternalLink size={12} />
        </Link>
      </header>

      {/* Collapsible Admin Sidebar */}
      <aside
        className={`bg-stone-950 text-stone-300 flex flex-col justify-between transition-all duration-300 shrink-0 z-30 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${isMobileMenuOpen ? 'fixed inset-y-0 left-0 w-64 block' : 'hidden md:flex'}`}
      >
        <div>
          {/* Logo & Title */}
          <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between">
            <Link to="/admin/dashboard" className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                <ShieldCheck size={18} />
              </div>
              {!isSidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">
                    Platform Admin
                  </div>
                  <div className="text-sm font-bold text-white truncate">
                    {APP_CONFIG.brandName} Governance
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

          {/* Admin Role Permission Tier Switcher */}
          {!isSidebarCollapsed && (
            <div className="p-3.5 mx-3 my-3 bg-stone-900 rounded-xl border border-stone-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">
                  Admin Tier
                </span>
                <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono font-bold capitalize">
                  {adminTier.replace('_', ' ')}
                </span>
              </div>

              <select
                value={adminTier}
                onChange={(e) => {
                  setAdminTier(e.target.value as any);
                  addToast({
                    type: 'info',
                    message: `Admin scope switched to: ${e.target.value.toUpperCase()}`,
                  });
                }}
                className="w-full bg-stone-800 text-stone-200 text-xs font-semibold py-1.5 px-2 rounded-lg border border-stone-700 focus:outline-hidden"
              >
                <option value="super_admin">Super Admin (All Privileges)</option>
                <option value="ops">Operations (Catalog & KYC)</option>
                <option value="support">Customer Support (Read-Only)</option>
              </select>
            </div>
          )}

          {/* Nav Items */}
          <nav className="p-3 space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isAllowed = item.allowed.includes(adminTier);

              if (!isAllowed) {
                // If not allowed, show locked or hide per role-based instructions
                return (
                  <div
                    key={item.to}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-stone-600 cursor-not-allowed select-none ${
                      isSidebarCollapsed ? 'justify-center px-0' : ''
                    }`}
                    title={`Restricted to ${item.allowed.join(' / ').replace(/_/g, ' ')}`}
                  >
                    <Icon size={18} className="shrink-0 opacity-40" />
                    {!isSidebarCollapsed && (
                      <span className="truncate flex items-center justify-between flex-1">
                        <span className="line-through">{item.label}</span>
                        <Lock size={12} className="text-stone-600" />
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40'
                        : 'text-stone-400 hover:text-white hover:bg-stone-900'
                    } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                  title={item.label}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Exit Links */}
        <div className="p-3 border-t border-stone-800 text-xs">
          <Link
            to="/"
            className={`flex items-center gap-2.5 px-3 py-2 text-stone-400 hover:text-white hover:bg-stone-900 rounded-xl transition-colors ${
              isSidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <ExternalLink size={16} />
            {!isSidebarCollapsed && <span>View Customer Site</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 bg-white border-b border-stone-200/80 px-6 items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-stone-900">
              {APP_CONFIG.brandName} Control Center
            </h2>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full capitalize">
              Role: {adminTier.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/" className="text-stone-600 hover:text-stone-950 font-medium">
              Storefront
            </Link>
            <span className="text-stone-300">|</span>
            <Link to="/seller" className="text-stone-600 hover:text-stone-950 font-medium">
              Seller Portal
            </Link>
            <span className="text-stone-300">|</span>
            <div className="flex items-center gap-2">
              <img
                src={APP_CONFIG.demoUsers.admin.avatar}
                alt="Admin avatar"
                className="w-8 h-8 rounded-full object-cover border border-stone-200"
              />
              <span className="font-bold text-stone-900">{APP_CONFIG.demoUsers.admin.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <DemoRoleSwitcher />
      <ToastContainer />
    </div>
  );
};
