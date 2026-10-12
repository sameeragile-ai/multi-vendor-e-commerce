export type UserRole = 'customer' | 'seller' | 'admin';

export type AdminTier = 'super_admin' | 'ops' | 'support';

export interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  type: 'home' | 'work' | 'other';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  addresses: Address[];
  createdAt: string;
  adminTier?: AdminTier;
}

export type SellerKycStatus = 'pending' | 'approved' | 'rejected';

export interface SellerKycData {
  businessName: string;
  businessType: 'individual' | 'llc' | 'corporation' | 'partnership';
  taxId: string; // GSTIN or EIN
  panNumber?: string;
  bankName: string;
  accountNumber: string;
  routingOrIfsc: string;
  idProofType: 'passport' | 'drivers_license' | 'national_id' | 'business_license';
  documentUrl?: string;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

export interface Seller {
  id: string;
  userId: string;
  businessName: string;
  storeSlug: string;
  email: string;
  phone: string;
  logo: string;
  banner: string;
  bio: string;
  rating: number;
  totalReviews: number;
  totalSales: number;
  status: SellerKycStatus;
  kycData: SellerKycData;
  commissionRate: number; // e.g. 10 for 10%
  balance: number;
  pendingPayouts: number;
  joinedDate: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image: string;
  commissionRate: number;
  featured?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  featured?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Color: Onyx Black, Size: 256GB"
  attributes: {
    color?: string;
    size?: string;
    storage?: string;
    [key: string]: string | undefined;
  };
  price: number;
  originalPrice: number;
  stock: number;
  sku: string;
  image?: string;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  photos?: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  brandId: string;
  sellerId: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  ratingCount: number;
  reviewsCount: number;
  inStock: boolean;
  totalStock: number;
  lowStockThreshold: number;
  images: string[];
  specs: Record<string, string>;
  tags: string[];
  isFeatured: boolean;
  isDealOfTheDay: boolean;
  dealEndsAt?: string;
  variants: ProductVariant[];
  reviews: ProductReview[];
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  sellerId: string;
  quantity: number;
  price: number;
  selected: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt: string;
  applicableCategoryIds?: string[];
  isActive: boolean;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  variantName?: string;
  productTitle: string;
  productImage: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  itemId?: string;
  reason: string;
  explanation: string;
  photoUrl?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  adminSellerNote?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: 'card' | 'upi' | 'cod';
  paymentStatus: 'paid' | 'pending' | 'failed';
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  createdAt: string;
  status: OrderStatus;
  trackingNumber?: string;
  courier?: string;
  estimatedDelivery: string;
  timeline: OrderTimelineEvent[];
  returnRequest?: ReturnRequest;
}

export interface Payout {
  id: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  grossAmount: number;
  commissionDeducted: number;
  status: 'pending' | 'processed';
  period: string;
  transactionRef?: string;
  processedAt?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  link: string;
  image: string;
  gradientOverlay: string;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId?: string;
  targetRole: 'customer' | 'seller' | 'admin' | 'all';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  type: 'order' | 'kyc' | 'deal' | 'system' | 'return';
}

export interface FilterParams {
  category?: string;
  brand?: string;
  seller?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  minDiscount?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
  page?: number;
  pageSize?: number;
}
