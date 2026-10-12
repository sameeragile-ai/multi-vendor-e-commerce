import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Payout } from '../../../types';
import { useStore } from '../../../store';
import { DollarSign, CheckCircle2, Clock, Send, ShieldCheck } from 'lucide-react';

export const AdminPayouts: React.FC = () => {
  const { addToast } = useStore();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, []);

  async function loadPayouts() {
    setIsLoading(true);
    const list = await api.getPayouts();
    setPayouts(list);
    setIsLoading(false);
  }

  const handleProcessPayout = async (payoutId: string) => {
    try {
      const processed = await api.processPayout(payoutId);
      setPayouts(payouts.map((p) => (p.id === payoutId ? processed : p)));
      addToast({
        type: 'success',
        title: 'ACH Wire Settlement Completed',
        message: `Disbursement #${processed.id} sent to ${processed.sellerName}. Wire ref: ${processed.transactionRef}`,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: 'Failed to process payout.',
      });
    }
  };

  const pendingCount = payouts.filter((p) => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Treasury & Seller Payout Approvals
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Authorize ACH direct deposit settlements to vetted merchant bank accounts.
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
            {pendingCount} Disbursals Ready for Wire Transfer
          </span>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Payout ID</th>
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Gross Sales</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Net Payout</th>
                <th className="py-3 px-4">Wire Reference</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Treasury Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{p.id}</td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-stone-900">
                    {p.sellerName}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    ${p.grossAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-amber-600">
                    -${p.commissionDeducted.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-teal-700 font-bold">
                    ${p.amount.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                    {p.transactionRef || 'Pending Release'}
                  </td>
                  <td className="py-3.5 px-4 font-sans">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'processed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans">
                    {p.status === 'pending' ? (
                      <button
                        onClick={() => handleProcessPayout(p.id)}
                        className="btn-brand-primary px-3 py-1 font-bold text-xs"
                      >
                        Authorize Transfer
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-[11px] flex items-center justify-end gap-1">
                        <CheckCircle2 size={13} />
                        <span>Transferred</span>
                      </span>
                    )}
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
