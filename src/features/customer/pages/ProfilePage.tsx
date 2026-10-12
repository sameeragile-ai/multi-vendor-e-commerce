import React, { useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { User, MapPin, Mail, Phone, ShieldCheck, Plus, Check } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, addToast } = useStore();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '+1 (555) 234-8890');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = await api.updateUser({ name, email, phone });
    setCurrentUser(updated);
    setIsSaving(false);
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Personal contact details successfully updated.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-bold font-display text-stone-950">Account & Preferences</h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage your personal identity, contact channels, and primary delivery destinations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: User Card */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 text-center space-y-3">
          <img
            src={
              currentUser.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
            }
            alt={currentUser.name}
            className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-amber-100"
          />
          <div>
            <h3 className="text-base font-bold text-stone-900">{currentUser.name}</h3>
            <p className="text-xs text-stone-500 font-mono">{currentUser.email}</p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>Verified Customer Account</span>
          </div>
        </div>

        {/* Right: Personal Info Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-stone-200/80 p-6 space-y-5">
          <h3 className="text-sm font-bold text-stone-950 pb-2 border-b border-stone-100">
            Personal Information
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Mobile Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-brand-primary px-5 py-2.5 text-xs font-semibold"
            >
              {isSaving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Saved Addresses Section */}
          <div className="pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Delivery Address Book
              </h4>
              <button
                type="button"
                onClick={() =>
                  addToast({
                    type: 'info',
                    message: 'Address book management ready for checkout.',
                  })
                }
                className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Destination</span>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex justify-between items-start">
                <div>
                  <span className="font-bold text-stone-900">Alex Morgan (Home Default)</span>
                  <p className="text-stone-600 mt-0.5">
                    742 Evergreen Terrace, Apt 4B, Portland, OR 97201
                  </p>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Primary
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/70 flex justify-between items-start">
                <div>
                  <span className="font-bold text-stone-900">Alex Morgan (Office)</span>
                  <p className="text-stone-600 mt-0.5">1200 NW Marshall St, Portland, OR 97209</p>
                </div>
                <span className="text-[10px] bg-stone-200 text-stone-700 font-bold px-2 py-0.5 rounded">
                  Work
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
