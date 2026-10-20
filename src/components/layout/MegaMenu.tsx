import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  Layers,
  ChevronRight,
  Flame,
  Award,
  Wrench,
  BatteryCharging,
  Zap,
  Disc,
  Boxes,
  Shield,
  Tag,
  Briefcase,
} from 'lucide-react';
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

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('battery') || slug.includes('mpatarias')) return <BatteryCharging className="w-4 h-4 text-[#e21b22]" />;
    if (slug.includes('electric') || slug.includes('ilektrika')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (slug.includes('hand') || slug.includes('xeiros')) return <Wrench className="w-4 h-4 text-sky-500" />;
    if (slug.includes('accessories') || slug.includes('analosima')) return <Disc className="w-4 h-4 text-emerald-500" />;
    if (slug.includes('storage') || slug.includes('apothikefsi')) return <Boxes className="w-4 h-4 text-purple-500" />;
    if (slug.includes('safety') || slug.includes('rouxa')) return <Shield className="w-4 h-4 text-yellow-500" />;
    if (slug.includes('offers') || slug.includes('prosfores')) return <Flame className="w-4 h-4 text-red-500 animate-pulse" />;
    return <Layers className="w-4 h-4 text-neutral-400" />;
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
                      className={`flex min-h-[62px] items-center justify-between px-4 py-3 text-sm font-semibold leading-snug cursor-pointer border-l-2 transition-colors ${
                        isActive
                          ? 'border-[#e21b22] bg-red-50 text-neutral-900'
                          : 'border-transparent text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex min-w-0 items-center space-x-2.5">
                        {getCategoryIcon(cat.slug)}
                        <span className="min-w-0 whitespace-normal leading-snug">{cat.name}</span>
                      </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#e21b22]' : 'text-neutral-400'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Right Area: Level 2 Subcategories & Level 3 Children */}
              <div className="min-w-0 flex-1 p-6 bg-white rounded-r-2xl flex flex-col">
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-5">
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
                    <div className="grid grid-cols-3 items-start gap-x-10 gap-y-5">
                      {activeSubcategories.map((subcat) => {
                        const childCats = getChildCategories(subcat.id);
                        return (
                            <div key={subcat.id} className="min-w-0 min-h-[78px] space-y-2">
                            {/* Subcategory title (Level 2) */}
                            <button
                              onClick={() => {
                                setIsAllCategoriesOpen(false);
                                onNavigate(`/category/${subcat.slug}`);
                              }}
                              className="min-h-[54px] w-full font-display font-bold text-base leading-snug text-neutral-800 hover:text-[#e21b22] tracking-wide text-left flex items-start space-x-1 transition-colors"
                            >
                              <span>{subcat.name}</span>
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
                      <button
                        onClick={() => {
                          setIsAllCategoriesOpen(false);
                          if (selectedCategory) onNavigate('/products');
                        }}
                        className="self-start rounded border border-[#e21b22]/60 bg-red-50 px-3 py-2 text-left text-sm font-bold text-[#c81e24] hover:bg-[#e21b22] hover:text-white transition-colors"
                      >
                        Προβολή όλων
                        <span className="mt-1 block text-[11px] font-normal text-neutral-500">Όλα τα προϊόντα της κατηγορίας</span>
                      </button>
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
