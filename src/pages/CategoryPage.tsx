import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Filter,
  Grid,
  List,
  X,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';

interface CategoryPageProps {
  categorySlug?: string;
  onNavigate: (route: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, onNavigate }) => {
  const { products, categories, brands, isB2BMode } = useStore();

  // Find target category
  const currentCategory = categories.find((c) => c.slug === categorySlug);
  const parentCategory = currentCategory?.parentId
    ? categories.find((c) => c.id === currentCategory.parentId)
    : null;
  const childCategories = currentCategory
    ? categories.filter((c) => c.parentId === currentCategory.id && c.active)
    : [];

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedVoltages, setSelectedVoltages] = useState<string[]>([]);
  const [selectedMotors, setSelectedMotors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [pageSize, setPageSize] = useState(30);
  const [page, setPage] = useState(1);

  // Base products for this category or all
  const baseProducts = useMemo(() => {
    if (!currentCategory) return products;
    // Match current category ID or any child category IDs
    const childIds = categories.filter((c) => c.parentId === currentCategory.id).map((c) => c.id);
    const validCategoryIds = [currentCategory.id, ...childIds];

    return products.filter((p) =>
      p.categoryIds.some((cid) => validCategoryIds.includes(cid))
    );
  }, [currentCategory, categories, products]);

  // Available filter options based on base products
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, number>();
    baseProducts.forEach((p) => {
      brandMap.set(p.brandId, (brandMap.get(p.brandId) || 0) + 1);
    });
    return Array.from(brandMap.entries()).map(([brandId, count]) => {
      const bObj = brands.find((b) => b.id === brandId);
      return { id: brandId, name: bObj?.name || brandId, count };
    });
  }, [baseProducts, brands]);

  const availableVoltages = useMemo(() => {
    const voltSet = new Set<string>();
    baseProducts.forEach((p) => {
      if (p.attributes.voltage) voltSet.add(p.attributes.voltage);
    });
    return Array.from(voltSet);
  }, [baseProducts]);

  const availableMotors = useMemo(() => {
    const motorSet = new Set<string>();
    baseProducts.forEach((p) => {
      if (p.attributes.motor) motorSet.add(p.attributes.motor);
    });
    return Array.from(motorSet);
  }, [baseProducts]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    return baseProducts.filter((prod) => {
      const price = prod.salePrice || prod.price;

      if (price < minPrice || price > maxPrice) return false;
      if (inStockOnly && prod.stockQuantity <= 0) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(prod.brandId)) return false;
      if (selectedVoltages.length > 0 && (!prod.attributes.voltage || !selectedVoltages.includes(prod.attributes.voltage)))
        return false;
      if (selectedMotors.length > 0 && (!prod.attributes.motor || !selectedMotors.includes(prod.attributes.motor)))
        return false;

      return true;
    });
  }, [baseProducts, minPrice, maxPrice, inStockOnly, selectedBrands, selectedVoltages, selectedMotors]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      case 'price-desc':
        return list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      case 'rating':
        return list.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case 'featured':
      default:
        return list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [filteredProducts, sortBy]);

  React.useEffect(() => {
    setPage(1);
  }, [categorySlug, pageSize, selectedBrands, selectedVoltages, selectedMotors, inStockOnly, minPrice, maxPrice, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const pagedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedVoltages([]);
    setSelectedMotors([]);
    setInStockOnly(false);
    setMinPrice(0);
    setMaxPrice(2000);
  };

  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedVoltages.length > 0 ||
    selectedMotors.length > 0 ||
    inStockOnly ||
    minPrice > 0 ||
    maxPrice < 2000;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-xs text-neutral-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-neutral-900 transition-colors">
          Αρχική
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('/products')} className="hover:text-neutral-900 transition-colors">
          Κατάλογος
        </button>
        {parentCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              onClick={() => onNavigate(`/category/${parentCategory.slug}`)}
              className="hover:text-neutral-900 transition-colors"
            >
              {parentCategory.name}
            </button>
          </>
        )}
        {currentCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 font-semibold">{currentCategory.name}</span>
          </>
        )}
      </nav>

      {/* Category Header */}
      <div className="border-b border-[#cfd8dc] pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="font-category font-black text-2xl sm:text-3xl text-neutral-900 uppercase tracking-tight">
              {currentCategory?.name || 'ΟΛΑ ΤΑ ΕΠΑΓΓΕΛΜΑΤΙΚΑ ΕΡΓΑΛΕΙΑ'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl leading-relaxed">
              {currentCategory?.description ||
                'Περιηγηθείτε σε ολόκληρο τον κατάλογο βαρέος τύπου εργαλείων, εξαρτημάτων και εξοπλισμού συνεργείου.'}
            </p>
          </div>
          <div className="text-xs font-mono-spec text-neutral-500 shrink-0">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'προϊόν' : 'προϊόντα'}
          </div>
        </div>

        {/* Subcategory Pills */}
        {childCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-neutral-100">
            {childCategories.map((child) => (
              <button
                key={child.id}
                onClick={() => onNavigate(`/category/${child.slug}`)}
                className="bg-[#f0edec] hover:bg-[#e4dfdd] text-neutral-800 text-xs font-semibold px-3 py-1.5 rounded border border-[#cfd8dc] transition-colors"
              >
                {child.name} ({products.filter((p) => p.categoryIds.includes(child.id)).length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-5 bg-white border border-[#cfd8dc] p-4 rounded text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#cfd8dc]">
            <span className="font-display font-bold text-sm uppercase tracking-wider text-neutral-900 flex items-center space-x-1.5">
              <Filter className="w-4 h-4 text-[#e21b22]" />
              <span>ΦΙΛΤΡΑ ΑΝΑΖΗΤΗΣΗΣ</span>
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] text-[#e21b22] hover:underline font-semibold flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Καθαρισμός</span>
              </button>
            )}
          </div>

          {/* In stock only filter */}
          <div>
            <label className="flex items-center space-x-2.5 cursor-pointer font-medium text-neutral-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-[#cfd8dc] text-[#e21b22] focus:ring-[#e21b22]"
              />
              <span>Μόνο Ετοιμοπαράδοτα ({baseProducts.filter((p) => p.stockQuantity > 0).length})</span>
            </label>
          </div>

          {/* Price Range Filter */}
          <div className="border-t border-[#cfd8dc] pt-4 space-y-2">
            <span className="font-bold uppercase tracking-wider text-neutral-800 block">
              ΕΥΡΟΣ ΤΙΜΗΣ (€)
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                max={maxPrice}
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-1/2 p-1.5 border border-[#cfd8dc] rounded text-xs font-mono-spec"
                placeholder="Από"
              />
              <span className="text-neutral-400">-</span>
              <input
                type="number"
                min={minPrice}
                max="3000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-1/2 p-1.5 border border-[#cfd8dc] rounded text-xs font-mono-spec"
                placeholder="Έως"
              />
            </div>
          </div>

          {/* Brands Filter */}
          {availableBrands.length > 0 && (
            <div className="border-t border-[#cfd8dc] pt-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-neutral-800 block">
                ΚΑΤΑΣΚΕΥΑΣΤΗΣ
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableBrands.map((b) => {
                  const isChecked = selectedBrands.includes(b.id);
                  return (
                    <label key={b.id} className="flex items-center justify-between cursor-pointer py-0.5 hover:text-neutral-900 text-neutral-700">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() =>
                            setSelectedBrands((prev) =>
                              isChecked ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                            )
                          }
                          className="rounded border-[#cfd8dc] text-[#e21b22] focus:ring-[#e21b22]"
                        />
                        <span className="font-medium uppercase">{b.name}</span>
                      </div>
                      <span className="text-neutral-400 font-mono-spec text-[11px]">({b.count})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Voltages Filter */}
          {availableVoltages.length > 0 && (
            <div className="border-t border-[#cfd8dc] pt-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-neutral-800 block">
                ΤΑΣΗ ΜΠΑΤΑΡΙΑΣ
              </span>
              <div className="space-y-1.5">
                {availableVoltages.map((volt) => {
                  const isChecked = selectedVoltages.includes(volt);
                  return (
                    <label key={volt} className="flex items-center space-x-2 cursor-pointer text-neutral-700">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedVoltages((prev) =>
                            isChecked ? prev.filter((v) => v !== volt) : [...prev, volt]
                          )
                        }
                        className="rounded border-[#cfd8dc] text-[#e21b22] focus:ring-[#e21b22]"
                      />
                      <span className="font-mono-spec font-medium">{volt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Motors Filter */}
          {availableMotors.length > 0 && (
            <div className="border-t border-[#cfd8dc] pt-4 space-y-2">
              <span className="font-bold uppercase tracking-wider text-neutral-800 block">
                ΤΥΠΟΣ ΚΙΝΗΤΗΡΑ
              </span>
              <div className="space-y-1.5">
                {availableMotors.map((m) => {
                  const isChecked = selectedMotors.includes(m);
                  return (
                    <label key={m} className="flex items-center space-x-2 cursor-pointer text-neutral-700">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedMotors((prev) =>
                            isChecked ? prev.filter((item) => item !== m) : [...prev, m]
                          )
                        }
                        className="rounded border-[#cfd8dc] text-[#e21b22] focus:ring-[#e21b22]"
                      />
                      <span>{m}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Product Listing Main Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: Sort, View Layout, Mobile filter toggle */}
          <div className="bg-white border border-[#cfd8dc] p-3 rounded flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded font-semibold border border-neutral-300"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#e21b22]" />
                <span>Φίλτρα {hasActiveFilters && '(Ενεργά)'}</span>
              </button>

              <span className="hidden sm:inline text-neutral-500 font-mono-spec">
                Προβολή {sortedProducts.length} αποτελεσμάτων
              </span>
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              {/* Sorting Selector */}
              <div className="flex items-center space-x-1.5">
                <span className="text-neutral-500 font-medium">Ταξινόμηση:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-neutral-50 border border-neutral-300 rounded px-2.5 py-1 text-xs focus:border-[#e21b22] focus:outline-none"
                >
                  <option value="featured">Προτεινόμενα</option>
                  <option value="price-asc">Τιμή: Χαμηλή προς Υψηλή</option>
                  <option value="price-desc">Τιμή: Υψηλή προς Χαμηλή</option>
                  <option value="rating">Καλύτερη Βαθμολογία</option>
                  <option value="newest">Νεότερες Αφίξεις</option>
                </select>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center border border-neutral-300 rounded overflow-hidden">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 ${layoutMode === 'grid' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}
                  title="Πλέγμα"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 ${layoutMode === 'list' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}
                  title="Λίστα"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 bg-[#fafafa] p-2.5 rounded border border-neutral-200 text-xs">
              <span className="text-neutral-500 font-semibold mr-1">Ενεργά:</span>

              {inStockOnly && (
                <span className="inline-flex items-center bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[11px]">
                  Μόνο Ετοιμοπαράδοτα
                  <button onClick={() => setInStockOnly(false)} className="ml-1 text-emerald-600 hover:text-emerald-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBrands.map((bId) => {
                const b = brands.find((brand) => brand.id === bId);
                return (
                  <span key={bId} className="inline-flex items-center bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded text-[11px]">
                    {b?.name}
                    <button
                      onClick={() => setSelectedBrands((prev) => prev.filter((id) => id !== bId))}
                      className="ml-1 text-neutral-500 hover:text-neutral-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}

              {selectedVoltages.map((volt) => (
                <span key={volt} className="inline-flex items-center bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-mono-spec">
                  {volt}
                  <button
                    onClick={() => setSelectedVoltages((prev) => prev.filter((v) => v !== volt))}
                    className="ml-1 text-blue-500 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                onClick={resetFilters}
                className="text-[11px] text-[#e21b22] font-bold hover:underline ml-2"
              >
                Καθαρισμός Όλων
              </button>
            </div>
          )}

          {/* Products Grid / List */}
          {sortedProducts.length > 0 ? (
            <>
            <div className="mb-4 flex items-center justify-between rounded border border-neutral-200 bg-white px-3 py-2 text-xs">
              <span className="text-neutral-500">Εμφάνιση {Math.min((page - 1) * pageSize + 1, sortedProducts.length)}–{Math.min(page * pageSize, sortedProducts.length)} από {sortedProducts.length}</span>
              <label className="flex items-center gap-2 font-semibold text-neutral-700">Προϊόντα ανά σελίδα
                <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded border border-neutral-300 bg-white px-2 py-1">
                  <option value={30}>30</option><option value={60}>60</option><option value={90}>90</option>
                </select>
              </label>
            </div>
            <div
              className={
                layoutMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-3'
              }
            >
              {pagedProducts.map((p) => (
                <ProductCard key={p.id} product={p} onNavigate={onNavigate} layout={layoutMode} />
              ))}
            </div>
            {pageCount > 1 && <div className="mt-5 flex items-center justify-center gap-2 text-xs">
              <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-neutral-300 bg-white px-3 py-1.5 disabled:opacity-40">Προηγούμενη</button>
              <span className="font-semibold text-neutral-600">Σελίδα {page} / {pageCount}</span>
              <button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded border border-neutral-300 bg-white px-3 py-1.5 disabled:opacity-40">Επόμενη</button>
            </div>}
            </>
          ) : (
            <div className="bg-white border border-[#cfd8dc] rounded p-12 text-center space-y-3">
              <Filter className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-neutral-800 uppercase">
                Δεν βρέθηκαν προϊόντα με τα επιλεγμένα φίλτρα
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Δοκιμάστε να αφαιρέσετε μερικά από τα ενεργά φίλτρα ή να διευρύνετε το εύρος τιμών για να δείτε περισσότερα αποτελέσματα.
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#e21b22] text-white px-4 py-2 rounded text-xs font-bold uppercase font-display"
              >
                Επαναφορά Όλων των Φίλτρων
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
