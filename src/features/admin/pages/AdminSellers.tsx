import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Seller } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  Building,
  CreditCard,
  FileText,
} from 'lucide-react';

export const AdminSellers: React.FC = () => {
  const { adminTier, addToast } = useStore();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [inspectSeller, setInspectSeller] = useState<Seller | null>(null);
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSellers();
  }, []);

  async function loadSellers() {
    setIsLoading(true);
    try {
      const list = await api.getSellers();
      setSellers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleApprove = async (sellerId: string) => {
    try {
      const updated = await api.approveSeller(sellerId);
      setSellers(sellers.map((s) => (s.id === sellerId ? updated : s)));
      setInspectSeller(null);
      addToast({
        type: 'success',
        title: 'Merchant Approved',
        message: `${updated.businessName} has been cleared for marketplace listing.`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (sellerId: string) => {
    if (!rejectReasonInput.trim()) {
      addToast({
        type: 'warning',
        message: 'Please provide an audit rejection note for the merchant.',
      });
      return;
    }

    try {
      const updated = await api.rejectSeller(sellerId, rejectReasonInput);
      setSellers(sellers.map((s) => (s.id === sellerId ? updated : s)));
      setInspectSeller(null);
      setRejectReasonInput('');
      addToast({
        type: 'info',
        title: 'Merchant KYC Rejected',
        message: 'Rejection notice and instructions dispatched to seller.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSuspend = async (seller: Seller) => {
    const newStatus = seller.status === 'rejected' ? 'approved' : 'rejected';
    const updated = await api.updateSeller(seller.id, {
      status: newStatus,
    });
    setSellers(sellers.map((s) => (s.id === seller.id ? updated : s)));
    addToast({
      type: 'info',
      message: `${seller.businessName} status changed to ${newStatus}.`,
    });
  };

  const filtered = sellers.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.businessName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.kycData?.taxId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Merchant Governance & KYC Auditing
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit legal incorporation certificates, verify tax registrations, and authorize store licenses.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search seller by name or tax ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl capitalize transition-all ${
              statusFilter === tab
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Merchant Business</th>
                <th className="py-3 px-4">Tax Identifier</th>
                <th className="py-3 px-4">Bank Routing</th>
                <th className="py-3 px-4">Sales Volume</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                        <ImageWithFallback src={s.logo} alt={s.businessName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{s.businessName}</div>
                        <div className="text-[11px] text-stone-400">{s.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-stone-700">
                    {s.kycData?.taxId || 'Pending'}
                  </td>

                  <td className="py-3.5 px-4 text-stone-600">
                    <div className="font-medium">{s.kycData?.bankName || 'Standard Bank'}</div>
                    <div className="text-[10px] font-mono text-stone-400">{s.kycData?.routingOrIfsc}</div>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    {s.totalSales} units · ★ {s.rating}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        s.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800'
                          : s.status === 'pending'
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setInspectSeller(s);
                          setRejectReasonInput(s.kycData?.rejectionReason || '');
                        }}
                        className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold rounded-lg flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Inspect KYC</span>
                      </button>

                      {s.status === 'approved' && (
                        <button
                          onClick={() => handleToggleSuspend(s)}
                          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg font-semibold"
                          title="Suspend Merchant"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Inspection Modal */}
      {inspectSeller && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setInspectSeller(null)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold text-stone-950">
                  KYC Audit: {inspectSeller.businessName}
                </h3>
                <span className="text-stone-400 text-[11px]">Submitted for marketplace compliance review</span>
              </div>
              <button
                onClick={() => setInspectSeller(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
              <div>
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Entity Type</span>
                <span className="font-bold text-stone-900 capitalize">
                  {inspectSeller.kycData?.businessType || 'LLC'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Tax ID / EIN</span>
                <span className="font-mono font-bold text-stone-900">
                  {inspectSeller.kycData?.taxId || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Bank Account</span>
                <span className="font-mono font-bold text-stone-900">
                  {inspectSeller.kycData?.bankName} ({inspectSeller.kycData?.accountNumber})
                </span>
              </div>
              <div>
                <span className="text-stone-400 font-semibold block text-[10px] uppercase">Routing / IFSC</span>
                <span className="font-mono font-bold text-stone-900">
                  {inspectSeller.kycData?.routingOrIfsc}
                </span>
              </div>
            </div>

            {/* Document Preview */}
            <div>
              <span className="font-bold text-stone-900 block mb-2">
                Uploaded Identification & Incorporation Document:
              </span>
              <div className="aspect-video w-full rounded-2xl bg-stone-100 overflow-hidden border border-stone-200">
                <ImageWithFallback
                  src={
                    inspectSeller.kycData?.documentUrl ||
                    'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=800&q=80'
                  }
                  alt="KYC Certificate"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Rejection Note field if rejecting */}
            <div>
              <label className="block font-semibold text-stone-800 mb-1">
                Compliance Note / Audit Remarks (Sent to Merchant if Rejected)
              </label>
              <textarea
                rows={2}
                value={rejectReasonInput}
                onChange={(e) => setRejectReasonInput(e.target.value)}
                placeholder="e.g. State incorporation certificate was expired. Please re-upload current tax filing..."
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 flex justify-between gap-3 border-t border-stone-100">
              <button
                onClick={() => handleReject(inspectSeller.id)}
                className="px-4 py-2.5 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100"
              >
                Reject KYC with Note
              </button>
              <button
                onClick={() => handleApprove(inspectSeller.id)}
                className="btn-brand-primary px-6 py-2.5 font-bold"
              >
                Approve & Activate Merchant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
