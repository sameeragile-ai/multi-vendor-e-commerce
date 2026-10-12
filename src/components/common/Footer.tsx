import React from 'react';
import { Link } from 'react-router-dom';
import { APP_CONFIG } from '../../config/appConfig';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Marketplace Commitments Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-stone-800">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#FF6B4A] flex items-center justify-center shrink-0">
              <Truck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Priority Dispatch
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Complimentary insured delivery on all orders over ${APP_CONFIG.shipping.freeShippingThreshold}.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#FFB547] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                100% Genuine
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Every artisan and manufacturer undergoes verified identity and tax screening.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-teal-400 flex items-center justify-center shrink-0">
              <RotateCcw size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                7-Day Hassle-Free Returns
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Instant return authorization with prepaid courier labels and fast refunds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-800 text-[#FF6B4A] flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Direct Maker Support
              </h4>
              <p className="text-xs text-stone-400 mt-1">
                Fair marketplace fees giving up to 92% of sales back to independent creators.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12 border-b border-stone-800">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center text-white">
                <span className="font-display font-extrabold text-base">K</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                {APP_CONFIG.brandName}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              {APP_CONFIG.brandDescription}
            </p>
            <div className="mt-4 text-xs text-stone-400 space-y-1">
              <div>Customer Care: {APP_CONFIG.support.email}</div>
              <div>Toll Free: {APP_CONFIG.support.phone}</div>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Explore
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/search?category=cat_electronics" className="hover:text-white transition-colors">
                  Electronics & Audio
                </Link>
              </li>
              <li>
                <Link to="/search?category=cat_home" className="hover:text-white transition-colors">
                  Home & Living
                </Link>
              </li>
              <li>
                <Link to="/search?category=cat_kitchen" className="hover:text-white transition-colors">
                  Kitchen & Culinary
                </Link>
              </li>
              <li>
                <Link to="/search?category=cat_beauty" className="hover:text-white transition-colors">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link to="/search?deal=true" className="hover:text-white transition-colors">
                  Flash Deals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Partners & Sellers
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/seller" className="hover:text-white transition-colors font-semibold text-[#FF6B4A]">
                  Seller Portal
                </Link>
              </li>
              <li>
                <Link to="/seller/kyc" className="hover:text-white transition-colors">
                  Seller KYC Verification
                </Link>
              </li>
              <li>
                <Link to="/cms/seller-policy" className="hover:text-white transition-colors">
                  Merchant Policies
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors text-stone-400">
                  Marketplace Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Company & Trust
            </h5>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <Link to="/cms/about" className="hover:text-white transition-colors">
                  About Kartova
                </Link>
              </li>
              <li>
                <Link to="/cms/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cms/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cms/faq" className="hover:text-white transition-colors">
                  Buyer FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            © {new Date().getFullYear()} {APP_CONFIG.brandName} Technologies Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-stone-400">Secure Payments:</span>
            <span className="font-mono text-stone-300">VISA · MASTERCARD · UPI · AMEX</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
