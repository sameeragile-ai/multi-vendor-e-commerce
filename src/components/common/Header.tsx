import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { api } from '../../services/api';
import { Product, Category, Notification } from '../../types';
import { ImageWithFallback } from './ImageWithFallback';
import { CustomerAuthModal } from '../../features/customer/pages/CustomerAuthModal';
import {
  Search,
  ShoppingBag,
  Heart,
  Scale,
  Bell,
  User,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Package,
  MapPin,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    wishlistIds,
    compareIds,
    setIsCartDrawerOpen,
    setIsCompareDrawerOpen,
    currentUser,
    setCurrentUser,
  } = useStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    async function loadNavData() {
      const [cats, notifs] = await Promise.all([
        api.getCategories(),
        api.getNotifications('customer', currentUser.id),
      ]);
      setCategories(cats);
      setNotifications(notifs);
    }
    loadNavData();
  }, [currentUser]);

  // Live search debounced
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await api.getProducts({ search: searchQuery, pageSize: 5 });
      setSearchResults(res.products);
      setIsSearching(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearchFocused(false);
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Top micro announcement banner */}
      <div className="bg-stone-900 text-stone-200 text-[11px] py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6B4A]" />
            <span>
              Free priority dispatch on orders over ${APP_CONFIG.shipping.freeShippingThreshold}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-stone-400">
            <Link to="/cms/faq" className="hover:text-white transition-colors">
              Help & FAQ
            </Link>
            <span>·</span>
            <Link to="/seller" className="hover:text-white transition-colors flex items-center gap-1">
              <span>Sell on Kartova</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main sticky navigation header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-6 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center text-white shadow-md shadow-[#FF6B4A]/25 group-hover:scale-105 transition-transform">
                  <span className="font-display font-extrabold text-xl leading-none">K</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-stone-950">
                    {APP_CONFIG.brandName}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#FF6B4A] font-extrabold -mt-1 hidden sm:block">
                    Marketplace
                  </span>
                </div>
              </Link>

              {/* Categories mega button */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-950 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <Menu size={16} />
                  <span>Departments</span>
                  <ChevronDown size={14} className="text-stone-400" />
                </button>

                {isCategoryMenuOpen && (
                  <div
                    onMouseLeave={() => setIsCategoryMenuOpen(false)}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in-50 duration-150"
                  >
                    <div className="text-[10px] uppercase font-bold text-stone-400 px-3 py-1.5 tracking-wider">
                      Shop by Category
                    </div>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/search?category=${cat.id}`}
                        onClick={() => setIsCategoryMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-amber-50/60 rounded-lg transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ChevronDown size={12} className="-rotate-90 text-stone-300" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Search Bar */}
            <div ref={searchRef} className="flex-1 max-w-xl relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search headphones, ceramics, artisan coffee, skincare..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  className="w-full bg-white border border-stone-200/90 rounded-xl pl-10 pr-20 py-2 sm:py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#FF6B4A]/20 focus:border-[#FF6B4A] transition-all shadow-xs"
                />
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    <X size={14} />
                  </button>
                )}

                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Live search preview popup */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-stone-200/90 p-3 z-50">
                  <div className="text-[10px] uppercase font-bold text-stone-400 px-2 pb-2 tracking-wider flex items-center justify-between">
                    <span>Matching Products</span>
                    {isSearching && <span className="animate-pulse">Searching...</span>}
                  </div>

                  {searchResults.length === 0 && !isSearching ? (
                    <div className="p-4 text-center text-xs text-stone-500">
                      No direct matches for &ldquo;{searchQuery}&rdquo;. Press Enter to see full catalog search.
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {searchResults.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setIsSearchFocused(false);
                            navigate(`/product/${prod.id}`);
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-amber-50/50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="w-10 h-10 rounded-md bg-stone-100 overflow-hidden shrink-0">
                            <ImageWithFallback
                              src={prod.images[0]}
                              alt={prod.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-stone-900 truncate">
                              {prod.title}
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-2">
                              <span className="font-bold text-stone-900">
                                ${prod.price.toFixed(2)}
                              </span>
                              <span>·</span>
                              <span>★ {prod.rating}</span>
                            </div>
                          </div>
                          <ChevronDown size={14} className="-rotate-90 text-stone-400" />
                        </div>
                      ))}

                      <div className="pt-2 border-t border-stone-100">
                        <button
                          onClick={handleSearchSubmit}
                          className="w-full text-center text-xs font-semibold text-[#FF6B4A] hover:underline py-1 flex items-center justify-center gap-1"
                        >
                          <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Compare Button */}
              {compareIds.length > 0 && (
                <button
                  onClick={() => setIsCompareDrawerOpen(true)}
                  className="relative p-2 text-stone-600 hover:text-stone-950 rounded-xl hover:bg-stone-100 transition-colors"
                  title="Compare Products"
                >
                  <Scale size={20} />
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {compareIds.length}
                  </span>
                </button>
              )}

              {/* Wishlist Button */}
              <Link
                to="/wishlist"
                className="relative p-2 text-stone-600 hover:text-stone-950 rounded-xl hover:bg-stone-100 transition-colors hidden sm:block"
                title="Wishlist"
              >
                <Heart size={20} />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6B4A] text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Notification Center */}
              <div ref={notifMenuRef} className="relative hidden sm:block">
                <button
                  onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                  className="relative p-2 text-stone-600 hover:text-stone-950 rounded-xl hover:bg-stone-100 transition-colors"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadNotifsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6B4A] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotifsCount}
                    </span>
                  )}
                </button>

                {isNotifMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 z-50 animate-in fade-in-50 duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <span className="text-xs font-bold text-stone-900">Notifications</span>
                      <span className="text-[10px] text-stone-500 font-medium">
                        {unreadNotifsCount} unread
                      </span>
                    </div>

                    <div className="divide-y divide-stone-100 max-h-72 overflow-y-auto mt-1">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-stone-400">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              setIsNotifMenuOpen(false);
                              if (notif.link) navigate(notif.link);
                            }}
                            className="py-2.5 px-2 hover:bg-stone-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-stone-900">
                                {notif.title}
                              </span>
                              <span className="text-[10px] text-stone-400 shrink-0">
                                {notif.timestamp}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Drawer Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-all shadow-xs"
                title="View Bag"
              >
                <div className="relative">
                  <ShoppingBag size={20} className="text-[#FF6B4A]" />
                  {totalCartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-gradient-brand text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                      {totalCartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-bold hidden md:inline">Bag</span>
              </button>

              {/* User Account / Profile */}
              <div ref={userMenuRef} className="relative">
                {currentUser ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full border border-stone-200/90 hover:border-stone-400 transition-colors"
                  >
                    <img
                      src={
                        currentUser.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
                      }
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-800 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                  >
                    <User size={15} />
                    <span>Sign In</span>
                  </button>
                )}

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 p-2 z-50 animate-in fade-in-50 duration-150">
                    <div className="p-2.5 border-b border-stone-100">
                      <div className="text-xs font-bold text-stone-900">{currentUser.name}</div>
                      <div className="text-[11px] text-stone-500 truncate">{currentUser.email}</div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded-lg transition-colors"
                      >
                        <Package size={15} className="text-stone-400" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded-lg transition-colors"
                      >
                        <Heart size={15} className="text-stone-400" />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded-lg transition-colors"
                      >
                        <MapPin size={15} className="text-stone-400" />
                        <span>Addresses & Profile</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-50 rounded-lg transition-colors text-left"
                      >
                        <User size={15} className="text-stone-400" />
                        <span>Switch Account</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Category Quick Links Rail */}
        <div className="border-t border-stone-200/60 bg-white/60 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-8 h-10 overflow-x-auto text-xs font-semibold text-stone-600 no-scrollbar">
              <Link
                to="/search?deal=true"
                className="text-[#FF6B4A] hover:text-[#E05333] flex items-center gap-1.5 shrink-0"
              >
                <Sparkles size={13} />
                <span>Deals of the Day</span>
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/search?category=${cat.id}`}
                  className="hover:text-stone-950 transition-colors shrink-0"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
