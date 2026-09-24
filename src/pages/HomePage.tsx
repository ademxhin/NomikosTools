import React, { useState } from 'react';
import {
  Flame,
  Zap,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Award,
  Wrench,
  BatteryCharging,
  Sliders,
  CheckCircle2,
  Wind,
  Disc3,
  Settings2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { products, categories, brands, isB2BMode } = useStore();
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers' | 'new'>('featured');
  const [activePromo, setActivePromo] = useState(0);
  const [productPage, setProductPage] = useState(0);

  // Filter products for homepage sections
  const featuredProducts = products.filter((p) => p.featured && p.active);
  const bestsellers = products.filter((p) => (p.salePrice || p.rating >= 4.8) && p.active);
  const newArrivals = [...products]
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    .slice(0, 8);

  const renderCategoryIcon = (iconName?: string) => {
    const iconClassName = 'w-7 h-7';
    switch (iconName) {
      case 'BatteryCharging':
        return <BatteryCharging className={iconClassName} />;
      case 'Zap':
        return <Zap className={iconClassName} />;
      case 'Wrench':
        return <Wrench className={iconClassName} />;
      case 'Wind':
        return <Wind className={iconClassName} />;
      case 'Disc':
        return <Disc3 className={iconClassName} />;
      default:
        return <Settings2 className={iconClassName} />;
    }
  };

  const displayedProducts =
    activeTab === 'featured'
      ? featuredProducts
      : activeTab === 'bestsellers'
      ? bestsellers
      : newArrivals;
  const sliderProducts = products.filter((product) => product.active).slice(0, 16);
  const productPageCount = Math.max(1, Math.ceil(sliderProducts.length / 4));
  const visibleProducts = sliderProducts.slice(productPage * 4, productPage * 4 + 4);

  const mainCategories = categories.filter((c) => c.level === 1 && c.active);
  const promoCopy = [
    { image: '/assets/promos/m18-fuel-wide.png', eyebrow: 'Milwaukee M18 FUEL™', title: 'Πάρε τη δύναμη στα χέρια σου', accent: 'δύναμη', description: 'Επαγγελματικά εργαλεία μπαταρίας με άμεση διαθεσιμότητα.', original: 389, price: 311, side: 'left' },
    { image: '/assets/promos/packout-right-wide.png', eyebrow: 'Milwaukee PACKOUT™', title: 'Οργάνωσε το εργοτάξιο', accent: 'εργοτάξιο', description: 'Modular αποθήκευση που αντέχει κάθε καθημερινή χρήση.', original: 249, price: 174, side: 'left' },
    { image: '/assets/promos/m12-wide.png', eyebrow: 'Milwaukee M12™', title: 'Μικρό μέγεθος. Μεγάλη ισχύς.', accent: 'Μεγάλη ισχύς.', description: 'Συμπαγή εργαλεία για γρήγορη και επαγγελματική εργασία.', original: 199, price: 99, side: 'left' },
  ];
  const currentPromo = promoCopy[activePromo % promoCopy.length];
  const currentProduct = products[0];
  const originalPrice = currentPromo.original;
  const currentPrice = currentPromo.price;

  React.useEffect(() => {
    const timer = window.setInterval(() => setActivePromo((value) => (value + 1) % promoCopy.length), 12000);
    return () => window.clearInterval(timer);
  }, [activePromo, promoCopy.length]);

  return (
    <div className="space-y-10 pb-8">
      {/* Centered campaign banner, following the dense storefront rhythm of the reference */}
      <section className="bg-[#0f0f0f] px-4 py-5 sm:py-7">
        <div className="relative mx-auto aspect-[21/9] max-w-7xl overflow-hidden rounded-3xl border-[6px] border-[#e21b22] bg-[#090909] text-white shadow-2xl">
          <img src={currentPromo.image} alt="Milwaukee campaign" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className={`pointer-events-none absolute inset-0 ${currentPromo.side === 'right' ? 'bg-gradient-to-l from-black/90 via-black/55 to-transparent' : 'bg-gradient-to-r from-black/90 via-black/55 to-transparent'}`} />
          <div className="pointer-events-none absolute inset-0 hidden bg-black/10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[36%] bg-[#e21b22]" />
          <div className="pointer-events-none absolute -right-5 top-1/2 -translate-y-1/2 font-display text-[12rem] lg:text-[18rem] font-black leading-none text-black/10 select-none">
            NT
          </div>

          <div className="relative z-10 grid h-full grid-cols-1 px-6 py-8 sm:px-10 lg:px-12 lg:py-9">
            <div className={`absolute inset-0 px-6 py-8 sm:px-10 lg:px-12 lg:py-9 ${currentPromo.side === 'right' ? 'text-right' : 'text-left'}`}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e21b22] bg-black/35 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffb4b7]">
                <Zap className="h-3.5 w-3.5" />
                {currentPromo.eyebrow}
              </div>

              <h1 className="max-w-xl font-display text-5xl font-black uppercase leading-[0.86] tracking-tight sm:text-6xl lg:text-7xl">
                {currentPromo.title.split(currentPromo.accent)[0]}
                <span className="text-[#e21b22]">{currentPromo.accent}</span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-300 sm:text-base">
                {currentPromo.description}
              </p>

              <div className={`absolute bottom-8 flex flex-wrap gap-2 sm:bottom-10 ${currentPromo.side === 'right' ? 'right-6 justify-end sm:right-10 lg:right-12' : 'left-6 sm:left-10 lg:left-12'}`}>
                <button
                  id="hero-explore-catalog-btn"
                  onClick={() => onNavigate('/category/ergaleia-mpatarias')}
                  className="group flex items-center gap-2 bg-[#e21b22] px-6 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#c81016]"
                >
                  Αγόρασε τώρα
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  id="hero-b2b-offers-btn"
                  onClick={() => onNavigate('/offers')}
                  className="flex items-center gap-2 rounded-xl border border-neutral-600 bg-black/35 px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-black"
                >
                  <Flame className="h-4 w-4 text-[#e21b22]" />
                  Όλες οι προσφορές
                </button>
              </div>
            </div>

            <div className="relative hidden items-center justify-center lg:col-span-4">
              <div className="absolute h-64 w-64 rounded-full bg-[#e21b22]/25 blur-3xl" />
              <div className="relative w-full max-w-[390px] -rotate-2 overflow-hidden rounded-2xl border border-white/10 bg-white p-4 shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
                  <img
                  src={currentProduct?.images[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=85'}
                  alt={currentProduct?.name || 'Milwaukee επαγγελματικό εργαλείο'}
                  className="h-60 w-full object-contain sm:h-72"
                />
                <div className="absolute -bottom-4 left-4 right-4 flex items-end justify-between bg-[#111] px-4 py-3 text-white shadow-xl">
                  <div className="min-w-0 pr-3">
                    <div className="truncate text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      {currentProduct?.name || 'Milwaukee M18 FUEL™'}
                    </div>
                    <div className="font-mono-spec text-2xl font-black text-[#e21b22]">
                      <span className="mr-2 text-sm text-neutral-500 line-through">€{originalPrice.toFixed(2)}</span>
                      €{currentPrice.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => currentProduct && onNavigate(`/product/${currentProduct.slug}`)}
                    className="shrink-0 bg-[#e21b22] px-3 py-2 font-display text-xs font-bold uppercase hover:bg-[#c81016]"
                  >
                    Τώρα
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden">
              <div className="mb-5 font-display text-3xl font-black uppercase leading-none">
                Επίλεξε το
                <span className="block text-white">επόμενο εργαλείο</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {products.slice(1, 4).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onNavigate(`/product/${product.slug}`)}
                    className="group rounded-xl border border-white/20 bg-black/30 p-2 transition-colors hover:border-white hover:bg-black/50"
                    aria-label={`Προβολή ${product.name}`}
                  >
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-20 w-full bg-white object-contain transition-transform group-hover:scale-105"
                    />
                    <span className="mt-2 block truncate text-[10px] font-bold uppercase text-white">
                      €{(product.salePrice || product.price).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/20 pt-4 text-center">
                <div>
                  <strong className="block font-display text-xl">5.000+</strong>
                  <span className="text-[9px] uppercase text-red-100">Κωδικοί</span>
                </div>
                <div>
                  <strong className="block font-display text-xl">24H</strong>
                  <span className="text-[9px] uppercase text-red-100">Αποστολή</span>
                </div>
                <div>
                  <strong className="block font-display text-xl">100%</strong>
                  <span className="text-[9px] uppercase text-red-100">Εγγύηση</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            <button onClick={() => setActivePromo((activePromo - 1 + promoCopy.length) % promoCopy.length)} className="rounded-full bg-black/50 p-1.5 text-white hover:bg-[#e21b22]" aria-label="Προηγούμενο promo"><ChevronLeft className="h-4 w-4" /></button>
            {promoCopy.map((_, index) => <button key={index} onClick={() => setActivePromo(index)} aria-label={`Promo ${index + 1}`} className={`h-2.5 rounded-full transition-all ${index === activePromo ? 'w-7 bg-white' : 'w-2.5 bg-white/40'}`} />)}
            <button onClick={() => setActivePromo((activePromo + 1) % promoCopy.length)} className="rounded-full bg-black/50 p-1.5 text-white hover:bg-[#e21b22]" aria-label="Επόμενο promo"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {/* Promotional tiles */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { image: '/assets/promos/m12-wide.png', badge: '/assets/brand-badges/m12-custom.svg', label: 'M12', title: 'PORTABLE', copy: 'PRODUCTIVITY.', action: 'EXPLORE M12', route: '/category/ergaleia-mpatarias' },
          { image: '/assets/promos/m18-fuel-wide.png', badge: '/assets/brand-badges/m18-custom.svg', label: 'M18', title: 'PERFORMANCE', copy: 'DRIVEN.', action: 'EXPLORE M18', route: '/category/ergaleia-mpatarias' },
          { image: '/assets/promos/mx-fuel-tile.png', badge: '/assets/brand-badges/mx-fuel-custom.svg', label: 'MX FUEL', title: 'EQUIPMENT', copy: 'REDEFINED.', action: 'EXPLORE MX FUEL', route: '/category/ergaleia-mpatarias' },
          { image: '/assets/promos/packout-right-wide.png', badge: '/assets/brand-badges/packout-custom.svg', label: 'PACKOUT', title: 'MODULAR STORAGE', copy: 'SYSTEM.', action: 'EXPLORE PACKOUT', route: '/offers' },
        ].map((tile) => (
          <div key={tile.label} className="group relative min-h-[230px] overflow-hidden rounded-2xl bg-[#171717] text-white shadow-lg">
            <img src={tile.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[#e21b22]/85 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#b90008]/65 via-[#e21b22]/25 to-[#e21b22]/45" />
            <div className="relative flex h-full min-h-[230px] flex-col items-center justify-center p-5 text-center">
              <div className="inline-flex flex-col items-center justify-center rounded-lg px-0.5 py-0.5 text-center">
                {!tile.badge && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb4b7]">{tile.label}</span>}
                {tile.badge && <img src={tile.badge} alt={tile.label} className="mb-1 h-9 w-auto max-w-[165px] object-contain" />}
                <h3 className="mt-0 font-display text-lg font-black uppercase leading-none">{tile.title}</h3>
                <p className="mt-0.5 font-display text-lg font-black uppercase leading-none text-white">{tile.copy}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Products Tabs */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="mb-3">
          <h2 className="font-display text-3xl font-black uppercase tracking-wide text-neutral-950">
            Προτεινόμενα προϊόντα
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#cfd8dc] pb-2">
          {/* Tabs */}
          <div />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2">
          <button onClick={() => setProductPage((page) => (page - 1 + productPageCount) % productPageCount)} className="rounded-full bg-[#171717] p-1.5 text-white transition-colors hover:bg-[#e21b22]" aria-label="Προηγούμενα προϊόντα"><ChevronLeft className="h-4 w-4" /></button>
          {Array.from({ length: productPageCount }).map((_, index) => (
            <button key={index} onClick={() => setProductPage(index)} aria-label={`Σελίδα προϊόντων ${index + 1}`} className={`h-2.5 rounded-full transition-all ${index === productPage ? 'w-7 bg-[#e21b22]' : 'w-2.5 bg-neutral-300 hover:bg-neutral-500'}`} />
          ))}
          <button onClick={() => setProductPage((page) => (page + 1) % productPageCount)} className="rounded-full bg-[#171717] p-1.5 text-white transition-colors hover:bg-[#e21b22]" aria-label="Επόμενα προϊόντα"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </section>

      {/* Main Categories Navigation Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 border-b border-[#cfd8dc] pb-3">
          <div>
            <h2 className="font-display font-black text-2xl text-neutral-900 uppercase tracking-wide">
              ΒΑΣΙΚΕΣ ΚΑΤΗΓΟΡΙΕΣ ΕΞΟΠΛΙΣΜΟΥ
            </h2>
            <p className="text-xs text-neutral-500">
              Περιηγηθείτε στις κύριες κατηγορίες επαγγελματικών εργαλείων &amp; μηχανημάτων
            </p>
          </div>
          <button
            onClick={() => onNavigate('/products')}
            className="text-xs font-bold text-[#e21b22] hover:underline flex items-center space-x-1 font-display uppercase tracking-wide"
          >
            <span>Όλος ο Κατάλογος</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {mainCategories.slice(0, 6).map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className="bg-white rounded-2xl border border-[#cfd8dc] hover:border-[#1e1e1e] hover:shadow-md p-4 text-center cursor-pointer transition-all group flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-xl bg-[#f7f7f7] border-2 border-neutral-200 flex items-center justify-center text-[#e21b22] group-hover:bg-[#e21b22] group-hover:border-[#e21b22] group-hover:text-white transition-colors mb-3">
                {renderCategoryIcon(cat.iconName)}
              </div>

              <h3 className="font-display font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-[#e21b22] uppercase leading-tight line-clamp-2">
                {cat.name}
              </h3>

              <span className="text-[11px] text-neutral-400 mt-1 font-mono-spec">
                {products.filter((p) => p.categoryIds.includes(cat.id)).length} Προϊόντα
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Industrial B2B Banner Callout */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1e1e1e] text-white rounded-3xl p-6 sm:p-8 border border-[#333] shadow-lg grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-mono-spec uppercase text-[#ffb4b7] font-bold tracking-wider">
              ΕΙΔΙΚΕΣ ΠΑΡΟΧΕΣ ΓΙΑ ΤΕΧΝΙΚΕΣ ΕΤΑΙΡΕΙΕΣ &amp; ΕΡΓΟΛΑΒΟΥΣ
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wide">
              ΕΠΑΓΓΕΛΜΑΤΙΚΟΣ ΛΟΓΑΡΙΑΣΜΟΣ B2B NOMIKOS TOOLS
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
              Εγγραφείτε με το ΑΦΜ της επιχείρησής σας και αποκτήστε πρόσβαση σε κλιμακωτές χονδρικές εκπτώσεις, πιστωτικό όριο 30 ημερών, αποκλειστικό B2B Account Manager και αυτόματη απαλλαγή ΦΠΑ (Άρθρο 39α).
            </p>
            <div className="flex flex-wrap gap-4 text-xs text-neutral-300 pt-1">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Τιμολόγηση με Άρθρο 39α (Laptop / Tablets / Εργαλεία)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Αποστολή με φορτωτική πανελλαδικά</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              onClick={() => onNavigate('/contact')}
              className="bg-[#e21b22] hover:bg-[#c81016] text-white font-display font-bold uppercase text-xs tracking-wider py-3 px-6 rounded text-center transition-colors shadow"
            >
              ΑΙΤΗΣΗ ΕΓΓΡΑΦΗΣ B2B
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="bg-[#2a2a2a] hover:bg-[#333] text-white border border-[#444] font-display font-bold uppercase text-xs tracking-wider py-3 px-6 rounded text-center transition-colors"
            >
              ΕΠΙΚΟΙΝΩΝΙΑ ΜΕ ΣΥΜΒΟΥΛΟ
            </button>
          </div>
        </div>
      </section>

      {/* Brand Directory Logos */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="border-b border-[#cfd8dc] pb-3 mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-display font-black text-xl text-neutral-900 uppercase tracking-wide">
              ΕΠΙΣΗΜΟΙ ΚΑΤΑΣΚΕΥΑΣΤΕΣ &amp; BRANDS
            </h2>
            <p className="text-xs text-neutral-500">
              Συνεργαζόμαστε αποκλειστικά με τους κορυφαίους κατασκευαστές παγκοσμίως
            </p>
          </div>
          <button
            onClick={() => onNavigate('/brand/milwaukee')}
            className="text-xs font-bold text-[#e21b22] hover:underline flex items-center space-x-1 font-display uppercase tracking-wide"
          >
            <span>Όλα τα Brands</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {brands.map((b) => (
            <div
              key={b.id}
              onClick={() => onNavigate(`/brand/${b.slug}`)}
              className="bg-white border border-[#cfd8dc] hover:border-[#1e1e1e] hover:shadow p-3 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 group"
            >
              <span className="font-display font-black text-sm tracking-wider text-neutral-800 group-hover:text-[#e21b22] uppercase">
                {b.name}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono-spec">
                {products.filter((p) => p.brandId === b.id).length} Εργαλεία
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
