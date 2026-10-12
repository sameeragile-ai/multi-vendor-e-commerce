import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Product } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import { RatingStars } from '../../../components/common/RatingStars';
import { X, Scale, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CompareDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    compareIds,
    removeFromCompare,
    clearCompare,
    isCompareDrawerOpen,
    setIsCompareDrawerOpen,
    addToCart,
  } = useStore();

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadCompareItems() {
      if (compareIds.length === 0) {
        setProducts([]);
        return;
      }
      const fetched: Product[] = [];
      for (const id of compareIds) {
        const p = await api.getProductById(id);
        if (p) fetched.push(p);
      }
      setProducts(fetched);
    }
    if (isCompareDrawerOpen && compareIds.length > 0) {
      loadCompareItems();
    }
  }, [compareIds, isCompareDrawerOpen]);

  if (!isCompareDrawerOpen || compareIds.length === 0) return null;

  // Extract all unique spec keys across compared items
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs || {})))
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCompareDrawerOpen(false)}
      />

      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Scale size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Product Comparison ({products.length}/4)
              </h2>
              <span className="text-xs text-stone-500">
                Detailed side-by-side analysis of features, specifications & pricing
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-xs text-stone-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
            <button
              onClick={() => setIsCompareDrawerOpen(false)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4 sm:p-6">
          <div className="min-w-[650px]">
            {/* Top row: Product summaries */}
            <div className="grid grid-cols-4 gap-4 pb-6 border-b border-stone-200">
              {products.map((prod) => (
                <div key={prod.id} className="flex flex-col relative group">
                  <button
                    onClick={() => removeFromCompare(prod.id)}
                    className="absolute top-1 right-1 z-10 p-1 bg-white/80 backdrop-blur-xs rounded-full text-stone-400 hover:text-red-600 shadow-xs transition-colors"
                    title="Remove from compare"
                  >
                    <X size={14} />
                  </button>

                  <div
                    onClick={() => {
                      setIsCompareDrawerOpen(false);
                      navigate(`/product/${prod.id}`);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="aspect-square rounded-xl bg-stone-100 overflow-hidden mb-3 border border-stone-100">
                      <ImageWithFallback
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xs font-bold text-stone-900 line-clamp-2 leading-snug">
                      {prod.title}
                    </h3>
                  </div>

                  <div className="mt-2">
                    <RatingStars rating={prod.rating} count={prod.ratingCount} size={12} />
                  </div>

                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-stone-900">
                      ${prod.price.toFixed(2)}
                    </span>
                    {prod.originalPrice > prod.price && (
                      <span className="text-xs text-stone-400 line-through">
                        ${prod.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      addToCart({
                        productId: prod.id,
                        variantId: prod.variants[0]?.id,
                        sellerId: prod.sellerId,
                        quantity: 1,
                        price: prod.price,
                      })
                    }
                    className="mt-3 btn-brand-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5 w-full"
                  >
                    <ShoppingBag size={13} />
                    <span>Add to Bag</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Specifications rows */}
            <div className="divide-y divide-stone-100 mt-4 text-xs">
              <div className="py-2.5 font-bold text-stone-900 bg-stone-50 px-2 rounded">
                Technical Specifications
              </div>
              {allSpecKeys.map((specKey) => (
                <div key={specKey} className="grid grid-cols-4 gap-4 py-3 px-2 hover:bg-stone-50/50">
                  {products.map((prod) => (
                    <div key={`${prod.id}-${specKey}`}>
                      <span className="block text-[10px] text-stone-400 font-medium">
                        {specKey}
                      </span>
                      <span className="font-medium text-stone-800">
                        {prod.specs[specKey] || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              <div className="py-2.5 font-bold text-stone-900 bg-stone-50 px-2 rounded mt-2">
                Availability & Stock
              </div>
              <div className="grid grid-cols-4 gap-4 py-3 px-2">
                {products.map((prod) => (
                  <div key={`${prod.id}-stock`}>
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                        prod.inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {prod.inStock ? `${prod.totalStock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
