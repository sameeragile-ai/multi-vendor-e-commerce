import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Order, Seller } from '../../../types';
import { Download, Calendar, DollarSign, TrendingUp, Filter } from 'lucide-react';

export const SellerReports: React.FC = () => {
  const { activeSellerId, addToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [ords, s] = await Promise.all([
          api.getOrders({ role: 'seller', entityId: activeSellerId }),
          api.getSellerById(activeSellerId),
        ]);
        setOrders(ords);
        setSeller(s);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeSellerId]);

  const commissionRate = seller?.commissionRate || 10;

  // Filter orders by date range
  const filteredOrders = orders.filter((o) => {
    if (dateRange === 'all') return true;
    const days = dateRange === '7d' ? 7 : 30;
    const pastTime = Date.now() - days * 24 * 3600 * 1000;
    return new Date(o.createdAt).getTime() >= pastTime;
  });

  const grossSales = filteredOrders.reduce((acc, o) => {
    const sItems = o.items.filter((i) => i.sellerId === activeSellerId);
    return acc + sItems.reduce((sub, i) => sub + i.totalPrice, 0);
  }, 0);

  const platformCommission = (grossSales * commissionRate) / 100;
  const netEarnings = grossSales - platformCommission;

  // Real CSV File Export Generation
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      addToast({
        type: 'warning',
        message: 'No orders available for the selected period.',
      });
      return;
    }

    const headers = [
      'Order Number',
      'Date',
      'Customer',
      'Items Purchased',
      'Gross Amount',
      'Platform Fee %',
      'Commission Deducted',
      'Net Payout',
      'Order Status',
    ];

    const rows = filteredOrders.map((o) => {
      const sItems = o.items.filter((i) => i.sellerId === activeSellerId);
      const gross = sItems.reduce((acc, i) => acc + i.totalPrice, 0);
      const comm = (gross * commissionRate) / 100;
      const net = gross - comm;
      const itemsList = sItems.map((i) => `${i.productTitle} (x${i.quantity})`).join('; ');

      return [
        o.orderNumber,
        new Date(o.createdAt).toISOString().split('T')[0],
        `"${o.customerName}"`,
        `"${itemsList}"`,
        gross.toFixed(2),
        `${commissionRate}%`,
        comm.toFixed(2),
        net.toFixed(2),
        o.status,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Kartova_Sales_Report_${seller?.storeSlug || 'store'}_${dateRange}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Report Downloaded',
      message: 'Generated comprehensive reconciliation file.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Sales Reports & Tax Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Download financial reconciliation spreadsheets with line-item commission breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setDateRange('7d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === '7d' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === '30d' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                dateRange === 'all' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="btn-brand-primary px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">Gross Merchandise Volume</span>
          <div className="text-2xl font-extrabold text-stone-950">${grossSales.toFixed(2)}</div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Across {filteredOrders.length} customer transactions
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">
            Marketplace Commission ({commissionRate}%)
          </span>
          <div className="text-2xl font-extrabold text-amber-600">
            -${platformCommission.toFixed(2)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Platform governance and hosting fee
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">Net Settled Revenue</span>
          <div className="text-2xl font-extrabold text-teal-700">${netEarnings.toFixed(2)}</div>
          <span className="text-[11px] text-teal-600 font-medium mt-1 block">
            Directly credited into your bank account
          </span>
        </div>
      </div>

      {/* Orders Ledger Preview */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Ledger Reconciliation Preview ({filteredOrders.length} Records)
          </h3>
          <span className="text-[11px] text-stone-400">All amounts in USD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Gross ($)</th>
                <th className="py-3 px-4">Fee ({commissionRate}%)</th>
                <th className="py-3 px-4">Net Payout ($)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {filteredOrders.map((o) => {
                const sItems = o.items.filter((i) => i.sellerId === activeSellerId);
                const gross = sItems.reduce((acc, i) => acc + i.totalPrice, 0);
                const fee = (gross * commissionRate) / 100;
                const net = gross - fee;

                return (
                  <tr key={o.id} className="hover:bg-stone-50/80">
                    <td className="py-3 px-4 font-bold text-stone-900">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-stone-600 font-sans">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-bold">${gross.toFixed(2)}</td>
                    <td className="py-3 px-4 text-amber-600">-${fee.toFixed(2)}</td>
                    <td className="py-3 px-4 text-teal-700 font-bold">${net.toFixed(2)}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {o.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
