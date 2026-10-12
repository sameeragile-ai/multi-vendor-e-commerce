import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store';
import { api } from '../../../services/api';
import { Product, Category, ProductVariant } from '../../../types';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  AlertCircle,
  Copy,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SellerProducts: React.FC = () => {
  const { activeSellerId, addToast } = useStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Selected for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPrice, setFormPrice] = useState(99);
  const [formOriginalPrice, setFormOriginalPrice] = useState(120);
  const [formStock, setFormStock] = useState(50);
  const [formLowStockThreshold, setFormLowStockThreshold] = useState(10);
  const [formImages, setFormImages] = useState<string[]>(['']);
  const [formVariants, setFormVariants] = useState<ProductVariant[]>([]);
  const [formNewVariantName, setFormNewVariantName] = useState('');
  const [formNewVariantPrice, setFormNewVariantPrice] = useState(99);
  const [formNewVariantStock, setFormNewVariantStock] = useState(25);

  useEffect(() => {
    loadProducts();
  }, [activeSellerId]);

  async function loadProducts() {
    setIsLoading(true);
    try {
      const [prodsRes, cats] = await Promise.all([
        api.getProducts({ seller: activeSellerId }),
        api.getCategories(),
      ]);
      setProducts(prodsRes.products);
      setCategories(cats);
      if (cats.length > 0 && !formCategory) {
        setFormCategory(cats[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory(categories[0]?.id || 'cat_electronics');
    setFormPrice(99);
    setFormOriginalPrice(120);
    setFormStock(45);
    setFormLowStockThreshold(8);
    setFormImages([
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
    ]);
    setFormVariants([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormDescription(p.description);
    setFormCategory(p.categoryId);
    setFormPrice(p.price);
    setFormOriginalPrice(p.originalPrice);
    setFormStock(p.totalStock);
    setFormLowStockThreshold(p.lowStockThreshold);
    setFormImages(p.images.length > 0 ? p.images : ['']);
    setFormVariants(p.variants || []);
    setIsModalOpen(true);
  };

  const handleAddImageField = () => {
    setFormImages([...formImages, '']);
  };

  const handleImageChange = (index: number, val: string) => {
    const updated = [...formImages];
    updated[index] = val;
    setFormImages(updated);
  };

  const handleAddVariant = () => {
    if (!formNewVariantName.trim()) return;
    const newV: ProductVariant = {
      id: `v_${Date.now()}`,
      name: formNewVariantName,
      attributes: { label: formNewVariantName },
      price: Number(formNewVariantPrice),
      originalPrice: Number(formNewVariantPrice * 1.2),
      stock: Number(formNewVariantStock),
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setFormVariants([...formVariants, newV]);
    setFormNewVariantName('');
  };

  const handleRemoveVariant = (variantId: string) => {
    setFormVariants(formVariants.filter((v) => v.id !== variantId));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const discount =
      formOriginalPrice > formPrice
        ? Math.round(((formOriginalPrice - formPrice) / formOriginalPrice) * 100)
        : 0;

    const cleanedImages = formImages.filter((img) => img.trim().length > 0);
    if (cleanedImages.length === 0) {
      cleanedImages.push(
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80'
      );
    }

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, {
          title: formTitle,
          description: formDescription,
          categoryId: formCategory,
          price: Number(formPrice),
          originalPrice: Number(formOriginalPrice),
          discountPercent: discount,
          totalStock: Number(formStock),
          inStock: Number(formStock) > 0,
          lowStockThreshold: Number(formLowStockThreshold),
          images: cleanedImages,
          variants: formVariants,
        });
        addToast({
          type: 'success',
          title: 'Product Updated',
          message: `Changes saved for "${formTitle}".`,
        });
      } else {
        await api.createProduct({
          title: formTitle,
          slug: formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: formDescription,
          shortDescription: formDescription.slice(0, 100),
          categoryId: formCategory,
          brandId: 'brand_aurora',
          sellerId: activeSellerId,
          price: Number(formPrice),
          originalPrice: Number(formOriginalPrice),
          discountPercent: discount,
          rating: 5.0,
          ratingCount: 1,
          reviewsCount: 0,
          inStock: Number(formStock) > 0,
          totalStock: Number(formStock),
          lowStockThreshold: Number(formLowStockThreshold),
          images: cleanedImages,
          specs: { 'Origin': 'Handcrafted Studio', 'Warranty': '1 Year Full Coverage' },
          tags: ['new', 'verified', 'artisan'],
          isFeatured: true,
          isDealOfTheDay: false,
          variants: formVariants,
          status: 'active',
        });
        addToast({
          type: 'success',
          title: 'Product Published',
          message: `"${formTitle}" is now active in the marketplace catalog.`,
        });
      }

      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        message: 'Failed to save product.',
      });
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await api.deleteProduct(id);
      addToast({
        type: 'info',
        message: `Product "${title}" removed from catalog.`,
      });
      loadProducts();
    }
  };

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected products?`)) {
      for (const id of selectedIds) {
        await api.deleteProduct(id);
      }
      setSelectedIds([]);
      addToast({
        type: 'info',
        message: 'Selected products deleted.',
      });
      loadProducts();
    }
  };

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
    if (searchQuery.trim()) {
      return (
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-display text-stone-950">
            Product Catalog Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your store&apos;s SKUs, multi-variant listings, pricing, and live inventory.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="btn-brand-primary px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Bulk Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#FF6B4A]"
            />
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium"
          >
            <option value="all">All Departments</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">
              {selectedIds.length} items selected:
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1"
            >
              <Trash2 size={13} />
              <span>Delete Selected</span>
            </button>
          </div>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] font-semibold border-b border-stone-100">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredProducts.length &&
                      filteredProducts.length > 0
                    }
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? filteredProducts.map((p) => p.id) : []
                      )
                    }
                    className="rounded border-stone-300"
                  />
                </th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Variants</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredProducts.map((p) => {
                const isSelected = selectedIds.includes(p.id);
                const isLowStock = p.totalStock <= p.lowStockThreshold;

                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-stone-50/80 transition-colors ${
                      isSelected ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) =>
                          setSelectedIds(
                            e.target.checked
                              ? [...selectedIds, p.id]
                              : selectedIds.filter((id) => id !== p.id)
                          )
                        }
                        className="rounded border-stone-300"
                      />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100">
                          <ImageWithFallback
                            src={p.images[0]}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <div className="font-bold text-stone-900 truncate">{p.title}</div>
                          <div className="text-[11px] text-stone-400 mt-0.5 font-mono">
                            ID: {p.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {categories.find((c) => c.id === p.categoryId)?.name || p.categoryId}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-stone-950">${p.price.toFixed(2)}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-stone-400 line-through block">
                          ${p.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {p.variants.length > 0 ? `${p.variants.length} options` : 'Standard'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.totalStock === 0
                            ? 'bg-red-50 text-red-700'
                            : isLowStock
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.totalStock} units
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-800 font-semibold">
                      ★ {p.rating} ({p.reviewsCount})
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${p.id}`}
                          target="_blank"
                          className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                          title="View live page"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-stone-600 hover:text-teal-700 rounded-lg hover:bg-teal-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.title)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="text-lg font-bold font-display text-stone-950">
                {editingProduct ? 'Edit Marketplace Product' : 'List New Product SKU'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-800 mb-1">Product Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Handmade Ceramic Stoneware Dripper"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Department</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Original Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Total Stock (Units)</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    value={formLowStockThreshold}
                    onChange={(e) => setFormLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detail the materials, manufacturing standards, dimensions, and craftsmanship..."
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                />
              </div>

              {/* Multi-Image URLs */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-stone-800">Product Image URLs (Unsplash or CDN)</label>
                  <button
                    type="button"
                    onClick={handleAddImageField}
                    className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus size={13} />
                    <span>Add Image URL</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formImages.map((img, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={img}
                      onChange={(e) => handleImageChange(idx, e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
                    />
                  ))}
                </div>
              </div>

              {/* Variants Builder */}
              <div className="pt-2 border-t border-stone-100">
                <label className="block font-semibold text-stone-800 mb-2">
                  Product Variants (Sizes, Colors, Storage)
                </label>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Variant Name (e.g. Size: Large)"
                    value={formNewVariantName}
                    onChange={(e) => setFormNewVariantName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Price ($)"
                    value={formNewVariantPrice}
                    onChange={(e) => setFormNewVariantPrice(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={formNewVariantStock}
                    onChange={(e) => setFormNewVariantStock(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-3 py-2 bg-stone-800 text-white font-bold rounded-lg hover:bg-stone-900"
                  >
                    Add
                  </button>
                </div>

                {formVariants.length > 0 && (
                  <div className="space-y-1.5">
                    {formVariants.map((v) => (
                      <div
                        key={v.id}
                        className="p-2 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-stone-900">{v.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono">${v.price.toFixed(2)}</span>
                          <span className="text-stone-500">Stock: {v.stock}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(v.id)}
                            className="text-stone-400 hover:text-red-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-brand-primary px-6 py-2.5 text-xs font-bold">
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
