import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { Order } from '../../../types';
import { useStore } from '../../../store';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  RotateCcw,
  AlertCircle,
  Copy,
  ChevronLeft,
  X,
  Upload,
} from 'lucide-react';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Return modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged or Defective Item');
  const [returnExplanation, setReturnExplanation] = useState('');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await api.getOrderById(id);
        setOrder(found);
      } catch (err) {
        console.error('Failed to load order', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded w-1/3" />
        <div className="h-32 bg-stone-200 rounded-2xl" />
        <div className="h-48 bg-stone-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold text-stone-900">Order Not Found</h2>
        <button
          onClick={() => navigate('/orders')}
          className="mt-4 btn-brand-primary px-4 py-2 text-xs"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const handleCopyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      addToast({
        type: 'info',
        message: 'Tracking number copied to clipboard.',
      });
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      const updated = await api.updateOrderStatus(order.id, 'cancelled', {
        note: 'Cancelled by customer before seller shipment.',
      });
      setOrder(updated);
      addToast({
        type: 'info',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled and full payment refunded.',
      });
    }
  };

  const handleSubmitReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnExplanation.trim()) return;
    setIsSubmittingReturn(true);

    try {
      const updated = await api.requestReturn(
        order.id,
        returnReason,
        returnExplanation,
        returnPhotoUrl || order.items[0]?.productImage
      );
      setOrder(updated);
      setIsReturnModalOpen(false);
      addToast({
        type: 'success',
        title: 'Return Request Submitted',
        message: 'Seller and marketplace administration have been notified.',
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: 'Failed to submit return request.',
      });
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // Timeline progress steps
  const steps = [
    { key: 'placed', label: 'Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 font-semibold mb-2"
          >
            <ChevronLeft size={14} />
            <span>Back to All Orders</span>
          </button>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Order #{order.orderNumber}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Placed on {new Date(order.createdAt).toLocaleString()} · Paid via{' '}
            {order.paymentMethod.toUpperCase()}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {['placed', 'confirmed'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
              Cancel Order
            </button>
          )}

          {['delivered'].includes(order.status) && !order.returnRequest && (
            <button
              onClick={() => setIsReturnModalOpen(true)}
              className="btn-brand-primary px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Request Return / Refund</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Tracking Progress Tracker */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
              Delivery Tracking
            </span>
            <h2 className="text-base font-bold text-stone-900 mt-0.5">
              Estimated Delivery: {order.estimatedDelivery}
            </h2>
          </div>

          {order.trackingNumber && (
            <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-stone-500 font-medium">{order.courier}:</span>
              <span className="font-mono font-bold text-stone-900">{order.trackingNumber}</span>
              <button
                onClick={handleCopyTracking}
                className="text-stone-400 hover:text-stone-700 p-0.5"
                title="Copy tracking"
              >
                <Copy size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Step circles */}
        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4 sm:px-8 mb-8">
          <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-stone-100 -z-0">
            <div
              className="h-full bg-gradient-brand transition-all duration-500"
              style={{
                width: `${
                  currentStepIdx >= 0
                    ? (currentStepIdx / (steps.length - 1)) * 100
                    : order.status === 'return_requested' || order.status === 'returned'
                    ? 100
                    : 20
                }%`,
              }}
            />
          </div>

          {steps.map((st, idx) => {
            const isPassed = currentStepIdx >= idx;
            const isCurrent = currentStepIdx === idx;

            return (
              <div key={st.key} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isPassed
                      ? 'bg-[#FF6B4A] text-white shadow-md shadow-[#FF6B4A]/25'
                      : 'bg-white border-2 border-stone-200 text-stone-400'
                  }`}
                >
                  {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span
                  className={`text-xs mt-2 font-semibold ${
                    isCurrent ? 'text-stone-950 font-bold' : isPassed ? 'text-stone-700' : 'text-stone-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Timeline Events Log */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-4">
            Carrier Milestones
          </h3>
          <div className="space-y-4 pl-4 border-l-2 border-stone-200 text-xs">
            {order.timeline.map((ev, i) => (
              <div key={i} className="relative pl-4">
                <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FF6B4A] ring-4 ring-white" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{ev.title}</span>
                  <span className="text-[11px] text-stone-400 font-mono">{ev.timestamp}</span>
                </div>
                <p className="text-stone-600 mt-0.5 text-xs">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Return Request Banner if active */}
      {order.returnRequest && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <RotateCcw size={16} className="text-amber-700" />
            <span className="font-bold text-amber-950">
              Return Request Status: {order.returnRequest.status.toUpperCase()}
            </span>
          </div>
          <p className="text-amber-900">
            <span className="font-semibold">Reason:</span> {order.returnRequest.reason} -{' '}
            {order.returnRequest.explanation}
          </p>
          {order.returnRequest.adminSellerNote && (
            <div className="p-3 bg-white/70 rounded-xl text-amber-950 mt-2">
              <span className="font-semibold">Seller/Admin Note:</span>{' '}
              {order.returnRequest.adminSellerNote}
            </div>
          )}
        </div>
      )}

      {/* Ordered Items & Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-stone-950 pb-3 border-b border-stone-100">
            Items in this Package
          </h3>

          <div className="divide-y divide-stone-100 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                  <ImageWithFallback
                    src={item.productImage}
                    alt={item.productTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900">{item.productTitle}</h4>
                  {item.variantName && (
                    <div className="text-[11px] text-stone-500 mt-0.5">{item.variantName}</div>
                  )}
                  <div className="text-xs text-stone-600 mt-1">
                    Seller: <span className="font-medium">{item.sellerName}</span> · Qty:{' '}
                    {item.quantity}
                  </div>
                </div>
                <span className="text-xs font-extrabold text-stone-950">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-bold text-stone-950 pb-2 border-b border-stone-100">
            Delivery Address
          </h3>
          <div className="text-stone-600 leading-relaxed">
            <div className="font-bold text-stone-900">{order.shippingAddress.name}</div>
            <div>{order.shippingAddress.street}</div>
            {order.shippingAddress.apartment && <div>{order.shippingAddress.apartment}</div>}
            <div>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.zipCode}
            </div>
            <div className="text-stone-400 mt-1">{order.shippingAddress.phone}</div>
          </div>

          <h3 className="text-sm font-bold text-stone-950 pt-2 pb-2 border-b border-stone-100">
            Payment Breakdown
          </h3>
          <div className="space-y-1.5 text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount ({order.couponCode})</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>${order.deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-stone-100 flex justify-between font-bold text-sm text-stone-950">
              <span>Total Paid</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs"
            onClick={() => setIsReturnModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <RotateCcw size={18} className="text-[#FF6B4A]" />
                <h3 className="text-base font-bold text-stone-950">Request Return & Refund</h3>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="Damaged or Defective Item">Damaged or Defective Item</option>
                  <option value="Wrong Item or Size Received">Wrong Item or Size Received</option>
                  <option value="Item Does Not Match Description">
                    Item Does Not Match Description
                  </option>
                  <option value="Quality Did Not Meet Expectation">
                    Quality Did Not Meet Expectation
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Explanation / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Please describe the defect, damage, or discrepancy in detail..."
                  value={returnExplanation}
                  onChange={(e) => setReturnExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Photo Attachment (Simulated Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://... image of defect"
                    value={returnPhotoUrl}
                    onChange={(e) => setReturnPhotoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setReturnPhotoUrl(
                        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80'
                      )
                    }
                    className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-semibold text-[11px]"
                  >
                    Use Sample Photo
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReturn}
                  className="btn-brand-primary px-5 py-2 text-xs"
                >
                  {isSubmittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
