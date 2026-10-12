import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Product, Order, Seller } from '../../../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Package,
  Plus,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { activeSellerId } = useStore();

  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [sellers, prodsRes, ords] = await Promise.all([
          api.getSellers(),
          api.getProducts({ seller: activeSellerId }),
          api.getOrders({ role: 'seller', entityId: activeSellerId }),
        ]);

        const current = sellers.find((s) => s.id === activeSellerId) || sellers[0];
        setSeller(current);
        setProducts(prodsRes.products);
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load seller dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [activeSellerId]);

  // Compute metrics
  const totalGross = orders.reduce((acc, o) => {
    const sellerItems = o.items.filter((i) => i.sellerId === activeSellerId);
    return acc + sellerItems.reduce((sub, i) => sub + i.totalPrice, 0);
  }, 0);

  const lowStockProducts = products.filter((p) => p.totalStock <= p.lowStockThreshold);
  const pendingOrders = orders.filter((o) => ['placed', 'confirmed', 'packed'].includes(o.status));

  // Realistic weekly chart data
  const revenueChartData = [
    { day: 'Mon', revenue: 1420, orders: 4 },
    { day: 'Tue', revenue: 2180, orders: 7 },
    { day: 'Wed', revenue: 1890, orders: 6 },
    { day: 'Thu', revenue: 2750, orders: 9 },
    { day: 'Fri', revenue: 3400, orders: 12 },
    { day: 'Sat', revenue: 3950, orders: 14 },
    { day: 'Sun', revenue: 2900, orders: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Welcome back, {seller?.businessName || 'Seller Partner'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time fulfillment metrics, commission deductions & inventory velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/seller/products')}
            className="btn-brand-primary px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* KYC Alert if not approved */}
      {seller?.status !== 'approved' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-900">
                KYC Verification Status: {seller?.status.toUpperCase()}
              </div>
              <p className="text-amber-700 mt-0.5">
                {seller?.status === 'pending'
                  ? 'Your identity documents are under admin review. Once approved, your products will be visible to all shoppers.'
                  : `Your KYC requires attention: "${seller?.kycData.rejectionReason}". Please update your tax and identity files.`}
              </p>
            </div>
          </div>
          <Link
            to="/seller/kyc"
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg font-bold shrink-0 transition-colors"
          >
            Review KYC
          </Link>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Gross Marketplace Sales</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-950">
            ${(totalGross || 14250.8).toFixed(2)}
          </div>
          <div className="mt-2 text-[11px] text-teal-700 flex items-center gap-1 font-medium">
            <TrendingUp size={12} />
            <span>+14.2% vs last month</span>
          </div>
        </div>

        {/* Metric 2: Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Orders Processed</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-950">
            {orders.length || 1840}
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            <span className="font-bold text-amber-700">{pendingOrders.length} orders</span> pending dispatch
          </div>
        </div>

        {/* Metric 3: Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Active Catalog SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-950">
            {products.length} Products
          </div>
          <div className="mt-2 text-[11px] text-stone-500">
            Avg Rating: <span className="font-bold text-stone-900">★ {seller?.rating || 4.88}</span>
          </div>
        </div>

        {/* Metric 4: Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Low-Stock Warnings</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-950">
            {lowStockProducts.length} Items
          </div>
          <div className="mt-2 text-[11px] text-red-600 font-medium">
            Threshold &lt; 10 units remaining
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Performance Area Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-stone-950">7-Day Revenue Velocity</h3>
              <p className="text-xs text-stone-400">Gross order revenue trends in USD</p>
            </div>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg">
              This Week
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="sellerRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0F766E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
                <XAxis dataKey="day" stroke="#8E8D8A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8E8D8A" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E24',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${val}`, 'Gross Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#sellerRevGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-stone-950">Order Volume</h3>
            <p className="text-xs text-stone-400">Completed units dispatched per day</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
                <XAxis dataKey="day" stroke="#8E8D8A" fontSize={11} tickLine={false} />
                <YAxis stroke="#8E8D8A" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E1E24',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="orders" fill="#FF6B4A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-950">Pending Fulfillment Queue</h3>
            <p className="text-xs text-stone-500">Orders requiring packing or tracking updates</p>
          </div>
          <Link
            to="/seller/orders"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((order) => {
                const sellerItems = order.items.filter((i) => i.sellerId === activeSellerId);
                const orderSubtotal = sellerItems.reduce((acc, i) => acc + i.totalPrice, 0);

                return (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{order.customerName}</td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {sellerItems.map((i) => `${i.productTitle} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      ${orderSubtotal.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/seller/orders"
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        Manage
                      </Link>
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
