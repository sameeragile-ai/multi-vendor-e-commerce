import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { Seller, Order, Product } from '../../../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Store,
  Users,
  ShoppingBag,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [sList, oList, pRes] = await Promise.all([
          api.getSellers(),
          api.getOrders(),
          api.getProducts(),
        ]);
        setSellers(sList);
        setOrders(oList);
        setProducts(pRes.products);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalGMV = orders.reduce((acc, o) => acc + o.total, 0);
  const totalCommission = (totalGMV * APP_CONFIG.defaultCommissionPercent) / 100;
  const pendingKycSellers = sellers.filter((s) => s.status === 'pending');
  const approvedSellers = sellers.filter((s) => s.status === 'approved');

  const gmvChartData = [
    { month: 'May', gmv: 34500, commission: 3450 },
    { month: 'Jun', gmv: 42100, commission: 4210 },
    { month: 'Jul', gmv: 51200, commission: 5120 },
    { month: 'Aug', gmv: 68900, commission: 6890 },
    { month: 'Sep', gmv: 82400, commission: 8240 },
    { month: 'Oct', gmv: 98150, commission: 9815 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Marketplace Analytics & Governance
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Cross-tenant transaction monitoring, seller compliance, and treasury ledger.
          </p>
        </div>
      </div>

      {/* Pending KYC Action Callout */}
      {pendingKycSellers.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-amber-950">
                {pendingKycSellers.length} Merchant KYC Submissions Awaiting Audit
              </span>
              <p className="text-amber-800 mt-0.5">
                New sellers submitted incorporation files ({pendingKycSellers.map((s) => s.businessName).join(', ')}).
              </p>
            </div>
          </div>
          <Link
            to="/admin/sellers"
            className="btn-brand-primary px-4 py-2 text-xs font-bold shrink-0"
          >
            Review Documents
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Gross Marketplace Value (GMV)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-950">
            ${(totalGMV + 98150).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
            <TrendingUp size={12} />
            <span>+24.8% Month-over-Month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Net Platform Fees Earned</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-700">
            ${(totalCommission + 9815).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-medium">
            Average Take Rate: <span className="font-bold text-stone-900">{APP_CONFIG.defaultCommissionPercent}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Verified Merchant Stores</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Store size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-950">
            {approvedSellers.length} Active Stores
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-medium">
            {pendingKycSellers.length} pending KYC audits
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Live Marketplace SKUs</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Package size={16} />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-950">
            {products.length} Products
          </div>
          <div className="mt-2 text-[11px] text-stone-500 font-medium">
            Across 8 curated departments
          </div>
        </div>
      </div>

      {/* GMV Growth Chart */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-950">
              Platform GMV & Take-Rate Trends (6-Month Horizon)
            </h3>
            <p className="text-xs text-stone-400">Total consumer spend processed in USD</p>
          </div>
          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-lg">
            Fiscal 2026
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gmvChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adminGmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0ECE1" />
              <XAxis dataKey="month" stroke="#8E8D8A" fontSize={11} tickLine={false} />
              <YAxis stroke="#8E8D8A" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E24',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '11px',
                }}
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'GMV Volume']}
              />
              <Area
                type="monotone"
                dataKey="gmv"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#adminGmvGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
