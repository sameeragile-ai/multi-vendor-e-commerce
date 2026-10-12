import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Order, OrderStatus } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  ShoppingBag,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  X,
  ExternalLink,
} from 'lucide-react';

export const SellerOrders: React.FC = () => {
  const { activeSellerId, addToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Ship Modal
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [courierName, setCourierName] = useState('FedEx Express');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');

  useEffect(() => {
    loadOrders();
  }, [activeSellerId]);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const list = await api.getOrders({ role: 'seller', entityId: activeSellerId });
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status, { note });
      setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
      addToast({
        type: 'success',
        title: 'Order Status Synchronized',
        message: `Order #${updated.orderNumber} is now ${status}. Customer timeline updated.`,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: 'Failed to update order status.',
      });
    }
  };

  const handleOpenShipModal = (order: Order) => {
    setShippingOrder(order);
    setCourierName('FedEx Express');
    setTrackingNumberInput(`FX-${Math.floor(100000000 + Math.random() * 900000000)}-US`);
  };

  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingOrder || !trackingNumberInput.trim()) return;

    try {
      const updated = await api.updateOrderStatus(shippingOrder.id, 'shipped', {
        courier: courierName,
        trackingNumber: trackingNumberInput,
        note: `Dispatched with ${courierName} tracking ${trackingNumberInput}.`,
      });
      setOrders(orders.map((o) => (o.id === shippingOrder.id ? updated : o)));
      setShippingOrder(null);
      addToast({
        type: 'success',
        title: 'Package Dispatched',
        message: `Tracking #${trackingNumberInput} broadcasted to customer!`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Fulfillment & Order Processing
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Accept buyer orders, print packaging manifests, and input live courier tracking numbers.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search order # or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {(['all', 'placed', 'confirmed', 'packed', 'shipped', 'delivered', 'return_requested'] as const).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl capitalize transition-all shrink-0 ${
                statusFilter === tab
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer & Destination</th>
                <th className="py-3 px-4">Allocated Items</th>
                <th className="py-3 px-4">Net Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    No orders matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const sellerItems = order.items.filter((i) => i.sellerId === activeSellerId);
                  const sellerGross = sellerItems.reduce((acc, i) => acc + i.totalPrice, 0);

                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-stone-900">
                          {order.orderNumber}
                        </div>
                        <div className="text-[11px] text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">{order.customerName}</div>
                        <div className="text-[11px] text-stone-500">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          {sellerItems.map((item) => (
                            <div key={item.id} className="truncate text-stone-800">
                              <span className="font-bold text-stone-900">x{item.quantity}</span>{' '}
                              {item.productTitle}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-stone-950">
                        ${sellerGross.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                          {order.status}
                        </span>
                        {order.trackingNumber && (
                          <div className="text-[10px] font-mono text-indigo-700 mt-1">
                            {order.trackingNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status === 'placed' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-lg transition-colors"
                            >
                              Confirm
                            </button>
                          )}

                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'packed')}
                              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-900 font-bold rounded-lg transition-colors"
                            >
                              Mark Packed
                            </button>
                          )}

                          {order.status === 'packed' && (
                            <button
                              onClick={() => handleOpenShipModal(order)}
                              className="btn-brand-primary px-3 py-1 font-bold text-xs"
                            >
                              Dispatch Courier
                            </button>
                          )}

                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors"
                            >
                              Mark Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ship & Add Tracking Modal */}
      {shippingOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setShippingOrder(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-[#FF6B4A]" />
                <h3 className="text-base font-bold text-stone-950">
                  Dispatch Package #{shippingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setShippingOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmShipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Logistics Carrier Partner
                </label>
                <select
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  <option value="FedEx Express">FedEx Express</option>
                  <option value="UPS Ground">UPS Ground</option>
                  <option value="DHL Air Priority">DHL Air Priority</option>
                  <option value="USPS Priority Mail">USPS Priority Mail</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">
                  Tracking Waybill Number
                </label>
                <input
                  type="text"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold"
                  required
                />
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 leading-relaxed text-[11px]">
                Upon submitting, the customer will receive a real-time notification with live tracking
                link in their account.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShippingOrder(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand-primary px-5 py-2 text-xs font-bold">
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
