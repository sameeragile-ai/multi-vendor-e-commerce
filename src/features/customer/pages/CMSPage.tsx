import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { APP_CONFIG } from '../../../config/appConfig';
import { ChevronDown, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

export const CMSPage: React.FC = () => {
  const { page = 'about' } = useParams<{ page: string }>();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does multi-vendor fulfillment work on Kartova?',
      a: 'Each item ordered is fulfilled directly from the verified maker or authorized studio distributor. If you order from multiple independent sellers in one transaction, items will ship securely in separate packages with distinct tracking numbers.',
    },
    {
      q: 'What is the Kartova Buyer Protection and 7-day return guarantee?',
      a: 'We hold seller disbursements in escrow until 7 days post-delivery. If an item arrives damaged, flawed, or differs from listed specifications, you can submit a return request with photos directly from your order page for an immediate refund.',
    },
    {
      q: 'How are sellers vetted before listing products?',
      a: 'All sellers complete multi-step KYC verification comprising national identity screening, tax documentation (GSTIN or EIN/TIN), verified business checking accounts, and craft proof.',
    },
    {
      q: 'What payment methods are supported on the platform?',
      a: 'We support all major credit and debit cards (Visa, MasterCard, Amex), instant Digital UPI/Wallets, and Cash on Delivery with SMS OTP verification.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'about', label: 'About Kartova' },
          { id: 'faq', label: 'Frequently Asked Questions' },
          { id: 'terms', label: 'Terms of Service' },
          { id: 'seller-policy', label: 'Seller Guidelines' },
          { id: 'privacy', label: 'Privacy & Data' },
        ].map((tab) => (
          <Link
            key={tab.id}
            to={`/cms/${tab.id}`}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              page === tab.id
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Content based on route param */}
      {page === 'about' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 space-y-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
            Our Manifesto
          </span>
          <h1 className="text-3xl font-bold font-display text-stone-950">
            A Better Marketplace for Genuine Makers & Mindful Living
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            {APP_CONFIG.brandName} was built to bridge the gap between discerning shoppers and the
            world&apos;s finest independent craftspeople, audiophile manufacturers, and clean beauty
            formulators.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
              <h4 className="font-bold text-xs text-stone-900">Direct From Maker</h4>
              <p className="text-xs text-stone-600 mt-1">
                Cutting out unnecessary intermediary markups so artisans retain fair margins.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60">
              <h4 className="font-bold text-xs text-stone-900">Verified Identity</h4>
              <p className="text-xs text-stone-600 mt-1">
                Rigorous KYC and product testing ensure 100% authenticity on every catalog SKU.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-stone-100/70 border border-stone-200/60">
              <h4 className="font-bold text-xs text-stone-900">Sustainable Packaging</h4>
              <p className="text-xs text-stone-600 mt-1">
                Zero single-use plastics wherever possible with recyclable paper cushions.
              </p>
            </div>
          </div>
        </div>
      )}

      {page === 'faq' && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 space-y-6">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-[#FF6B4A]" />
            <h1 className="text-2xl font-bold font-display text-stone-950">
              Buyer Questions & Support
            </h1>
          </div>
          <div className="divide-y divide-stone-100">
            {faqs.map((faq, i) => (
              <div key={i} className="py-4">
                <button
                  onClick={() => setOpenFaqIdx(openFaqIdx === i ? null : i)}
                  className="w-full flex items-center justify-between text-left font-bold text-sm text-stone-900"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform text-stone-400 ${
                      openFaqIdx === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIdx === i && (
                  <p className="mt-2.5 text-xs text-stone-600 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(page === 'terms' || page === 'seller-policy' || page === 'privacy') && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-8 space-y-4 text-xs text-stone-600 leading-relaxed">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <FileText size={18} className="text-[#FF6B4A]" />
            <h1 className="text-xl font-bold font-display text-stone-950 capitalize">
              {page.replace('-', ' ')}
            </h1>
          </div>
          <p>
            Last revised: October 2026. By accessing or publishing goods on {APP_CONFIG.brandName}, you
            agree to uphold our standards of merchant honesty, copyright legitimacy, and prompt
            delivery within specified SLA windows.
          </p>
          <h3 className="font-bold text-stone-900 text-sm pt-2">Commission & Escrow Governance</h3>
          <p>
            Marketplace commission rates are pegged between 7% and 15% per department as configured
            by platform governance. Payouts are computed after deducting platform fees and released
            via direct bank wire.
          </p>
        </div>
      )}
    </div>
  );
};
