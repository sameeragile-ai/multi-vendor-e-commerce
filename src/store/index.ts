import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Coupon, UserRole, AdminTier, User } from '../types';
import { APP_CONFIG } from '../config/appConfig';
import { INITIAL_USER } from '../data/seedData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface AppState {
  // ROLE & AUTH
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  adminTier: AdminTier;
  setAdminTier: (tier: AdminTier) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Active Seller Impersonation (for seller portal)
  activeSellerId: string;
  setActiveSellerId: (sellerId: string) => void;

  // CART
  cartItems: CartItem[];
  appliedCoupon: Coupon | null;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, 'id' | 'selected'>) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;

  // WISHLIST
  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // COMPARE (Up to 4 products)
  compareIds: string[];
  addToCompare: (productId: string) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompareDrawerOpen: boolean;
  setIsCompareDrawerOpen: (open: boolean) => void;

  // RECENTLY VIEWED
  recentlyViewedIds: string[];
  addRecentlyViewed: (productId: string) => void;

  // TOASTS
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // FLYING ITEM ANIMATION STATE
  flyingItem: { x: number; y: number; image: string } | null;
  triggerFlyToCart: (pos: { x: number; y: number; image: string }) => void;
  clearFlyingItem: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Role & Auth
      currentRole: 'customer',
      setCurrentRole: (role) => set({ currentRole: role }),
      adminTier: 'super_admin',
      setAdminTier: (tier) => set({ adminTier: tier }),
      currentUser: INITIAL_USER,
      setCurrentUser: (user) => set({ currentUser: user }),
      activeSellerId: 'seller_apex_tech',
      setActiveSellerId: (sellerId) => set({ activeSellerId: sellerId }),

      // Cart
      cartItems: [
        {
          id: 'cart_init_1',
          productId: 'prod_1',
          variantId: 'v1_black',
          sellerId: 'seller_apex_tech',
          quantity: 1,
          price: 349,
          selected: true,
        },
      ],
      appliedCoupon: null,
      isCartDrawerOpen: false,
      setIsCartDrawerOpen: (open) => set({ isCartDrawerOpen: open }),

      addToCart: (item) => {
        const items = [...get().cartItems];
        const existingIdx = items.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId
        );

        if (existingIdx !== -1) {
          items[existingIdx].quantity += item.quantity;
        } else {
          items.push({
            ...item,
            id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            selected: true,
          });
        }

        set({ cartItems: items, isCartDrawerOpen: true });
        get().addToast({
          type: 'success',
          title: 'Added to Bag',
          message: 'Item has been added to your shopping bag.',
        });
      },

      removeFromCart: (cartItemId) => {
        set({ cartItems: get().cartItems.filter((i) => i.id !== cartItemId) });
        get().addToast({
          type: 'info',
          message: 'Item removed from bag.',
        });
      },

      updateCartQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(cartItemId);
          return;
        }
        set({
          cartItems: get().cartItems.map((i) =>
            i.id === cartItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ cartItems: [], appliedCoupon: null }),

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
        get().addToast({
          type: 'success',
          title: 'Coupon Applied',
          message: `Code ${coupon.code} applied successfully!`,
        });
      },

      removeCoupon: () => {
        set({ appliedCoupon: null });
        get().addToast({
          type: 'info',
          message: 'Coupon removed.',
        });
      },

      // Wishlist
      wishlistIds: ['prod_2', 'prod_4'],
      toggleWishlist: (productId) => {
        const list = [...get().wishlistIds];
        const idx = list.indexOf(productId);
        if (idx !== -1) {
          list.splice(idx, 1);
          set({ wishlistIds: list });
          get().addToast({
            type: 'info',
            message: 'Removed from your wishlist.',
          });
        } else {
          list.push(productId);
          set({ wishlistIds: list });
          get().addToast({
            type: 'success',
            title: 'Saved to Wishlist',
            message: 'Item saved to your curated wishlist.',
          });
        }
      },
      isInWishlist: (productId) => get().wishlistIds.includes(productId),

      // Compare
      compareIds: [],
      addToCompare: (productId) => {
        const current = [...get().compareIds];
        if (current.includes(productId)) {
          get().addToast({
            type: 'info',
            message: 'Product already in comparison list.',
          });
          return;
        }
        if (current.length >= 4) {
          get().addToast({
            type: 'warning',
            title: 'Comparison Limit',
            message: 'You can compare up to 4 items simultaneously.',
          });
          return;
        }
        current.push(productId);
        set({ compareIds: current, isCompareDrawerOpen: true });
        get().addToast({
          type: 'success',
          title: 'Added to Compare',
          message: 'View side-by-side comparison tray.',
        });
      },
      removeFromCompare: (productId) => {
        set({ compareIds: get().compareIds.filter((id) => id !== productId) });
      },
      clearCompare: () => set({ compareIds: [], isCompareDrawerOpen: false }),
      isCompareDrawerOpen: false,
      setIsCompareDrawerOpen: (open) => set({ isCompareDrawerOpen: open }),

      // Recently Viewed
      recentlyViewedIds: ['prod_1', 'prod_2', 'prod_3'],
      addRecentlyViewed: (productId) => {
        const current = get().recentlyViewedIds.filter((id) => id !== productId);
        set({ recentlyViewedIds: [productId, ...current].slice(0, 10) });
      },

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
        const newToast: ToastMessage = { ...toast, id };
        set({ toasts: [...get().toasts, newToast] });

        // Auto remove after duration (default 4000ms)
        const dur = toast.duration || 4000;
        setTimeout(() => {
          set({ toasts: get().toasts.filter((t) => t.id !== id) });
        }, dur);
      },
      removeToast: (id) => {
        set({ toasts: get().toasts.filter((t) => t.id !== id) });
      },

      // Flying Item Animation
      flyingItem: null,
      triggerFlyToCart: (pos) => set({ flyingItem: pos }),
      clearFlyingItem: () => set({ flyingItem: null }),
    }),
    {
      name: 'kartova_store_v1',
      partialize: (state) => ({
        currentRole: state.currentRole,
        adminTier: state.adminTier,
        currentUser: state.currentUser,
        activeSellerId: state.activeSellerId,
        cartItems: state.cartItems,
        appliedCoupon: state.appliedCoupon,
        wishlistIds: state.wishlistIds,
        compareIds: state.compareIds,
        recentlyViewedIds: state.recentlyViewedIds,
      }),
    }
  )
);
