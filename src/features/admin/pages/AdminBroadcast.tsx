import React, { useState } from 'react';
import { api } from '../../../services/api';
import { useStore } from '../../../store';
import { Radio, Send, Bell, CheckCircle2 } from 'lucide-react';

export const AdminBroadcast: React.FC = () => {
  const { addToast } = useStore();
  const [targetRole, setTargetRole] = useState<'all' | 'customer' | 'seller'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('/search');
  const [isSending, setIsSending] = useState(false);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);
    try {
      await api.addNotification({
        targetRole,
        title,
        message,
        link,
        type: 'system',
      });
      setTitle('');
      setMessage('');
      addToast({
        type: 'success',
        title: 'Broadcast Dispatched',
        message: `Notification pushed to all active ${targetRole} sessions in real-time.`,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: 'Failed to send broadcast.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-2 border-b border-stone-200">
        <h1 className="text-2xl font-bold font-display text-stone-950">
          Platform-Wide Notification Broadcast
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Push real-time alert banners and deal announcements directly to shopper & seller notification bells.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs space-y-5 text-xs">
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block font-semibold text-stone-800 mb-1.5">Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetRole('all')}
                className={`py-2 rounded-xl font-bold transition-colors ${
                  targetRole === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Everyone (All)
              </button>
              <button
                type="button"
                onClick={() => setTargetRole('customer')}
                className={`py-2 rounded-xl font-bold transition-colors ${
                  targetRole === 'customer'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Shoppers Only
              </button>
              <button
                type="button"
                onClick={() => setTargetRole('seller')}
                className={`py-2 rounded-xl font-bold transition-colors ${
                  targetRole === 'seller'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Merchants Only
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-800 mb-1">Notification Headline</label>
            <input
              type="text"
              placeholder="e.g. Flash Deal Alert: 20% off all artisan kitchenware"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-800 mb-1">Body Text</label>
            <textarea
              rows={3}
              placeholder="e.g. Use promo code FIRST15 before midnight to unlock complimentary express shipping on verified maker collections..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-800 mb-1">Destination Action URL</label>
            <input
              type="text"
              placeholder="/search?category=cat_kitchen"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full btn-brand-primary py-3 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Send size={15} />
            <span>{isSending ? 'Transmitting...' : 'Dispatch Platform Broadcast'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
