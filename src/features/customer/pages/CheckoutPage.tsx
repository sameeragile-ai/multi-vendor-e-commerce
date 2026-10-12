import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Address, OrderItem, Product, Seller } from '../../../types';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Truck,
  MapPin,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    clearCart,
    currentUser,
    appliedCoupon,
    addToast,
  } = useStore();

  const [productsMap, setProductsMap] = useState<Record<string, Product>>({});
  const [sellersMap, setSellersMap] = useState<Record<string, Seller>>({});

  // 3-step checkout state
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr_1');
  const [newAddress, setNewAddress] = useState<Address>({
    id: `addr_${Date.now()}`,
    name: currentUser.name,
    phone: currentUser.phone || '+1 (555) 234-8890',
    street: '742 Evergreen Terrace',
    apartment: 'Apt 4B',
    city: 'Portland',
    state: 'OR',
    zipCode: '97201',
    country: 'United States',
    isDefault: true,
    type: 'home',
  });

  // Shipping Speed: standard vs express
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');

  // Payment Method: card, upi, cod
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [upiId, setUpiId] = useState('alex@okhdfcbank');

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleteId, setOrderCompleteId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeta() {
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
    loadMeta();
  }, []);

  if (cartItems.length === 0 && !orderCompleteId) {
    navigate('/cart');
    return null;
  }

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

  const baseDeliveryFee =
    subtotal === 0 || subtotal >= APP_CONFIG.shipping.freeShippingThreshold
      ? 0
      : APP_CONFIG.shipping.standardDeliveryFee;
  const deliveryFee =
    shippingMethod === 'express' ? baseDeliveryFee + APP_CONFIG.shipping.expressDeliveryFee : baseDeliveryFee;
  const tax = Math.round((subtotal * APP_CONFIG.taxRatePercent) / 100 * 100) / 100;
  const total = Math.max(0, subtotal - discount + deliveryFee + tax);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Build order items
      const orderItems: OrderItem[] = cartItems.map((c) => {
        const prod = productsMap[c.productId];
        const seller = sellersMap[c.sellerId];
        const variant = prod?.variants.find((v) => v.id === c.variantId);

        return {
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          productId: c.productId,
          variantId: c.variantId,
          variantName: variant?.name,
          productTitle: prod?.title || 'Marketplace Item',
          productImage: prod?.images[0] || '',
          sellerId: c.sellerId,
          sellerName: seller?.businessName || 'Verified Seller',
          quantity: c.quantity,
          unitPrice: c.price,
          totalPrice: c.price * c.quantity,
        };
      });

      const newOrder = await api.createOrder({
        customerId: currentUser.id,
        customerName: newAddress.name || currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: newAddress.phone,
        items: orderItems,
        shippingAddress: newAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        subtotal,
        discount,
        couponCode: appliedCoupon?.code,
        deliveryFee,
        tax,
        total,
        estimatedDelivery: new Date(Date.now() + 86400000 * (shippingMethod === 'express' ? 2 : 4))
          .toISOString()
          .split('T')[0],
      });

      // Fire celebratory confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      clearCart();
      setOrderCompleteId(newOrder.id);
      addToast({
        type: 'success',
        title: 'Payment Successful',
        message: `Order #${newOrder.orderNumber} placed successfully!`,
      });
    } catch (err) {
      console.error('Order creation error', err);
      addToast({
        type: 'error',
        title: 'Payment Gateway Error',
        message: 'Could not process transaction. Please retry.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Order Success View
  if (orderCompleteId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10 animate-in zoom-in duration-300">
          <CheckCircle2 size={44} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-950">
          Payment & Order Confirmed!
        </h1>
        <p className="text-xs text-stone-600 mt-2 max-w-md mx-auto">
          We&apos;ve notified the verified sellers to prepare and dispatch your items. You can inspect
          live tracking milestones on your orders dashboard.
        </p>

        <div className="mt-8 p-6 bg-white rounded-2xl border border-stone-200/80 shadow-xs text-left text-xs space-y-2">
          <div className="flex justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500">Order ID:</span>
            <span className="font-mono font-bold text-stone-900">{orderCompleteId}</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-stone-100">
            <span className="text-stone-500">Total Paid:</span>
            <span className="font-bold text-stone-900">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500">Delivery Address:</span>
            <span className="font-semibold text-stone-800 text-right">
              {newAddress.street}, {newAddress.city}
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(`/orders/${orderCompleteId}`)}
            className="w-full sm:w-auto btn-brand-primary px-6 py-3 text-xs font-bold inline-flex items-center justify-center gap-2"
          >
            <span>Track Order Timeline</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-3 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Checkout Progress Bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 ${
              currentStep >= 1 ? 'text-[#FF6B4A]' : 'text-stone-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Delivery Address</span>
          </button>

          <div
            className={`flex-1 h-0.5 mx-4 ${
              currentStep >= 2 ? 'bg-[#FF6B4A]' : 'bg-stone-200'
            }`}
          />

          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 ${
              currentStep >= 2 ? 'text-[#FF6B4A]' : 'text-stone-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[11px]">
              2
            </span>
            <span>Delivery Speed</span>
          </button>

          <div
            className={`flex-1 h-0.5 mx-4 ${
              currentStep >= 3 ? 'bg-[#FF6B4A]' : 'bg-stone-200'
            }`}
          />

          <button
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 ${
              currentStep === 3 ? 'text-[#FF6B4A]' : 'text-stone-400'
            }`}
          >
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-[11px]">
              3
            </span>
            <span>Secure Payment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Step Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: Shipping Address */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <MapPin size={18} className="text-[#FF6B4A]" />
                <h2 className="text-base font-bold text-stone-900">
                  Select or Enter Delivery Address
                </h2>
              </div>

              {/* Saved Address Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedAddressId('addr_1')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === 'addr_1'
                      ? 'border-[#FF6B4A] bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900">{newAddress.name}</span>
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-semibold uppercase">
                      Home
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {newAddress.street}, {newAddress.apartment}
                    <br />
                    {newAddress.city}, {newAddress.state} {newAddress.zipCode}
                  </p>
                  <div className="text-[11px] text-stone-500 mt-2 font-mono">
                    Phone: {newAddress.phone}
                  </div>
                </div>

                <div
                  onClick={() => setSelectedAddressId('addr_2')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === 'addr_2'
                      ? 'border-[#FF6B4A] bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900">Alex Morgan (Office)</span>
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600 font-semibold uppercase">
                      Work
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    1200 NW Marshall St, Floor 3
                    <br />
                    Portland, OR 97209
                  </p>
                  <div className="text-[11px] text-stone-500 mt-2 font-mono">
                    Phone: +1 (555) 234-8890
                  </div>
                </div>
              </div>

              {/* Edit form */}
              <div className="pt-4 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-stone-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State & Zip Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-1/2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                    />
                    <input
                      type="text"
                      value={newAddress.zipCode}
                      onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                      className="w-1/2 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="btn-brand-primary px-6 py-2.5 text-xs inline-flex items-center gap-2"
                >
                  <span>Continue to Delivery Options</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Speed */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Truck size={18} className="text-[#FF6B4A]" />
                <h2 className="text-base font-bold text-stone-900">Choose Shipping Speed</h2>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setShippingMethod('standard')}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'standard'
                      ? 'border-[#FF6B4A] bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="mt-1 text-[#FF6B4A] focus:ring-[#FF6B4A]"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        Standard Insured Ground Delivery (3–5 Business Days)
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Delivered via FedEx or UPS with tracking updates
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    {baseDeliveryFee === 0 ? 'FREE' : `$${baseDeliveryFee.toFixed(2)}`}
                  </span>
                </label>

                <label
                  onClick={() => setShippingMethod('express')}
                  className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === 'express'
                      ? 'border-[#FF6B4A] bg-amber-50/40 shadow-xs'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="mt-1 text-[#FF6B4A] focus:ring-[#FF6B4A]"
                    />
                    <div>
                      <div className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                        <span>Express Air Dispatch (1–2 Business Days)</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                          Fastest
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Priority courier dispatch with signature delivery
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-stone-900">
                    ${(baseDeliveryFee + APP_CONFIG.shipping.expressDeliveryFee).toFixed(2)}
                  </span>
                </label>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-brand-primary px-6 py-2.5 text-xs inline-flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Gateway Selection */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-5 animate-in fade-in-50 duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <Lock size={18} className="text-[#FF6B4A]" />
                <h2 className="text-base font-bold text-stone-900">
                  Select Secure Payment Method
                </h2>
              </div>

              {/* Payment Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-stone-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="text-xs">Credit / Debit Card</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-stone-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <QrCode size={18} />
                  <span className="text-xs">Instant UPI / Wallet</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-stone-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Banknote size={18} />
                  <span className="text-xs">Cash on Delivery</span>
                </button>
              </div>

              {/* Payment Method Details Form */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-stone-50 rounded-xl space-y-3 text-xs border border-stone-200/60">
                  <div className="flex items-center justify-between text-stone-500 font-medium pb-2 border-b border-stone-200/60">
                    <span>Demo Card (Auto-filled)</span>
                    <span className="font-mono text-[11px]">VISA Encrypted</span>
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'upi' && (
                <div className="p-4 bg-stone-50 rounded-xl space-y-3 text-xs border border-stone-200/60">
                  <div className="text-stone-700 font-semibold">Enter your UPI ID / VPA:</div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg font-medium"
                    placeholder="username@bank"
                  />
                  <p className="text-[11px] text-stone-500">
                    A simulated approval request will be sent to your UPI application.
                  </p>
                </div>
              )}

              {paymentMethod === 'cod' && (
                <div className="p-4 bg-stone-50 rounded-xl text-xs border border-stone-200/60 space-y-1">
                  <div className="font-semibold text-stone-900">Cash on Delivery Verification</div>
                  <p className="text-stone-500 text-[11px]">
                    Pay in cash or digital scan upon courier arrival at your doorstep.
                  </p>
                </div>
              )}

              <div className="pt-3 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="btn-brand-primary px-8 py-3 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authorizing Payment Gateway...
                    </span>
                  ) : (
                    <>
                      <span>Authorize & Place Order (${total.toFixed(2)})</span>
                      <ShieldCheck size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Sticky Summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-950 pb-2 border-b border-stone-100">
              Order Review ({cartItems.length} items)
            </h3>

            <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto space-y-2.5">
              {cartItems.map((item) => {
                const p = productsMap[item.productId];
                return (
                  <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3 text-xs">
                    <img
                      src={p?.images[0]}
                      alt={p?.title}
                      className="w-10 h-10 rounded-md object-cover bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-stone-900 truncate">{p?.title}</div>
                      <div className="text-[11px] text-stone-500">Qty: {item.quantity}</div>
                    </div>
                    <span className="font-bold text-stone-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-stone-100 flex justify-between text-sm font-extrabold text-stone-950">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
