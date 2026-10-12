import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Product } from '../../../types';
import { ProductCard } from '../components/ProductCard';
import { Heart, ArrowRight, Trash2 } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { wishlistIds, clearCompare } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      setIsLoading(true);
      try {
        const list: Product[] = [];
        for (const id of wishlistIds) {
          const p = await api.getProductById(id);
          if (p) list.push(p);
        }
        setProducts(list);
      } catch (err) {
        console.error('Failed to load wishlist items', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWishlist();
  }, [wishlistIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-4 border-b border-stone-200">
        <h1 className="text-2xl font-bold font-display text-stone-950">
          Saved in Wishlist ({wishlistIds.length})
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Items you&apos;ve flagged for mindful future consideration or price alerts.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3">
              <div className="aspect-square bg-stone-100 rounded-xl" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
          <Heart size={36} className="text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900">Your wishlist is empty</h3>
          <p className="text-xs text-stone-500 mt-1">
            Browse our curated collections and save items you love using the heart icon.
          </p>
          <Link
            to="/search"
            className="mt-5 btn-brand-primary px-5 py-2.5 text-xs inline-flex items-center gap-1.5"
          >
            <span>Explore Collections</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
