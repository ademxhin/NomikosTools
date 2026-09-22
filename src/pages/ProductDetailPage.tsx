import React, { useState } from 'react';
import {
  ChevronRight,
  Heart,
  Scale,
  ShoppingCart,
  Star,
  CheckCircle2,
  AlertCircle,
  Truck,
  Shield,
  FileText,
  Barcode,
  Share2,
  Printer,
  Boxes,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { generateBarcodeSvg } from '../utils/barcodeGenerator';

interface ProductDetailPageProps {
  productSlug: string;
  onNavigate: (route: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  onNavigate,
}) => {
  const {
    products,
    categories,
    brands,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    isB2BMode,
    showToast,
  } = useStore();

  const product = products.find((p) => p.slug === productSlug) || products[0];
  const brand = brands.find((b) => b.id === product?.brandId);
  const mainCategory = categories.find((c) => product?.categoryIds.includes(c.id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'warranty' | 'barcode' | 'reviews'>('specs');
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product?.variants?.[0]?.id
  );

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-800">Το προϊόν δεν βρέθηκε</h2>
        <button
          onClick={() => onNavigate('/products')}
          className="mt-4 bg-[#af101a] text-white px-4 py-2 rounded text-xs font-bold uppercase font-display"
        >
          Επιστροφή στον Κατάλογο
        </button>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);
  const isComp = isInCompare(product.id);

  // Price calculations
  const grossPrice = product.salePrice || product.price;
  const oldGrossPrice = product.salePrice ? product.price : null;
  const netPrice = grossPrice / 1.24;
  const oldNetPrice = oldGrossPrice ? oldGrossPrice / 1.24 : null;

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categoryIds.some((cid) => product.categoryIds.includes(cid)))
    .slice(0, 4);

  const barcodeSvgString = generateBarcodeSvg(product.ean, { height: 60, showText: true });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Ο σύνδεσμος του προϊόντος αντιγράφηκε στο πρόχειρο');
    }
  };

  const handlePrintLabel = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ετικέτα Barcode - ${product.sku}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 20px; }
              .label { border: 2px dashed #000; padding: 15px; width: 320px; margin: 0 auto; }
              h3 { margin: 0 0 5px 0; font-size: 14px; }
              p { margin: 0 0 10px 0; font-size: 11px; color: #444; }
            </style>
          </head>
          <body>
            <div class="label">
              <h3>${product.name}</h3>
              <p>SKU: ${product.sku} | MPN: ${product.manufacturerCode || '-'}</p>
              ${barcodeSvgString}
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8 select-none">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-xs text-neutral-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-neutral-900 transition-colors">
          Αρχική
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('/products')} className="hover:text-neutral-900 transition-colors">
          Εργαλεία
        </button>
        {mainCategory && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <button
              onClick={() => onNavigate(`/category/${mainCategory.slug}`)}
              className="hover:text-neutral-900 transition-colors"
            >
              {mainCategory.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="bg-white border border-[#cfd8dc] rounded-lg p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Gallery (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative w-full h-80 sm:h-96 bg-[#fafafa] border border-[#cfd8dc] rounded-lg p-4 flex items-center justify-center overflow-hidden">
            {product.salePrice && (
              <span className="absolute top-3 left-3 bg-[#af101a] text-white text-xs font-display font-black px-2 py-1 rounded shadow z-10">
                ΠΡΟΣΦΟΡΑ
              </span>
            )}
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded border p-1 shrink-0 bg-[#fafafa] ${
                    selectedImage === idx ? 'border-[#af101a] ring-2 ring-[#af101a]/30' : 'border-neutral-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Quick Barcode Scanner Test Button */}
          <div className="bg-[#f5f5f5] p-3 rounded border border-neutral-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Barcode className="w-5 h-5 text-neutral-700" />
              <div>
                <div className="font-mono-spec font-bold text-neutral-800">EAN: {product.ean}</div>
                <div className="text-[10px] text-neutral-500">Έτοιμο για σάρωση μέσω Scanner</div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('barcode')}
              className="text-[#af101a] font-bold hover:underline font-mono-spec text-[11px]"
            >
              Προβολή Barcode →
            </button>
          </div>
        </div>

        {/* Center/Right: Product Details & Actions (Col 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            {/* Brand & Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0f0f0] pb-2 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => brand && onNavigate(`/brand/${brand.slug}`)}
                  className="font-display font-extrabold text-sm text-[#af101a] hover:underline uppercase tracking-wider"
                >
                  {brand?.name}
                </button>
                <span className="text-neutral-300">|</span>
                <span className="font-mono-spec text-neutral-600">SKU: {product.sku}</span>
                <span className="text-neutral-300">|</span>
                <span className="font-mono-spec text-neutral-600">MPN: {product.manufacturerCode || product.sku}</span>
              </div>

              <div className="flex items-center space-x-2 text-neutral-400">
                <button onClick={handleShare} className="hover:text-neutral-700 p-1" title="Κοινοποίηση">
                  <Share2 className="w-4 h-4" />
                </button>
                <button onClick={handlePrintLabel} className="hover:text-neutral-700 p-1" title="Εκτύπωση Ετικέτας">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-bold text-xl sm:text-2xl text-neutral-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating & Availability */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                <span className="text-neutral-800 text-sm">{product.rating}</span>
                <span className="text-neutral-400 font-normal ml-1">({product.reviewCount} κριτικές)</span>
              </div>

              <span>•</span>

              {product.stockQuantity > 0 ? (
                <div className="inline-flex items-center text-[#2e7d32] font-bold text-xs bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>ΣΕ ΑΠΟΘΕΜΑ: {product.stockQuantity} τεμάχια (Κεντρικό Logistics Ασπρόπυργος)</span>
                </div>
              ) : (
                <div className="inline-flex items-center text-[#c62828] font-bold text-xs bg-red-50 px-2.5 py-1 rounded border border-red-200">
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  <span>ΚΑΤΟΠΙΝ ΠΑΡΑΓΓΕΛΙΑΣ (Παράδοση σε 4-8 εργάσιμες)</span>
                </div>
              )}
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variants Selector (if applicable) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wide block">
                  ΕΠΙΛΟΓΗ ΕΚΔΟΣΗΣ / ΣΥΣΚΕΥΑΣΙΑΣ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                        selectedVariantId === v.id
                          ? 'border-[#af101a] bg-[#af101a] text-white font-bold'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {v.name} ({v.sku})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing Box (Dual Net B2B & Gross Retail) */}
            <div className="bg-[#fbf9f9] border border-[#cfd8dc] rounded-lg p-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-3xl font-bold font-mono-spec text-neutral-900 leading-tight">
                    €{(isB2BMode ? netPrice : grossPrice).toFixed(2)}
                    <span className="text-xs font-normal text-neutral-500 ml-2">
                      {isB2BMode ? 'Χωρίς ΦΠΑ 24%' : 'με ΦΠΑ 24%'}
                    </span>
                  </div>
                  <div className="text-xs font-mono-spec text-[#af101a] font-semibold mt-0.5">
                    {isB2BMode
                      ? `Τελική τιμή λιανικής: €${grossPrice.toFixed(2)} με ΦΠΑ`
                      : `Καθαρή αξία B2B: €${netPrice.toFixed(2)} χωρίς ΦΠΑ`}
                  </div>
                </div>

                {oldGrossPrice && (
                  <div className="text-right">
                    <span className="text-sm text-neutral-400 line-through font-mono-spec">
                      €{(isB2BMode ? oldNetPrice! : oldGrossPrice).toFixed(2)}
                    </span>
                    <span className="block text-xs font-bold text-[#af101a] font-display">
                      ΚΕΡΔΙΖΕΤΕ €{(oldGrossPrice - grossPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* B2B Tier Discount Table */}
              <div className="mt-3 pt-2 border-t border-neutral-200 text-xs">
                <span className="text-[11px] font-bold text-neutral-700 uppercase font-mono-spec block mb-1">
                  ΚΛΙΜΑΚΩΤΕΣ ΕΚΠΤΩΣΕΙΣ ΠΟΣΟΤΗΤΑΣ:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="bg-white p-1.5 rounded border border-neutral-200">
                    <div className="font-bold text-neutral-800">1 - 2 τεμ.</div>
                    <div className="font-mono-spec text-neutral-600">Κανονική τιμή</div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-neutral-200">
                    <div className="font-bold text-neutral-800">3 - 5 τεμ.</div>
                    <div className="font-mono-spec text-[#af101a] font-bold">Έκπτωση -5%</div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-neutral-200">
                    <div className="font-bold text-neutral-800">6+ τεμ.</div>
                    <div className="font-mono-spec text-[#af101a] font-bold">Έκπτωση -8%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper & Cart Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <div className="flex items-center border border-neutral-300 rounded overflow-hidden w-full sm:w-auto shrink-0 justify-between">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold"
                >
                  -
                </button>
                <span className="px-5 py-3 font-mono-spec font-bold text-sm bg-white min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold"
                >
                  +
                </button>
              </div>

              <button
                id="pdp-add-to-cart-btn"
                onClick={() => addToCart(product, quantity, selectedVariantId)}
                className="w-full sm:flex-1 bg-[#af101a] hover:bg-[#b71c1c] active:bg-[#8e0c14] text-white font-display font-bold uppercase tracking-wider py-3.5 px-6 rounded-md flex items-center justify-center space-x-2 shadow-md transition-all text-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>ΠΡΟΣΘΗΚΗ ΣΤΟ ΚΑΛΑΘΙ</span>
              </button>
            </div>

            {/* Secondary Actions: Wishlist, Compare */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs text-neutral-600">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center space-x-1.5 ${isWish ? 'text-[#af101a] font-bold' : 'hover:text-neutral-900'}`}
              >
                <Heart className={`w-4 h-4 ${isWish ? 'fill-[#af101a]' : ''}`} />
                <span>{isWish ? 'Στα Αγαπημένα σας' : 'Προσθήκη στη Λίστα Επιθυμιών'}</span>
              </button>

              <button
                onClick={() => toggleCompare(product.id)}
                className={`flex items-center space-x-1.5 ${isComp ? 'text-[#0d47a1] font-bold' : 'hover:text-neutral-900'}`}
              >
                <Scale className="w-4 h-4" />
                <span>{isComp ? 'Στη Σύγκριση (Επιλεγμένο)' : 'Προσθήκη στη Σύγκριση'}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Service Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-neutral-200 text-xs">
            <div className="flex items-start space-x-2.5 bg-neutral-50 p-2.5 rounded border border-neutral-200">
              <Truck className="w-4 h-4 text-[#af101a] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-800 block">Express Αποστολή</span>
                <span className="text-neutral-500 text-[11px]">ACS 1-2 ημέρες ή άμεσα σε Box Now Locker 24/7.</span>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 bg-neutral-50 p-2.5 rounded border border-neutral-200">
              <Shield className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-neutral-800 block">{product.warranty}</span>
                <span className="text-neutral-500 text-[11px]">Επίσημη κάλυψη &amp; εξουσιοδοτημένο service.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-[#cfd8dc] rounded-lg overflow-hidden">
        <div className="flex border-b border-[#cfd8dc] bg-[#fbfbfb] overflow-x-auto">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-5 py-3 font-display font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'specs'
                ? 'border-[#af101a] bg-white text-[#af101a]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΤΕΧΝΙΚΑ ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-5 py-3 font-display font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'description'
                ? 'border-[#af101a] bg-white text-[#af101a]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΠΕΡΙΓΡΑΦΗ &amp; ΕΞΟΠΛΙΣΜΟΣ
          </button>
          <button
            onClick={() => setActiveTab('warranty')}
            className={`px-5 py-3 font-display font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'warranty'
                ? 'border-[#af101a] bg-white text-[#af101a]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΕΓΓΥΗΣΗ &amp; SERVICE
          </button>
          <button
            onClick={() => setActiveTab('barcode')}
            className={`px-5 py-3 font-display font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'barcode'
                ? 'border-[#af101a] bg-white text-[#af101a]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΕΤΙΚΕΤΑ BARCODE / EAN
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-5 py-3 font-display font-bold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'reviews'
                ? 'border-[#af101a] bg-white text-[#af101a]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΚΡΙΤΙΚΕΣ ({product.reviewCount})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                ΑΝΑΛΥΤΙΚΕΣ ΤΕΧΝΙΚΕΣ ΠΡΟΔΙΑΓΡΑΦΕΣ
              </h3>
              <div className="border border-[#cfd8dc] rounded overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {product.specifications.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#fafafa]' : 'bg-white'}>
                        <td className="p-3 font-bold text-neutral-700 w-1/3 border-b border-neutral-200">
                          {spec.key}
                        </td>
                        <td className="p-3 text-neutral-900 font-mono-spec border-b border-neutral-200">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                    {product.weight && (
                      <tr className="bg-white">
                        <td className="p-3 font-bold text-neutral-700 border-b border-neutral-200">Βάρος</td>
                        <td className="p-3 text-neutral-900 font-mono-spec border-b border-neutral-200">
                          {product.weight} kg
                        </td>
                      </tr>
                    )}
                    {product.dimensions && (
                      <tr className="bg-[#fafafa]">
                        <td className="p-3 font-bold text-neutral-700 border-b border-neutral-200">Διαστάσεις (ΜxΠxΥ)</td>
                        <td className="p-3 text-neutral-900 font-mono-spec border-b border-neutral-200">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-6 text-sm text-neutral-700 leading-relaxed">
              <div>
                <h3 className="font-display font-bold text-base text-neutral-900 uppercase mb-2">
                  ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΠΑΡΟΥΣΙΑΣΗ
                </h3>
                <p className="whitespace-pre-line leading-relaxed">{product.fullDescription || product.shortDescription}</p>
              </div>

              {product.includedItems && product.includedItems.length > 0 && (
                <div className="bg-[#f8f9fa] border border-[#cfd8dc] p-4 rounded">
                  <h4 className="font-display font-bold text-sm text-neutral-900 uppercase mb-2 flex items-center space-x-1.5">
                    <Boxes className="w-4 h-4 text-[#af101a]" />
                    <span>ΠΑΡΑΔΙΔΕΤΑΙ ΜΕ (ΒΑΣΙΚΟΣ ΕΞΟΠΛΙΣΜΟΣ):</span>
                  </h4>
                  <ul className="space-y-1 pl-4 list-disc text-xs text-neutral-700">
                    {product.includedItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-2xl">
              <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                ΟΡΟΙ ΕΓΓΥΗΣΗΣ &amp; ΤΕΧΝΙΚΗ ΥΠΟΣΤΗΡΙΞΗ
              </h3>
              <p>
                Όλα τα εργαλεία της <strong>Nomikos Tools</strong> συνοδεύονται από επίσημη εργοστασιακή εγγύηση ελληνικής και ευρωπαϊκής αντιπροσωπείας.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded space-y-1 text-emerald-900">
                <div className="font-bold flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>Επέκταση Εγγύησης σε 3 Έτη</span>
                </div>
                <p className="text-xs">
                  Με την ηλεκτρονική εγγραφή του εργαλείου σας στο portal του κατασκευαστή (Milwaukee, DeWalt, Bosch, Makita) εντός 30 ημερών από την ημερομηνία αγοράς, επεκτείνετε αυτόματα την εγγύηση σε 36 μήνες.
                </p>
              </div>
              <p className="text-xs text-neutral-500">
                Για service και γνήσια ανταλλακτικά, επικοινωνήστε με το τμήμα τεχνικής υποστήριξης στο <strong>210 5550190</strong>.
              </p>
            </div>
          )}

          {activeTab === 'barcode' && (
            <div className="space-y-4 max-w-md">
              <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                ΕΤΙΚΕΤΑ ΑΠΟΘΗΚΗΣ &amp; ΣΑΡΩΣΗ BARCODE
              </h3>
              <p className="text-xs text-neutral-600">
                Μπορείτε να σαρώσετε αυτό το barcode απευθείας με την κάμερα ή το φυσικό barcode scanner για αναζήτηση, απογραφή ή Picking παραγγελιών.
              </p>

              <div className="border-2 border-dashed border-neutral-400 bg-white p-6 rounded-lg text-center shadow-inner space-y-3">
                <div className="font-display font-bold text-sm text-neutral-900 uppercase">
                  {product.name}
                </div>
                <div className="text-xs text-neutral-500 font-mono-spec">
                  SKU: {product.sku} | EAN-13: {product.ean}
                </div>
                <div
                  className="flex justify-center p-2 bg-white"
                  dangerouslySetInnerHTML={{ __html: barcodeSvgString }}
                />
              </div>

              <button
                onClick={handlePrintLabel}
                className="w-full bg-[#1e1e1e] hover:bg-black text-white text-xs font-display font-bold uppercase py-2.5 rounded flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>ΕΚΤΥΠΩΣΗ ΕΤΙΚΕΤΑΣ ΣΤΟΝ ΕΚΤΥΠΩΤΗ ΕΤΙΚΕΤΩΝ</span>
              </button>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                    ΑΞΙΟΛΟΓΗΣΕΙΣ ΕΠΑΓΓΕΛΜΑΤΙΩΝ ({product.reviewCount})
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-neutral-800">{product.rating} στα 5</span>
                  </div>
                </div>

                <button
                  onClick={() => showToast('Η φόρμα υποβολής κριτικής είναι διαθέσιμη για πιστοποιημένους αγοραστές')}
                  className="bg-[#af101a] text-white text-xs font-display font-bold uppercase px-4 py-2 rounded"
                >
                  ΓΡΑΨΤΕ ΚΡΙΤΙΚΗ
                </button>
              </div>

              {/* Sample Greek Verified Reviews */}
              <div className="space-y-4 text-xs">
                <div className="border-b border-neutral-100 pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800">Κώστας Β. (Ηλεκτρολόγος Εγκαταστάτης)</span>
                    <span className="text-neutral-400">12 Φεβ 2026</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    Εξαιρετική δύναμη και αυτονομία. Το χρησιμοποιώ καθημερινά σε εργοτάξιο. Η Nomikos Tools το έστειλε την επόμενη εργάσιμη στο κατάστημά μου.
                  </p>
                </div>

                <div className="border-b border-neutral-100 pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-800">Δημήτρης Μ. (Τεχνική Κατασκευαστική)</span>
                    <span className="text-neutral-400">28 Ιαν 2026</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    Άψογη εξυπηρέτηση και τιμολόγηση B2B με απαλλαγή ΦΠΑ άμεσα χωρίς καθυστερήσεις.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cross-selling / Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#cfd8dc] pb-2">
            <h2 className="font-display font-black text-xl text-neutral-900 uppercase tracking-wide">
              ΣΥΜΠΛΗΡΩΣΤΕ ΤΟΝ ΕΞΟΠΛΙΣΜΟ ΣΑΣ
            </h2>
            <button
              onClick={() => onNavigate(`/category/${mainCategory?.slug || 'ergaleia-mpatarias'}`)}
              className="text-xs font-bold text-[#af101a] hover:underline flex items-center space-x-1 uppercase font-display"
            >
              <span>Περισσότερα</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
