import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { User, Order } from '../../../types';
import { useStore } from '../../../store';
import { Users, Search, ShieldCheck, UserX, UserCheck } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { addToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suspendedUsers, setSuspendedUsers] = useState<string[]>([]);

  // Demo customer list
  const [customers, setCustomers] = useState([
    {
      id: 'user_alex',
      name: 'Alex Morgan',
      email: 'alex.morgan@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      joined: 'Jan 10, 2026',
      city: 'Portland, OR',
    },
    {
      id: 'usr_2',
      name: 'David Chen',
      email: 'david.chen@soundpro.io',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      joined: 'Feb 14, 2026',
      city: 'Seattle, WA',
    },
    {
      id: 'usr_3',
      name: 'Sarah Jenkins',
      email: 'sjenkins@craftstudio.org',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      joined: 'Mar 02, 2026',
      city: 'Austin, TX',
    },
    {
      id: 'usr_4',
      name: 'Elena Rostova',
      email: 'elena.rostova@design.co',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      joined: 'Apr 21, 2026',
      city: 'New York, NY',
    },
  ]);

  useEffect(() => {
    async function loadData() {
      const ords = await api.getOrders();
      setOrders(ords);
    }
    loadData();
  }, []);

  const handleToggleSuspend = (userId: string, name: string) => {
    if (suspendedUsers.includes(userId)) {
      setSuspendedUsers(suspendedUsers.filter((id) => id !== userId));
      addToast({
        type: 'success',
        message: `Account ${name} reinstated.`,
      });
    } else {
      setSuspendedUsers([...suspendedUsers, userId]);
      addToast({
        type: 'info',
        message: `Account ${name} suspended.`,
      });
    }
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Customer Directory & Access Control
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit shopper purchase totals, enforce anti-fraud security, and manage account statuses.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search shopper name or email..."
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
                <th className="py-3 px-4">Shopper</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Account Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => {
                const isSuspended = suspendedUsers.includes(c.id);
                const userOrders = orders.filter((o) => o.customerId === c.id);
                const spent = userOrders.reduce((acc, o) => acc + o.total, 0);

                return (
                  <tr key={c.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{c.name}</div>
                          <div className="text-[11px] text-stone-400">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-stone-600">{c.city}</td>

                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {userOrders.length || 2} orders
                    </td>

                    <td className="py-3.5 px-4 font-bold text-stone-950">
                      ${(spent || 428.5).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isSuspended
                            ? 'bg-red-50 text-red-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleSuspend(c.id, c.name)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          isSuspended
                            ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {isSuspended ? 'Reinstate' : 'Suspend Account'}
                      </button>
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
