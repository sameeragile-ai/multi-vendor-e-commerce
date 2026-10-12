import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { Product, ProductVariant, Seller } from '../../../types';
import { useStore } from '../../../store';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import { RatingStars } from '../../../components/common/RatingStars';
import { ProductCard } from '../components/ProductCard';
import {
  ShoppingBag,
  Heart,
  Scale,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Star,
  ChevronRight,
  ZoomIn,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    addToCart,
    isInWishlist,
    toggleWishlist,
    addToCompare,
    compareIds,
    addRecentlyViewed,
    addToast,
  } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setIsLoading(true);
      try {
        const prod = await api.getProductById(id);
        if (prod) {
          setProduct(prod);
          setSelectedImageIdx(0);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
          addRecentlyViewed(prod.id);

          const [sellerData, relRes] = await Promise.all([
            api.getSellerById(prod.sellerId),
            api.getProducts({ category: prod.categoryId, pageSize: 4 }),
          ]);
          setSeller(sellerData);
          setRelatedProducts(relRes.products.filter((p) => p.id !== prod.id));
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id, addRecentlyViewed]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-stone-200 rounded w-3/4" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
            <div className="h-10 bg-stone-200 rounded w-1/3" />
            <div className="h-32 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <h2 className="text-xl font-bold text-stone-900">Product Not Found</h2>
        <p className="text-xs text-stone-500 mt-2">
          The requested product may have been archived or removed from the marketplace.
        </p>
        <button
          onClick={() => navigate('/search')}
          className="mt-6 btn-brand-primary px-6 py-2.5 text-xs inline-flex items-center gap-2"
        >
          Return to Marketplace Catalog
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant
    ? selectedVariant.originalPrice
    : product.originalPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : product.totalStock;

  const isFavorited = isInWishlist(product.id);
  const isCompared = compareIds.includes(product.id);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      variantId: selectedVariant?.id,
      sellerId: product.sellerId,
      quantity,
      price: currentPrice,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;
    setIsSubmittingReview(true);

    setTimeout(() => {
      const newReview = {
        id: `rev_${Date.now()}`,
        userId: 'user_alex',
        userName: 'Alex Morgan',
        rating: newReviewRating,
        title: newReviewTitle || 'Verified Customer Review',
        comment: newReviewComment,
        date: new Date().toISOString().split('T')[0],
        verified: true,
        helpfulCount: 0,
      };

      setProduct({
        ...product,
        reviews: [newReview, ...product.reviews],
        reviewsCount: product.reviewsCount + 1,
      });

      setNewReviewComment('');
      setNewReviewTitle('');
      setIsSubmittingReview(false);
      addToast({
        type: 'success',
        title: 'Review Published',
        message: 'Thank you for sharing your verified review with the community!',
      });
    }, 400);
  };

  // Star distribution breakdown
  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = product.reviews.filter((r) => Math.round(r.rating) === stars).length;
    const pct = product.reviews.length > 0 ? (count / product.reviews.length) * 100 : stars === 5 ? 80 : 15;
    return { stars, count, pct };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/" className="hover:text-stone-900 transition-colors">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link to={`/search?category=${product.categoryId}`} className="hover:text-stone-900 transition-colors">
          Department
        </Link>
        <ChevronRight size={12} />
        <span className="text-stone-900 font-semibold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main Product Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-sm group">
            <ImageWithFallback
              src={product.images[selectedImageIdx] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
            />

            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs text-stone-700 hover:text-stone-950 flex items-center justify-center shadow-md transition-colors"
              title="Expand image"
            >
              <ZoomIn size={16} />
            </button>

            {product.discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-lg">
                Save {product.discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-stone-100 border-2 transition-all shrink-0 ${
                    selectedImageIdx === idx
                      ? 'border-[#FF6B4A] shadow-md scale-102'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="flex flex-col justify-between space-y-6">
          <div>
            {/* Title & Brand */}
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-950 leading-tight">
              {product.title}
            </h1>

            {/* Rating & reviews counter */}
            <div className="mt-3 flex items-center gap-4">
              <RatingStars rating={product.rating} count={product.ratingCount} size={15} />
              <span className="text-stone-300">·</span>
              <a href="#reviews-section" className="text-xs font-semibold text-[#FF6B4A] hover:underline">
                {product.reviewsCount} customer reviews
              </a>
            </div>

            {/* Price section */}
            <div className="mt-5 p-4 rounded-2xl bg-stone-100/60 border border-stone-200/60 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-stone-950">
                ${currentPrice.toFixed(2)}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-sm text-stone-400 line-through">
                  ${currentOriginalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold ml-auto">
                In Stock & Certified
              </span>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Variants Selector (Color / Size) */}
            {product.variants.length > 0 && (
              <div className="mt-6 pt-5 border-t border-stone-200/70">
                <div className="text-xs font-bold text-stone-900 mb-2.5 flex items-center justify-between">
                  <span>Choose Variant / Specification:</span>
                  <span className="text-stone-500 font-medium">
                    {selectedVariant?.name || 'Standard'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 py-2 text-xs rounded-xl font-semibold border transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-[#FF6B4A] bg-[#FF6B4A]/10 text-stone-950 shadow-xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {v.name} · ${v.price.toFixed(2)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector & Stock Info */}
            <div className="mt-6 flex items-center gap-6">
              <div>
                <span className="block text-xs font-bold text-stone-700 mb-1.5">Quantity</span>
                <div className="flex items-center border border-stone-200 bg-white rounded-xl overflow-hidden shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-stone-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-50 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-xs text-stone-500 self-end pb-2">
                Available: <span className="font-bold text-stone-900">{currentStock} units</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="btn-brand-primary py-3.5 px-6 text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag size={17} />
                <span>Add to Shopping Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="py-3.5 px-6 text-xs sm:text-sm font-bold text-stone-900 bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Instant Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Wishlist & Compare buttons */}
            <div className="mt-3 flex items-center gap-4 text-xs">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center gap-1.5 font-semibold transition-colors ${
                  isFavorited ? 'text-red-600' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Heart size={15} className={isFavorited ? 'fill-red-600' : ''} />
                <span>{isFavorited ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              <button
                onClick={() => addToCompare(product.id)}
                className={`flex items-center gap-1.5 font-semibold transition-colors ${
                  isCompared ? 'text-teal-700' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Scale size={15} />
                <span>{isCompared ? 'In Compare Tray' : 'Compare Specifications'}</span>
              </button>
            </div>

            {/* Guarantees Strip */}
            <div className="mt-8 p-4 rounded-2xl bg-white border border-stone-200/80 grid grid-cols-3 gap-3 text-center text-xs">
              <div className="flex flex-col items-center gap-1 text-stone-600">
                <Truck size={17} className="text-[#FF6B4A]" />
                <span className="font-semibold text-stone-900 text-[11px]">Free Shipping</span>
                <span className="text-[10px] text-stone-400">On orders over $50</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-stone-600 border-x border-stone-100">
                <ShieldCheck size={17} className="text-teal-600" />
                <span className="font-semibold text-stone-900 text-[11px]">Authenticity</span>
                <span className="text-[10px] text-stone-400">100% Verified Maker</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-stone-600">
                <RotateCcw size={17} className="text-[#FFB547]" />
                <span className="font-semibold text-stone-900 text-[11px]">7-Day Return</span>
                <span className="text-[10px] text-stone-400">Instant Refund</span>
              </div>
            </div>
          </div>

          {/* Seller Card Box */}
          {seller && (
            <div className="p-4 rounded-2xl bg-stone-100/60 border border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white p-1 border border-stone-200 overflow-hidden shrink-0">
                  <ImageWithFallback
                    src={seller.logo}
                    alt={seller.businessName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900">{seller.businessName}</span>
                    <ShieldCheck size={13} className="text-teal-600" />
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    ★ {seller.rating} rating · {seller.totalSales} items fulfilled
                  </div>
                </div>
              </div>

              <Link
                to={`/search?seller=${seller.id}`}
                className="px-3 py-1.5 text-xs font-bold text-stone-800 bg-white hover:bg-stone-50 rounded-lg border border-stone-200 transition-colors"
              >
                Visit Store
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Specifications Table */}
      <section className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8">
        <h3 className="text-lg font-bold font-display text-stone-950 mb-4">
          Detailed Specifications & Dimensions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 divide-y md:divide-y-0 divide-stone-100 text-xs">
          {Object.entries(product.specs || {}).map(([key, val]) => (
            <div key={key} className="py-2 flex justify-between border-b border-stone-100">
              <span className="text-stone-500 font-medium">{key}</span>
              <span className="font-semibold text-stone-900 text-right">{val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section id="reviews-section" className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
              Verified Feedback
            </span>
            <h3 className="text-xl font-bold font-display text-stone-950 mt-1">
              Customer Ratings & Reviews
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="text-4xl font-extrabold text-stone-950">
                {product.rating.toFixed(1)}
              </span>
              <div>
                <RatingStars rating={product.rating} size={15} showText={false} />
                <span className="text-xs text-stone-500 mt-0.5 block">
                  Based on {product.reviewsCount} customer experiences
                </span>
              </div>
            </div>
          </div>

          {/* Star Rating Breakdown Bar Chart */}
          <div className="w-full md:w-80 space-y-2 text-xs">
            {starCounts.map(({ stars, count, pct }) => (
              <div key={stars} className="flex items-center gap-3">
                <span className="w-12 text-stone-600 font-medium">{stars} stars</span>
                <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-stone-400 text-[11px] font-mono">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Write a review form */}
        <div className="pt-6 pb-8 border-b border-stone-200">
          <h4 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-[#FF6B4A]" />
            <span>Write a Customer Review</span>
          </h4>
          <form onSubmit={handleSubmitReview} className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-600 font-medium">Your Rating:</span>
              <div className="flex gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      size={18}
                      className={star <= newReviewRating ? 'fill-amber-400 text-amber-500' : 'text-stone-300'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <input
              type="text"
              placeholder="Headline / summary of your experience"
              value={newReviewTitle}
              onChange={(e) => setNewReviewTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
            />

            <textarea
              rows={3}
              placeholder="What did you love about this item? How was the build quality, materials, and shipping?"
              value={newReviewComment}
              onChange={(e) => setNewReviewComment(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
            />

            <button
              type="submit"
              disabled={isSubmittingReview || !newReviewComment.trim()}
              className="btn-brand-primary px-4 py-2 text-xs font-semibold"
            >
              {isSubmittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="pt-6 divide-y divide-stone-100 space-y-5">
          {product.reviews.map((rev) => (
            <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">{rev.userName}</span>
                  {rev.verified && (
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                      <Check size={10} />
                      Verified Purchase
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-400">{rev.date}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <RatingStars rating={rev.rating} size={11} showText={false} />
                <span className="text-xs font-bold text-stone-800">{rev.title}</span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>

              {rev.photos && rev.photos.length > 0 && (
                <div className="flex gap-2 pt-1">
                  {rev.photos.map((ph, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden border">
                      <ImageWithFallback src={ph} alt="Customer review photo" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-bold font-display text-stone-950">
            More in this Collection
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Fullscreen Zoom Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-stone-950/90 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <img
            src={product.images[selectedImageIdx]}
            alt={product.title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};
