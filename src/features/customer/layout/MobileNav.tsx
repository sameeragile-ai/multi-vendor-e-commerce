import React from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../../store';
import { Home, Search, Heart, ShoppingBag, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { cartItems, wishlistIds, setIsCartDrawerOpen } = useStore();
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 md:hidden py-2 px-4 shadow-lg">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#FF6B4A]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <Home size={19} />
          <span>Home</span>
        </NavLink>

        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#FF6B4A]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <Search size={19} />
          <span>Explore</span>
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#FF6B4A]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <div className="relative">
            <Heart size={19} />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#FF6B4A] text-white text-[9px] font-bold flex items-center justify-center">
                {wishlistIds.length}
              </span>
            )}
          </div>
          <span>Wishlist</span>
        </NavLink>

        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[10px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
        >
          <div className="relative">
            <ShoppingBag size={19} />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#FF6B4A] text-white text-[9px] font-bold flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </div>
          <span>Bag</span>
        </button>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[#FF6B4A]' : 'text-stone-500 hover:text-stone-900'
            }`
          }
        >
          <User size={19} />
          <span>Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};
