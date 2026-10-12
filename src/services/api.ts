import {
  Product,
  Category,
  Brand,
  Seller,
  Order,
  Coupon,
  Banner,
  Notification,
  User,
  FilterParams,
  OrderStatus,
  SellerKycData,
  Payout,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_SELLERS,
  INITIAL_PRODUCTS,
  INITIAL_COUPONS,
  INITIAL_BANNERS,
  INITIAL_ORDERS,
  INITIAL_USER,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';

const STORAGE_KEYS = {
  CATEGORIES: 'kartova_categories_v1',
  BRANDS: 'kartova_brands_v1',
  SELLERS: 'kartova_sellers_v1',
  PRODUCTS: 'kartova_products_v1',
  COUPONS: 'kartova_coupons_v1',
  BANNERS: 'kartova_banners_v1',
  ORDERS: 'kartova_orders_v1',
  USER: 'kartova_user_v1',
  NOTIFICATIONS: 'kartova_notifications_v1',
  PAYOUTS: 'kartova_payouts_v1',
};

// Simulated network latency helper
const delay = (ms = 70) => new Promise((resolve) => setTimeout(resolve, ms));

// Safe local storage helpers
function getFromStorage<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item) as T;
  } catch {
    return defaultVal;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save to storage [${key}]:`, err);
  }
}

// Initial hydration if missing
export function initializeStorageIfEmpty(): void {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    saveToStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    saveToStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BRANDS)) {
    saveToStorage(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
    saveToStorage(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
    saveToStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) {
    saveToStorage(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    saveToStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    saveToStorage(STORAGE_KEYS.USER, INITIAL_USER);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYOUTS)) {
    const initialPayouts: Payout[] = [
      {
        id: 'pay_901',
        sellerId: 'seller_apex_tech',
        sellerName: 'Apex Tech Hub',
        grossAmount: 8200,
        commissionDeducted: 656,
        amount: 7544,
        status: 'processed',
        period: 'Sep 15 - Sep 30, 2026',
        transactionRef: 'WIRE-US-948102',
        processedAt: '2026-10-01T12:00:00Z',
        createdAt: '2026-10-01T09:00:00Z',
      },
      {
        id: 'pay_902',
        sellerId: 'seller_veda_craft',
        sellerName: 'Veda Handcrafted Living',
        grossAmount: 4500,
        commissionDeducted: 450,
        amount: 4050,
        status: 'processed',
        period: 'Sep 15 - Sep 30, 2026',
        transactionRef: 'WIRE-US-884192',
        processedAt: '2026-10-01T14:30:00Z',
        createdAt: '2026-10-01T09:00:00Z',
      },
    ];
    saveToStorage(STORAGE_KEYS.PAYOUTS, initialPayouts);
  }
}

// Ensure storage is initialized right away
initializeStorageIfEmpty();

export const api = {
  // PRODUCTS
  async getProducts(params: FilterParams = {}): Promise<{ products: Product[]; total: number }> {
    await delay();
    let list = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);

    if (params.category) {
      list = list.filter((p) => p.categoryId === params.category);
    }
    if (params.brand) {
      list = list.filter((p) => p.brandId === params.brand);
    }
    if (params.seller) {
      list = list.filter((p) => p.sellerId === params.seller);
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (params.minPrice !== undefined) {
      list = list.filter((p) => p.price >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= params.maxPrice!);
    }
    if (params.minRating !== undefined) {
      list = list.filter((p) => p.rating >= params.minRating!);
    }
    if (params.minDiscount !== undefined) {
      list = list.filter((p) => p.discountPercent >= params.minDiscount!);
    }
    if (params.inStockOnly) {
      list = list.filter((p) => p.inStock && p.totalStock > 0);
    }

    // Sort
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'price_asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'featured':
        default:
          list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
          break;
      }
    }

    const total = list.length;
    if (params.page && params.pageSize) {
      const start = (params.page - 1) * params.pageSize;
      list = list.slice(start, start + params.pageSize);
    }

    return { products: list, total };
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay();
    const list = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return list.find((p) => p.id === id) || null;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    await delay();
    const list = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return list.find((p) => p.slug === slug || p.id === slug) || null;
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'reviews'>): Promise<Product> {
    await delay(120);
    const list = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}`,
      reviews: [],
      createdAt: new Date().toISOString(),
    };
    list.unshift(newProduct);
    saveToStorage(STORAGE_KEYS.PRODUCTS, list);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await delay(100);
    const list = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Product not found');
    list[idx] = { ...list[idx], ...updates };
    saveToStorage(STORAGE_KEYS.PRODUCTS, list);
    return list[idx];
  },

  async deleteProduct(id: string): Promise<boolean> {
    await delay(100);
    let list = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    list = list.filter((p) => p.id !== id);
    saveToStorage(STORAGE_KEYS.PRODUCTS, list);
    return true;
  },

  // CATEGORIES & BRANDS
  async getCategories(): Promise<Category[]> {
    await delay(40);
    return getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    await delay(80);
    const list = getFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      saveToStorage(STORAGE_KEYS.CATEGORIES, list);
      return list[idx];
    }
    throw new Error('Category not found');
  },

  async getBrands(): Promise<Brand[]> {
    await delay(40);
    return getFromStorage<Brand[]>(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
  },

  // SELLERS
  async getSellers(): Promise<Seller[]> {
    await delay(60);
    return getFromStorage<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
  },

  async getSellerById(id: string): Promise<Seller | null> {
    await delay(50);
    const sellers = getFromStorage<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    return sellers.find((s) => s.id === id || s.storeSlug === id) || null;
  },

  async updateSeller(id: string, updates: Partial<Seller>): Promise<Seller> {
    await delay(90);
    const list = getFromStorage<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const idx = list.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Seller not found');
    list[idx] = { ...list[idx], ...updates };
    saveToStorage(STORAGE_KEYS.SELLERS, list);
    return list[idx];
  },

  async submitSellerKyc(sellerId: string, kycData: Partial<SellerKycData>): Promise<Seller> {
    await delay(150);
    const list = getFromStorage<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const idx = list.findIndex((s) => s.id === sellerId);
    if (idx === -1) throw new Error('Seller not found');

    list[idx].kycData = {
      ...list[idx].kycData,
      ...kycData,
      submittedAt: new Date().toISOString(),
    };
    list[idx].status = 'pending';
    saveToStorage(STORAGE_KEYS.SELLERS, list);

    // Notify admin
    await api.addNotification({
      targetRole: 'admin',
      title: 'New KYC Submission',
      message: `${list[idx].businessName} submitted verification documents for approval.`,
      link: '/admin/sellers',
      type: 'kyc',
    });

    return list[idx];
  },

  async approveSeller(sellerId: string): Promise<Seller> {
    await delay(120);
    const list = getFromStorage<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const idx = list.findIndex((s) => s.id === sellerId);
    if (idx === -1) throw new Error('Seller not found');

    list[idx].status = 'approved';
    list[idx].kycData.reviewedAt = new Date().toISOString();
    delete list[idx].kycData.rejectionReason;
    saveToStorage(STORAGE_KEYS.SELLERS, list);

    // Notify seller
    await api.addNotification({
      targetRole: 'seller',
      userId: list[idx].userId,
      title: 'KYC Verification Approved!',
      message: 'Congratulations! Your seller account is active and you can now publish products.',
      link: '/seller/dashboard',
      type: 'kyc',
    });

    return list[idx];
  },

  async rejectSeller(sellerId: string, reason: string): Promise<Seller> {
    await delay(120);
    const list = getFromStorage<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const idx = list.findIndex((s) => s.id === sellerId);
    if (idx === -1) throw new Error('Seller not found');

    list[idx].status = 'rejected';
    list[idx].kycData.reviewedAt = new Date().toISOString();
    list[idx].kycData.rejectionReason = reason;
    saveToStorage(STORAGE_KEYS.SELLERS, list);

    // Notify seller
    await api.addNotification({
      targetRole: 'seller',
      userId: list[idx].userId,
      title: 'KYC Action Required',
      message: `Your verification requires review: "${reason}". Please update your details.`,
      link: '/seller/kyc',
      type: 'kyc',
    });

    return list[idx];
  },

  // ORDERS
  async getOrders(params: { role?: 'customer' | 'seller' | 'admin'; entityId?: string } = {}): Promise<Order[]> {
    await delay(80);
    let orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    if (params.role === 'customer' && params.entityId) {
      orders = orders.filter((o) => o.customerId === params.entityId);
    } else if (params.role === 'seller' && params.entityId) {
      orders = orders.filter((o) => o.items.some((item) => item.sellerId === params.entityId));
    }

    // Sort newest first
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    await delay(60);
    const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders.find((o) => o.id === orderId || o.orderNumber === orderId) || null;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline' | 'status'>): Promise<Order> {
    await delay(180);
    const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const orderNumber = `KTV-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      orderNumber,
      status: 'placed',
      createdAt: now,
      timeline: [
        {
          status: 'placed',
          title: 'Order Placed',
          description: `Order successfully placed and verified. Payment method: ${orderData.paymentMethod.toUpperCase()}`,
          timestamp: new Date().toLocaleString(),
        },
      ],
    };

    orders.unshift(newOrder);
    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Update product stock quantities
    const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    for (const item of newOrder.items) {
      const prodIdx = products.findIndex((p) => p.id === item.productId);
      if (prodIdx !== -1) {
        products[prodIdx].totalStock = Math.max(0, products[prodIdx].totalStock - item.quantity);
        if (products[prodIdx].totalStock === 0) {
          products[prodIdx].inStock = false;
        }
      }
    }
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);

    // Send notifications to sellers & customer
    await api.addNotification({
      targetRole: 'customer',
      userId: newOrder.customerId,
      title: `Order Confirmed: ${newOrder.orderNumber}`,
      message: `Your order for $${newOrder.total.toFixed(2)} has been placed successfully.`,
      link: `/orders/${newOrder.id}`,
      type: 'order',
    });

    const uniqueSellerIds = Array.from(new Set(newOrder.items.map((i) => i.sellerId)));
    for (const sellerId of uniqueSellerIds) {
      await api.addNotification({
        targetRole: 'seller',
        userId: sellerId,
        title: `New Order: ${newOrder.orderNumber}`,
        message: `You have new pending items to pack for order #${newOrder.orderNumber}.`,
        link: '/seller/orders',
        type: 'order',
      });
    }

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    details?: { trackingNumber?: string; courier?: string; note?: string }
  ): Promise<Order> {
    await delay(120);
    const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    order.status = newStatus;

    if (details?.trackingNumber) order.trackingNumber = details.trackingNumber;
    if (details?.courier) order.courier = details.courier;

    const timelineTitles: Record<OrderStatus, string> = {
      placed: 'Order Placed',
      confirmed: 'Confirmed by Seller',
      packed: 'Items Packed & Boxed',
      shipped: 'Dispatched with Courier',
      delivered: 'Package Delivered',
      cancelled: 'Order Cancelled',
      return_requested: 'Return Requested',
      returned: 'Refund Processed',
    };

    let desc = details?.note || `Order status transitioned to ${newStatus}.`;
    if (newStatus === 'shipped' && details?.trackingNumber) {
      desc = `Dispatched via ${details.courier || 'Express'} (Tracking: ${details.trackingNumber})`;
    }

    order.timeline.push({
      status: newStatus,
      title: timelineTitles[newStatus] || newStatus,
      description: desc,
      timestamp: new Date().toLocaleString(),
    });

    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Notify customer
    await api.addNotification({
      targetRole: 'customer',
      userId: order.customerId,
      title: `Order Update: ${timelineTitles[newStatus]}`,
      message: `Order #${order.orderNumber} is now ${newStatus}. ${desc}`,
      link: `/orders/${order.id}`,
      type: 'order',
    });

    return order;
  },

  async requestReturn(orderId: string, reason: string, explanation: string, photoUrl?: string): Promise<Order> {
    await delay(140);
    const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    order.status = 'return_requested';
    order.returnRequest = {
      id: `ret_${Date.now()}`,
      orderId,
      reason,
      explanation,
      photoUrl,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    order.timeline.push({
      status: 'return_requested',
      title: 'Return & Refund Requested',
      description: `Customer reported: "${reason}" - ${explanation}`,
      timestamp: new Date().toLocaleString(),
    });

    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Notify Seller & Admin
    await api.addNotification({
      targetRole: 'seller',
      title: `Return Request for #${order.orderNumber}`,
      message: `Customer requested return: ${reason}`,
      link: '/seller/returns',
      type: 'return',
    });

    return order;
  },

  async handleReturnDecision(orderId: string, approve: boolean, note?: string): Promise<Order> {
    await delay(120);
    const orders = getFromStorage<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx === -1) throw new Error('Order not found');

    const order = orders[idx];
    if (!order.returnRequest) throw new Error('No return request found');

    order.returnRequest.status = approve ? 'approved' : 'rejected';
    order.returnRequest.adminSellerNote = note;

    if (approve) {
      order.status = 'returned';
      order.timeline.push({
        status: 'returned',
        title: 'Return Approved & Refund Issued',
        description: note || 'Refund has been approved and credited back to original payment method.',
        timestamp: new Date().toLocaleString(),
      });
    } else {
      order.timeline.push({
        status: order.status,
        title: 'Return Request Declined',
        description: note || 'Return request did not meet return policy criteria.',
        timestamp: new Date().toLocaleString(),
      });
    }

    saveToStorage(STORAGE_KEYS.ORDERS, orders);

    // Notify customer
    await api.addNotification({
      targetRole: 'customer',
      userId: order.customerId,
      title: approve ? `Refund Approved: #${order.orderNumber}` : `Return Update: #${order.orderNumber}`,
      message: approve
        ? `Your return request has been approved and refund of $${order.total.toFixed(2)} is on the way!`
        : `Your return request could not be accepted: ${note || 'See order page for details.'}`,
      link: `/orders/${order.id}`,
      type: 'return',
    });

    return order;
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    await delay(50);
    return getFromStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },

  async validateCoupon(
    code: string,
    subtotal: number,
    itemCategoryIds: string[]
  ): Promise<{ valid: boolean; discountAmount: number; coupon?: Coupon; error?: string }> {
    await delay(70);
    const coupons = getFromStorage<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());

    if (!found || !found.isActive) {
      return { valid: false, discountAmount: 0, error: 'Invalid or inactive coupon code.' };
    }

    if (new Date(found.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, error: 'This coupon has expired.' };
    }

    if (subtotal < found.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Requires minimum cart order of $${found.minOrderValue}.`,
      };
    }

    if (found.applicableCategoryIds && found.applicableCategoryIds.length > 0) {
      const hasMatchingCat = itemCategoryIds.some((cid) => found.applicableCategoryIds!.includes(cid));
      if (!hasMatchingCat) {
        return {
          valid: false,
          discountAmount: 0,
          error: 'Coupon is not applicable to the items in your cart.',
        };
      }
    }

    let discount = 0;
    if (found.discountType === 'percent') {
      discount = (subtotal * found.discountValue) / 100;
      if (found.maxDiscount && discount > found.maxDiscount) {
        discount = found.maxDiscount;
      }
    } else {
      discount = Math.min(found.discountValue, subtotal);
    }

    return { valid: true, discountAmount: Math.round(discount * 100) / 100, coupon: found };
  },

  // BANNERS
  async getBanners(): Promise<Banner[]> {
    await delay(40);
    return getFromStorage<Banner[]>(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
  },

  async updateBanners(banners: Banner[]): Promise<Banner[]> {
    await delay(100);
    saveToStorage(STORAGE_KEYS.BANNERS, banners);
    return banners;
  },

  // PAYOUTS
  async getPayouts(sellerId?: string): Promise<Payout[]> {
    await delay(60);
    let list = getFromStorage<Payout[]>(STORAGE_KEYS.PAYOUTS, []);
    if (sellerId) {
      list = list.filter((p) => p.sellerId === sellerId);
    }
    return list;
  },

  async createPayout(sellerId: string, grossAmount: number, commissionPercent = 10): Promise<Payout> {
    await delay(120);
    const sellers = getFromStorage<Seller[]>(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    const seller = sellers.find((s) => s.id === sellerId);
    if (!seller) throw new Error('Seller not found');

    const commissionDeducted = (grossAmount * commissionPercent) / 100;
    const netAmount = grossAmount - commissionDeducted;

    const payouts = getFromStorage<Payout[]>(STORAGE_KEYS.PAYOUTS, []);
    const newPayout: Payout = {
      id: `pay_${Date.now()}`,
      sellerId,
      sellerName: seller.businessName,
      grossAmount,
      commissionDeducted,
      amount: netAmount,
      status: 'pending',
      period: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Cycle`,
      createdAt: new Date().toISOString(),
    };

    payouts.unshift(newPayout);
    saveToStorage(STORAGE_KEYS.PAYOUTS, payouts);
    return newPayout;
  },

  async processPayout(payoutId: string, transactionRef?: string): Promise<Payout> {
    await delay(120);
    const payouts = getFromStorage<Payout[]>(STORAGE_KEYS.PAYOUTS, []);
    const idx = payouts.findIndex((p) => p.id === payoutId);
    if (idx === -1) throw new Error('Payout not found');

    payouts[idx].status = 'processed';
    payouts[idx].transactionRef = transactionRef || `WIRE-${Math.floor(100000 + Math.random() * 900000)}`;
    payouts[idx].processedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.PAYOUTS, payouts);

    // Notify seller
    await api.addNotification({
      targetRole: 'seller',
      userId: payouts[idx].sellerId,
      title: 'Payout Processed Successfully',
      message: `$${payouts[idx].amount.toFixed(2)} has been deposited into your bank account.`,
      link: '/seller/payouts',
      type: 'system',
    });

    return payouts[idx];
  },

  // NOTIFICATIONS
  async getNotifications(role?: 'customer' | 'seller' | 'admin', userId?: string): Promise<Notification[]> {
    await delay(40);
    const notifs = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!role) return notifs;

    return notifs.filter(
      (n) => n.targetRole === 'all' || n.targetRole === role || (userId && n.userId === userId)
    );
  },

  async addNotification(notifData: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    const list = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const newNotif: Notification = {
      ...notifData,
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    list.unshift(newNotif);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotif;
  },

  async markNotificationRead(id: string): Promise<void> {
    const list = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const idx = list.findIndex((n) => n.id === id);
    if (idx !== -1) {
      list[idx].read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, list);
    }
  },

  // USER & PROFILE
  async getCurrentUser(): Promise<User> {
    await delay(30);
    return getFromStorage<User>(STORAGE_KEYS.USER, INITIAL_USER);
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    await delay(90);
    const user = getFromStorage<User>(STORAGE_KEYS.USER, INITIAL_USER);
    const updated = { ...user, ...updates };
    saveToStorage(STORAGE_KEYS.USER, updated);
    return updated;
  },

  // RESET ALL DEMO DATA
  async resetAllDemoData(): Promise<void> {
    saveToStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    saveToStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    saveToStorage(STORAGE_KEYS.BRANDS, INITIAL_BRANDS);
    saveToStorage(STORAGE_KEYS.SELLERS, INITIAL_SELLERS);
    saveToStorage(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    saveToStorage(STORAGE_KEYS.BANNERS, INITIAL_BANNERS);
    saveToStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    saveToStorage(STORAGE_KEYS.USER, INITIAL_USER);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    saveToStorage(STORAGE_KEYS.PAYOUTS, [
      {
        id: 'pay_901',
        sellerId: 'seller_apex_tech',
        sellerName: 'Apex Tech Hub',
        grossAmount: 8200,
        commissionDeducted: 656,
        amount: 7544,
        status: 'processed',
        period: 'Sep 15 - Sep 30, 2026',
        transactionRef: 'WIRE-US-948102',
        processedAt: '2026-10-01T12:00:00Z',
        createdAt: '2026-10-01T09:00:00Z',
      },
    ]);
  },
};
