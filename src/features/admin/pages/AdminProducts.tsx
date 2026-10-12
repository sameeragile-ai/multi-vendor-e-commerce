import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { Product, Category, ProductReview } from '../../../types';
import { useStore } from '../../../store';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  Package,
  Search,
  Star,
  Trash2,
  Sparkles,
  MessageSquare,
  X,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminProducts: React.FC = () => {
  const { addToast } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectReviewsProduct, setInspectReviewsProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const [pRes, cats] = await Promise.all([
      api.getProducts(),
      api.getCategories(),
    ]);
    setProducts(pRes.products);
    setCategories(cats);
  }

  const handleToggleFeatured = async (product: Product) => {
    const updated = await api.updateProduct(product.id, {
      isFeatured: !product.isFeatured,
    });
    setProducts(products.map((p) => (p.id === product.id ? updated : p)));
    addToast({
      type: 'success',
      message: `Product "${product.title}" ${
        updated.isFeatured ? 'featured on homepage' : 'removed from featured'
      }.`,
    });
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (window.confirm(`Admin: Remove product "${title}" permanently?`)) {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      addToast({
        type: 'info',
        message: `Product removed.`,
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!inspectReviewsProduct) return;
    const remaining = inspectReviewsProduct.reviews.filter((r) => r.id !== reviewId);
    const updated = await api.updateProduct(inspectReviewsProduct.id, {
      reviews: remaining,
      reviewsCount: Math.max(0, inspectReviewsProduct.reviewsCount - 1),
    });
    setInspectReviewsProduct(updated);
    setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
    addToast({
      type: 'info',
      message: 'Review moderated and deleted.',
    });
  };

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Catalog Oversight & Review Moderation
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit merchant SKU authenticity, toggle homepage collections, and moderate user ratings.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search catalog by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden"
          />
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Rating & Reviews</th>
                <th className="py-3 px-4">Featured</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                        <ImageWithFallback src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <div className="font-bold text-stone-900 truncate">{p.title}</div>
                        <div className="text-[10px] text-stone-400 font-mono">Seller: {p.sellerId}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-stone-600">
                    {categories.find((c) => c.id === p.categoryId)?.name || p.categoryId}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-stone-950">${p.price.toFixed(2)}</td>

                  <td className="py-3.5 px-4 font-mono font-medium">{p.totalStock} units</td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => setInspectReviewsProduct(p)}
                      className="flex items-center gap-1.5 font-semibold text-stone-800 hover:text-indigo-600 transition-colors"
                    >
                      <Star size={12} className="fill-amber-400 text-amber-500" />
                      <span>{p.rating} ({p.reviews.length} reviews)</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                        p.isFeatured
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      <Sparkles size={11} />
                      <span>{p.isFeatured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/product/${p.id}`}
                        target="_blank"
                        className="p-1 text-stone-400 hover:text-stone-700"
                        title="View product"
                      >
                        <ExternalLink size={14} />
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(p.id, p.title)}
                        className="p-1 text-stone-400 hover:text-red-600"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Moderation Modal */}
      {inspectReviewsProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setInspectReviewsProduct(null)}
          />

          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-950">
                Review Moderation: {inspectReviewsProduct.title}
              </h3>
              <button
                onClick={() => setInspectReviewsProduct(null)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            {inspectReviewsProduct.reviews.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                No customer reviews submitted for this SKU.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 space-y-3">
                {inspectReviewsProduct.reviews.map((rev) => (
                  <div key={rev.id} className="pt-3 first:pt-0 flex justify-between items-start gap-4">
                    <div>
                      <div className="font-bold text-stone-900 flex items-center gap-2">
                        <span>{rev.userName}</span>
                        <span className="text-amber-500">★ {rev.rating}</span>
                      </div>
                      <div className="font-semibold text-stone-800 mt-0.5">{rev.title}</div>
                      <p className="text-stone-600 mt-1 leading-relaxed">{rev.comment}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                    >
                      Remove Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
