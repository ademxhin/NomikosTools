import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  Scale,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  Clock,
  Flame,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Product } from '../../types/product';

interface HeaderProps {
  onNavigate: (route: string) => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenMobileMenu }) => {
  const {
    products,
    categories,
    brands,
    cart,
    wishlist,
    compareList,
    getCartTotal,
    isB2BMode,
  } = useStore();
  const { user, isAuthenticated, logout } = useAuth();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('nomikos_recent_searches');
    return saved ? JSON.parse(saved) : ['Milwaukee M18', 'Knipex Cobra', 'Γωνιακός Τροχός'];
  });

  const popularSearches = ['Milwaukee FPD3', 'DeWalt DCD996', 'Knipex 87 01 250', 'Brushless', 'Packout'];

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced Search Logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      const q = searchTerm.toLowerCase().trim();
      const matches = products.filter((prod) => {
        const brand = brands.find((b) => b.id === prod.brandId)?.name.toLowerCase() || '';
        const matchTitle = prod.name.toLowerCase().includes(q);
        const matchSku = prod.sku.toLowerCase().includes(q);
        const matchEan = prod.ean.includes(q);
        const matchBrand = brand.includes(q);
        const matchDesc = prod.shortDescription.toLowerCase().includes(q);
        const matchCategory = categories.some(
          (c) => prod.categoryIds.includes(c.id) && c.name.toLowerCase().includes(q)
        );
        return matchTitle || matchSku || matchEan || matchBrand || matchDesc || matchCategory;
      });

      setSearchResults(matches.slice(0, 8));
      setIsSearchOpen(true);
      setSelectedIndex(-1);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, products, brands, categories]);

  // Click outside to close search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    // Save to recent searches
    const updated = [searchTerm || product.name.slice(0, 20), ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('nomikos_recent_searches', JSON.stringify(updated));

    setIsSearchOpen(false);
    setSearchTerm('');
    onNavigate(`/product/${product.slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      handleSelectProduct(searchResults[selectedIndex]);
      return;
    }

    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('nomikos_recent_searches', JSON.stringify(updated));

    setIsSearchOpen(false);
    onNavigate(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
    }
  };

  // Highlight matching text in search results
  const renderHighlighted = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-[#ffdad6] text-[#af101a] font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-[#1c1b1b] text-white sticky top-0 z-40 shadow-md border-b border-[#2e2e2e]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
          aria-label="Άνοιγμα Μενού Κατηγοριών"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo */}
        <div
          id="brand-logo"
          onClick={() => onNavigate('/')}
          className="cursor-pointer flex items-center space-x-2 shrink-0 select-none group"
        >
          <div className="w-9 h-9 md:w-11 md:h-11 bg-[#af101a] flex items-center justify-center font-display font-black text-xl md:text-2xl text-white rounded tracking-tighter border-t border-red-400 shadow-sm group-hover:bg-[#b71c1c] transition-colors">
            NT
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-extrabold text-xl md:text-2xl tracking-wider text-white uppercase leading-none">
                NOMIKOS
              </span>
              <span className="font-display font-extrabold text-xl md:text-2xl tracking-wider text-[#af101a] uppercase leading-none">
                TOOLS
              </span>
            </div>
            <span className="text-[9px] md:text-[10px] tracking-widest text-neutral-400 font-mono-spec uppercase">
              HEAVY-DUTY PRECISION
            </span>
          </div>
        </div>

        {/* Large Centered Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              id="global-search-input"
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Αναζήτηση προϊόντος, κωδικού SKU, barcode EAN, μάρκας (π.χ. Milwaukee, 87 01 250)..."
              className="w-full bg-[#2a2a2a] text-white text-sm pl-11 pr-24 py-2.5 rounded border border-[#3e3e3e] focus:border-[#af101a] focus:ring-1 focus:ring-[#af101a] focus:bg-[#222] focus:outline-none transition-all placeholder:text-neutral-400"
              autoComplete="off"
            />
            <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 pointer-events-none" />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-20 text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 px-4 bg-[#af101a] hover:bg-[#b71c1c] text-white text-xs font-bold font-display uppercase tracking-wider rounded flex items-center space-x-1 transition-colors"
            >
              <span>ΒΡΕΣ</span>
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1e1e1e] border border-[#333] rounded shadow-2xl overflow-hidden z-50 text-neutral-200">
              {/* If no search term, show recent & popular */}
              {!searchTerm.trim() ? (
                <div className="p-4 space-y-3">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                        <Clock className="w-3.5 h-3.5 text-[#af101a]" />
                        <span>Πρόσφατες Αναζητήσεις</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentSearches.map((term, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSearchTerm(term);
                              searchInputRef.current?.focus();
                            }}
                            className="text-xs bg-[#2a2a2a] hover:bg-[#333] text-neutral-300 hover:text-white px-2.5 py-1 rounded border border-[#3a3a3a] transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      <Flame className="w-3.5 h-3.5 text-[#e65100]" />
                      <span>Δημοφιλείς Αναζητήσεις</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSearches.map((term, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSearchTerm(term);
                            searchInputRef.current?.focus();
                          }}
                          className="text-xs bg-[#2a2a2a] hover:bg-[#333] text-neutral-300 hover:text-white px-2.5 py-1 rounded border border-[#3a3a3a] transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-96 overflow-y-auto divide-y divide-[#2a2a2a]">
                  <div className="px-3 py-1.5 bg-[#252525] text-[11px] font-semibold text-neutral-400 flex justify-between">
                    <span>ΠΡΟΪΟΝΤΑ ({searchResults.length})</span>
                    <span>Πατήστε Enter για όλα τα αποτελέσματα</span>
                  </div>

                  {searchResults.map((prod, index) => {
                    const brand = brands.find((b) => b.id === prod.brandId);
                    const category = categories.find((c) => prod.categoryIds.includes(c.id));
                    const isSelected = index === selectedIndex;
                    const displayPrice = isB2BMode
                      ? (prod.salePrice || prod.price) / 1.24
                      : prod.salePrice || prod.price;

                    return (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod)}
                        className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#2a2a2a] text-white' : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-12 h-12 object-cover rounded bg-white p-0.5 border border-neutral-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 text-[11px] text-neutral-400">
                              <span className="font-bold text-[#af101a] uppercase">{brand?.name}</span>
                              <span>•</span>
                              <span className="font-mono-spec">SKU: {renderHighlighted(prod.sku, searchTerm)}</span>
                              {category && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{category.name}</span>
                                </>
                              )}
                            </div>
                            <h4 className="text-xs font-medium text-white truncate max-w-md">
                              {renderHighlighted(prod.name, searchTerm)}
                            </h4>
                            <div className="flex items-center space-x-2 mt-0.5">
                              {prod.stockQuantity > 0 ? (
                                <span className="inline-flex items-center text-[10px] text-[#2e7d32] font-semibold">
                                  <CheckCircle2 className="w-3 h-3 mr-0.5" /> Σε απόθεμα
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] text-[#c62828] font-semibold">
                                  <AlertCircle className="w-3 h-3 mr-0.5" /> Κατόπιν παραγγελίας
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold text-white font-mono-spec">
                            €{displayPrice.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-neutral-400">
                            {isB2BMode ? 'χωρίς ΦΠΑ' : 'με ΦΠΑ 24%'}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    onClick={handleSearchSubmit}
                    className="p-2.5 text-center text-xs font-semibold text-[#ffb3ac] hover:bg-[#282828] cursor-pointer"
                  >
                    Προβολή όλων των αποτελεσμάτων για "{searchTerm}" →
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-neutral-400">
                  <p className="text-sm font-medium">Δεν βρέθηκαν προϊόντα για "{searchTerm}"</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Δοκιμάστε να αναζητήσετε με διαφορετικές λέξεις-κλειδιά ή κωδικό κατασκευαστή.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Action Icons: Account, Wishlist, Compare, Cart */}
        <div className="flex items-center space-x-1 md:space-x-4 shrink-0">
          {/* Compare Button */}
          <button
            id="header-compare-btn"
            onClick={() => onNavigate('/compare')}
            className="relative p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors hidden sm:flex items-center"
            title="Σύγκριση Εργαλείων"
          >
            <Scale className="w-5 h-5" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#455b65] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            id="header-wishlist-btn"
            onClick={() => onNavigate('/wishlist')}
            className="relative p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors hidden sm:flex items-center"
            title="Λίστα Επιθυμιών"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#af101a] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button
            id="header-account-btn"
            onClick={() => onNavigate(isAuthenticated ? '/account' : '/login')}
            className="flex items-center space-x-1.5 p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded transition-colors"
            title="Ο Λογαριασμός μου"
          >
            <UserIcon className="w-5 h-5 text-neutral-300" />
            <div className="hidden xl:flex flex-col text-left text-xs leading-tight">
              <span className="text-[10px] text-neutral-400">
                {isAuthenticated ? 'Καλωσήρθατε' : 'Σύνδεση / Εγγραφή'}
              </span>
              <span className="font-semibold text-white truncate max-w-[100px]">
                {isAuthenticated ? user?.name : 'Λογαριασμός'}
              </span>
            </div>
          </button>

          {/* Cart Button */}
          <button
            id="header-cart-btn"
            onClick={() => onNavigate('/cart')}
            className="flex items-center space-x-2.5 bg-[#af101a] hover:bg-[#b71c1c] text-white px-3 py-2 rounded transition-colors"
            title="Καλάθι Αγορών"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {totalCartCount}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-[9px] uppercase tracking-wider text-red-100 font-display">
                ΚΑΛΑΘΙ ({totalCartCount})
              </span>
              <span className="text-xs font-bold font-mono-spec">
                €{getCartTotal().toFixed(2)}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
