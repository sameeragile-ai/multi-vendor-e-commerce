import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Product, Seller } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeFromCart,
    updateCartQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useStore();

  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [sellersMap, setSellersMap] = useState<Record<string, Seller>>({});
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

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
    if (isCartDrawerOpen) {
      loadData();
    }
  }, [isCartDrawerOpen]);

  // Calculate pricing
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

  const shippingFee =
    subtotal === 0 || subtotal >= APP_CONFIG.shipping.freeShippingThreshold
      ? 0
      : APP_CONFIG.shipping.standardDeliveryFee;
  const estimatedTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError(null);

    const categoryIds = cartItems
      .map((item) => productsMap[item.productId]?.categoryId)
      .filter(Boolean) as string[];

    const res = await api.validateCoupon(couponCodeInput, subtotal, categoryIds);
    setIsValidatingCoupon(false);

    if (res.valid && res.coupon) {
      applyCoupon(res.coupon);
      setCouponCodeInput('');
      setCouponError(null);
    } else {
      setCouponError(res.error || 'Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  // Group items by seller
  const groupedBySeller: Record<string, typeof cartItems> = {};
  cartItems.forEach((item) => {
    if (!groupedBySeller[item.sellerId]) {
      groupedBySeller[item.sellerId] = [];
    }
    groupedBySeller[item.sellerId].push(item);
  });

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B4A]/10 text-[#FF6B4A] flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900">Your Shopping Bag</h2>
                <span className="text-xs text-stone-500">
                  {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items selected
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-base font-semibold text-stone-900">Your bag is empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Explore curated collections from verified independent sellers and craftspeople.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/search');
                  }}
                  className="mt-5 btn-brand-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
                >
                  Start Exploring
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              <>
                {/* Per Seller Grouping */}
                {Object.entries(groupedBySeller).map(([sellerId, items]) => {
                  const seller = sellersMap[sellerId];
                  return (
                    <div
                      key={sellerId}
                      className="border border-stone-200/80 rounded-xl p-3.5 bg-stone-50/40"
                    >
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-stone-800">
                          <span className="text-stone-400 font-normal">Fulfillment by:</span>
                          <span className="font-semibold text-stone-900">
                            {seller?.businessName || 'Verified Seller'}
                          </span>
                        </div>
                        <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <ShieldCheck size={11} />
                          Verified
                        </span>
                      </div>

                      <div className="space-y-3">
                        {items.map((item) => {
                          const product = productsMap[item.productId];
                          const image = product?.images[0] || '';
                          const variant = product?.variants.find((v) => v.id === item.variantId);

                          return (
                            <div key={item.id} className="flex gap-3 items-center">
                              <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                                <ImageWithFallback
                                  src={image}
                                  alt={product?.title || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-stone-900 truncate">
                                  {product?.title || 'Loading product...'}
                                </h4>
                                {variant && (
                                  <div className="text-[11px] text-stone-500 mt-0.5 truncate">
                                    {variant.name}
                                  </div>
                                )}
                                <div className="text-xs font-bold text-stone-900 mt-1">
                                  ${item.price.toFixed(2)}
                                </div>
                              </div>

                              {/* Quantity control */}
                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-stone-400 hover:text-red-500 transition-colors p-1"
                                  title="Remove item"
                                >
                                  <Trash2 size={13} />
                                </button>

                                <div className="flex items-center border border-stone-200 bg-white rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                    className="p-1 hover:bg-stone-50 text-stone-600 transition-colors"
                                  >
                                    <Minus size={11} />
                                  </button>
                                  <span className="px-2 text-xs font-semibold text-stone-800">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                    className="p-1 hover:bg-stone-50 text-stone-600 transition-colors"
                                  >
                                    <Plus size={11} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Promo Code Input */}
                <div className="pt-2">
                  <div className="text-xs font-semibold text-stone-800 mb-1.5 flex items-center gap-1.5">
                    <Tag size={13} className="text-[#FF6B4A]" />
                    <span>Have a promo code?</span>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-600 font-bold" />
                        <div>
                          <span className="font-bold text-emerald-900">{appliedCoupon.code}</span>
                          <span className="text-emerald-700 ml-1.5">applied</span>
                        </div>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[11px] text-stone-500 hover:text-red-600 font-medium underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. FIRST15 or KARTOVA100"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 text-xs uppercase font-medium bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
                      />
                      <button
                        type="submit"
                        disabled={isValidatingCoupon}
                        className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                      >
                        {isValidatingCoupon ? 'Checking...' : 'Apply'}
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <div className="text-[11px] text-red-600 mt-1 font-medium">{couponError}</div>
                  )}

                  {/* Quick coupon chips */}
                  {!appliedCoupon && (
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto text-[10px]">
                      <span className="text-stone-400">Try:</span>
                      <button
                        onClick={() => {
                          setCouponCodeInput('FIRST15');
                        }}
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-mono rounded border border-amber-200 transition-colors"
                      >
                        FIRST15
                      </button>
                      <button
                        onClick={() => {
                          setCouponCodeInput('KARTOVA100');
                        }}
                        className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-mono rounded border border-amber-200 transition-colors"
                      >
                        KARTOVA100
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-stone-100 bg-white space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-stone-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-medium">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-base text-stone-950">${estimatedTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full py-2.5 px-3 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors text-center"
                >
                  View Full Cart
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full btn-brand-primary py-2.5 px-3 text-xs flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="text-[11px] text-center text-stone-400 flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-teal-600" />
                <span>Encrypted 256-bit checkout & easy returns</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
