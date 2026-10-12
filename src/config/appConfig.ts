/**
 * Central Brand and Application Configuration
 * Rename brand or tweak marketplace settings easily from here.
 */

export const APP_CONFIG = {
  brandName: 'Kartova',
  brandTagline: 'Curated Multi-Vendor Marketplace',
  brandDescription: 'Discover millions of authentic products from verified independent creators and global brands.',
  currency: {
    symbol: '$',
    code: 'USD',
    locale: 'en-US',
  },
  support: {
    email: 'care@kartova.com',
    phone: '+1 (800) 527-8682',
    hours: 'Mon-Sun: 8:00 AM - 10:00 PM EST',
  },
  shipping: {
    freeShippingThreshold: 50,
    standardDeliveryFee: 4.99,
    expressDeliveryFee: 9.99,
  },
  defaultCommissionPercent: 10,
  taxRatePercent: 8,
  demoUsers: {
    customer: {
      email: 'alex.morgan@example.com',
      name: 'Alex Morgan',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    seller: {
      email: 'seller@apextech.com',
      name: 'Marcus Vance',
      storeName: 'Apex Tech Hub',
      sellerId: 'seller_apex_tech',
      role: 'seller',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
    admin: {
      email: 'admin@kartova.com',
      name: 'Eleanor Vance',
      role: 'admin',
      adminTier: 'super_admin',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    },
  },
};
