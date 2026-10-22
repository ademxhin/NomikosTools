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
  const customCategoryImages = [
    '/assets/category-electric-tools.png', '/assets/category-battery-tools.png',
    '/assets/category-hand-tools.png', '/assets/category-cutting.png',
    '/assets/category-plumbing.png', '/assets/category-garden.png',
    '/assets/category-measurement-safety.png', '/assets/category-all.png',
  ];
  const categoryGroups = [
    { name: 'Ηλεκτρικά Εργαλεία', match: /(δράπανα|δραπανοκατσάβιδα|σκαπτικά|διατρητικά|γωνιακοί τροχοί|τριβεία|σέγες|σπαθοσέγες|πριόνια|φρέζες|πλάνες|πολυεργαλεία|κατσαβίδια|μπουλονόκλειδα|καρφωτικά|πριτσιναδόροι)/i },
    { name: 'Εργαλεία Μπαταρίας & Φορτιστές', match: /(μπαταρί|φορτιστές|σετ εργαλείων μπαταρίας|εκκινητές)/i },
    { name: 'Εργαλεία Χειρός', match: /(γερμανο|κλειδιά|καρυδάκια|καστάνιες|πένσες|κόφτες|σφυριά|βαριοπούλες|σκαρπέλα|λοστοί|τσεκούρια|ψαλίδια|καλέμια|βελόνια|εργαλεία χειρός|βοηθητικά εργαλεία)/i },
    { name: 'Κοπτικά, Λεπίδες & Αναλώσιμα', match: /(δίσκοι|λάμες|τρυπάνια|ποτηροτρύπανα|μύτες|αναλώσιμα|κοπτικά|απογρεζωτές|χαρτοκόπτες|κοπίδια)/i },
    { name: 'Υδραυλικά, Αέρας & Αντλίες', match: /(υδραυλ|κομπρεσέρ|αέρος|αντλίες|τρόμπες|πρέσες|αποφρακτικά|σωληνοκόφτες|φιλιέρες|κολαούζα|σύνδεσμοι|ρακόρ)/i },
    { name: 'Κήπος & Εξωτερικές Εργασίες', match: /(κήπου|χλοο|χορτο|αλυσοπρίονα|κλαδέματος|μπορντούρας|ψεκαστήρες|πολυεργαλείων κήπου|ποτίσματος)/i },
    { name: 'Μέτρηση, Ασφάλεια & Εργοτάξιο', match: /(αλφάδια|laser|μέτρα|πολύμετρα|θερμόμετρα|ανιχνευτές|φωτισ|φακοί|κράνη|γυαλιά|γάντια|μάσκες|ωτοασπίδες|επιγονατίδες|παπούτσια|γιλέκα|εργασίας|εργαλειοθήκες|εργαλειοφόροι|αποθήκευση|μεταφορά|ανύψωση)/i },
  ].map((group, index) => {
    const matched = mainCategories.filter((category) => group.match.test(category.name));
    const ids = new Set(matched.map((category) => category.id));
    return {
      ...group,
      slug: matched[0]?.slug ?? 'products',
      iconName: matched[0]?.iconName ?? 'Boxes',
      image: customCategoryImages[index],
      subcategories: matched.slice(0, 3).map((category) => category.name),
      count: products.filter((product) => product.categoryIds.some((id) => ids.has(id))).length,
    };
  });
  categoryGroups.push({ name: 'Όλες οι κατηγορίες', match: /.*/, slug: 'products', iconName: 'Boxes', image: customCategoryImages[7], subcategories: [], count: products.length });
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
    <div className="space-y-8 pb-8 sm:space-y-10">
      {/* Centered campaign banner, following the dense storefront rhythm of the reference */}
      <section className="promo-surface px-3 py-4 sm:px-4 sm:py-7">
        <div className="relative mx-auto min-h-[310px] max-w-7xl overflow-hidden rounded-[1.35rem] border-[4px] border-[#e21b22] bg-[#090909] text-white shadow-2xl sm:aspect-[21/9] sm:min-h-0 sm:rounded-3xl sm:border-[6px]">
          <img src={currentPromo.image} alt="Milwaukee campaign" className="absolute inset-0 h-full w-full object-cover object-[68%_center] sm:object-center" />
          <div className={`pointer-events-none absolute inset-0 ${currentPromo.side === 'right' ? 'bg-gradient-to-l from-black/90 via-black/55 to-transparent' : 'bg-gradient-to-r from-black/95 via-black/70 to-black/15 sm:from-black/90 sm:via-black/55 sm:to-transparent'}`} />
          <div className="pointer-events-none absolute inset-0 hidden bg-black/10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[36%] bg-[#e21b22]" />
          <div className="pointer-events-none absolute -right-5 top-1/2 -translate-y-1/2 font-display text-[12rem] lg:text-[18rem] font-black leading-none text-black/10 select-none">
            NT
          </div>

          <div className="relative z-10 min-h-[310px] px-5 pb-[4.5rem] pt-5 sm:grid sm:h-full sm:min-h-0 sm:grid-cols-1 sm:px-10 sm:py-9 lg:px-12">
            <div className={`relative flex min-h-[255px] flex-col items-start ${currentPromo.side === 'right' ? 'text-right sm:items-end' : 'text-left'}`}>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e21b22] bg-black/55 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#ffb4b7] sm:mb-5 sm:px-3 sm:text-[11px]">
                <Zap className="h-3.5 w-3.5" />
                {currentPromo.eyebrow}
              </div>

              <h1 className="max-w-[90%] font-promo text-[clamp(2rem,9vw,2.7rem)] font-black uppercase leading-[0.9] tracking-tight sm:max-w-xl sm:text-6xl lg:text-7xl">
                {currentPromo.title.split(currentPromo.accent)[0]}
                <span className="text-[#e21b22]">{currentPromo.accent}</span>
              </h1>

              <p className="mt-3 hidden max-w-lg text-sm leading-relaxed text-neutral-300 sm:mt-6 sm:block sm:text-base">
                {currentPromo.description}
              </p>

              <div className={`mt-auto flex flex-wrap gap-2 pt-5 sm:absolute sm:bottom-10 sm:mt-0 sm:pt-0 ${currentPromo.side === 'right' ? 'sm:right-0 sm:justify-end lg:right-0' : 'sm:left-0 lg:left-0'}`}>
                <button
                  id="hero-explore-catalog-btn"
                  onClick={() => onNavigate('/category/ergaleia-mpatarias')}
                  className="group flex items-center gap-2 rounded-xl bg-[#e21b22] px-4 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#c81016] sm:px-6 sm:py-3.5 sm:text-sm"
                >
                  Αγόρασε τώρα
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  id="hero-b2b-offers-btn"
                  onClick={() => onNavigate('/offers')}
                  className="hidden items-center gap-2 rounded-xl border border-neutral-600 bg-black/35 px-5 py-3.5 font-display text-sm font-bold uppercase tracking-wider text-white transition-colors hover:border-white hover:bg-white hover:text-black sm:flex"
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
          <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-4 sm:gap-2">
            <button onClick={() => setActivePromo((activePromo - 1 + promoCopy.length) % promoCopy.length)} className="rounded-full bg-black/50 p-1.5 text-white hover:bg-[#e21b22]" aria-label="Προηγούμενο promo"><ChevronLeft className="h-4 w-4" /></button>
            {promoCopy.map((_, index) => <button key={index} onClick={() => setActivePromo(index)} aria-label={`Promo ${index + 1}`} className={`h-2.5 w-2.5 rounded-full transition-all ${index === activePromo ? 'bg-white' : 'bg-white/40'}`} />)}
            <button onClick={() => setActivePromo((activePromo + 1) % promoCopy.length)} className="rounded-full bg-black/50 p-1.5 text-white hover:bg-[#e21b22]" aria-label="Επόμενο promo"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      {/* Promotional tiles */}
      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-2.5 px-3 min-[390px]:gap-3 sm:gap-4 sm:px-4 lg:grid-cols-4">
        {[
          { image: '/assets/promos/m12-wide.png', badge: '/assets/brand-badges/m12-custom.svg', label: 'M12', title: 'PORTABLE', copy: 'PRODUCTIVITY.', action: 'EXPLORE M12', route: '/category/ergaleia-mpatarias' },
          { image: '/assets/promos/m18-fuel-wide.png', badge: '/assets/brand-badges/m18-custom.svg', label: 'M18', title: 'PERFORMANCE', copy: 'DRIVEN.', action: 'EXPLORE M18', route: '/category/ergaleia-mpatarias' },
          { image: '/assets/promos/mx-fuel-tile.png', badge: '/assets/brand-badges/mx-fuel-custom.svg', label: 'MX FUEL', title: 'EQUIPMENT', copy: 'REDEFINED.', action: 'EXPLORE MX FUEL', route: '/category/ergaleia-mpatarias' },
          { image: '/assets/promos/packout-right-wide.png', badge: '/assets/brand-badges/packout-custom.svg', label: 'PACKOUT', title: 'MODULAR STORAGE', copy: 'SYSTEM.', action: 'EXPLORE PACKOUT', route: '/offers' },
        ].map((tile) => (
          <button key={tile.label} type="button" onClick={() => onNavigate(tile.route)} aria-label={tile.action} className="group relative min-h-[138px] overflow-hidden rounded-xl bg-[#171717] text-white shadow-lg min-[390px]:min-h-[150px] sm:min-h-[210px] sm:rounded-2xl lg:min-h-[230px]">
            <img src={tile.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-screen transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[#e21b22]/85 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#b90008]/65 via-[#e21b22]/25 to-[#e21b22]/45" />
            <div className="relative flex h-full min-h-[138px] flex-col items-center justify-center p-2 text-center min-[390px]:min-h-[150px] sm:min-h-[210px] sm:p-5 lg:min-h-[230px]">
              <div className="inline-flex flex-col items-center justify-center rounded-lg px-0.5 py-0.5 text-center">
                {!tile.badge && <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffb4b7]">{tile.label}</span>}
                {tile.badge && <img src={tile.badge} alt="" className="mb-1 h-6 w-auto max-w-[112px] object-contain min-[390px]:h-7 min-[390px]:max-w-[120px] sm:h-9 sm:max-w-[165px]" />}
                <h3 className="mt-0 font-promo text-sm font-black uppercase leading-none sm:text-lg">{tile.title}</h3>
                <p className="mt-0.5 font-promo text-sm font-black uppercase leading-none text-white sm:text-lg">{tile.copy}</p>
              </div>
            </div>
          </button>
        ))}
      </section>

      {/* Featured Products Tabs */}
      <section className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="mb-3">
          <h2 className="font-display text-2xl sm:text-3xl font-black  tracking-wide text-neutral-950">
            Προτεινόμενα προϊόντα
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-[#cfd8dc] pb-2">
          {/* Tabs */}
          <div />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-2.5 min-[390px]:gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
      <section className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="flex items-center justify-between mb-6 border-b border-[#cfd8dc] pb-3">
          <div>
          <h2 className="font-category font-black text-xl sm:text-2xl text-neutral-900  tracking-wide">
              ΒΑΣΙΚΕΣ ΚΑΤΗΓΟΡΙΕΣ ΕΞΟΠΛΙΣΜΟΥ
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/products')}
            className="text-xs font-bold text-[#e21b22] hover:underline flex items-center space-x-1 font-display  tracking-wide"
          >
            <span>Όλος ο Κατάλογος</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryGroups.map((cat) => (
            <div
              key={`${cat.name}-${cat.slug}`}
              onClick={() => onNavigate(cat.name === 'Όλες οι κατηγορίες' ? '/categories' : `/category/${cat.slug}`)}
              className="relative min-h-64 overflow-hidden rounded-2xl border border-[#cfd8dc] bg-[#b8b8b8] text-center cursor-pointer transition-all group hover:border-[#e21b22] hover:shadow-lg"
            >
              <img src={cat.image} alt="" className="absolute inset-0 h-full w-full object-cover grayscale opacity-70 transition-all duration-300 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 transition-colors group-hover:bg-[#e21b22]/50" />

              <div className="relative z-10 flex min-h-64 flex-col items-start justify-end p-4 text-left text-white">
                <h3 className="font-category text-lg font-black  leading-tight line-clamp-2">
                  {cat.name}
                </h3>

                {cat.subcategories.length > 0 && (
                  <p className="mt-1 line-clamp-1 text-[10px] text-neutral-200">
                    {cat.subcategories.join(' · ')}
                  </p>
                )}

                <ArrowRight className="mt-2 h-4 w-4 translate-x-0 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Directory Logos */}
      <section className="mx-auto max-w-7xl px-3 sm:px-4">
        <div className="border-b border-[#cfd8dc] pb-3 mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="font-display font-black text-base sm:text-xl text-neutral-900  tracking-wide">
              ΕΠΙΣΗΜΟΙ ΚΑΤΑΣΚΕΥΑΣΤΕΣ &amp; BRANDS
            </h2>
            <p className="hidden text-xs text-neutral-500 sm:block">
              Συνεργαζόμαστε αποκλειστικά με τους κορυφαίους κατασκευαστές παγκοσμίως
            </p>
          </div>
          <button
            onClick={() => onNavigate('/brand/milwaukee')}
            className="shrink-0 text-[10px] sm:text-xs font-bold text-[#e21b22] hover:underline flex items-center space-x-1 font-display  tracking-wide"
          >
            <span>Όλα τα Brands</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="brand-marquee overflow-hidden">
          <div className="brand-marquee-track flex w-max gap-3 py-1">
            {[...brands, ...brands].map((b, index) => (
              <button
                key={`${b.id}-${index}`}
                onClick={() => onNavigate(`/brand/${b.slug}`)}
                className="group flex h-20 w-52 shrink-0 flex-col items-center justify-center bg-transparent px-6 text-center transition-all"
              >
                {b.name.toLowerCase() === 'milwaukee' ? (
                  <img src="/assets/brand-milwaukee.png" alt="Milwaukee" className="h-12 w-40 scale-125 object-contain grayscale mix-blend-darken transition duration-200 group-hover:grayscale-0" />
                ) : b.name.toLowerCase() === 'aeg' ? (
                  <img src="/assets/brand-aeg.png" alt="AEG" className="h-12 w-40 scale-90 object-contain grayscale mix-blend-darken transition duration-200 group-hover:grayscale-0" />
                ) : b.name.toLowerCase() === 'brennenstuhl' ? (
                  <img src="/assets/brand-brennenstuhl.png" alt="Brennenstuhl" className="h-12 w-40 scale-[2.1] object-contain grayscale mix-blend-darken transition duration-200 group-hover:grayscale-0" />
                ) : (
                  <span className="flex h-12 w-40 items-center justify-center font-display text-xl font-black tracking-wider text-neutral-800 group-hover:text-[#e21b22] ">{b.name}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
