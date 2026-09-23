import React, { useState } from 'react';
import {
  Flame,
  Zap,
  ShieldCheck,
  Truck,
  ArrowRight,
  Sparkles,
  ChevronRight,
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

  const mainCategories = categories.filter((c) => c.level === 1 && c.active);

  return (
    <div className="space-y-10 pb-8">
      {/* Centered campaign banner, following the dense storefront rhythm of the reference */}
      <section className="bg-[#0f0f0f] px-4 py-5 sm:py-7">
        <div className="relative max-w-7xl mx-auto min-h-[430px] lg:min-h-[500px] overflow-hidden rounded-3xl border-[10px] border-[#e21b22] bg-[#090909] text-white shadow-2xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_56%_44%,rgba(226,27,34,0.28),transparent_29%),linear-gradient(110deg,#090909_0%,#151515_52%,#070707_100%)]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[36%] bg-[#e21b22] [clip-path:polygon(38%_0,100%_0,100%_100%,0_100%)] opacity-95" />
          <div className="pointer-events-none absolute -right-5 top-1/2 -translate-y-1/2 font-display text-[12rem] lg:text-[18rem] font-black leading-none text-black/10 select-none">
            NT
          </div>

          <div className="relative z-10 grid min-h-[410px] lg:min-h-[480px] grid-cols-1 items-center gap-6 px-6 py-8 sm:px-10 lg:grid-cols-12 lg:px-12 lg:py-9">
            <div className="lg:col-span-5">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e21b22] bg-black/35 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#ffb4b7]">
                <Zap className="h-3.5 w-3.5" />
                Milwaukee Heavy Duty Campaign
              </div>

              <h1 className="font-display text-5xl font-black uppercase leading-[0.86] tracking-tight sm:text-6xl lg:text-7xl">
                Πάρε τη
                <span className="block text-[#e21b22]">δύναμη</span>
                στα χέρια σου
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-relaxed text-neutral-300 sm:text-base">
                Επαγγελματικά εργαλεία Milwaukee M18 FUEL™, άμεσα διαθέσιμα με επίσημη εγγύηση και παράδοση σε όλη την Ελλάδα.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
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

            <div className="relative flex items-center justify-center lg:col-span-4">
              <div className="absolute h-64 w-64 rounded-full bg-[#e21b22]/25 blur-3xl" />
              <div className="relative w-full max-w-[390px] -rotate-2 overflow-hidden rounded-2xl border border-white/10 bg-white p-4 shadow-[0_28px_70px_rgba(0,0,0,0.55)]">
                <img
                  src={products[0]?.images[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=85'}
                  alt={products[0]?.name || 'Milwaukee επαγγελματικό εργαλείο'}
                  className="h-60 w-full object-contain sm:h-72"
                />
                <div className="absolute -bottom-4 left-4 right-4 flex items-end justify-between bg-[#111] px-4 py-3 text-white shadow-xl">
                  <div className="min-w-0 pr-3">
                    <div className="truncate text-[11px] font-bold uppercase tracking-wider text-neutral-300">
                      {products[0]?.name || 'Milwaukee M18 FUEL™'}
                    </div>
                    <div className="font-mono-spec text-2xl font-black text-[#e21b22]">
                      €{(products[0]?.salePrice || products[0]?.price || 389).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => products[0] && onNavigate(`/product/${products[0].slug}`)}
                    className="shrink-0 bg-[#e21b22] px-3 py-2 font-display text-xs font-bold uppercase hover:bg-[#c81016]"
                  >
                    Προβολή
                  </button>
                </div>
              </div>
            </div>

            <div className="hidden lg:col-span-3 lg:block">
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
        </div>
      </section>

      {/* Promotional tiles */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 gap-4 px-4 md:grid-cols-3">
        <div className="rounded-2xl bg-[#171717] p-5 text-white shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb4b7]">Milwaukee M18</span>
          <h3 className="mt-2 font-display text-2xl font-black uppercase">Δύναμη χωρίς καλώδιο</h3>
          <p className="mt-1 text-xs text-neutral-300">Brushless εργαλεία με άμεση αποστολή.</p>
          <button onClick={() => onNavigate('/category/ergaleia-mpatarias')} className="mt-4 rounded-lg bg-[#e21b22] px-4 py-2 text-xs font-bold uppercase">Ανακάλυψε τη σειρά</button>
        </div>
        <div className="rounded-2xl bg-[#e21b22] p-5 text-white shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-100">Ειδική προσφορά</span>
          <h3 className="mt-2 font-display text-2xl font-black uppercase">Packout έως -20%</h3>
          <p className="mt-1 text-xs text-red-100">Οργάνωσε το εργοτάξιο με modular αποθήκευση.</p>
          <button onClick={() => onNavigate('/offers')} className="mt-4 rounded-lg bg-[#111] px-4 py-2 text-xs font-bold uppercase">Δες τις προσφορές</button>
        </div>
        <div className="rounded-2xl border border-[#d5d5d5] bg-white p-5 text-neutral-950 shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e21b22]">B2B Nomikos Tools</span>
          <h3 className="mt-2 font-display text-2xl font-black uppercase">Τιμές συνεργείου</h3>
          <p className="mt-1 text-xs text-neutral-600">Ειδικές τιμές και υποστήριξη για επαγγελματίες.</p>
          <button onClick={() => onNavigate('/contact')} className="mt-4 rounded-lg bg-[#171717] px-4 py-2 text-xs font-bold uppercase text-white">Μίλησε με σύμβουλο</button>
        </div>
      </section>

      {/* Featured Products Tabs */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="mb-3">
          <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#e21b22]">Nomikos Tools</span>
          <h2 className="font-display text-3xl font-black uppercase tracking-wide text-neutral-950">
            Προτεινόμενα προϊόντα
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#cfd8dc] pb-2">
          {/* Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('featured')}
              className={`font-display font-bold text-sm sm:text-base uppercase tracking-wider px-4 py-2 rounded-t transition-colors ${
                activeTab === 'featured'
                  ? 'bg-[#e21b22] text-white shadow'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              ΠΡΟΤΕΙΝΟΜΕΝΑ HEAVY-DUTY
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`font-display font-bold text-sm sm:text-base uppercase tracking-wider px-4 py-2 rounded-t transition-colors ${
                activeTab === 'bestsellers'
                  ? 'bg-[#e21b22] text-white shadow'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              ΔΗΜΟΦΙΛΗ &amp; BEST SELLERS
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`font-display font-bold text-sm sm:text-base uppercase tracking-wider px-4 py-2 rounded-t transition-colors ${
                activeTab === 'new'
                  ? 'bg-[#e21b22] text-white shadow'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              ΝΕΕΣ ΑΦΙΞΕΙΣ
            </button>
          </div>

          <div className="text-xs text-neutral-500 font-mono-spec">
            Εμφάνιση {displayedProducts.length} προϊόντων
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
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
