import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../../types';
import { useStore } from '../../../store';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import { RatingStars } from '../../../components/common/RatingStars';
import { Heart, Scale, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  layout = 'grid',
}) => {
  const navigate = useNavigate();
  const {
    isInWishlist,
    toggleWishlist,
    addToCompare,
    compareIds,
    addToCart,
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const isCompared = compareIds.includes(product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const primaryVariant = product.variants[0];
    addToCart({
      productId: product.id,
      variantId: primaryVariant?.id,
      sellerId: product.sellerId,
      quantity: 1,
      price: product.price,
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(product.id);
  };

  if (layout === 'list') {
    return (
      <div
        onClick={handleCardClick}
        className="group bg-white rounded-2xl border border-stone-200/80 p-4 hover:border-stone-300 hover:shadow-lg transition-all duration-300 flex flex-col sm:flex-row gap-5 cursor-pointer relative"
      >
        <div className="w-full sm:w-56 h-48 rounded-xl bg-stone-100 overflow-hidden shrink-0 relative">
          <ImageWithFallback
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
          />
          {product.discountPercent > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-stone-900/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
              -{product.discountPercent}% OFF
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-stone-900 group-hover:text-[#FF6B4A] transition-colors leading-snug">
                {product.title}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleToggleCompare}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isCompared
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                  }`}
                  title="Compare"
                >
                  <Scale size={16} />
                </button>
                <button
                  onClick={handleToggleWishlist}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isFavorited
                      ? 'text-red-500 bg-red-50'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart size={16} className={isFavorited ? 'fill-red-500' : ''} />
                </button>
              </div>
            </div>

            <p className="text-xs text-stone-500 mt-2 line-clamp-2 leading-relaxed">
              {product.shortDescription || product.description}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating} count={product.ratingCount} size={13} />
              <span className="text-stone-300">·</span>
              <span className="text-xs text-stone-500">
                {product.inStock ? `${product.totalStock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-stone-950">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={!product.inStock}
              className="btn-brand-primary px-4 py-2 text-xs flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>Add to Bag</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Layout
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl border border-stone-200/80 p-3 sm:p-3.5 hover:border-stone-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full rounded-xl bg-stone-100 overflow-hidden mb-3">
        <ImageWithFallback
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Discount Badge */}
        {product.discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-stone-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
            -{product.discountPercent}%
          </div>
        )}

        {/* Low Stock Indicator */}
        {product.inStock && product.totalStock <= 8 && (
          <div className="absolute bottom-2 left-2 bg-amber-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
            Only {product.totalStock} left
          </div>
        )}

        {/* Floating Quick Action Icons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors ${
              isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-stone-600 hover:text-red-500 hover:bg-white'
            }`}
            title="Wishlist"
          >
            <Heart size={14} className={isFavorited ? 'fill-white' : ''} />
          </button>
          <button
            onClick={handleToggleCompare}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md shadow-xs transition-colors ${
              isCompared
                ? 'bg-teal-600 text-white'
                : 'bg-white/90 text-stone-600 hover:text-teal-700 hover:bg-white'
            }`}
            title="Compare"
          >
            <Scale size={14} />
          </button>
        </div>
      </div>

      {/* Meta Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#FF6B4A] transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          <div className="mt-1.5">
            <RatingStars rating={product.rating} count={product.ratingCount} size={11} />
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
          <div>
            <div className="text-sm sm:text-base font-extrabold text-stone-950 leading-tight">
              ${product.price.toFixed(2)}
            </div>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-stone-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!product.inStock}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-100 hover:bg-gradient-brand text-stone-700 hover:text-white flex items-center justify-center transition-all shadow-xs hover:shadow-md hover:scale-105 active:scale-95"
            title="Add to Bag"
          >
            <ShoppingBag size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
