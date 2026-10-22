import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  ArrowLeftRight,
  User as UserIcon,
  MapPin,
  Phone,
  PhoneCall,
  LogIn,
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
import { useWorkspace } from '../../context/WorkspaceContext';
import { Product } from '../../types/product';

interface HeaderProps {
  onNavigate: (route: string) => void;
  onOpenMobileMenu: () => void;
  onOpenMegaMenu?: () => void;
  isMegaMenuOpen?: boolean;
  isMobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenMobileMenu, onOpenMegaMenu, isMegaMenuOpen = false, isMobileMenuOpen = false }) => {
  const { state: workspace } = useWorkspace();
  const contactPhone = workspace.content?.phone ?? '2110069347';
  const contactEmail = workspace.content?.email ?? 'sales@nomikostools.gr';
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string');
      } catch {
        localStorage.removeItem('nomikos_recent_searches');
      }
    }
    return ['Milwaukee M18', 'Knipex Cobra', 'Γωνιακός Τροχός'];
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
            <mark key={i} className="bg-[#ffe0e1] text-[#e21b22] font-bold px-0.5 rounded">
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
    <header className="bg-[#242424] text-white sticky top-0 z-40 shadow-lg border-b-4 border-[#e21b22]">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-2 px-3 py-2.5 sm:flex sm:flex-wrap sm:gap-3 sm:px-4 lg:flex-nowrap lg:py-3 lg:gap-4">
        {/* Mobile menu trigger */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={() => {
            if (window.matchMedia('(min-width: 1024px)').matches) {
              if (!isMegaMenuOpen) onOpenMegaMenu?.();
            } else onOpenMobileMenu();
          }}
          onMouseEnter={() => {
            if (window.matchMedia('(min-width: 1024px)').matches && !isMegaMenuOpen) onOpenMegaMenu?.();
          }}
          onFocus={(event) => {
            if (event.currentTarget.matches(':focus-visible') && window.matchMedia('(min-width: 1024px)').matches && !isMegaMenuOpen) onOpenMegaMenu?.();
          }}
          className="flex h-11 w-11 items-center justify-center shrink-0 bg-[#e21b22] hover:bg-[#c81016] text-white transition-colors rounded-xl sm:w-14 sm:h-12"
          aria-label={isMegaMenuOpen || isMobileMenuOpen ? 'Κλείσιμο μενού κατηγοριών' : 'Άνοιγμα μενού κατηγοριών'}
          aria-expanded={isMegaMenuOpen || isMobileMenuOpen}
          aria-controls={isMegaMenuOpen ? 'desktop-mega-menu-panel' : isMobileMenuOpen ? 'mobile-menu-panel' : undefined}
        >
          <Menu className="w-[26px] h-[26px]" />
        </button>

        {/* Brand Logo */}
        <div
          id="brand-logo"
          onClick={() => onNavigate('/')}
          className="cursor-pointer flex min-w-0 items-center shrink-0 select-none group lg:pr-12"
        >
          <img
            src="/assets/nomikos-tools-logo.png"
            alt="Nomikos Tools"
            className="h-14 w-full max-w-[230px] object-contain object-left origin-left sm:h-16 sm:w-auto sm:max-w-none md:h-18 lg:scale-[1.15]"
          />
        </div>

        {/* Compact centered search */}
        <div ref={searchContainerRef} className="relative col-span-3 row-start-2 mt-0.5 w-full min-w-0 lg:order-none lg:col-auto lg:row-auto lg:mt-0 lg:mx-4 lg:max-w-sm lg:flex-1 xl:max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              id="global-search-input"
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Αναζήτηση προϊόντος..."
              className="w-full bg-white text-neutral-950 text-sm pl-10 pr-16 py-3 lg:py-2.5 border-2 border-white rounded-xl focus:border-black focus:ring-2 focus:ring-black/20 focus:outline-none transition-all placeholder:text-neutral-500 shadow-inner"
              autoComplete="off"
            />
            <Search className="w-5 h-5 text-neutral-500 absolute left-3.5 pointer-events-none" />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-14 text-neutral-400 hover:text-neutral-950 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 w-11 bg-[#e21b22] hover:bg-[#c81016] text-white flex items-center justify-center rounded-lg transition-colors"
              aria-label="Αναζήτηση"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e1e1e] border border-[#333] rounded-2xl shadow-2xl overflow-hidden z-50 text-neutral-200">
              {/* If no search term, show recent & popular */}
              {!searchTerm.trim() ? (
                <div className="p-4 space-y-3">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-400  tracking-wider mb-2">
                        <Clock className="w-3.5 h-3.5 text-[#e21b22]" />
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
                    <div className="flex items-center space-x-1 text-xs font-semibold text-neutral-400  tracking-wider mb-2">
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
                              <span className="font-bold text-[#e21b22] ">{brand?.name}</span>
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
                    className="p-2.5 text-center text-xs font-semibold text-[#ffb4b7] hover:bg-[#282828] cursor-pointer"
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

        {/* Contact information and commerce actions */}
        <div className="col-start-3 row-start-1 flex items-center justify-self-end gap-0.5 shrink-0 sm:gap-1.5 lg:ml-auto">
          <div className="hidden xl:flex items-center gap-2.5 pl-2 pr-3">
            <PhoneCall className="w-[30px] h-[30px] text-white" />
            <div className="leading-tight">
              <div className="font-display font-bold text-base  tracking-wide">Πληροφορίες</div>
              <div className="text-[15px] text-neutral-200 whitespace-nowrap tracking-tight">{contactPhone}&nbsp; | &nbsp;{contactEmail}</div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/contact')}
            className="hidden md:flex xl:hidden items-center gap-2 h-10 px-2.5 rounded-xl text-white hover:bg-black/15 transition-colors"
            title="Τοποθεσία καταστημάτων"
            aria-label="Τοποθεσία καταστημάτων"
          >
            <MapPin className="w-[22px] h-[22px]" />
            <span className="hidden 2xl:inline text-[11px] font-semibold">Καταστήματα</span>
          </button>

          <a
            href={`tel:${contactPhone}`}
            className="hidden md:flex xl:hidden items-center gap-2 h-10 px-2.5 rounded-xl text-white hover:bg-black/15 transition-colors"
            title={`Καλέστε στο ${contactPhone}`}
            aria-label={`Τηλέφωνο ${contactPhone}`}
          >
            <Phone className="w-[22px] h-[22px]" />
            <span className="hidden 2xl:inline text-[11px] font-semibold">{contactPhone}</span>
          </a>

          {/* Compare Button */}
          <button
            id="header-compare-btn"
            onClick={() => onNavigate('/compare')}
            className="relative h-10 w-10 text-white hover:bg-black/15 transition-colors hidden md:flex items-center justify-center rounded-xl"
            title="Σύγκριση Εργαλείων"
          >
            <ArrowLeftRight className="w-[22px] h-[22px]" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e21b22] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Wishlist Button */}
          <button
            id="header-wishlist-btn"
            onClick={() => onNavigate('/wishlist')}
            className="relative h-10 w-10 text-white hover:bg-black/15 transition-colors hidden md:flex items-center justify-center rounded-xl"
            title="Λίστα Επιθυμιών"
          >
            <Heart className="w-[22px] h-[22px]" />
            {wishlist.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e21b22] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Button */}
          <button
            id="header-cart-btn"
            onClick={() => onNavigate('/cart')}
            className="relative h-10 w-10 text-white hover:bg-black/15 transition-colors rounded-xl flex items-center justify-center"
            title={`Καλάθι αγορών — ${totalCartCount} προϊόντα, €${getCartTotal().toFixed(2)}`}
          >
            <ShoppingCart className="w-[22px] h-[22px]" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#e21b22] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button
            id="header-account-btn"
            onClick={() => onNavigate(isAuthenticated ? '/account' : '/login')}
            className="h-10 w-10 text-white hover:bg-black/15 transition-colors rounded-xl flex items-center justify-center"
            title={isAuthenticated ? `Λογαριασμός — ${user?.name}` : 'Σύνδεση / Εγγραφή'}
          >
            {isAuthenticated ? <UserIcon className="w-[22px] h-[22px] text-white" /> : <LogIn className="w-[22px] h-[22px] text-white" />}
          </button>
        </div>
      </div>
    </header>
  );
};
