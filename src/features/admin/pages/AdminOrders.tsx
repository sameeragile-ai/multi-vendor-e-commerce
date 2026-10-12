import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Order, OrderStatus } from '../../../types';
import { useStore } from '../../../store';
import { ShoppingBag, Search, ExternalLink, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminOrders: React.FC = () => {
  const { addToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const list = await api.getOrders();
    setOrders(list);
  }

  const handleForceUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await api.updateOrderStatus(orderId, newStatus, {
      note: `Admin override update to ${newStatus}.`,
    });
    setOrders(orders.map((o) => (o.id === orderId ? updated : o)));
    addToast({
      type: 'info',
      title: 'Order Status Overridden',
      message: `Order #${updated.orderNumber} transitioned to ${newStatus}.`,
    });
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      return (
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Global Orders Oversight & Logistics
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Cross-vendor fulfillment audit, package tracking status, and administrative override controls.
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

      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Order # & Timestamp</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Vendors Involved</th>
                <th className="py-3 px-4">Total GMV</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Admin Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-stone-900">{o.orderNumber}</span>
                    <span className="text-[10px] text-stone-400 block font-sans">
                      {new Date(o.createdAt).toLocaleString()}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-900">{o.customerName}</div>
                    <div className="text-[11px] text-stone-500">{o.customerEmail}</div>
                  </td>

                  <td className="py-3.5 px-4 text-stone-700">
                    {Array.from(new Set(o.items.map((i) => i.sellerName))).join(', ')}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-stone-950">
                    ${o.total.toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                      {o.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={o.status}
                        onChange={(e) => handleForceUpdateStatus(o.id, e.target.value as OrderStatus)}
                        className="px-2 py-1 bg-stone-100 border border-stone-200 rounded font-semibold text-[11px]"
                      >
                        <option value="placed">placed</option>
                        <option value="confirmed">confirmed</option>
                        <option value="packed">packed</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                        <option value="return_requested">return_requested</option>
                        <option value="returned">returned</option>
                        <option value="cancelled">cancelled</option>
                      </select>

                      <Link
                        to={`/orders/${o.id}`}
                        target="_blank"
                        className="p-1 text-stone-400 hover:text-stone-700"
                        title="View order tracking"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
