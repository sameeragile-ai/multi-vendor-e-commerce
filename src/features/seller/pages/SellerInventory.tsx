import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Product } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import { Boxes, AlertTriangle, Check, RefreshCw, Plus, Minus } from 'lucide-react';

export const SellerInventory: React.FC = () => {
  const { activeSellerId, addToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [activeSellerId]);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const res = await api.getProducts({ seller: activeSellerId });
      setProducts(res.products);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleUpdateStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.totalStock + delta);
    await api.updateProduct(product.id, {
      totalStock: newStock,
      inStock: newStock > 0,
    });
    setProducts(
      products.map((p) =>
        p.id === product.id ? { ...p, totalStock: newStock, inStock: newStock > 0 } : p
      )
    );
    addToast({
      type: 'success',
      message: `Stock updated for ${product.title}: ${newStock} units`,
    });
  };

  const handleUpdateThreshold = async (product: Product, threshold: number) => {
    await api.updateProduct(product.id, {
      lowStockThreshold: threshold,
    });
    setProducts(
      products.map((p) =>
        p.id === product.id ? { ...p, lowStockThreshold: threshold } : p
      )
    );
    addToast({
      type: 'info',
      message: `Alert threshold updated to ${threshold}`,
    });
  };

  const lowStockCount = products.filter((p) => p.totalStock <= p.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Inventory & Warehouse Velocity
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Monitor real-time item depletion and configure proactive low-inventory alert thresholds.
          </p>
        </div>

        <button
          onClick={loadProducts}
          className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 flex items-center gap-1.5 shadow-xs"
        >
          <RefreshCw size={13} />
          <span>Refresh Stock</span>
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-amber-900">
              Low-Stock Warning: {lowStockCount} items
            </span>{' '}
            are currently below their minimum safety thresholds. Restock soon to prevent order delays.
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Item SKU</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Alert Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => {
                const isCritical = p.totalStock <= p.lowStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                          <ImageWithFallback
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-stone-900 truncate">{p.title}</div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            {p.variants[0]?.sku || `SKU-${p.id}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-950">${p.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-sm text-stone-900">
                        {p.totalStock}
                      </span>{' '}
                      <span className="text-stone-400 text-[11px]">units</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        defaultValue={p.lowStockThreshold}
                        onBlur={(e) => handleUpdateThreshold(p, Number(e.target.value))}
                        className="w-16 px-2 py-1 bg-stone-50 border border-stone-200 rounded text-center font-bold"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          p.totalStock === 0
                            ? 'bg-red-50 text-red-700'
                            : isCritical
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.totalStock === 0 ? 'Out of Stock' : isCritical ? 'Low Stock' : 'Optimal'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleUpdateStock(p, -5)}
                          className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 font-bold"
                          title="Reduce 5"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleUpdateStock(p, 10)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-bold"
                          title="Add 10"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleUpdateStock(p, 50)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded font-bold"
                          title="Add 50"
                        >
                          +50
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
