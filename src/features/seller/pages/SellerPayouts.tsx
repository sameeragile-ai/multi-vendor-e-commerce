import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Payout, Seller } from '../../../types';
import { DollarSign, Clock, CheckCircle2, ShieldCheck, ArrowRight, Building } from 'lucide-react';

export const SellerPayouts: React.FC = () => {
  const { activeSellerId, addToast } = useStore();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSellerId]);

  async function loadData() {
    const [s, payList] = await Promise.all([
      api.getSellerById(activeSellerId),
      api.getPayouts(activeSellerId),
    ]);
    setSeller(s);
    setPayouts(payList);
  }

  const handleRequestPayout = async () => {
    if (!seller) return;
    if (seller.balance <= 0) {
      addToast({
        type: 'warning',
        message: 'No unsettled balance available for payout right now.',
      });
      return;
    }

    setIsRequesting(true);
    try {
      const gross = seller.balance;
      const created = await api.createPayout(seller.id, gross, seller.commissionRate);
      // Deduct balance
      await api.updateSeller(seller.id, { balance: 0, pendingPayouts: seller.pendingPayouts + created.amount });
      addToast({
        type: 'success',
        title: 'Payout Request Initiated',
        message: `$${created.amount.toFixed(2)} scheduled for ACH bank transfer.`,
      });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Commission & Escrow Disbursements
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Track gross merchandise sales, platform commission deductions, and direct deposit settlements.
          </p>
        </div>

        <button
          onClick={handleRequestPayout}
          disabled={isRequesting || (seller?.balance || 0) <= 0}
          className="btn-brand-primary px-5 py-2.5 text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <DollarSign size={15} />
          <span>{isRequesting ? 'Initiating...' : 'Request Payout Disbursement'}</span>
        </button>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">Available Settlement Balance</span>
          <div className="text-2xl font-extrabold text-stone-950">
            ${(seller?.balance || 14250.8).toFixed(2)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Funds cleared past 7-day return guarantee
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">In-Flight / Pending Payouts</span>
          <div className="text-2xl font-extrabold text-amber-600">
            ${(seller?.pendingPayouts || 3180.5).toFixed(2)}
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            Currently processing via bank ACH network
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-xs text-stone-500 font-semibold block mb-1">Contracted Commission Rate</span>
          <div className="text-2xl font-extrabold text-teal-700">
            {seller?.commissionRate || 10}%
          </div>
          <span className="text-[11px] text-teal-600 font-medium mt-1 block">
            Includes hosting, fraud screening & gateway fees
          </span>
        </div>
      </div>

      {/* Linked Bank Account Card */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <Building size={20} />
          </div>
          <div>
            <div className="text-xs font-bold text-stone-900">
              {seller?.kycData.bankName || 'Commercial Bank Checking'}
            </div>
            <div className="text-[11px] text-stone-500 font-mono">
              Account: {seller?.kycData.accountNumber || '•••• •••• 9210'} · Routing:{' '}
              {seller?.kycData.routingOrIfsc || 'SVCB00192'}
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full flex items-center gap-1">
          <ShieldCheck size={12} /> Direct Deposit Active
        </span>
      </div>

      {/* Payout History Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Disbursement Settlement History
          </h3>
          <span className="text-[11px] text-stone-400">Escrow Transfer Wire ID</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Payout Ref #</th>
                <th className="py-3 px-4">Cycle Period</th>
                <th className="py-3 px-4">Gross Sales</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Net Deposited</th>
                <th className="py-3 px-4">Wire Reference</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400 font-sans">
                    No historical disbursements found.
                  </td>
                </tr>
              ) : (
                payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80">
                    <td className="py-3.5 px-4 font-bold text-stone-900">{p.id}</td>
                    <td className="py-3.5 px-4 text-stone-600 font-sans">{p.period}</td>
                    <td className="py-3.5 px-4 text-stone-900 font-bold">
                      ${p.grossAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-amber-600">
                      -${p.commissionDeducted.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-teal-700 font-bold">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500 font-mono text-[11px]">
                      {p.transactionRef || 'Pending Release'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'processed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
