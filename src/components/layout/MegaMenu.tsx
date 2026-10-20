import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { categoryGroups, formatSubcategoryName } from '../../data/categoryHierarchy';
import { Category } from '../../types/category';

interface MegaMenuProps {
  onNavigate: (route: string) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onNavigate, isOpen, onOpenChange }) => {
  const { categories, products } = useStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [activeMainCatId, setActiveMainCatId] = useState(categoryGroups[0]?.id ?? '');

  const activeSubcategories = useMemo(
    () => categories
      .filter((category) => category.active && category.parentId === activeMainCatId)
      .sort((a, b) => a.order - b.order),
    [categories, activeMainCatId]
  );

  const groupedSubcategories = useMemo(() => {
    const groups = new Map<string, Category[]>();
    activeSubcategories.forEach((category) => {
      const groupName = category.groupName || 'Κατηγορίες';
      groups.set(groupName, [...(groups.get(groupName) ?? []), category]);
    });
    return [...groups.entries()];
  }, [activeSubcategories]);

  const selectedCategory = categoryGroups.find((category) => category.id === activeMainCatId);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (document.activeElement?.id === 'mobile-menu-toggle-btn') {
      panelRef.current?.querySelector<HTMLButtonElement>('[data-main-category]')?.focus();
    }

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
        document.getElementById('mobile-menu-toggle-btn')?.focus();
      }
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onOpenChange]);

  const cancelScheduledClose = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    cancelScheduledClose();
    closeTimerRef.current = window.setTimeout(() => {
      onOpenChange(false);
      closeTimerRef.current = null;
    }, 220);
  };

  const navigate = (route: string) => {
    onOpenChange(false);
    onNavigate(route);
  };

  const handleCategoryKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;
    if (event.key === 'ArrowDown') nextIndex = (index + 1) % categoryGroups.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + categoryGroups.length) % categoryGroups.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = categoryGroups.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    const nextCategory = categoryGroups[nextIndex];
    setActiveMainCatId(nextCategory.id);
    panelRef.current?.querySelectorAll<HTMLButtonElement>('[data-main-category]')[nextIndex]?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 top-[84px] z-50 hidden bg-neutral-950/20 px-4 pb-5 pt-3 lg:block"
      onMouseEnter={scheduleClose}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false);
      }}
      aria-hidden="false"
    >
      <div
        ref={panelRef}
        id="desktop-mega-menu-panel"
        className="mx-auto flex max-h-full w-full max-w-7xl overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-[0_24px_70px_-24px_rgba(0,0,0,0.42)]"
        onMouseEnter={cancelScheduledClose}
        onMouseLeave={scheduleClose}
        aria-label="Μενού κατηγοριών προϊόντων"
      >
        <nav aria-label="Βασικές κατηγορίες" className="w-[330px] shrink-0 overflow-y-auto border-r border-neutral-200 bg-[#f7f7f6] p-3 xl:w-[365px]">
          <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
            Κατηγορίες προϊόντων
          </div>
          <ul className="space-y-1">
            {categoryGroups.map((category, index) => {
              const selected = category.id === activeMainCatId;
              const subcategoryIds = new Set(categories.filter((item) => item.active && item.parentId === category.id).map((item) => item.id));
              const count = products.filter((product) => product.categoryIds.some((id) => subcategoryIds.has(id))).length;
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    data-main-category
                    onClick={() => setActiveMainCatId(category.id)}
                    onMouseEnter={() => setActiveMainCatId(category.id)}
                    onKeyDown={(event) => handleCategoryKeyDown(event, index)}
                    aria-current={selected ? 'true' : undefined}
                    className={`group flex min-h-[54px] w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[14px] font-semibold leading-snug transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22] focus-visible:ring-offset-1 ${
                      selected
                        ? 'border-red-100 bg-white text-neutral-950 shadow-sm'
                        : 'border-transparent text-neutral-700 hover:border-neutral-200 hover:bg-white'
                    }`}
                  >
                    <span className="min-w-0">{category.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className={`text-xs tabular-nums ${selected ? 'text-[#c81e24]' : 'text-neutral-400'}`}>{count}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${selected ? 'translate-x-0.5 text-[#e21b22]' : 'text-neutral-400 group-hover:text-neutral-700'}`} aria-hidden="true" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="flex min-w-0 flex-1 flex-col p-6 xl:p-8" aria-labelledby="mega-menu-heading">
          <div className="flex items-start justify-between gap-6 border-b border-neutral-200 pb-5">
            <div className="min-w-0">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#c81e24]">Εξερεύνηση κατηγορίας</p>
              <h2 id="mega-menu-heading" className="font-display text-xl font-bold leading-tight text-neutral-950 xl:text-2xl">
                {selectedCategory?.name}
              </h2>
              <p className="mt-1.5 text-sm text-neutral-500">
                Επιλέξτε υποκατηγορία για να δείτε τα διαθέσιμα προϊόντα.
              </p>
            </div>
            <a
              href={`/category/${activeMainCatId}`}
              onClick={(event) => { event.preventDefault(); navigate(`/category/${activeMainCatId}`); }}
              className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-[#c81e24] transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
            >
              Όλα τα προϊόντα <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto py-5">
            {groupedSubcategories.length ? (
              <div className="grid grid-cols-2 items-start gap-x-6 gap-y-6 xl:grid-cols-3 xl:gap-x-8">
                {groupedSubcategories.map(([groupName, groupCategories]) => {
                  const splitIntoColumns = groupCategories.length > 0;
                  const midpoint = Math.ceil(groupCategories.length / 2);
                  const categoryColumns = splitIntoColumns
                    ? [groupCategories.slice(0, midpoint), groupCategories.slice(midpoint)]
                    : [groupCategories];
                  return (
                  <section key={groupName} className={`min-w-0 ${splitIntoColumns ? 'col-span-2 xl:col-span-3' : ''}`}>
                    <h3 className="mb-2.5 flex items-center gap-2 text-[12px] font-bold uppercase leading-snug tracking-wide text-neutral-500">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#e21b22]" aria-hidden="true" />
                      {groupName}
                    </h3>
                    <div className={`grid items-start gap-x-5 ${splitIntoColumns ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {categoryColumns.map((column, columnIndex) => <ul key={`${groupName}-${columnIndex}`} className="space-y-1">
                      {column.map((subcategory) => {
                        const productCount = products.filter((product) => product.categoryIds.includes(subcategory.id)).length;
                        return (
                          <li key={subcategory.id}>
                            <a
                              href={`/category/${subcategory.slug}`}
                              onClick={(event) => { event.preventDefault(); navigate(`/category/${subcategory.slug}`); }}
                              className="group flex min-h-10 items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 py-2 text-[14px] font-medium leading-snug text-neutral-800 transition-colors hover:border-red-100 hover:bg-red-50/70 hover:text-[#b91c22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]"
                            >
                              <span>{formatSubcategoryName(subcategory.name)}</span>
                              <span className="flex shrink-0 items-center gap-1 text-xs text-neutral-400 transition-colors group-hover:text-[#c81e24]">
                                {productCount > 0 && <span className="tabular-nums">{productCount}</span>}
                                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>)}
                    </div>
                  </section>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
                Δεν υπάρχουν διαθέσιμες υποκατηγορίες.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-xs text-neutral-500">
            <span>Nomikos Tools <span className="mx-1.5 text-neutral-300">/</span> {selectedCategory?.name}</span>
            <span>{activeSubcategories.length} υποκατηγορίες</span>
          </div>
        </section>
      </div>
    </div>
  );
};
