import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Category } from '../../../types';
import { useStore } from '../../../store';
import { Percent, Save, Check } from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const AdminCommissions: React.FC = () => {
  const { addToast } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalRate, setGlobalRate] = useState<number>(APP_CONFIG.defaultCommissionPercent);
  const [categoryRates, setCategoryRates] = useState<Record<string, number>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      const cats = await api.getCategories();
      setCategories(cats);
      const rates: Record<string, number> = {};
      cats.forEach((c) => {
        rates[c.id] = c.commissionRate;
      });
      setCategoryRates(rates);
    }
    loadData();
  }, []);

  const handleRateChange = (catId: string, val: number) => {
    setCategoryRates({ ...categoryRates, [catId]: val });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const cat of categories) {
        if (categoryRates[cat.id] !== undefined) {
          await api.updateCategory(cat.id, {
            commissionRate: categoryRates[cat.id],
          });
        }
      }
      addToast({
        type: 'success',
        title: 'Commission Matrix Saved',
        message: 'Category take-rates updated and live for all future order calculations.',
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: 'Failed to update commission rates.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Marketplace Take-Rate & Commission Matrix
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure platform fees deducted from gross merchant settlements per department.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="btn-brand-primary px-5 py-2.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
        >
          <Save size={15} />
          <span>{isSaving ? 'Updating...' : 'Save Commission Rules'}</span>
        </button>
      </div>

      {/* Global Base Rule */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">Default Baseline Marketplace Fee</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Applied to unclassified merchant products and universal catalog SKUs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="40"
            value={globalRate}
            onChange={(e) => setGlobalRate(Number(e.target.value))}
            className="w-20 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-sm text-center"
          />
          <span className="font-bold text-stone-700 text-sm">%</span>
        </div>
      </div>

      {/* Per Category Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800">
            Department-Specific Commission Overrides
          </h3>
          <span className="text-[11px] text-stone-400">8 Configured Categories</span>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {categories.map((cat) => {
            const current = categoryRates[cat.id] ?? cat.commissionRate;

            return (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-stone-50/50">
                <div>
                  <div className="font-bold text-stone-900">{cat.name}</div>
                  <div className="text-[11px] text-stone-500">{cat.description}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-400 font-medium">Commission:</span>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={current}
                    onChange={(e) => handleRateChange(cat.id, Number(e.target.value))}
                    className="w-16 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-center font-bold text-stone-900"
                  />
                  <span className="font-bold text-stone-700">%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
