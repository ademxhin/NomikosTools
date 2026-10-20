import React, { useState, useMemo } from 'react';
import {
  ChevronRight,
  Filter,
  Grid,
  List,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { categoryGroups, formatSubcategoryName } from '../data/categoryHierarchy';

interface CategoryPageProps {
  categorySlug?: string;
  onNavigate: (route: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, onNavigate }) => {
  const { products, categories, brands, isB2BMode } = useStore();

  // Find target category
  const currentCategory = categories.find((c) => c.active && (c.slug === categorySlug || c.previousSlugs?.includes(categorySlug ?? '')));
  const selectedGroup = categoryGroups.find((group) => group.id === categorySlug);
  const parentGroup = currentCategory?.parentId
    ? categoryGroups.find((group) => group.id === currentCategory.parentId)
    : undefined;
  const childCategories = currentCategory
    ? categories.filter((c) => c.parentId === currentCategory.id && c.active)
    : selectedGroup
      ? categories.filter((c) => c.parentId === selectedGroup.id && c.active)
      : [];

  // Filter States
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
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
    if (!currentCategory && !selectedGroup) return products;
    // For a top-level menu group, include products assigned to any active subcategory.
    const ownerId = currentCategory?.id ?? selectedGroup?.id;
    const childIds = categories.filter((c) => c.parentId === ownerId && c.active).map((c) => c.id);
    const validCategoryIds = currentCategory ? [currentCategory.id, ...childIds] : childIds;

    return products.filter((p) =>
      p.categoryIds.some((cid) => validCategoryIds.includes(cid))
    );
  }, [currentCategory, selectedGroup, categories, products]);

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
      if (selectedSubcategoryIds.length > 0 && !prod.categoryIds.some((id) => selectedSubcategoryIds.includes(id))) return false;
      if (selectedBrands.length > 0 && !selectedBrands.includes(prod.brandId)) return false;
      if (selectedVoltages.length > 0 && (!prod.attributes.voltage || !selectedVoltages.includes(prod.attributes.voltage)))
        return false;
      if (selectedMotors.length > 0 && (!prod.attributes.motor || !selectedMotors.includes(prod.attributes.motor)))
        return false;

      return true;
    });
  }, [baseProducts, minPrice, maxPrice, inStockOnly, selectedSubcategoryIds, selectedBrands, selectedVoltages, selectedMotors]);

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
  }, [categorySlug, pageSize, selectedSubcategoryIds, selectedBrands, selectedVoltages, selectedMotors, inStockOnly, minPrice, maxPrice, sortBy]);

  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const pagedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setSelectedSubcategoryIds([]);
    setSelectedBrands([]);
    setSelectedVoltages([]);
    setSelectedMotors([]);
    setInStockOnly(false);
    setMinPrice(0);
    setMaxPrice(2000);
  };

  const closeMobileFilters = () => {
    setIsMobileFilterOpen(false);
    requestAnimationFrame(() => document.getElementById('mobile-filter-toggle-btn')?.focus());
  };

  const hasActiveFilters =
    selectedSubcategoryIds.length > 0 ||
    selectedBrands.length > 0 ||
    selectedVoltages.length > 0 ||
    selectedMotors.length > 0 ||
    inStockOnly ||
    minPrice > 0 ||
    maxPrice < 2000;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-4 sm:py-7">
      {/* Breadcrumbs */}
      <nav aria-label="Διαδρομή σελίδας" className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-neutral-500">
        <button onClick={() => onNavigate('/')} className="hover:text-neutral-900 transition-colors">
          Αρχική
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('/products')} className="hover:text-neutral-900 transition-colors">
          Κατάλογος
        </button>
        {parentGroup && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              onClick={() => onNavigate(`/category/${parentGroup.id}`)}
              className="hover:text-neutral-900 transition-colors"
            >
              {parentGroup.name}
            </button>
          </>
        )}
        {selectedGroup && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 font-semibold">{selectedGroup.name}</span>
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
      <div className="rounded-2xl border border-neutral-200 border-t-4 border-t-[#e21b22] bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-6">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
              {currentCategory?.name || selectedGroup?.name || 'Όλα τα επαγγελματικά εργαλεία'}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-neutral-500">
              {currentCategory?.description || (selectedGroup
                ? `Περιηγηθείτε σε όλα τα προϊόντα της κατηγορίας ${selectedGroup.name}.`
                : 'Περιηγηθείτε σε ολόκληρο τον κατάλογο βαρέος τύπου εργαλείων, εξαρτημάτων και εξοπλισμού συνεργείου.')}
            </p>
          </div>
          <div className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-sm font-semibold text-neutral-700">
            <span className="font-mono-spec text-neutral-950">{sortedProducts.length}</span>
            <span>{sortedProducts.length === 1 ? 'προϊόν' : 'προϊόντα'}</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Sidebar Filters + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Shared desktop sidebar and mobile filter sheet */}
        <aside
          id="category-filter-sidebar"
          role={isMobileFilterOpen ? 'dialog' : undefined}
          aria-modal={isMobileFilterOpen || undefined}
          aria-label="Φίλτρα προϊόντων"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeMobileFilters();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && isMobileFilterOpen) closeMobileFilters();
          }}
          className={isMobileFilterOpen
            ? 'fixed inset-0 z-[60] flex items-end bg-neutral-950/45 lg:sticky lg:top-4 lg:block lg:bg-transparent'
            : 'hidden lg:sticky lg:top-4 lg:block'}
        >
          <div className="max-h-[88vh] w-full space-y-5 overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-5 text-xs shadow-xl lg:max-h-none lg:overflow-visible lg:rounded-2xl lg:shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
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
            <button
              onClick={closeMobileFilters}
              aria-label="Κλείσιμο φίλτρων"
              className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!currentCategory && !selectedGroup && (
            <section className="space-y-2 border-b border-neutral-100 pb-4" aria-labelledby="all-category-filter-heading">
              <h2 id="all-category-filter-heading" className="font-bold uppercase tracking-wider text-neutral-800">
                Κατηγορίες προϊόντων
              </h2>
              <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                {categoryGroups.map((group) => {
                  const groupSubcategories = categories
                    .filter((category) => category.active && category.parentId === group.id)
                    .sort((a, b) => a.order - b.order);
                  const groupIds = groupSubcategories.map((category) => category.id);
                  const selectedGroupIds = groupIds.filter((id) => selectedSubcategoryIds.includes(id));
                  const allSelected = groupIds.length > 0 && selectedGroupIds.length === groupIds.length;
                  const groupProductCount = products.filter((product) => product.categoryIds.some((id) => groupIds.includes(id))).length;

                  return (
                    <details key={group.id} className="group rounded-lg border border-transparent open:border-neutral-200 open:bg-neutral-50">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 py-2 font-semibold text-neutral-700 hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="text-neutral-400 transition-transform group-open:rotate-90">›</span>
                          <span className="leading-snug">{group.name}</span>
                        </span>
                        <span className="shrink-0 font-mono-spec text-neutral-400">({groupProductCount})</span>
                      </summary>
                      <div className="space-y-1 px-2 pb-2 pl-8">
                        <label className="flex cursor-pointer items-center gap-2 py-1 text-neutral-800">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => setSelectedSubcategoryIds((selected) =>
                              allSelected
                                ? selected.filter((id) => !groupIds.includes(id))
                                : [...new Set([...selected, ...groupIds])]
                            )}
                          />
                          <span className="font-semibold">Όλες οι υποκατηγορίες</span>
                        </label>
                        {groupSubcategories.map((subcategory) => {
                          const isChecked = selectedSubcategoryIds.includes(subcategory.id);
                          const productCount = products.filter((product) => product.categoryIds.includes(subcategory.id)).length;
                          return (
                            <label key={subcategory.id} className="flex cursor-pointer items-start justify-between gap-2 py-1 text-neutral-700">
                              <span className="flex min-w-0 items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => setSelectedSubcategoryIds((selected) =>
                                    isChecked ? selected.filter((id) => id !== subcategory.id) : [...selected, subcategory.id]
                                  )}
                                />
                                <span className="leading-snug">{formatSubcategoryName(subcategory.name)}</span>
                              </span>
                              <span className="shrink-0 font-mono-spec text-neutral-400">({productCount})</span>
                            </label>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </section>
          )}

          {childCategories.length > 0 && (
            <section className="space-y-2 border-b border-neutral-100 pb-4" aria-labelledby="subcategory-filter-heading">
              <h2 id="subcategory-filter-heading" className="font-bold uppercase tracking-wider text-neutral-800">Κατηγορία</h2>
              <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
                {childCategories.map((subcategory) => {
                  const isChecked = selectedSubcategoryIds.includes(subcategory.id);
                  const productCount = products.filter((product) => product.categoryIds.includes(subcategory.id)).length;
                  return (
                    <label key={subcategory.id} className="flex cursor-pointer items-start justify-between gap-3 rounded-lg px-1 py-1.5 text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-950">
                      <span className="flex min-w-0 items-start gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => setSelectedSubcategoryIds((selected) =>
                            isChecked ? selected.filter((id) => id !== subcategory.id) : [...selected, subcategory.id]
                          )}
                        />
                        <span className="leading-snug">{formatSubcategoryName(subcategory.name)}</span>
                      </span>
                      <span className="shrink-0 font-mono-spec text-neutral-400">({productCount})</span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

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
          <div className="space-y-2 border-t border-neutral-100 pt-4">
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
          </div>
        </aside>

        {/* Product Listing Main Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: Sort, View Layout, Mobile filter toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs shadow-sm sm:gap-3 sm:p-3">
            <div className="flex items-center space-x-2">
              {/* Mobile Filter Button */}
              <button
                id="mobile-filter-toggle-btn"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                aria-expanded={isMobileFilterOpen}
                aria-controls="category-filter-sidebar"
                className="flex items-center space-x-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-semibold transition-colors hover:bg-neutral-100 lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#e21b22]" />
                <span>Φίλτρα {hasActiveFilters && '(Ενεργά)'}</span>
              </button>

              <span className="hidden sm:inline text-neutral-500 font-mono-spec">
                Προβολή {sortedProducts.length} αποτελεσμάτων
              </span>
            </div>

            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:space-x-3 sm:ml-auto">
              {/* Sorting Selector */}
              <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:flex-initial">
                <span className="hidden text-neutral-500 font-medium sm:inline">Ταξινόμηση:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Ταξινόμηση προϊόντων"
                  className="nt-custom-select min-w-0 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-2 text-xs sm:w-auto sm:py-1"
                >
                  <option value="featured">Προτεινόμενα</option>
                  <option value="price-asc">Τιμή: Χαμηλή προς Υψηλή</option>
                  <option value="price-desc">Τιμή: Υψηλή προς Χαμηλή</option>
                  <option value="rating">Καλύτερη Βαθμολογία</option>
                  <option value="newest">Νεότερες Αφίξεις</option>
                </select>
              </div>

              {/* View Layout Toggle */}
                <div className="nt-view-toggle" role="group" aria-label="Τρόπος προβολής">
                <button
                  type="button"
                  aria-pressed={layoutMode === 'grid'}
                  onClick={() => setLayoutMode('grid')}
                  className={layoutMode === 'grid' ? 'is-active' : ''}
                  title="Πλέγμα"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-pressed={layoutMode === 'list'}
                  onClick={() => setLayoutMode('list')}
                  className={layoutMode === 'list' ? 'is-active' : ''}
                  title="Λίστα"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200 bg-white p-2.5 text-xs shadow-sm">
              <span className="text-neutral-500 font-semibold mr-1">Ενεργά:</span>

              {selectedSubcategoryIds.map((subcategoryId) => {
                const subcategory = childCategories.find((category) => category.id === subcategoryId);
                if (!subcategory) return null;
                return (
                  <span key={subcategoryId} className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] text-[#b91c22]">
                    {formatSubcategoryName(subcategory.name)}
                    <button
                      aria-label={`Αφαίρεση φίλτρου ${formatSubcategoryName(subcategory.name)}`}
                      onClick={() => setSelectedSubcategoryIds((selected) => selected.filter((id) => id !== subcategoryId))}
                      className="ml-1 text-[#c81e24] hover:text-neutral-950"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}

              {inStockOnly && (
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800">
                  Μόνο Ετοιμοπαράδοτα
                  <button onClick={() => setInStockOnly(false)} className="ml-1 text-emerald-600 hover:text-emerald-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBrands.map((bId) => {
                const b = brands.find((brand) => brand.id === bId);
                return (
              <span key={bId} className="inline-flex items-center rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-[11px] text-neutral-800">
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
              <span key={volt} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-mono-spec text-blue-800">
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
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-[10px] shadow-sm sm:text-xs">
              <span className="text-neutral-500">Εμφάνιση {Math.min((page - 1) * pageSize + 1, sortedProducts.length)}–{Math.min(page * pageSize, sortedProducts.length)} από {sortedProducts.length}</span>
              <label className="flex items-center gap-2 font-semibold text-neutral-700">Ανά σελίδα
                <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1">
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
              <button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 shadow-sm disabled:opacity-40">Προηγούμενη</button>
              <span className="font-semibold text-neutral-600">Σελίδα {page} / {pageCount}</span>
              <button disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 shadow-sm disabled:opacity-40">Επόμενη</button>
            </div>}
            </>
          ) : (
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <Filter className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-neutral-800 uppercase">
                Δεν βρέθηκαν προϊόντα με τα επιλεγμένα φίλτρα
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Δοκιμάστε να αφαιρέσετε μερικά από τα ενεργά φίλτρα ή να διευρύνετε το εύρος τιμών για να δείτε περισσότερα αποτελέσματα.
              </p>
              <button
                onClick={resetFilters}
                className="rounded-xl bg-[#e21b22] px-4 py-2 text-xs font-bold uppercase text-white transition-colors hover:bg-[#c81016] font-display"
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
