import React, { useState, useRef } from 'react';
import { ChevronDown, Layers, ChevronRight, Flame, Award } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types/category';
import { categoryGroups } from '../../data/categoryHierarchy';

interface MegaMenuProps {
  onNavigate: (route: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onNavigate, isOpen = false, onOpenChange }) => {
  const { categories } = useStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const isAllCategoriesOpen = isOpen || internalOpen;
  const setIsAllCategoriesOpen = (open: boolean) => {
    setInternalOpen(open);
    onOpenChange?.(open);
  };
  const [activeMainCatId, setActiveMainCatId] = useState<string>(categoryGroups[0].id);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Level 1 Categories
  const mainCategories = categoryGroups.map((group) => ({
    id: group.id,
    name: group.name,
    slug: group.id,
    description: `Προϊόντα στην κατηγορία ${group.name}.`,
    level: 1 as const,
    order: categoryGroups.indexOf(group) + 1,
    active: true,
  }));

  // Subcategories of currently selected main category
  const activeSubcategories = categories
    .filter((c) => c.active && c.parentId === activeMainCatId)
    .sort((a, b) => a.order - b.order);

  // Get child categories for a subcategory
  const getChildCategories = (subcatId: string) => {
    return categories
      .filter((c) => c.parentId === subcatId && c.level === 3 && c.active)
      .sort((a, b) => a.order - b.order);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onOpenChange?.(true); setInternalOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onOpenChange?.(false); setInternalOpen(false);
    }, 250);
  };

  const selectedCategory = mainCategories.find((c) => c.id === activeMainCatId);

  return (
    <nav className="fixed top-[76px] left-0 right-0 text-white hidden lg:block select-none z-30 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Left: All Categories Dropdown Trigger */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            id="mega-menu-trigger-btn"
            onClick={() => setIsAllCategoriesOpen(!isAllCategoriesOpen)}
            className="hidden"
          >
            <Layers className="w-4 h-4" />
            <span>ΟΛΕΣ ΟΙ ΚΑΤΗΓΟΡΙΕΣ</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAllCategoriesOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Full Mega Menu Panel */}
          {isAllCategoriesOpen && (
            <div
              id="desktop-mega-menu-panel"
              className="pointer-events-auto fixed top-[76px] left-1/2 -translate-x-1/2 w-[min(1280px,calc(100vw-2rem))] overflow-visible rounded-2xl bg-white border border-neutral-200 shadow-2xl z-50 flex text-neutral-800"
            >
              {/* Left Column: Level 1 Main Categories */}
              <div className="w-96 shrink-0 bg-neutral-50 rounded-l-2xl border-r border-neutral-200 py-1.5">
                {mainCategories.map((cat) => {
                  const isActive = cat.id === activeMainCatId;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setActiveMainCatId(cat.id)}
                      onClick={() => {
                        setIsAllCategoriesOpen(false);
                        onNavigate('/products');
                      }}
                      className={`flex min-h-[62px] items-center justify-between px-4 py-3 text-base font-semibold leading-snug cursor-pointer border-l-2 transition-colors ${
                        isActive
                          ? 'border-[#e21b22] bg-red-50 text-neutral-900'
                          : 'border-transparent text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex min-w-0 items-center">
                        <span className="min-w-0 whitespace-normal leading-snug">{cat.name}</span>
                      </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#e21b22]' : 'text-neutral-400'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Right Area: Level 2 Subcategories & Level 3 Children */}
              <div className="min-w-0 flex-1 px-5 py-4 bg-white rounded-r-2xl flex flex-col">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
                    <div>
                      <h3 className="font-display font-bold text-lg text-neutral-900 tracking-wide flex items-center space-x-2">
                        <span>{selectedCategory?.name}</span>
                        {selectedCategory?.slug === 'prosfores' && (
                          <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                            ΕΚΠΤΩΣΕΙΣ ΕΩΣ -40%
                          </span>
                        )}
                      </h3>
                      {selectedCategory?.description && (
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
                          {selectedCategory.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setIsAllCategoriesOpen(false);
                        if (selectedCategory) onNavigate('/products');
                      }}
                      className="text-xs text-[#c81e24] hover:text-[#e21b22] font-semibold flex items-center space-x-1"
                    >
                      <span>Προβολή Όλων</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Multi-column Grid for Subcategories */}
                  {activeSubcategories.length > 0 ? (
                    <div className="grid grid-cols-3 auto-rows-fr gap-3">
                      {activeSubcategories.map((subcat) => {
                        const childCats = getChildCategories(subcat.id);
                        return (
                          <div key={subcat.id} className="min-w-0 h-full space-y-2">
                            {/* Subcategory title (Level 2) */}
                            <button
                              onClick={() => {
                                setIsAllCategoriesOpen(false);
                                onNavigate(`/category/${subcat.slug}`);
                              }}
                              className="group relative flex h-full min-h-[64px] w-full items-center overflow-hidden rounded-lg border border-neutral-200 bg-gradient-to-br from-white to-neutral-50 px-4 py-3 text-left font-display text-[15px] font-bold leading-snug tracking-wide text-neutral-800 shadow-sm transition-all duration-200 before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-[#e21b22] before:opacity-0 before:transition-opacity hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50/60 hover:text-[#c81e24] hover:shadow-md hover:before:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e21b22]/30"
                            >
                              <span className="relative">{subcat.name}</span>
                            </button>

                            {/* Level 3 Children */}
                            {childCats.length > 0 && (
                              <ul className="space-y-1 pl-1 border-l border-neutral-200">
                                {childCats.map((child) => (
                                  <li key={child.id}>
                                    <button
                                      onClick={() => {
                                        setIsAllCategoriesOpen(false);
                                        onNavigate(`/category/${child.slug}`);
                                      }}
                                      className="text-xs text-neutral-500 hover:text-[#e21b22] hover:underline pl-2 text-left transition-colors"
                                    >
                                      {child.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-neutral-400">
                      <p className="text-sm">Δεν υπάρχουν καταχωρημένες υπο-κατηγορίες.</p>
                      <button
                        onClick={() => {
                          setIsAllCategoriesOpen(false);
                          if (selectedCategory) onNavigate(`/category/${selectedCategory.slug}`);
                        }}
                        className="mt-3 bg-[#e21b22] text-white px-4 py-1.5 text-xs font-bold rounded uppercase font-display"
                      >
                        Προβολή όλων
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Center Horizontal Quick Category Links */}
        <div className="hidden">
          <button
            onClick={() => onNavigate('/category/ergaleia-mpatarias')}
            className="px-3 py-3 hover:text-white hover:bg-[#1e1e1e] transition-colors whitespace-nowrap"
          >
            Εργαλεία Μπαταρίας
          </button>
          <button
            onClick={() => onNavigate('/category/ilektrika-ergaleia')}
            className="px-3 py-3 hover:text-white hover:bg-[#1e1e1e] transition-colors whitespace-nowrap"
          >
            Ηλεκτρικά
          </button>
          <button
            onClick={() => onNavigate('/category/ergaleia-xeiros')}
            className="px-3 py-3 hover:text-white hover:bg-[#1e1e1e] transition-colors whitespace-nowrap"
          >
            Χειρός
          </button>
          <button
            onClick={() => onNavigate('/category/analosima-eksartimata')}
            className="px-3 py-3 hover:text-white hover:bg-[#1e1e1e] transition-colors whitespace-nowrap"
          >
            Αναλώσιμα
          </button>
          <button
            onClick={() => onNavigate('/category/apothikefsi-ergaleiothikes')}
            className="px-3 py-3 hover:text-white hover:bg-[#1e1e1e] transition-colors whitespace-nowrap"
          >
            Αποθήκευση
          </button>
          <button
            onClick={() => onNavigate('/products')}
            className="px-3 py-3 hover:text-white hover:bg-[#1e1e1e] transition-colors whitespace-nowrap"
          >
            Όλος ο Κατάλογος
          </button>
        </div>

        {/* Right Quick Links: Offers & Brands */}
        <div className="hidden">
          <button
            id="nav-offers-btn"
            onClick={() => onNavigate('/offers')}
            className="flex items-center space-x-1.5 text-red-400 hover:text-red-300 font-display font-bold text-xs uppercase tracking-wider px-3 py-3 transition-colors"
          >
            <Flame className="w-4 h-4 text-red-500 animate-bounce" />
            <span>ΠΡΟΣΦΟΡΕΣ</span>
          </button>

          <button
            id="nav-brands-btn"
            onClick={() => onNavigate('/brand/milwaukee')}
            className="flex items-center space-x-1.5 text-neutral-300 hover:text-white text-xs uppercase tracking-wider px-3 py-3 transition-colors font-semibold"
          >
            <Award className="w-3.5 h-3.5 text-neutral-400" />
            <span>BRANDS</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
