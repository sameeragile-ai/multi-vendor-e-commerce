import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Coupon, Banner } from '../../../types';
import { useStore } from '../../../store';
import { TicketPercent, Image as ImageIcon, Plus, Trash2, Check, X } from 'lucide-react';

export const AdminCouponsBanners: React.FC = () => {
  const { addToast } = useStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeTab, setActiveTab] = useState<'banners' | 'coupons'>('banners');

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDescription, setNewCouponDescription] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent' | 'flat'>('percent');
  const [newCouponValue, setNewCouponValue] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(50);

  // New Banner Form
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerBadge, setNewBannerBadge] = useState('New Spotlight');
  const [newBannerCta, setNewBannerCta] = useState('Shop Collection');
  const [newBannerLink, setNewBannerLink] = useState('/search');
  const [newBannerImage, setNewBannerImage] = useState(
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80'
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [cList, bList] = await Promise.all([api.getCoupons(), api.getBanners()]);
    setCoupons(cList);
    setBanners(bList);
  }

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const newCoupon: Coupon = {
      id: `coup_${Date.now()}`,
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDescription || `${newCouponValue}% off your order`,
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minOrderValue: Number(newCouponMinOrder),
      expiresAt: '2026-12-31T23:59:59Z',
      isActive: true,
    };

    const updated = [newCoupon, ...coupons];
    setCoupons(updated);
    setNewCouponCode('');
    setNewCouponDescription('');
    addToast({
      type: 'success',
      title: 'Coupon Created',
      message: `Code ${newCoupon.code} is now live for all shoppers!`,
    });
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerTitle.trim()) return;

    const newBanner: Banner = {
      id: `ban_${Date.now()}`,
      title: newBannerTitle,
      subtitle: newBannerSubtitle,
      badge: newBannerBadge,
      ctaText: newBannerCta,
      link: newBannerLink,
      image: newBannerImage,
      gradientOverlay: 'from-[#14141A]/90 via-[#14141A]/60 to-transparent',
      isActive: true,
    };

    const updated = [newBanner, ...banners];
    await api.updateBanners(updated);
    setBanners(updated);
    setNewBannerTitle('');
    setNewBannerSubtitle('');
    addToast({
      type: 'success',
      title: 'Homepage Banner Published',
      message: 'New carousel hero slide is now visible to customers.',
    });
  };

  const handleDeleteBanner = async (id: string) => {
    const updated = banners.filter((b) => b.id !== id);
    await api.updateBanners(updated);
    setBanners(updated);
    addToast({
      type: 'info',
      message: 'Banner removed.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Promotions & Homepage Merchandising
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage live discount codes and customize customer-facing hero carousel banners.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-stone-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'banners' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon size={13} />
            <span>Homepage Banners</span>
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'coupons' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <TicketPercent size={13} />
            <span>Promo Coupons</span>
          </button>
        </div>
      </div>

      {/* BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Banner Form */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-stone-950 pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <Plus size={16} className="text-[#FF6B4A]" />
              <span>Add Homepage Hero Slide</span>
            </h3>

            <form onSubmit={handleCreateBanner} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Headline Title</label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted Japanese Ceramics"
                  value={newBannerTitle}
                  onChange={(e) => setNewBannerTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Subtitle Prose</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Direct from Kyoto master artisans..."
                  value={newBannerSubtitle}
                  onChange={(e) => setNewBannerSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={newBannerBadge}
                    onChange={(e) => setNewBannerBadge(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={newBannerCta}
                    onChange={(e) => setNewBannerCta(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Image URL</label>
                <input
                  type="text"
                  value={newBannerImage}
                  onChange={(e) => setNewBannerImage(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                  required
                />
              </div>

              <button type="submit" className="w-full btn-brand-primary py-2.5 text-xs font-bold">
                Publish Banner to Homepage
              </button>
            </form>
          </div>

          {/* Existing Banners Grid */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Active Homepage Slides ({banners.length})
            </h3>

            <div className="space-y-3">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-4"
                >
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-24 h-16 rounded-xl object-cover border"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                      {b.badge || 'Banner'}
                    </span>
                    <h4 className="text-xs font-bold text-stone-900 truncate">{b.title}</h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{b.subtitle}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg"
                    title="Remove banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Coupon Form */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-stone-950 pb-2 border-b border-stone-100 flex items-center gap-1.5">
              <Plus size={16} className="text-[#FF6B4A]" />
              <span>Create Coupon Code</span>
            </h3>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH30"
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Discount Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCouponType('percent')}
                    className={`py-1.5 rounded-lg font-bold ${
                      newCouponType === 'percent'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCouponType('flat')}
                    className={`py-1.5 rounded-lg font-bold ${
                      newCouponType === 'flat'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    Flat Discount ($)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Value {newCouponType === 'percent' ? '(%)' : '($)'}
                  </label>
                  <input
                    type="number"
                    value={newCouponValue}
                    onChange={(e) => setNewCouponValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    value={newCouponMinOrder}
                    onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 15% off cart on orders above $50"
                  value={newCouponDescription}
                  onChange={(e) => setNewCouponDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              <button type="submit" className="w-full btn-brand-primary py-2.5 text-xs font-bold">
                Activate Coupon Code
              </button>
            </form>
          </div>

          {/* Active Coupons List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Active Promo Codes ({coupons.length})
            </h3>

            <div className="space-y-3">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm text-stone-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {c.code}
                      </span>
                      <span className="text-xs font-bold text-teal-700">
                        {c.discountType === 'percent'
                          ? `${c.discountValue}% OFF`
                          : `$${c.discountValue} FLAT OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{c.description}</p>
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      Min Order: ${c.minOrderValue} · Expires: Dec 2026
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
                    Live
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
