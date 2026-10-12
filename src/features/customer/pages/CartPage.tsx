import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Product, Seller } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  ShoppingBag,
  Trash2,
  Heart,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Check,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    toggleWishlist,
    addToast,
  } = useStore();

  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [sellersMap, setSellersMap] = useState<Record<string, Seller>>({});
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [prodsRes, sellers] = await Promise.all([
        api.getProducts(),
        api.getSellers(),
      ]);
      const pMap: Record<string, Product> = {};
      prodsRes.products.forEach((p) => {
        pMap[p.id] = p;
      });
      const sMap: Record<string, Seller> = {};
      sellers.forEach((s) => {
        sMap[s.id] = s;
      });
      setProductsMap(pMap);
      setSellersMap(sMap);
    }
    loadData();
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percent') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = Math.min(appliedCoupon.discountValue, subtotal);
    }
  }

  const shipping =
    subtotal === 0 || subtotal >= APP_CONFIG.shipping.freeShippingThreshold
      ? 0
      : APP_CONFIG.shipping.standardDeliveryFee;
  const tax = Math.round((subtotal * APP_CONFIG.taxRatePercent) / 100 * 100) / 100;
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsValidating(true);
    setCouponError(null);

    const categoryIds = cartItems
      .map((item) => productsMap[item.productId]?.categoryId)
      .filter(Boolean) as string[];

    const res = await api.validateCoupon(couponInput, subtotal, categoryIds);
    setIsValidating(false);

    if (res.valid && res.coupon) {
      applyCoupon(res.coupon);
      setCouponInput('');
      setCouponError(null);
    } else {
      setCouponError(res.error || 'Invalid coupon code');
    }
  };

  const handleSaveForLater = (productId: string, cartItemId: string) => {
    toggleWishlist(productId);
    removeFromCart(cartItemId);
    addToast({
      type: 'info',
      message: 'Item moved to your Wishlist for later.',
    });
  };

  // Group by seller
  const groupedBySeller: Record<string, typeof cartItems> = {};
  cartItems.forEach((item) => {
    if (!groupedBySeller[item.sellerId]) {
      groupedBySeller[item.sellerId] = [];
    }
    groupedBySeller[item.sellerId].push(item);
  });

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={36} />
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-900">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-sm mx-auto">
          Explore authentic items from our community of vetted makers and verified indie distributors.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="mt-6 btn-brand-primary px-6 py-3 text-xs inline-flex items-center gap-2"
        >
          <span>Explore Catalog</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-950 mb-8">
        Your Shopping Bag ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart items grouped by seller */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedBySeller).map(([sellerId, items]) => {
            const seller = sellersMap[sellerId];
            return (
              <div
                key={sellerId}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs"
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Fulfilled by:</span>
                    <span className="text-xs font-bold text-stone-900">
                      {seller?.businessName || 'Verified Merchant'}
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                    <ShieldCheck size={11} />
                    Verified Storefront
                  </span>
                </div>

                <div className="divide-y divide-stone-100 space-y-4">
                  {items.map((item) => {
                    const product = productsMap[item.productId];
                    const variant = product?.variants.find((v) => v.id === item.variantId);

                    return (
                      <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-start">
                        <Link
                          to={`/product/${item.productId}`}
                          className="w-20 h-20 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100"
                        >
                          <ImageWithFallback
                            src={product?.images[0]}
                            alt={product?.title || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        </Link>

                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${item.productId}`}
                            className="text-sm font-bold text-stone-900 hover:text-[#FF6B4A] transition-colors line-clamp-1"
                          >
                            {product?.title || 'Loading product...'}
                          </Link>

                          {variant && (
                            <div className="text-xs text-stone-500 mt-0.5">{variant.name}</div>
                          )}

                          <div className="mt-2 text-sm font-extrabold text-stone-950">
                            ${item.price.toFixed(2)}
                          </div>

                          {/* Action links */}
                          <div className="mt-3 flex items-center gap-4 text-xs">
                            <button
                              onClick={() => handleSaveForLater(item.productId, item.id)}
                              className="text-stone-500 hover:text-stone-900 font-medium flex items-center gap-1"
                            >
                              <Heart size={13} />
                              <span>Save for later</span>
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-stone-400 hover:text-red-600 font-medium flex items-center gap-1"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Quantity control */}
                        <div className="flex items-center border border-stone-200 bg-white rounded-lg overflow-hidden shrink-0">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-stone-50 text-stone-600"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-stone-50 text-stone-600"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Order Summary & Coupon */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-950 pb-3 border-b border-stone-100">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping & Handling</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-semibold">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-between text-base font-extrabold text-stone-950">
                <span>Estimated Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-brand-primary py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Coupon Box */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 mb-2">
              <Tag size={14} className="text-[#FF6B4A]" />
              <span>Apply Promotion Code</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                  <p className="text-[11px] text-emerald-700">{appliedCoupon.description}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-stone-500 hover:text-red-600 text-xs font-semibold underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs uppercase font-medium bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
                  />
                  <button
                    type="submit"
                    disabled={isValidating}
                    className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <div className="text-[11px] text-red-600 font-medium">{couponError}</div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
