import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { categoryGroups, formatSubcategoryName } from '../data/categoryHierarchy';

interface CategoryPageProps {
  categorySlug?: string;
  onNavigate: (route: string) => void;
}

function CollapsibleFilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b border-neutral-200 pb-4 last:border-b-0 last:pb-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-1 text-sm font-bold text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22] focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="pt-3">{children}</div>
    </details>
  );
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
  const [sortBy, setSortBy] = useState<'featured' | 'discount' | 'price-asc' | 'price-desc' | 'popular'>('featured');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [pageSize, setPageSize] = useState(30);
  const [page, setPage] = useState(1);
  const categorySliderRef = useRef<HTMLDivElement>(null);

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
  const availableBrandOptions = useMemo(() => {
    const brandIds = new Set(baseProducts.map((product) => product.brandId));
    return Array.from(brandIds).map((brandId) => {
      const bObj = brands.find((b) => b.id === brandId);
      return { id: brandId, name: bObj?.name || brandId };
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

  const availableBrands = useMemo(() =>
    availableBrandOptions.map((brand) => ({
      ...brand,
      count: filteredProducts.filter((product) => product.brandId === brand.id).length,
    })),
  [availableBrandOptions, filteredProducts]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
      case 'price-desc':
        return list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
      case 'discount':
        return list.sort((a, b) => {
          const discountA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
          const discountB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
          return discountB - discountA;
        });
      case 'popular':
        return list.sort((a, b) =>
          Number(b.popular) - Number(a.popular) || b.reviewCount - a.reviewCount || b.rating - a.rating
        );
      case 'featured':
      default:
        return list.sort((a, b) =>
          Number(b.featured) - Number(a.featured) || b.rating - a.rating || b.reviewCount - a.reviewCount
        );
    }
  }, [filteredProducts, sortBy]);

  React.useEffect(() => {
    setPage(1);
  }, [categorySlug, pageSize, selectedSubcategoryIds, selectedBrands, selectedVoltages, selectedMotors, inStockOnly, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [page]);

  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const pagedProducts = sortedProducts.slice((page - 1) * pageSize, page * pageSize);
  const resultStart = sortedProducts.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const resultEnd = sortedProducts.length > 0 ? Math.min(page * pageSize, sortedProducts.length) : 0;

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
          {(selectedGroup || parentGroup) && (
            <nav aria-label="Κατηγορίες προϊόντων" className="border-b border-neutral-200 pb-4">
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => onNavigate(`/category/${(selectedGroup ?? parentGroup)!.id}`)}
                  className="block w-full rounded-lg text-left text-sm font-bold leading-snug text-neutral-950 transition-colors hover:text-[#b91c22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22] focus-visible:ring-offset-2"
                >
                  {selectedGroup?.name || parentGroup?.name}
                </button>
              </div>
              <div className="space-y-1">
                {(selectedGroup
                  ? categories.filter((category) => category.active && category.parentId === selectedGroup.id)
                  : categories.filter((category) => category.active && category.parentId === parentGroup?.id)
                ).sort((a, b) => a.order - b.order).map((category) => {
                  const productCount = filteredProducts.filter((product) => product.categoryIds.includes(category.id)).length;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => onNavigate(`/category/${category.slug}`)}
                      className={`flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs transition-colors ${currentCategory?.id === category.id ? 'bg-red-50 font-bold text-[#b91c22]' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950'}`}
                    >
                      <span className="leading-snug">{formatSubcategoryName(category.name)}</span>
                      <span className="shrink-0 font-normal text-neutral-400">({productCount})</span>
                    </button>
                  );
                })}
              </div>
            </nav>
          )}
          <div className="flex justify-end lg:hidden">
            <button
              onClick={closeMobileFilters}
              aria-label="Κλείσιμο φίλτρων"
              className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!currentCategory && !selectedGroup && (
            <CollapsibleFilterSection title="Κατηγορίες προϊόντων">
              <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
                {categoryGroups.map((group) => {
                  const groupSubcategories = categories
                    .filter((category) => category.active && category.parentId === group.id)
                    .sort((a, b) => a.order - b.order);
                  const groupIds = groupSubcategories.map((category) => category.id);
                  const groupProductCount = filteredProducts.filter((product) => product.categoryIds.some((id) => groupIds.includes(id))).length;

                  return (
                    <details key={group.id} className="group rounded-lg border border-transparent open:border-neutral-200 open:bg-neutral-50">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-2 py-2 font-semibold text-neutral-700 hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="text-neutral-400 transition-transform group-open:rotate-90">›</span>
                          <span className="leading-snug">{group.name}</span>
                        </span>
                        <span className="shrink-0 font-normal text-neutral-400">({groupProductCount})</span>
                      </summary>
                      <div className="space-y-1 px-2 pb-2 pl-7">
                        <button
                          type="button"
                          onClick={() => onNavigate(`/category/${group.id}`)}
                          className="w-full rounded-md px-2 py-1.5 text-left font-semibold text-[#b91c22] transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                        >
                          Προβολή όλων
                        </button>
                        {groupSubcategories.map((subcategory) => {
                          const productCount = filteredProducts.filter((product) => product.categoryIds.includes(subcategory.id)).length;
                          return (
                            <button
                              key={subcategory.id}
                              type="button"
                              onClick={() => onNavigate(`/category/${subcategory.slug}`)}
                              className="flex w-full items-start justify-between gap-2 rounded-md px-2 py-1.5 text-left text-neutral-700 transition-colors hover:bg-white hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                            >
                              <span className="leading-snug">{formatSubcategoryName(subcategory.name)}</span>
                              <span className="shrink-0 font-normal text-neutral-400">({productCount})</span>
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </CollapsibleFilterSection>
          )}

          {/* In stock only filter */}
          <CollapsibleFilterSection title="Διαθεσιμότητα">
            <label className="flex items-center space-x-2.5 cursor-pointer font-medium text-neutral-800">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-[#cfd8dc] text-[#e21b22] focus:ring-[#e21b22]"
              />
              <span>Μόνο Ετοιμοπαράδοτα ({filteredProducts.filter((product) => product.stockQuantity > 0).length})</span>
            </label>
          </CollapsibleFilterSection>

          {/* Price Range Filter */}
          <CollapsibleFilterSection title="Εύρος τιμής (€)">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={maxPrice}
                value={minPrice}
                onChange={(event) => setMinPrice(Number(event.target.value))}
                aria-label="Ελάχιστη τιμή"
                className="w-1/2 rounded border border-[#cfd8dc] p-1.5 text-xs font-mono-spec"
                placeholder="Από"
              />
              <span className="text-neutral-400">–</span>
              <input
                type="number"
                min={minPrice}
                max={3000}
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
                aria-label="Μέγιστη τιμή"
                className="w-1/2 rounded border border-[#cfd8dc] p-1.5 text-xs font-mono-spec"
                placeholder="Έως"
              />
            </div>
          </CollapsibleFilterSection>

          {/* Brands Filter */}
          {availableBrands.length > 0 && (
            <CollapsibleFilterSection title="Κατασκευαστής">
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
                        <span className="font-medium">{b.name}</span>
                      </div>
                      <span className="text-[11px] font-normal text-neutral-400">({b.count})</span>
                    </label>
                  );
                })}
              </div>
            </CollapsibleFilterSection>
          )}

          {/* Voltages Filter */}
          {availableVoltages.length > 0 && (
            <CollapsibleFilterSection title="Τάση μπαταρίας">
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
            </CollapsibleFilterSection>
          )}

          {/* Motors Filter */}
          {availableMotors.length > 0 && (
            <CollapsibleFilterSection title="Τύπος κινητήρα">
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
            </CollapsibleFilterSection>
          )}
          </div>
        </aside>

        {/* Product Listing Main Column */}
        <div className="lg:col-span-3 space-y-4">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
                {currentCategory?.name || selectedGroup?.name || 'Όλα τα επαγγελματικά εργαλεία'}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-500">
                {currentCategory?.description || (selectedGroup
                  ? `Περιηγηθείτε σε όλα τα προϊόντα της κατηγορίας ${selectedGroup.name}.`
                  : 'Περιηγηθείτε σε ολόκληρο τον κατάλογο επαγγελματικών εργαλείων και εξοπλισμού.')}
              </p>
            </div>
            <span className="rounded-md bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-600 ring-1 ring-neutral-200">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'προϊόν' : 'προϊόντα'}
            </span>
          </header>

          {childCategories.length > 0 && (
            <div className="relative" aria-label="Γρήγορη επιλογή κατηγορίας">
              <button
                type="button"
                aria-label="Προηγούμενες κατηγορίες"
                onClick={() => categorySliderRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                className="absolute -left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div ref={categorySliderRef} className="nt-category-slider flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 py-0.5 scroll-smooth">
                {childCategories.map((category) => {
                  const isSelected = selectedSubcategoryIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedSubcategoryIds((selected) => isSelected ? selected.filter((id) => id !== category.id) : [...selected, category.id])}
                      className={`flex min-h-20 w-[270px] shrink-0 snap-start items-center gap-4 rounded-xl border bg-white px-4 py-3 text-left text-sm font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22] sm:w-[300px] ${isSelected ? 'border-[#e21b22] bg-red-50 text-[#b91c22]' : 'border-neutral-200 text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50'}`}
                    >
                      {category.image ? <img src={category.image} alt="" className="h-12 w-12 shrink-0 object-contain" /> : <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-neutral-100 text-[#e21b22]">{formatSubcategoryName(category.name).charAt(0)}</span>}
                      <span>{formatSubcategoryName(category.name)}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                aria-label="Επόμενες κατηγορίες"
                onClick={() => categorySliderRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                className="absolute -right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Results display controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              id="mobile-filter-toggle-btn"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              aria-expanded={isMobileFilterOpen}
              aria-controls="category-filter-sidebar"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22] lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#e21b22]" />
              <span>Φίλτρα {hasActiveFilters && '(Ενεργά)'}</span>
            </button>

            <div className="ml-auto flex flex-wrap items-center justify-end gap-3 text-xs text-neutral-500">
              <label className="flex items-center">
                <span className="sr-only">Ταξινόμηση</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                  aria-label="Ταξινόμηση προϊόντων"
                  className="nt-custom-select h-8 min-w-36 rounded-lg border border-neutral-200 bg-white py-0 pl-2.5 pr-8 text-xs text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                >
                  <option value="featured">Best seller</option>
                  <option value="discount">Με έκπτωση</option>
                  <option value="price-asc">Τιμή αύξουσα</option>
                  <option value="price-desc">Τιμή φθίνουσα</option>
                  <option value="popular">Δημοφιλή</option>
                </select>
              </label>
              {sortedProducts.length > 0 && (
                <label className="flex shrink-0 items-center gap-1.5 whitespace-nowrap font-medium text-neutral-500">
                  <span>Ανά σελίδα</span>
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    aria-label="Αποτελέσματα ανά σελίδα"
                    className="nt-custom-select h-8 rounded-lg border border-neutral-200 bg-white py-0 pl-2.5 pr-8 font-semibold text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                  >
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={90}>90</option>
                  </select>
                </label>
              )}
              <div className="nt-view-toggle" role="group" aria-label="Τρόπος προβολής">
                <button
                  type="button"
                  aria-label="Προβολή σε πλέγμα"
                  aria-pressed={layoutMode === 'grid'}
                  onClick={() => setLayoutMode('grid')}
                  className={layoutMode === 'grid' ? 'is-active' : ''}
                  title="Πλέγμα"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Προβολή σε λίστα"
                  aria-pressed={layoutMode === 'list'}
                  onClick={() => setLayoutMode('list')}
                  className={layoutMode === 'list' ? 'is-active' : ''}
                  title="Λίστα"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 py-1 text-xs">
              {selectedSubcategoryIds.map((subcategoryId) => {
                const subcategory = categories.find((category) => category.id === subcategoryId);
                if (!subcategory) return null;
                return (
                  <span key={subcategoryId} className="inline-flex min-h-7 items-center rounded-full bg-neutral-200 px-3 font-medium text-neutral-800">
                    {formatSubcategoryName(subcategory.name)}
                    <button
                      aria-label={`Αφαίρεση φίλτρου ${formatSubcategoryName(subcategory.name)}`}
                      onClick={() => setSelectedSubcategoryIds((selected) => selected.filter((id) => id !== subcategoryId))}
                      className="ml-1.5 rounded-full text-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}

              {inStockOnly && (
                <span className="inline-flex min-h-7 items-center rounded-full bg-neutral-200 px-3 font-medium text-neutral-800">
                  Μόνο Ετοιμοπαράδοτα
                  <button aria-label="Αφαίρεση φίλτρου διαθεσιμότητας" onClick={() => setInStockOnly(false)} className="ml-1.5 rounded-full text-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}

              {selectedBrands.map((bId) => {
                const b = brands.find((brand) => brand.id === bId);
                return (
                  <span key={bId} className="inline-flex min-h-7 items-center rounded-full bg-neutral-200 px-3 font-medium text-neutral-800">
                    {b?.name}
                    <button
                      aria-label={`Αφαίρεση φίλτρου ${b?.name ?? ''}`}
                      onClick={() => setSelectedBrands((prev) => prev.filter((id) => id !== bId))}
                      className="ml-1.5 rounded-full text-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}

              {selectedVoltages.map((volt) => (
                <span key={volt} className="inline-flex min-h-7 items-center rounded-full bg-neutral-200 px-3 font-medium text-neutral-800">
                  {volt}
                  <button
                    aria-label={`Αφαίρεση φίλτρου ${volt}`}
                    onClick={() => setSelectedVoltages((prev) => prev.filter((v) => v !== volt))}
                    className="ml-1.5 rounded-full text-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}

              {selectedMotors.map((motor) => (
                <span key={motor} className="inline-flex min-h-7 items-center rounded-full bg-neutral-200 px-3 font-medium text-neutral-800">
                  {motor}
                  <button aria-label={`Αφαίρεση φίλτρου ${motor}`} onClick={() => setSelectedMotors((prev) => prev.filter((item) => item !== motor))} className="ml-1.5 rounded-full text-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}

              {(minPrice > 0 || maxPrice < 2000) && (
                <span className="inline-flex min-h-7 items-center rounded-full bg-neutral-200 px-3 font-medium text-neutral-800">
                  {minPrice}€–{maxPrice}€
                  <button aria-label="Αφαίρεση φίλτρου εύρους τιμής" onClick={() => { setMinPrice(0); setMaxPrice(2000); }} className="ml-1.5 rounded-full text-neutral-500 hover:text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}

              <button
                onClick={resetFilters}
                className="min-h-7 px-1 text-xs font-medium text-[#c81e24] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
              >
                Καθαρισμός όλων
              </button>
            </div>
          )}

          {/* Products Grid / List */}
          {sortedProducts.length > 0 ? (
            <>
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
            </>
          ) : (
            <div className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
              <Filter className="w-12 h-12 text-neutral-300 mx-auto" />
              <h3 className="font-display font-bold text-lg text-neutral-800">
                Δεν βρέθηκαν προϊόντα με τα επιλεγμένα φίλτρα
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Δοκιμάστε να αφαιρέσετε μερικά από τα ενεργά φίλτρα ή να διευρύνετε το εύρος τιμών για να δείτε περισσότερα αποτελέσματα.
              </p>
              <button
                onClick={resetFilters}
                className="rounded-xl bg-[#e21b22] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#c81016] font-display"
              >
                Επαναφορά Όλων των Φίλτρων
              </button>
            </div>
          )}

          {/* Pagination bar */}
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white text-xs">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5 p-3">
              <div className="min-w-0 basis-full sm:basis-auto sm:flex-1">
                <span className="whitespace-nowrap font-medium text-neutral-500" aria-live="polite">
                  {resultStart}–{resultEnd} από {sortedProducts.length} αποτελέσματα
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                {pageCount > 1 && (
                  <div className="flex shrink-0 items-center gap-1" aria-label="Σελιδοποίηση προϊόντων">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((value) => value - 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Προηγούμενη σελίδα"
                    >
                      ‹
                    </button>
                    <span className="min-w-12 text-center font-semibold tabular-nums text-neutral-600" aria-live="polite">{page} / {pageCount}</span>
                    <button
                      type="button"
                      disabled={page === pageCount}
                      onClick={() => setPage((value) => value + 1)}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Επόμενη σελίδα"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
