import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { Product, Category, Banner, Seller, Brand } from '../../../types';
import { ProductCard } from '../components/ProductCard';
import { CountdownTimer } from '../components/CountdownTimer';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import { useStore } from '../../../store';
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Star,
  Award,
} from 'lucide-react';
import { APP_CONFIG } from '../../../config/appConfig';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { recentlyViewedIds } = useStore();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deals, setDeals] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHome() {
      setIsLoading(true);
      try {
        const [bannersData, catsData, prodsRes, sellersData, brandsData] =
          await Promise.all([
            api.getBanners(),
            api.getCategories(),
            api.getProducts(),
            api.getSellers(),
            api.getBrands(),
          ]);

        setBanners(bannersData);
        setCategories(catsData);
        setSellers(sellersData.filter((s) => s.status === 'approved'));
        setBrands(brandsData);

        const dealList = prodsRes.products.filter((p) => p.isDealOfTheDay);
        setDeals(dealList);

        const featList = prodsRes.products.filter((p) => p.isFeatured);
        setFeaturedProducts(featList);

        // Load recently viewed
        if (recentlyViewedIds.length > 0) {
          const recents: Product[] = [];
          for (const id of recentlyViewedIds.slice(0, 4)) {
            const p = prodsRes.products.find((prod) => prod.id === id);
            if (p) recents.push(p);
          }
          setRecentlyViewed(recents);
        }
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHome();
  }, [recentlyViewedIds]);

  // Auto rotate banner every 7s
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const currentBanner = banners[activeBannerIdx] || banners[0];

  const filteredFeatured =
    selectedFilter === 'all'
      ? featuredProducts
      : featuredProducts.filter((p) => p.categoryId === selectedFilter);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Banner Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-stone-900 min-h-[380px] sm:min-h-[460px] md:min-h-[500px] flex items-center">
          {/* Background Image with Gradient Overlay */}
          {currentBanner && (
            <>
              <img
                src={currentBanner.image}
                alt={currentBanner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity scale-102 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />
            </>
          )}

          {/* Hero Content Grid */}
          <div className="relative z-10 p-6 sm:p-12 md:p-16 max-w-2xl text-white">
            {currentBanner?.badge && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold text-amber-300 mb-4">
                <Sparkles size={13} className="text-[#FFB547]" />
                <span>{currentBanner.badge}</span>
              </div>
            )}

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              {currentBanner?.title || 'Heirloom Goods From Independent Hands'}
            </h1>

            <p className="mt-4 text-stone-300 text-sm sm:text-base leading-relaxed max-w-lg">
              {currentBanner?.subtitle ||
                'Discover audiophile electronics, stoneware ceramics, and sustainable tailoring with certified provenance.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => navigate(currentBanner?.link || '/search')}
                className="btn-brand-primary px-6 py-3.5 text-xs sm:text-sm font-bold inline-flex items-center gap-2 rounded-xl shadow-lg shadow-[#FF6B4A]/30"
              >
                <span>{currentBanner?.ctaText || 'Shop Curated Marketplace'}</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => navigate('/seller')}
                className="px-5 py-3 text-xs sm:text-sm font-semibold text-stone-200 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl border border-white/15 transition-all"
              >
                Become a Seller
              </button>
            </div>
          </div>

          {/* Carousel Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveBannerIdx((prev) => (prev - 1 + banners.length) % banners.length)
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setActiveBannerIdx((prev) => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white flex items-center justify-center backdrop-blur-md transition-colors border border-white/10"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>

              {/* Dots */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIdx(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeBannerIdx === i ? 'w-8 bg-[#FF6B4A]' : 'w-2 bg-white/40'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Category Rail Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
              Departments
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-950 mt-0.5">
              Explore by Category
            </h2>
          </div>
          <Link
            to="/search"
            className="text-xs font-bold text-stone-600 hover:text-stone-950 flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/search?category=${cat.id}`}
              className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-stone-200/80 hover:border-[#FF6B4A]/50 hover:shadow-lg transition-all duration-200 text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-100 mb-2.5 shrink-0 border border-stone-100">
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-bold text-stone-800 group-hover:text-[#FF6B4A] transition-colors line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals of the Day with Countdown Timer */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-500/5 rounded-3xl p-6 sm:p-8 border border-amber-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B4A] animate-ping" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
                    Limited Time Offer
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-950 mt-1">
                  Today&apos;s Featured Marketplace Deals
                </h2>
              </div>

              <CountdownTimer label="Special pricing closes in" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {deals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products & Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B4A]">
              Editor&apos;s Selection
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-950 mt-0.5">
              Trending & High-Rating Goods
            </h2>
          </div>

          {/* Interactive filter tabs (clean segmented controls) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setSelectedFilter('cat_electronics')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'cat_electronics'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Audio & Tech
            </button>
            <button
              onClick={() => setSelectedFilter('cat_home')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'cat_home'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Home & Living
            </button>
            <button
              onClick={() => setSelectedFilter('cat_beauty')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedFilter === 'cat_beauty'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Clean Beauty
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredFeatured.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Verified Independent Sellers Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
            Certified Sellers
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-stone-950 mt-0.5">
            Meet the Makers & Studios Behind {APP_CONFIG.brandName}
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Directly support vetted boutique workshops. Each seller maintains complete inventory control and verified fulfillment guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sellers.slice(0, 3).map((seller) => (
            <div
              key={seller.id}
              onClick={() => navigate(`/search?seller=${seller.id}`)}
              className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden hover:shadow-xl hover:border-stone-300 transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="h-32 bg-stone-100 overflow-hidden relative">
                <ImageWithFallback
                  src={seller.banner}
                  alt={seller.businessName}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
                <span className="absolute top-3 right-3 text-[10px] bg-white/90 backdrop-blur-xs text-teal-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                  <ShieldCheck size={12} className="text-teal-600" />
                  Verified Merchant
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between -mt-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-stone-100 overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={seller.logo}
                        alt={seller.businessName}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#FF6B4A] transition-colors leading-tight">
                        {seller.businessName}
                      </h3>
                      <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                        <Star size={11} className="fill-amber-400 text-amber-500" />
                        <span className="font-bold text-stone-800">{seller.rating}</span>
                        <span>·</span>
                        <span>{seller.totalReviews} reviews</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                    {seller.bio}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-stone-800 group-hover:text-[#FF6B4A]">
                  <span>Explore Storefront</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top Brands Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-100/70 rounded-3xl p-6 sm:p-8 border border-stone-200/60">
          <div className="flex items-center justify-between mb-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                Partnerships
              </span>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Featured Brand Collaborations
              </h3>
            </div>
            <Link
              to="/search"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {brands.map((b) => (
              <Link
                key={b.id}
                to={`/search?brand=${b.id}`}
                className="bg-white p-3 rounded-xl border border-stone-200/70 hover:border-stone-300 text-center flex flex-col items-center justify-center hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-stone-50 overflow-hidden mb-2">
                  <ImageWithFallback
                    src={b.logo}
                    alt={b.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs font-bold text-stone-800">{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Viewed Rail (if any) */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Browsing History
              </span>
              <h3 className="text-lg font-bold font-display text-stone-900">
                Recently Viewed by You
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recentlyViewed.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
