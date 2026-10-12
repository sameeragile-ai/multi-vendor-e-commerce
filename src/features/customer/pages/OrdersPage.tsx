import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { Order, OrderStatus } from '../../../types';
import { useStore } from '../../../store';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  Package,
  ChevronRight,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const list = await api.getOrders({ role: 'customer', entityId: currentUser.id });
        setOrders(list);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [currentUser]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      const matchNumber = o.orderNumber.toLowerCase().includes(q);
      const matchItem = o.items.some((i) => i.productTitle.toLowerCase().includes(q));
      return matchNumber || matchItem;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
      case 'confirmed':
        return (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock size={12} />
            Order Placed
          </span>
        );
      case 'packed':
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Package size={12} />
            Packed by Seller
          </span>
        );
      case 'shipped':
        return (
          <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Truck size={12} />
            In Transit
          </span>
        );
      case 'delivered':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={12} />
            Delivered
          </span>
        );
      case 'return_requested':
        return (
          <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <RotateCcw size={12} />
            Return Pending
          </span>
        );
      case 'returned':
        return (
          <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <RotateCcw size={12} />
            Refunded
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">My Purchase History</h1>
          <p className="text-xs text-stone-500 mt-1">
            Track packages, inspect invoices, and initiate 7-day hassle-free returns
          </p>
        </div>

        {/* Search orders */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by order # or product"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
        {(['all', 'shipped', 'delivered', 'return_requested'] as const).map((tab) => (
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
        ))}
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-stone-200 animate-pulse space-y-3">
              <div className="h-4 bg-stone-100 rounded w-1/4" />
              <div className="h-16 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
          <Package size={36} className="text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900">No orders found</h3>
          <p className="text-xs text-stone-500 mt-1">
            You don&apos;t have any orders matching the selected filter.
          </p>
          <Link
            to="/search"
            className="mt-5 btn-brand-primary px-5 py-2.5 text-xs inline-flex items-center gap-1.5"
          >
            Browse Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="group bg-white rounded-2xl border border-stone-200/80 p-5 hover:border-stone-300 hover:shadow-md transition-all cursor-pointer space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-stone-900">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <ChevronRight size={15} className="text-stone-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Order items preview */}
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                      <ImageWithFallback
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.productTitle}
                      </h4>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        Fulfilled by: {item.sellerName} · Qty: {item.quantity}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      ${item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <span>
                  Total Amount Paid:{' '}
                  <span className="font-bold text-stone-950">${order.total.toFixed(2)}</span>
                </span>
                <span className="font-semibold text-[#FF6B4A] hover:underline">
                  View Timeline & Return Request →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
