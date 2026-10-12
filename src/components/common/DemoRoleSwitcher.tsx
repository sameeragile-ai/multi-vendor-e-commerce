import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { api } from '../../services/api';
import {
  ShoppingBag,
  Store,
  ShieldCheck,
  ChevronUp,
  RotateCcw,
  UserCheck,
  Sparkles,
} from 'lucide-react';

export const DemoRoleSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentRole,
    setCurrentRole,
    adminTier,
    setAdminTier,
    addToast,
  } = useStore();

  const handleRoleSelect = (role: 'customer' | 'seller' | 'admin', path: string) => {
    setCurrentRole(role);
    navigate(path);
    setIsOpen(false);
    addToast({
      type: 'info',
      title: `Switched to ${role.toUpperCase()} Role`,
      message: `You are now interacting with the platform as a ${role}.`,
    });
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data back to default factory state?')) {
      await api.resetAllDemoData();
      addToast({
        type: 'success',
        title: 'Demo Reset Complete',
        message: 'All products, orders, and seed transactions have been restored.',
      });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Determine role from route path or store
  const isSellerRoute = location.pathname.startsWith('/seller');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const displayRole = isAdminRoute ? 'admin' : isSellerRoute ? 'seller' : 'customer';

  return (
    <div className="fixed bottom-4 left-4 z-50 select-none">
      {isOpen && (
        <div className="mb-2 w-80 bg-white rounded-2xl border border-stone-200/90 shadow-2xl p-4 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF6B4A]" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Marketplace Role Switcher
              </span>
            </div>
            <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-mono font-medium">
              Client Demo
            </span>
          </div>

          <div className="mt-3 space-y-1.5">
            {/* Customer Option */}
            <button
              onClick={() => handleRoleSelect('customer', '/')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                displayRole === 'customer'
                  ? 'bg-amber-50/80 border border-amber-200 text-stone-900 shadow-xs'
                  : 'hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    displayRole === 'customer' ? 'bg-[#FF6B4A] text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <ShoppingBag size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Customer Portal</div>
                  <div className="text-[11px] text-stone-500">Alex Morgan (Shopper)</div>
                </div>
              </div>
              {displayRole === 'customer' && (
                <span className="w-2 h-2 rounded-full bg-[#FF6B4A]" />
              )}
            </button>

            {/* Seller Option */}
            <button
              onClick={() => handleRoleSelect('seller', '/seller')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                displayRole === 'seller'
                  ? 'bg-amber-50/80 border border-amber-200 text-stone-900 shadow-xs'
                  : 'hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    displayRole === 'seller' ? 'bg-teal-700 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Store size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Seller Panel</div>
                  <div className="text-[11px] text-stone-500">Apex Tech Hub (Verified)</div>
                </div>
              </div>
              {displayRole === 'seller' && (
                <span className="w-2 h-2 rounded-full bg-teal-700" />
              )}
            </button>

            {/* Admin Option */}
            <button
              onClick={() => handleRoleSelect('admin', '/admin')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                displayRole === 'admin'
                  ? 'bg-amber-50/80 border border-amber-200 text-stone-900 shadow-xs'
                  : 'hover:bg-stone-50 text-stone-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    displayRole === 'admin' ? 'bg-indigo-700 text-white' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Admin Governance</div>
                  <div className="text-[11px] text-stone-500">Super Admin / Ops / Support</div>
                </div>
              </div>
              {displayRole === 'admin' && (
                <span className="w-2 h-2 rounded-full bg-indigo-700" />
              )}
            </button>
          </div>

          {/* Admin Role Permission Tier Switcher if in admin route */}
          {displayRole === 'admin' && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <div className="text-[11px] font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <UserCheck size={13} className="text-stone-500" />
                <span>Simulate Admin Tier:</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-lg text-[10px] font-medium text-stone-600">
                {(['super_admin', 'ops', 'support'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => {
                      setAdminTier(tier);
                      addToast({
                        type: 'info',
                        message: `Admin permissions set to: ${tier.replace('_', ' ').toUpperCase()}`,
                      });
                    }}
                    className={`py-1 rounded capitalize transition-all ${
                      adminTier === tier
                        ? 'bg-white font-bold text-stone-900 shadow-xs'
                        : 'hover:text-stone-900'
                    }`}
                  >
                    {tier.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset Demo Data Button */}
          <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={handleResetData}
              className="text-[11px] text-stone-500 hover:text-red-600 flex items-center gap-1.5 font-medium transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset Factory Data</span>
            </button>
            <span className="text-[10px] text-stone-400">All data synced</span>
          </div>
        </div>
      )}

      {/* Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 bg-stone-900/95 hover:bg-stone-900 text-white rounded-full shadow-lg border border-stone-700/60 backdrop-blur-md transition-all hover:scale-102 active:scale-98 text-xs font-semibold"
      >
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B4A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6B4A]"></span>
          </span>
          <span className="text-stone-300">Demo Role:</span>
          <span className="capitalize text-white font-bold">
            {displayRole}
          </span>
        </span>
        <ChevronUp
          size={14}
          className={`text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  );
};
