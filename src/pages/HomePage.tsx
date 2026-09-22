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
  const newArrivals = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

  const displayedProducts =
    activeTab === 'featured'
      ? featuredProducts
      : activeTab === 'bestsellers'
      ? bestsellers
      : newArrivals;

  const mainCategories = categories.filter((c) => c.level === 1 && c.active);

  return (
    <div className="space-y-12 pb-8">
      {/* Heavy-Duty Hero Banner */}
      <section className="relative bg-[#161616] text-white border-b border-[#2a2a2a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6 z-10">
            <div className="inline-flex items-center space-x-2 bg-[#af101a]/20 border border-[#af101a]/50 text-[#ffb3ac] px-3 py-1 rounded text-xs font-mono-spec font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#ffdad6]" />
              <span>OFFICIAL INDUSTRIAL DISTRIBUTOR 2026</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-none">
              ΕΠΑΓΓΕΛΜΑΤΙΚΑ <span className="text-[#af101a]">ΕΡΓΑΛΕΙΑ</span> ΥΨΗΛΗΣ ΑΝΤΟΧΗΣ
            </h1>

            <p className="text-neutral-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Εξοπλίστε το εργοτάξιο και το συνεργείο σας με κορυφαία εργαλεία μπαταρίας <strong>Milwaukee FUEL™</strong>, <strong>DeWalt XR</strong> και <strong>Knipex</strong>. Άμεση διαθεσιμότητα, τιμολόγιο B2B και παράδοση σε 24 ώρες.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                id="hero-explore-catalog-btn"
                onClick={() => onNavigate('/category/ergaleia-mpatarias')}
                className="bg-[#af101a] hover:bg-[#b71c1c] text-white font-display font-bold text-sm uppercase tracking-wider px-6 py-3.5 rounded shadow-lg flex items-center space-x-2 transition-all group"
              >
                <span>ΑΝΑΚΑΛΥΨΤΕ ΤΑ ΕΡΓΑΛΕΙΑ ΜΠΑΤΑΡΙΑΣ</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-b2b-offers-btn"
                onClick={() => onNavigate('/offers')}
                className="bg-[#2a2a2a] hover:bg-[#333] text-white border border-[#444] font-display font-bold text-sm uppercase tracking-wider px-5 py-3.5 rounded transition-colors flex items-center space-x-2"
              >
                <Flame className="w-4 h-4 text-red-500" />
                <span>ΠΡΟΣΦΟΡΕΣ ΕΒΔΟΜΑΔΑΣ</span>
              </button>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#2e2e2e] text-xs">
              <div>
                <div className="font-display font-black text-xl text-white">5.000+</div>
                <div className="text-neutral-400 text-[11px]">Ετοιμοπαράδοτοι Κωδικοί</div>
              </div>
              <div>
                <div className="font-display font-black text-xl text-white">24 ΩΡΕΣ</div>
                <div className="text-neutral-400 text-[11px]">Express Παράδοση ACS &amp; Box</div>
              </div>
              <div>
                <div className="font-display font-black text-xl text-[#af101a]">100%</div>
                <div className="text-neutral-400 text-[11px]">Εγγύηση Αντιπροσωπείας</div>
              </div>
            </div>
          </div>

          {/* Right: Featured Hero Visual */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#262626] to-[#1a1a1a] p-6 rounded-xl border border-[#3e3e3e] shadow-2xl">
              <div className="absolute -top-3 -right-3 bg-[#af101a] text-white text-xs font-display font-black uppercase px-3 py-1 rounded shadow">
                ΕΙΔΙΚΗ ΠΡΟΣΦΟΡΑ B2B
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono-spec text-neutral-400 mb-2">
                <span className="text-[#af101a] font-bold">MILWAUKEE M18 FUEL™</span>
                <span>•</span>
                <span>COMBO SET</span>
              </div>

              <img
                src={products[0]?.images[0] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80'}
                alt="Milwaukee M18 Heavy Duty"
                className="w-full h-64 object-contain my-3 drop-shadow-2xl"
              />

              <div className="space-y-2">
                <h3 className="font-bold text-base text-white line-clamp-1">
                  {products[0]?.name || 'Milwaukee M18 FPD3-502X Κρουστικό Δραπανοκατσάβιδο'}
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-neutral-400">Ειδική τιμή γνωριμίας:</div>
                    <div className="text-2xl font-bold font-mono-spec text-[#ffb3ac]">
                      €{products[0]?.salePrice?.toFixed(2) || '389.00'}
                      <span className="text-xs font-normal text-neutral-400 ml-1">με ΦΠΑ</span>
                    </div>
                  </div>
                  <button
                    onClick={() => products[0] && onNavigate(`/product/${products[0].slug}`)}
                    className="bg-[#af101a] hover:bg-[#b71c1c] text-white px-4 py-2 rounded text-xs font-display font-bold uppercase tracking-wider"
                  >
                    ΠΡΟΒΟΛΗ
                  </button>
                </div>
              </div>
            </div>
          </div>
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
            className="text-xs font-bold text-[#af101a] hover:underline flex items-center space-x-1 font-display uppercase tracking-wide"
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
              className="bg-white border border-[#cfd8dc] hover:border-[#1e1e1e] hover:shadow-md p-4 rounded text-center cursor-pointer transition-all group flex flex-col items-center justify-between"
            >
              <div className="w-14 h-14 rounded-full bg-[#fbf8f8] border border-[#f0dedd] flex items-center justify-center text-[#af101a] group-hover:bg-[#af101a] group-hover:text-white transition-colors mb-3">
                {cat.slug.includes('battery') && <BatteryCharging className="w-7 h-7" />}
                {cat.slug.includes('electric') && <Zap className="w-7 h-7" />}
                {cat.slug.includes('hand') && <Wrench className="w-7 h-7" />}
                {cat.slug.includes('accessories') && <Sliders className="w-7 h-7" />}
                {cat.slug.includes('storage') && <Sparkles className="w-7 h-7" />}
                {cat.slug.includes('safety') && <ShieldCheck className="w-7 h-7" />}
              </div>

              <h3 className="font-display font-bold text-xs sm:text-sm text-neutral-900 group-hover:text-[#af101a] uppercase leading-tight line-clamp-2">
                {cat.name}
              </h3>

              <span className="text-[11px] text-neutral-400 mt-1 font-mono-spec">
                {products.filter((p) => p.categoryIds.includes(cat.id)).length} Προϊόντα
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products Tabs */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#cfd8dc] pb-2">
          {/* Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('featured')}
              className={`font-display font-bold text-sm sm:text-base uppercase tracking-wider px-4 py-2 rounded-t transition-colors ${
                activeTab === 'featured'
                  ? 'bg-[#af101a] text-white shadow'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              ΠΡΟΤΕΙΝΟΜΕΝΑ HEAVY-DUTY
            </button>
            <button
              onClick={() => setActiveTab('bestsellers')}
              className={`font-display font-bold text-sm sm:text-base uppercase tracking-wider px-4 py-2 rounded-t transition-colors ${
                activeTab === 'bestsellers'
                  ? 'bg-[#af101a] text-white shadow'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              ΔΗΜΟΦΙΛΗ &amp; BEST SELLERS
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`font-display font-bold text-sm sm:text-base uppercase tracking-wider px-4 py-2 rounded-t transition-colors ${
                activeTab === 'new'
                  ? 'bg-[#af101a] text-white shadow'
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

      {/* Industrial B2B Banner Callout */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-[#1e1e1e] text-white rounded-lg p-6 sm:p-8 border border-[#333] shadow-lg grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[11px] font-mono-spec uppercase text-[#ffb3ac] font-bold tracking-wider">
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
              className="bg-[#af101a] hover:bg-[#b71c1c] text-white font-display font-bold uppercase text-xs tracking-wider py-3 px-6 rounded text-center transition-colors shadow"
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
            className="text-xs font-bold text-[#af101a] hover:underline flex items-center space-x-1 font-display uppercase tracking-wide"
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
              className="bg-white border border-[#cfd8dc] hover:border-[#1e1e1e] hover:shadow p-3 rounded text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1 group"
            >
              <span className="font-display font-black text-sm tracking-wider text-neutral-800 group-hover:text-[#af101a] uppercase">
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
