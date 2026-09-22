import React, { useState } from 'react';
import {
  X,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Flame,
  Phone,
  Heart,
  Scale,
  User,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, onNavigate }) => {
  const { categories, wishlist, compareList, isB2BMode, setIsB2BMode } = useStore();
  const { user, isAuthenticated } = useAuth();
  const [expandedCats, setExpandedCats] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const mainCategories = categories.filter((c) => c.level === 1 && c.active);

  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId && c.level === 2 && c.active);

  const getChildCategories = (parentId: string) =>
    categories.filter((c) => c.parentId === parentId && c.level === 3 && c.active);

  const handleNav = (route: string) => {
    onClose();
    onNavigate(route);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-[#161616] text-white h-full flex flex-col shadow-2xl z-10 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 bg-[#1f1f1f] border-b border-[#2e2e2e] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#af101a] flex items-center justify-center font-display font-black text-lg text-white rounded">
              NT
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight uppercase">NOMIKOS TOOLS</div>
              <div className="text-[10px] text-neutral-400 font-mono-spec">HEAVY-DUTY CATALOG</div>
            </div>
          </div>
          <button
            onClick={onClose}
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
                isB2BMode ? 'bg-[#af101a]' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isB2BMode ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleNav('/offers')}
              className="flex items-center justify-center space-x-1.5 py-2 bg-red-950/40 text-red-400 border border-red-900/50 rounded font-display font-bold uppercase"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>ΠΡΟΣΦΟΡΕΣ</span>
            </button>
            <button
              onClick={() => handleNav('/admin')}
              className="flex items-center justify-center space-x-1.5 py-2 bg-[#252525] text-amber-300 border border-amber-900/40 rounded font-display font-bold uppercase"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>LOGISTICS</span>
            </button>
          </div>
        </div>

        {/* Scrollable Category Accordion */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#242424] text-sm">
          <div className="p-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-display">
            ΚΑΤΑΛΟΓΟΣ ΠΡΟΪΟΝΤΩΝ
          </div>

          {mainCategories.map((mainCat) => {
            const isExpanded = expandedCats.includes(mainCat.id);
            const subcats = getSubcategories(mainCat.id);

            return (
              <div key={mainCat.id} className="bg-[#161616]">
                <div className="flex items-center justify-between px-4 py-3 hover:bg-[#1e1e1e]">
                  <button
                    onClick={() => handleNav(`/category/${mainCat.slug}`)}
                    className="flex-1 text-left font-medium text-neutral-200 hover:text-white"
                  >
                    {mainCat.name}
                  </button>
                  {subcats.length > 0 && (
                    <button
                      onClick={() => toggleCategory(mainCat.id)}
                      className="p-1 text-neutral-400 hover:text-white"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-[#af101a]' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {isExpanded && subcats.length > 0 && (
                  <div className="bg-[#121212] divide-y divide-[#1e1e1e] pl-4">
                    {subcats.map((subcat) => {
                      const childCats = getChildCategories(subcat.id);
                      const isSubExpanded = expandedCats.includes(subcat.id);

                      return (
                        <div key={subcat.id} className="py-2">
                          <div className="flex items-center justify-between pr-4">
                            <button
                              onClick={() => handleNav(`/category/${subcat.slug}`)}
                              className="text-xs text-neutral-300 hover:text-white font-semibold text-left"
                            >
                              {subcat.name}
                            </button>
                            {childCats.length > 0 && (
                              <button
                                onClick={() => toggleCategory(subcat.id)}
                                className="p-1 text-neutral-500 hover:text-white"
                              >
                                <ChevronRight
                                  className={`w-3.5 h-3.5 transition-transform ${
                                    isSubExpanded ? 'rotate-90 text-[#af101a]' : ''
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
              <User className="w-4 h-4 text-[#af101a]" />
              <span>{isAuthenticated ? user?.name : 'Σύνδεση / Εγγραφή'}</span>
            </button>
            <button
              onClick={() => handleNav('/wishlist')}
              className="flex items-center space-x-1 text-neutral-300 hover:text-white"
            >
              <Heart className="w-4 h-4 text-[#af101a]" />
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
            <a href="tel:2105550190" className="flex items-center space-x-1 text-neutral-300">
              <Phone className="w-3 h-3 text-[#af101a]" />
              <span>210 5550190</span>
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
