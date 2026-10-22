import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronRight,
  Flame,
  Phone,
  Heart,
  Scale,
  User,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { categoryGroups, formatSubcategoryName } from '../../data/categoryHierarchy';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { categories, wishlist, compareList, isB2BMode, setIsB2BMode } = useStore();
  const { user, isAuthenticated } = useAuth();
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const mainCategories = categoryGroups.map((group, index) => ({
    id: group.id,
    name: group.name,
    slug: group.id,
    level: 1 as const,
    order: index + 1,
    active: true,
  }));

  const getSubcategories = (parentId: string) => {
    const group = categoryGroups.find((item) => item.id === parentId);
    if (!group) return [];
    return categories
      .filter((category) => category.active && category.parentId === parentId)
      .sort((a, b) => a.order - b.order);
  };

  const getChildCategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId && c.level === 3 && c.active);

  const handleNav = (route: string) => {
    onClose();
    onNavigate(route);
  };

  const closeDrawer = () => {
    onClose();
    requestAnimationFrame(() => document.getElementById('mobile-menu-toggle-btn')?.focus());
  };

  const handleDrawerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      requestAnimationFrame(() => document.getElementById('mobile-menu-toggle-btn')?.focus());
      return;
    }
    if (event.key !== 'Tab' || !drawerRef.current) return;
    const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden" onKeyDown={handleDrawerKeyDown}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div id="mobile-menu-panel" ref={drawerRef} role="dialog" aria-modal="true" aria-label="Μενού κατηγοριών" className="relative w-4/5 max-w-sm bg-[#161616] text-white h-full flex flex-col shadow-2xl z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <img src="/assets/nomikos-tools-logo.png" alt="Nomikos Tools" className="h-14 w-[240px] object-contain object-left" />
            </div>
          </div>
          <button
            ref={closeButtonRef}
            onClick={closeDrawer}
            aria-label="Κλείσιμο μενού"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* B2B Switcher & Fast Shortcuts */}
        <div className="p-3 bg-[#1a1a1a] border-b border-[#2a2a2a] space-y-2">
          <div className="flex items-center justify-between px-2 py-1.5 bg-[#222] rounded text-xs">
            <span className="text-neutral-300 font-medium">B2B Τιμολόγιο (Χωρίς ΦΠΑ):</span>
            <button
              onClick={() => setIsB2BMode(!isB2BMode)}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                isB2BMode ? 'bg-[#e21b22]' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isB2BMode ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs">
            <button
              onClick={() => handleNav('/offers')}
              className="flex items-center justify-center space-x-1.5 py-2 bg-red-950/40 text-red-400 border border-red-900/50 rounded font-display font-bold "
            >
              <Flame className="w-3.5 h-3.5" />
              <span>ΠΡΟΣΦΟΡΕΣ</span>
            </button>
          </div>
        </div>

        {/* Scrollable Category Accordion */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#242424] text-sm">
          <div className="p-3 text-[11px] font-bold text-neutral-400  tracking-wider font-display">
            ΚΑΤΑΛΟΓΟΣ ΠΡΟΪΟΝΤΩΝ
          </div>

          {mainCategories.map((mainCat) => {
            const isExpanded = expandedCats.includes(mainCat.id);
            const subcats = getSubcategories(mainCat.id);

            return (
              <div key={mainCat.id} className="bg-[#161616]">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-[#1e1e1e]">
                  <button
                    onClick={() => toggleCategory(mainCat.id)}
                    aria-expanded={isExpanded}
                    aria-controls={isExpanded ? `mobile-subcategories-${mainCat.id}` : undefined}
                    className="flex flex-1 items-center justify-between gap-3 text-left font-semibold leading-snug text-neutral-200 hover:text-white"
                  >
                    {mainCat.name}
                    <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#e21b22]' : 'text-neutral-500'}`} aria-hidden="true" />
                  </button>
                </div>

                {/* Subcategories */}
                {isExpanded && subcats.length > 0 && (
                  <div id={`mobile-subcategories-${mainCat.id}`} className="bg-[#121212] divide-y divide-[#1e1e1e] pl-4">
                    {[...subcats.reduce((groups, subcat) => {
                      const name = subcat.groupName || 'Κατηγορίες';
                      groups.set(name, [...(groups.get(name) ?? []), subcat]);
                      return groups;
                    }, new Map<string, typeof subcats>())].map(([groupName, groupSubcats]) => (
                    <section key={groupName} className="py-2 pr-3">
                      <h3 className="px-1 pb-1.5 text-[10px] font-bold  tracking-wider text-neutral-500">{groupName}</h3>
                      {groupSubcats.map((subcat) => {
                      const childCats = getChildCategories(subcat.id);
                      const isSubExpanded = expandedCats.includes(subcat.id);

                      return (
                        <div key={subcat.id} className="py-0.5">
                          <div className="flex min-h-10 items-center justify-between gap-2">
                            <button
                              onClick={() => handleNav(`/category/${subcat.slug}`)}
                              className="min-h-10 flex-1 py-2 text-left text-[13px] font-medium text-neutral-300 hover:text-white"
                            >
                              {formatSubcategoryName(subcat.name)}
                            </button>
                            {childCats.length > 0 && (
                              <button
                                onClick={() => toggleCategory(subcat.id)}
                                aria-label={`${isSubExpanded ? 'Σύμπτυξη' : 'Ανάπτυξη'} ${subcat.name}`}
                                aria-expanded={isSubExpanded}
                                className="p-2 text-neutral-500 hover:text-white"
                              >
                                <ChevronRight
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    isSubExpanded ? 'rotate-90 text-[#e21b22]' : ''
                                  }`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Children */}
                          {isSubExpanded && childCats.length > 0 && (
                            <div className="pl-3 mt-1.5 space-y-1">
                              {childCats.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => handleNav(`/category/${child.slug}`)}
                                  className="block w-full text-left text-[11px] text-neutral-400 hover:text-white py-1"
                                >
                                  • {child.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                      })}
                    </section>
                    ))}
                    <button onClick={() => handleNav(`/category/${mainCat.id}`)} className="flex min-h-11 w-full items-center justify-between px-1 text-left text-sm font-semibold text-[#ffb4b7] hover:text-white">
                      Όλα τα προϊόντα <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom User & Contact Bar */}
        <div className="p-4 bg-[#1f1f1f] border-t border-[#2e2e2e] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleNav(isAuthenticated ? '/account' : '/login')}
              className="flex items-center space-x-2 text-neutral-300 hover:text-white"
            >
              <User className="w-4 h-4 text-[#e21b22]" />
              <span>{isAuthenticated ? user?.name : 'Σύνδεση / Εγγραφή'}</span>
            </button>
            <button
              onClick={() => handleNav('/wishlist')}
              className="flex items-center space-x-1 text-neutral-300 hover:text-white"
            >
              <Heart className="w-4 h-4 text-[#e21b22]" />
              <span>({wishlist.length})</span>
            </button>
            <button
              onClick={() => handleNav('/compare')}
              className="flex items-center space-x-1 text-neutral-300 hover:text-white"
            >
              <Scale className="w-4 h-4 text-sky-400" />
              <span>({compareList.length})</span>
            </button>
          </div>
          <div className="pt-2 border-t border-neutral-700/60 flex items-center justify-between text-[11px] text-neutral-400">
            <a href="tel:2110069347" className="flex items-center space-x-1 text-neutral-300">
              <Phone className="w-3 h-3 text-[#e21b22]" />
              <span>2110069347</span>
            </a>
            <button onClick={() => handleNav('/track-order')} className="text-neutral-400 hover:text-white">
              Εντοπισμός Αποστολής
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
