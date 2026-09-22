import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  Layers,
  ChevronRight,
  Sparkles,
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

interface MegaMenuProps {
  onNavigate: (route: string) => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ onNavigate }) => {
  const { categories, brands } = useStore();
  const [isAllCategoriesOpen, setIsAllCategoriesOpen] = useState(false);
  const [activeMainCatId, setActiveMainCatId] = useState<string>('cat-battery');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Level 1 Categories
  const mainCategories = categories
    .filter((c) => c.level === 1 && c.active)
    .sort((a, b) => a.order - b.order);

  // Subcategories of currently selected main category
  const activeSubcategories = categories
    .filter((c) => c.parentId === activeMainCatId && c.level === 2 && c.active)
    .sort((a, b) => a.order - b.order);

  // Get child categories for a subcategory
  const getChildCategories = (subcatId: string) => {
    return categories
      .filter((c) => c.parentId === subcatId && c.level === 3 && c.active)
      .sort((a, b) => a.order - b.order);
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsAllCategoriesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsAllCategoriesOpen(false);
    }, 250);
  };

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('battery') || slug.includes('mpatarias')) return <BatteryCharging className="w-4 h-4 text-[#af101a]" />;
    if (slug.includes('electric') || slug.includes('ilektrika')) return <Zap className="w-4 h-4 text-amber-500" />;
    if (slug.includes('hand') || slug.includes('xeiros')) return <Wrench className="w-4 h-4 text-sky-500" />;
    if (slug.includes('accessories') || slug.includes('analosima')) return <Disc className="w-4 h-4 text-emerald-500" />;
    if (slug.includes('storage') || slug.includes('apothikefsi')) return <Boxes className="w-4 h-4 text-purple-500" />;
    if (slug.includes('safety') || slug.includes('rouxa')) return <Shield className="w-4 h-4 text-yellow-500" />;
    if (slug.includes('offers') || slug.includes('prosfores')) return <Flame className="w-4 h-4 text-red-500 animate-pulse" />;
    return <Layers className="w-4 h-4 text-neutral-400" />;
  };

  const selectedCategory = categories.find((c) => c.id === activeMainCatId);

  return (
    <nav className="bg-[#121212] text-white border-b border-[#252525] relative hidden lg:block select-none z-30">
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
            className="flex items-center space-x-3 bg-[#af101a] hover:bg-[#b71c1c] text-white px-5 py-3 font-display font-bold uppercase tracking-wider text-sm transition-colors border-r border-red-800"
          >
            <Layers className="w-4 h-4" />
            <span>ΟΛΕΣ ΟΙ ΚΑΤΗΓΟΡΙΕΣ</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isAllCategoriesOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Full Mega Menu Panel */}
          {isAllCategoriesOpen && (
            <div
              id="desktop-mega-menu-panel"
              className="absolute top-full left-0 w-[1050px] bg-[#1a1a1a] border border-[#333] shadow-2xl z-50 flex min-h-[460px] text-neutral-200"
            >
              {/* Left Column: Level 1 Main Categories */}
              <div className="w-72 bg-[#161616] border-r border-[#2a2a2a] py-2 overflow-y-auto max-h-[520px]">
                {mainCategories.map((cat) => {
                  const isActive = cat.id === activeMainCatId;
                  return (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setActiveMainCatId(cat.id)}
                      onClick={() => {
                        setIsAllCategoriesOpen(false);
                        onNavigate(`/category/${cat.slug}`);
                      }}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs font-semibold cursor-pointer border-l-2 transition-colors ${
                        isActive
                          ? 'border-[#af101a] bg-[#222] text-white'
                          : 'border-transparent text-neutral-300 hover:text-white hover:bg-[#1c1c1c]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        {getCategoryIcon(cat.slug)}
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#af101a]' : 'text-neutral-500'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Right Area: Level 2 Subcategories & Level 3 Children */}
              <div className="flex-1 p-6 bg-[#1e1e1e] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#2e2e2e] pb-3 mb-5">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white uppercase tracking-wide flex items-center space-x-2">
                        <span>{selectedCategory?.name}</span>
                        {selectedCategory?.slug === 'prosfores' && (
                          <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.5 rounded">
                            ΕΚΠΤΩΣΕΙΣ ΕΩΣ -40%
                          </span>
                        )}
                      </h3>
                      {selectedCategory?.description && (
                        <p className="text-xs text-neutral-400 mt-0.5 line-clamp-1">
                          {selectedCategory.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setIsAllCategoriesOpen(false);
                        if (selectedCategory) onNavigate(`/category/${selectedCategory.slug}`);
                      }}
                      className="text-xs text-[#ffb3ac] hover:text-white font-semibold flex items-center space-x-1"
                    >
                      <span>Προβολή Όλων</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Multi-column Grid for Subcategories */}
                  {activeSubcategories.length > 0 ? (
                    <div className="grid grid-cols-3 gap-6">
                      {activeSubcategories.map((subcat) => {
                        const childCats = getChildCategories(subcat.id);
                        return (
                          <div key={subcat.id} className="space-y-2">
                            {/* Subcategory title (Level 2) */}
                            <button
                              onClick={() => {
                                setIsAllCategoriesOpen(false);
                                onNavigate(`/category/${subcat.slug}`);
                              }}
                              className="font-display font-bold text-sm text-neutral-100 hover:text-[#af101a] tracking-wide text-left flex items-center space-x-1 uppercase transition-colors"
                            >
                              <span>{subcat.name}</span>
                            </button>

                            {/* Level 3 Children */}
                            {childCats.length > 0 && (
                              <ul className="space-y-1 pl-1 border-l border-[#333]">
                                {childCats.map((child) => (
                                  <li key={child.id}>
                                    <button
                                      onClick={() => {
                                        setIsAllCategoriesOpen(false);
                                        onNavigate(`/category/${child.slug}`);
                                      }}
                                      className="text-xs text-neutral-400 hover:text-white hover:underline pl-2 text-left transition-colors"
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
                      <p className="text-sm">Δείτε όλα τα διαθέσιμα προϊόντα στην κατηγορία {selectedCategory?.name}</p>
                      <button
                        onClick={() => {
                          setIsAllCategoriesOpen(false);
                          if (selectedCategory) onNavigate(`/category/${selectedCategory.slug}`);
                        }}
                        className="mt-3 bg-[#af101a] text-white px-4 py-1.5 text-xs font-bold rounded uppercase font-display"
                      >
                        Εξερεύνηση Προϊόντων
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Promo Strip in Mega Menu */}
                <div className="mt-6 pt-4 border-t border-[#2e2e2e] flex items-center justify-between bg-[#181818] p-3 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded bg-[#af101a]/20 flex items-center justify-center text-[#ffb3ac]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase font-display">
                        Επαγγελματική Υποστήριξη Nomikos Tools
                      </div>
                      <div className="text-[11px] text-neutral-400">
                        Εξειδικευμένοι σύμβουλοι εργαλείων για εργοτάξια και βιομηχανίες.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAllCategoriesOpen(false);
                      onNavigate('/contact');
                    }}
                    className="text-xs bg-[#2a2a2a] hover:bg-[#333] text-white px-3 py-1.5 rounded font-semibold transition-colors"
                  >
                    Ζητήστε Προσφορά B2B
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Center Horizontal Quick Category Links */}
        <div className="flex items-center space-x-1 overflow-x-auto text-xs font-semibold uppercase tracking-wider text-neutral-300">
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
        <div className="flex items-center space-x-2 shrink-0">
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
