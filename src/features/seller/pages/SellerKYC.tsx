import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Seller, SellerKycData } from '../../../types';
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Building,
  CreditCard,
  Upload,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const SellerKYC: React.FC = () => {
  const { activeSellerId, addToast } = useStore();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // KYC Form fields
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<'individual' | 'llc' | 'corporation' | 'partnership'>('llc');
  const [taxId, setTaxId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingOrIfsc, setRoutingOrIfsc] = useState('');
  const [idProofType, setIdProofType] = useState<
    'passport' | 'drivers_license' | 'national_id' | 'business_license'
  >('business_license');
  const [documentUrl, setDocumentUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      const s = await api.getSellerById(activeSellerId);
      if (s) {
        setSeller(s);
        setBusinessName(s.kycData?.businessName || s.businessName);
        setBusinessType(s.kycData?.businessType || 'llc');
        setTaxId(s.kycData?.taxId || 'US-EIN-948192831');
        setPanNumber(s.kycData?.panNumber || 'APXT9921K');
        setBankName(s.kycData?.bankName || 'Silicon Valley Commercial Bank');
        setAccountNumber(s.kycData?.accountNumber || '**** **** 9210');
        setRoutingOrIfsc(s.kycData?.routingOrIfsc || 'SVCB00192');
        setIdProofType(s.kycData?.idProofType || 'business_license');
        setDocumentUrl(
          s.kycData?.documentUrl ||
            'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=600&q=80'
        );
      }
    }
    loadData();
  }, [activeSellerId]);

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seller) return;
    setIsSubmitting(true);

    try {
      const updated = await api.submitSellerKyc(seller.id, {
        businessName,
        businessType,
        taxId,
        panNumber,
        bankName,
        accountNumber,
        routingOrIfsc,
        idProofType,
        documentUrl,
      });
      setSeller(updated);
      addToast({
        type: 'success',
        title: 'KYC Application Submitted',
        message: 'Your verification files have been sent to Platform Governance for review.',
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: 'Failed to submit KYC.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-2xl font-bold font-display text-stone-950">
          Merchant Identity & KYC Verification
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Compliance standards required for escrow disbursement, tax collection, and customer trust.
        </p>
      </div>

      {/* Status Alert Banner */}
      {seller?.status === 'approved' ? (
        <div className="p-5 rounded-2xl bg-teal-50 border border-teal-200 text-xs flex items-center gap-3">
          <ShieldCheck size={24} className="text-teal-700 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-teal-950">KYC Status: Fully Verified & Approved</h4>
            <p className="text-teal-800 mt-0.5">
              Your business incorporation, tax identification ({seller.kycData.taxId}), and banking
              credentials are in good standing. All product listings are live in the marketplace.
            </p>
          </div>
          <span className="text-[10px] bg-teal-200 text-teal-900 font-bold px-2 py-1 rounded">
            Level 2 Cleared
          </span>
        </div>
      ) : seller?.status === 'pending' ? (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs flex items-center gap-3">
          <Clock size={24} className="text-amber-700 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-amber-950">KYC Status: Under Verification</h4>
            <p className="text-amber-800 mt-0.5">
              Our compliance team is auditing your tax registry and state license documents. Typical
              turnaround is 24 business hours. (Tip: You can switch to Admin role to instantly approve this!).
            </p>
          </div>
          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-1 rounded">
            Pending Audit
          </span>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-xs flex items-start gap-3">
          <AlertTriangle size={24} className="text-red-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-red-950">KYC Status: Action Required / Rejected</h4>
            <p className="text-red-800 mt-0.5">
              <span className="font-bold">Admin Reviewer Reason:</span> &ldquo;
              {seller?.kycData.rejectionReason || 'Please resubmit valid incorporation documents.'}&rdquo;
            </p>
            <p className="text-red-700 mt-1">
              Please modify your details below and resubmit for immediate re-evaluation.
            </p>
          </div>
        </div>
      )}

      {/* Multi-step Form Card */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between max-w-lg mx-auto pb-4 border-b border-stone-100 text-xs font-bold">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 ${step >= 1 ? 'text-[#FF6B4A]' : 'text-stone-400'}`}
          >
            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Business</span>
          </button>
          <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-[#FF6B4A]' : 'bg-stone-200'}`} />
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 ${step >= 2 ? 'text-[#FF6B4A]' : 'text-stone-400'}`}
          >
            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Tax & Legal</span>
          </button>
          <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-[#FF6B4A]' : 'bg-stone-200'}`} />
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 ${step >= 3 ? 'text-[#FF6B4A]' : 'text-stone-400'}`}
          >
            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Bank Settlement</span>
          </button>
          <div className={`w-8 h-0.5 ${step >= 4 ? 'bg-[#FF6B4A]' : 'bg-stone-200'}`} />
          <button
            onClick={() => setStep(4)}
            className={`flex items-center gap-2 ${step === 4 ? 'text-[#FF6B4A]' : 'text-stone-400'}`}
          >
            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px]">
              4
            </span>
            <span>Documents</span>
          </button>
        </div>

        <form onSubmit={handleSubmitKyc} className="space-y-5 text-xs max-w-xl mx-auto">
          {/* STEP 1: Business */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Building size={16} className="text-[#FF6B4A]" />
                <span>Commercial Entity Information</span>
              </h3>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Registered Legal Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Entity Structure</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  <option value="llc">Limited Liability Company (LLC)</option>
                  <option value="corporation">Corporation (Inc / C-Corp / S-Corp)</option>
                  <option value="partnership">General Partnership</option>
                  <option value="individual">Sole Proprietorship / Independent Artisan</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-brand-primary px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  <span>Continue to Tax Details</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Tax Details */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#FF6B4A]" />
                <span>Taxpayer Identification & Classification</span>
              </h3>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Federal Tax ID (EIN or GSTIN)
                </label>
                <input
                  type="text"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  PAN or Secondary Tax Identifier
                </label>
                <input
                  type="text"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-brand-primary px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  <span>Continue to Bank Settlement</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Details */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <CreditCard size={16} className="text-[#FF6B4A]" />
                <span>Direct Deposit Bank Coordinates</span>
              </h3>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Commercial Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Routing / IFSC</label>
                  <input
                    type="text"
                    value={routingOrIfsc}
                    onChange={(e) => setRoutingOrIfsc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="btn-brand-primary px-5 py-2 text-xs flex items-center gap-1.5"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Document Upload & Submit */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Upload size={16} className="text-[#FF6B4A]" />
                <span>Verification Document Upload</span>
              </h3>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Proof Type</label>
                <select
                  value={idProofType}
                  onChange={(e) => setIdProofType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  <option value="business_license">Official State Business Registration Certificate</option>
                  <option value="passport">Principal Officer Passport</option>
                  <option value="drivers_license">Government Issued Driver&apos;s License</option>
                  <option value="national_id">National ID Card</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Document Preview / CDN Image URL
                </label>
                <input
                  type="text"
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                  required
                />
              </div>

              {documentUrl && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                  <img
                    src={documentUrl}
                    alt="Document preview"
                    className="w-16 h-12 object-cover rounded-lg border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-stone-800 truncate block">Document Attached</span>
                    <span className="text-[10px] text-stone-500">Ready for compliance audit</span>
                  </div>
                  <CheckCircle2 size={16} className="text-teal-600" />
                </div>
              )}

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-brand-primary px-6 py-2.5 text-xs font-bold shadow-md"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Submit KYC for Audit'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
