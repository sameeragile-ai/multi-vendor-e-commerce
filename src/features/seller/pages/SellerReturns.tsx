import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Order } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import { RotateCcw, Check, X, ShieldCheck, AlertCircle, Eye } from 'lucide-react';

export const SellerReturns: React.FC = () => {
  const { activeSellerId, addToast } = useStore();
  const [returnOrders, setReturnOrders] = useState<Order[]>([]);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReturns();
  }, [activeSellerId]);

  async function loadReturns() {
    setIsLoading(true);
    try {
      const orders = await api.getOrders({ role: 'seller', entityId: activeSellerId });
      const returnList = orders.filter((o) => o.returnRequest);
      setReturnOrders(returnList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDecision = async (approve: boolean) => {
    if (!reviewOrder) return;
    try {
      const updated = await api.handleReturnDecision(
        reviewOrder.id,
        approve,
        decisionNote || (approve ? 'Approved by merchant.' : 'Rejected per policy.')
      );
      setReturnOrders(returnOrders.map((o) => (o.id === reviewOrder.id ? updated : o)));
      setReviewOrder(null);
      setDecisionNote('');
      addToast({
        type: approve ? 'success' : 'info',
        title: approve ? 'Return & Refund Approved' : 'Return Request Declined',
        message: `Order #${updated.orderNumber} decision communicated to customer.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-2xl font-bold font-display text-stone-950">
          Returns & Dispute Resolution
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Review customer refund submissions, examine photo proofs, and authorize restitution.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Claimed Reason</th>
                <th className="py-3 px-4">Return Status</th>
                <th className="py-3 px-4">Requested On</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {returnOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-stone-400">
                    No active return or refund requests.
                  </td>
                </tr>
              ) : (
                returnOrders.map((order) => {
                  const req = order.returnRequest!;
                  return (
                    <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-800">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700 max-w-xs truncate font-medium">
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : req.status === 'rejected'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500">
                        {new Date(req.requestedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setReviewOrder(order)}
                          className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold"
                        >
                          Inspect & Decide
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setReviewOrder(null)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-950">
                Return Review: Order #{reviewOrder.orderNumber}
              </h3>
              <button
                onClick={() => setReviewOrder(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl space-y-1.5">
              <div className="font-semibold text-stone-900">
                Reason: {reviewOrder.returnRequest?.reason}
              </div>
              <p className="text-stone-600 leading-relaxed">
                {reviewOrder.returnRequest?.explanation}
              </p>
            </div>

            {reviewOrder.returnRequest?.photoUrl && (
              <div>
                <span className="font-semibold text-stone-800 block mb-1.5">Customer Attached Photo:</span>
                <div className="w-40 h-32 rounded-xl bg-stone-100 overflow-hidden border">
                  <ImageWithFallback
                    src={reviewOrder.returnRequest.photoUrl}
                    alt="Defect"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Merchant Note to Customer
              </label>
              <textarea
                rows={2}
                placeholder="Explanation of decision or return instructions..."
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div className="pt-3 flex justify-between gap-2 border-t border-stone-100">
              <button
                onClick={() => handleDecision(false)}
                className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleDecision(true)}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
              >
                Approve & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
