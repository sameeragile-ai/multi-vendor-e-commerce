import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../../services/api';
import { Product, Category, Brand } from '../../../types';
import { ProductCard } from '../components/ProductCard';
import {
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Search,
  X,
  RotateCcw,
  ChevronDown,
  Star,
  Check,
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedSeller = searchParams.get('seller') || '';
  const isDealFilter = searchParams.get('deal') === 'true';

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest'
  >('featured');
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function loadMeta() {
      const [cats, brs] = await Promise.all([
        api.getCategories(),
        api.getBrands(),
      ]);
      setCategories(cats);
      setBrands(brs);
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function fetchFiltered() {
      setIsLoading(true);
      try {
        const res = await api.getProducts({
          category: selectedCategory || undefined,
          brand: selectedBrand || undefined,
          seller: selectedSeller || undefined,
          search: searchQuery || undefined,
          minPrice: minPrice > 0 ? minPrice : undefined,
          maxPrice: maxPrice < 1000 ? maxPrice : undefined,
          minRating: minRating > 0 ? minRating : undefined,
          minDiscount: minDiscount > 0 ? minDiscount : undefined,
          inStockOnly: inStockOnly || undefined,
          sortBy,
        });

        let list = res.products;
        if (isDealFilter) {
          list = list.filter((p) => p.isDealOfTheDay);
        }

        setProducts(list);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFiltered();
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    selectedSeller,
    isDealFilter,
    minPrice,
    maxPrice,
    minRating,
    minDiscount,
    inStockOnly,
    sortBy,
  ]);

  const handleCategoryChange = (catId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategory === catId) {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleBrandChange = (brandId: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedBrand === brandId) {
      newParams.delete('brand');
    } else {
      newParams.set('brand', brandId);
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setMinPrice(0);
    setMaxPrice(1000);
    setMinRating(0);
    setMinDiscount(0);
    setInStockOnly(false);
    setSortBy('featured');
    setSearchParams({});
    setCurrentPage(1);
  };

  // Pagination slice
  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : selectedCategory
              ? categories.find((c) => c.id === selectedCategory)?.name || 'Catalog'
              : isDealFilter
              ? 'Deals of the Day'
              : 'Explore All Marketplace Products'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Showing {products.length} products with verified artisan & maker warranty
          </p>
        </div>

        {/* View Layout & Sorting Bar */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-stone-200 rounded-xl"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-stone-200 text-xs font-semibold text-stone-900 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Grid vs List toggle */}
          <div className="hidden sm:flex items-center bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setLayout('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                layout === 'grid'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                layout === 'list'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside
          className={`md:block space-y-6 ${
            isMobileFilterOpen
              ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto'
              : 'hidden'
          }`}
        >
          {isMobileFilterOpen && (
            <div className="flex items-center justify-between pb-4 border-b border-stone-200 md:hidden">
              <h3 className="text-base font-bold text-stone-900">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-stone-900">
              <SlidersHorizontal size={14} className="text-[#FF6B4A]" />
              <span>Refine Results</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          {/* Department Categories */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
              Departments
            </h4>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg text-left transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-amber-50 font-bold text-[#FF6B4A]'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <span>{cat.name}</span>
                  {selectedCategory === cat.id && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Max Price
              </h4>
              <span className="text-xs font-bold text-stone-900">${maxPrice}</span>
            </div>
            <input
              type="range"
              min={20}
              max={1000}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#FF6B4A] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>$20</span>
              <span>$500</span>
              <span>$1000+</span>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Minimum Rating
            </h4>
            <div className="space-y-1.5">
              {[4.5, 4.0, 3.5].map((ratingVal) => (
                <button
                  key={ratingVal}
                  onClick={() => setMinRating(minRating === ratingVal ? 0 : ratingVal)}
                  className={`w-full flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg transition-colors ${
                    minRating === ratingVal
                      ? 'bg-amber-50 font-bold text-stone-900'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center text-amber-500">
                    <Star size={12} className="fill-amber-400 text-amber-500" />
                  </div>
                  <span>{ratingVal} Stars & above</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount Filter */}
          <div className="pt-4 border-t border-stone-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
              Discount
            </h4>
            <div className="space-y-1.5">
              {[15, 20].map((disc) => (
                <button
                  key={disc}
                  onClick={() => setMinDiscount(minDiscount === disc ? 0 : disc)}
                  className={`w-full flex items-center justify-between text-xs py-1.5 px-2 rounded-lg transition-colors ${
                    minDiscount === disc
                      ? 'bg-amber-50 font-bold text-[#FF6B4A]'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span>{disc}% off or more</span>
                  {minDiscount === disc && <Check size={13} />}
                </button>
              ))}
            </div>
          </div>

          {/* In Stock Only Checkbox */}
          <div className="pt-4 border-t border-stone-200">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-[#FF6B4A] focus:ring-[#FF6B4A]"
              />
              <span className="text-xs font-semibold text-stone-700">
                In Stock & Ready to Ship
              </span>
            </label>
          </div>

          {isMobileFilterOpen && (
            <div className="pt-6">
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full btn-brand-primary py-2.5 text-xs"
              >
                Apply Filters
              </button>
            </div>
          )}
        </aside>

        {/* Products Grid Content Area */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse space-y-3"
                >
                  <div className="aspect-square bg-stone-100 rounded-xl" />
                  <div className="h-4 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-5 bg-stone-100 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-stone-900">No products match your criteria</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                Try widening your price range, clearing specific department filters, or resetting search keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-5 btn-brand-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
              >
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <>
              <div
                className={
                  layout === 'grid'
                    ? 'grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6'
                    : 'space-y-4'
                }
              >
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} layout={layout} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1
                          ? 'bg-stone-900 text-white'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-stone-200 rounded-lg disabled:opacity-40 hover:bg-stone-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
