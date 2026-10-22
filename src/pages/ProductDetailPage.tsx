import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  Heart,
  ArrowLeftRight,
  ShoppingCart,
  Star,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileText,
  Barcode,
  Share2,
  Printer,
  Boxes,
  Zap,
  ArrowRight,
  X,
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

  const product = products.find((p) => p.slug === productSlug);
  const brand = brands.find((b) => b.id === product?.brandId);
  const mainCategory = categories.find((c) => product?.categoryIds.includes(c.id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [alternativeStart, setAlternativeStart] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'warranty' | 'reviews'>('specs');
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    product?.variants?.[0]?.id
  );

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-800">Το προϊόν δεν βρέθηκε</h2>
        <button
          onClick={() => onNavigate('/products')}
          className="mt-4 bg-[#e21b22] text-white px-4 py-2 rounded text-xs font-bold  font-display"
        >
          Επιστροφή στον Κατάλογο
        </button>
      </div>
    );
  }

  const isWish = isInWishlist(product.id);
  const isComp = isInCompare(product.id);
  const displayProductName = product.name
    .replace(new RegExp(`^${brand?.name ?? ''}\\s*`, 'i'), '')
    .replace(/\s+\d{8,}\s*$/, '');
  const displayReviewCount = Math.max(product.reviewCount, 3);
  const displayRating = product.reviewCount > 0 ? product.rating : 4.7;
  const availability = {
    in_stock: { label: 'Άμεσα διαθέσιμο', tone: 'text-[#159a91] bg-[#dff4f1]' },
    low_stock: { label: 'Άμεσα διαθέσιμο', tone: 'text-[#159a91] bg-[#dff4f1]' },
    on_order: { label: 'Κατόπιν παραγγελίας', tone: 'text-amber-700 bg-amber-50' },
    out_of_stock: { label: 'Εξαντλημένο', tone: 'text-[#c62828] bg-red-50' },
  }[product.availabilityStatus];

  // Price calculations
  const grossPrice = product.salePrice || product.price;
  const oldGrossPrice = product.salePrice ? product.price : null;
  const netPrice = grossPrice / 1.24;
  const oldNetPrice = oldGrossPrice ? oldGrossPrice / 1.24 : null;

  // Related products
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.categoryIds.some((cid) => product.categoryIds.includes(cid)))
    .slice(0, 4);
  const recommendedProducts = products
    .filter((p) => p.id !== product.id && p.active && (p.featured || p.popular))
    .slice(0, 4);
  const comboProducts = products
    .filter((p) => p.id !== product.id && p.active && p.categoryIds.some((cid) => product.categoryIds.includes(cid)))
    .slice(0, 3);
  const comboRegularTotal = comboProducts.reduce((sum, p) => sum + (p.salePrice || p.price), 0);
  const comboDiscountedTotal = comboProducts.reduce(
    (sum, p) => sum + Math.round((p.salePrice || p.price) * 0.9 * 100) / 100,
    0,
  );
  const comboOfferId = `super-deal-${[product.id, ...comboProducts.map((p) => p.id)].sort().join('-')}`;
  const alternativeProducts = products
    .filter((p) => p.id !== product.id && p.active && p.categoryIds.some((cid) => product.categoryIds.includes(cid)))
    .slice(2, 14);
  const visibleAlternativeProducts = alternativeProducts.slice(alternativeStart, alternativeStart + 4);

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
              <p>SKU: ${product.sku}</p>
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
    <div className="max-w-7xl mx-auto px-3 py-5 sm:px-4 sm:py-7 space-y-8">
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
        <span className="text-neutral-900 font-semibold truncate max-w-xs">{displayProductName}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
        {/* Left: Gallery (Col 5) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative w-full h-[26rem] sm:h-[34rem] bg-white border border-[#cfd8dc] rounded-2xl p-5 flex items-center justify-center overflow-hidden shadow-md">
            <div className="absolute right-4 top-4 z-10 flex flex-col items-center gap-1 rounded-full bg-white/95 p-1 shadow-sm">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`rounded-full p-1.5 ${isWish ? 'text-[#e21b22]' : 'text-neutral-600 hover:text-[#e21b22]'}`}
                title="Προσθήκη στα αγαπημένα"
                aria-label="Προσθήκη στα αγαπημένα"
              >
                <Heart className={`h-4 w-4 ${isWish ? 'fill-[#e21b22]' : ''}`} />
              </button>
              <button
                onClick={() => toggleCompare(product.id)}
                className={`rounded-full p-1.5 ${isComp ? 'text-[#e21b22]' : 'text-neutral-600 hover:text-[#e21b22]'}`}
                title="Σύγκριση προϊόντος"
                aria-label="Σύγκριση προϊόντος"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>
            {product.salePrice && (
              <span className="absolute top-3 left-3 bg-[#e21b22] text-white text-xs font-display font-black px-2 py-1 rounded shadow z-10">
                ΠΡΟΣΦΟΡΑ
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="flex h-full w-full cursor-zoom-in items-center justify-center"
              aria-label="Μεγέθυνση εικόνας προϊόντος"
            >
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-200 hover:scale-[1.02]"
              />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded border p-1 shrink-0 bg-[#fafafa] ${
                    selectedImage === idx ? 'border-[#e21b22] ring-2 ring-[#e21b22]/30' : 'border-neutral-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Center/Right: Product Details & Actions (Col 7) */}
        <div className="relative lg:col-span-6 flex flex-col justify-between space-y-5 rounded-2xl border border-[#cfd8dc] bg-[#f3f4f5] p-5 sm:p-6 shadow-md">
          <div className="space-y-3">
            {/* Brand & Meta Info */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => brand && onNavigate(`/brand/${brand.slug}`)}
                  className="font-display font-extrabold text-sm text-[#e21b22] hover:underline  tracking-wider"
                >
                  {brand?.name}
                </button>
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
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 leading-tight tracking-tight">
              {displayProductName}
            </h1>

            <p className="text-xs sm:text-sm text-neutral-600">
              Κωδικός προϊόντος: <span className="font-mono-spec">{product.sku}</span>
            </p>

            {/* Rating & Availability */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center text-[#ff5a00] font-bold">
                <Star className="w-4 h-4 fill-[#ff5a00] text-[#ff5a00] mr-1" />
                <span className="text-neutral-800 text-sm">{displayRating}</span>
                <span className="text-neutral-400 font-normal ml-1">({displayReviewCount} κριτικές)</span>
              </div>

              {product.stockQuantity > 0 ? (
                <div className={`inline-flex items-center font-bold text-xs px-2.5 py-1 rounded-md ${availability.tone}`}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  <span>{availability.label}</span>
                </div>
              ) : (
                <div className={`inline-flex items-center font-bold text-xs px-2.5 py-1 rounded-md ${availability.tone}`}>
                  <AlertCircle className="w-4 h-4 mr-1.5" />
                  <span>{availability.label}</span>
                </div>
              )}
            </div>

            {/* Variants Selector (if applicable) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-neutral-800  tracking-wide block">
                  ΕΠΙΛΟΓΗ ΕΚΔΟΣΗΣ / ΣΥΣΚΕΥΑΣΙΑΣ:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                        selectedVariantId === v.id
                          ? 'border-[#e21b22] bg-[#e21b22] text-white font-bold'
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
            <div className="bg-white border border-[#cfd8dc] rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-baseline justify-between">
                <div>
              <div className="text-3xl font-bold font-price text-neutral-900 leading-tight">
                    €{(isB2BMode ? netPrice : grossPrice).toFixed(2)}
                    <span className="text-xs font-normal text-neutral-500 ml-2">
                      {isB2BMode ? 'Χωρίς ΦΠΑ 24%' : 'με ΦΠΑ 24%'}
                    </span>
                  </div>
                  <div className="text-xs font-price text-[#e21b22] font-semibold mt-0.5">
                    {isB2BMode
                      ? `Τελική τιμή λιανικής: €${grossPrice.toFixed(2)} με ΦΠΑ`
                      : `Καθαρή αξία B2B: €${netPrice.toFixed(2)} χωρίς ΦΠΑ`}
                  </div>
                </div>

                {oldGrossPrice && (
                  <div className="text-right">
                    <span className="text-sm text-neutral-400 line-through font-price">
                      €{(isB2BMode ? oldNetPrice! : oldGrossPrice).toFixed(2)}
                    </span>
                    <span className="block text-xs font-bold text-[#e21b22] font-display">
                      ΚΕΡΔΙΖΕΤΕ €{(oldGrossPrice - grossPrice).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Stepper & Cart Action Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <div className="flex items-center border border-[#cfd8dc] rounded-lg overflow-hidden w-full sm:w-auto shrink-0 justify-between bg-white">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-none px-2.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-3.5 py-2 font-mono-spec font-bold text-sm bg-white text-neutral-900 min-w-[2.5rem] text-center border-x border-neutral-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="rounded-none px-2.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold transition-colors"
                >
                  +
                </button>
              </div>

              <button
                id="pdp-add-to-cart-btn"
                onClick={() => addToCart(product, quantity, selectedVariantId)}
                className="w-full sm:flex-1 bg-[#e21b22] hover:bg-[#c81016] active:bg-[#a30b10] text-white font-display font-bold  tracking-wider py-4 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-md transition-all text-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>ΠΡΟΣΘΗΚΗ ΣΤΟ ΚΑΛΑΘΙ</span>
              </button>
            </div>

            <div className="rounded-2xl bg-white p-3 shadow-md border border-[#cfd8dc] space-y-2">
              <h3 className="font-display font-bold text-sm text-neutral-900">Επιλογές παράδοσης</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div className="h-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-[11px] text-neutral-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">Αποστολή με ACS</span>
                  <span className="inline-flex whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 font-bold">1-2 ημέρες</span>
                </div>
                <div className="mt-2 text-neutral-500">Δωρεάν μεταφορικά για αγορές άνω των 50€</div>
              </div>
              <div className="h-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-[11px] text-neutral-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">Παραλαβή από κατάστημα</span>
                  <span className="font-bold text-[#159a91]">ΔΩΡΕΑΝ</span>
                </div>
                <div className="mt-2 text-neutral-500">Λεωφ. Σαλαμίνος 111, Κερατσίνι</div>
              </div>
              <div className="h-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-[11px] text-neutral-800">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">Παραλαβή από Box Now</span>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 font-bold">24/7</span>
                </div>
                <div className="mt-2 text-neutral-500">Παράδοση σε διαθέσιμο locker της επιλογής σας</div>
              </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Μεγέθυνση εικόνας προϊόντος"
        >
          <div
            className="relative max-h-[90vh] max-w-[92vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
        className="absolute left-1/2 top-full z-10 mt-4 -translate-x-1/2 rounded-full border border-neutral-200 bg-white p-2 text-neutral-800 shadow-lg transition-colors hover:bg-[#e21b22] hover:text-white"
              aria-label="Κλείσιμο εικόνας"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="max-h-[90vh] max-w-[calc(92vw-48px)] rounded-xl bg-white object-contain p-4 shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white border border-[#cfd8dc] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex gap-0 border-b border-[#cfd8dc] bg-white p-0 overflow-x-auto rounded-t-2xl [&>button]:font-black [&>button]:rounded-t-xl [&>button]:rounded-b-none">
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-2.5 font-display font-bold text-xs sm:text-sm  tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'specs'
                ? 'border-[#e21b22] bg-white text-[#e21b22]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΤΕΧΝΙΚΑ ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ
          </button>
          <button
            onClick={() => setActiveTab('description')}
            className={`px-4 py-2.5 font-display font-bold text-xs sm:text-sm  tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'description'
                ? 'border-[#e21b22] bg-white text-[#e21b22]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΠΕΡΙΓΡΑΦΗ &amp; ΕΞΟΠΛΙΣΜΟΣ
          </button>
          <button
            onClick={() => setActiveTab('warranty')}
            className={`px-4 py-2.5 font-display font-bold text-xs sm:text-sm  tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'warranty'
                ? 'border-[#e21b22] bg-white text-[#e21b22]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΕΓΓΥΗΣΗ &amp; SERVICE
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2.5 font-display font-bold text-xs sm:text-sm  tracking-wider whitespace-nowrap transition-colors border-b-2 ${
              activeTab === 'reviews'
                ? 'border-[#e21b22] bg-white text-[#e21b22]'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            ΚΡΙΤΙΚΕΣ ({displayReviewCount})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5">
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-base text-neutral-900 ">
                ΑΝΑΛΥΤΙΚΕΣ ΤΕΧΝΙΚΕΣ ΠΡΟΔΙΑΓΡΑΦΕΣ
              </h3>
              <div className="border border-[#cfd8dc] rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <tbody>
                    {product.specifications.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-[#fafafa]' : 'bg-white'}>
                        <td className="p-2.5 font-bold text-neutral-700 w-1/3 border-b border-neutral-200">
                          {spec.key}
                        </td>
                        <td className="p-2.5 text-neutral-900 font-mono-spec border-b border-neutral-200">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                    {product.weight > 0 && (
                      <tr className="bg-white">
                        <td className="p-2.5 font-bold text-neutral-700 border-b border-neutral-200">Βάρος</td>
                        <td className="p-2.5 text-neutral-900 font-mono-spec border-b border-neutral-200">
                          {product.weight} kg
                        </td>
                      </tr>
                    )}
                    {product.dimensions && (product.dimensions.length > 0 || product.dimensions.width > 0 || product.dimensions.height > 0) && (
                      <tr className="bg-[#fafafa]">
                        <td className="p-2.5 font-bold text-neutral-700 border-b border-neutral-200">Διαστάσεις (ΜxΠxΥ)</td>
                        <td className="p-2.5 text-neutral-900 font-mono-spec border-b border-neutral-200">
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
                <h3 className="font-display font-bold text-base text-neutral-900  mb-2">
                  ΕΠΑΓΓΕΛΜΑΤΙΚΗ ΠΑΡΟΥΣΙΑΣΗ
                </h3>
                <p className="whitespace-pre-line leading-relaxed">{product.fullDescription || product.shortDescription}</p>
              </div>

              {product.includedItems && product.includedItems.length > 0 && (
                <div className="bg-[#f8f9fa] border border-[#cfd8dc] p-4 rounded">
                  <h4 className="font-display font-bold text-sm text-neutral-900  mb-2 flex items-center space-x-1.5">
                    <Boxes className="w-4 h-4 text-[#e21b22]" />
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
              <h3 className="font-display font-bold text-base text-neutral-900 ">
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
                Για service και γνήσια ανταλλακτικά, επικοινωνήστε με το τμήμα τεχνικής υποστήριξης στο <strong>2110069347</strong>.
              </p>
            </div>
          )}


          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <div>
                  <h3 className="font-display font-bold text-base text-neutral-900 ">
                    ΑΞΙΟΛΟΓΗΣΕΙΣ ΕΠΑΓΓΕΛΜΑΤΙΩΝ ({displayReviewCount})
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-sm text-neutral-800">{displayRating} στα 5</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsReviewFormOpen((open) => !open)}
                  className="bg-[#e21b22] text-white text-xs font-display font-bold  px-4 py-2 rounded"
                >
                  ΓΡΑΨΤΕ ΚΡΙΤΙΚΗ
                </button>
              </div>

              {isReviewFormOpen && (
                <form
                  className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setIsReviewFormOpen(false);
                    showToast('Η κριτική σας καταχωρήθηκε για έλεγχο');
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input required placeholder="Το όνομά σας" className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs" />
                    <select className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs" defaultValue="5">
                      <option value="5">★★★★★ — 5/5</option>
                      <option value="4">★★★★☆ — 4/5</option>
                      <option value="3">★★★☆☆ — 3/5</option>
                    </select>
                  </div>
                  <textarea required placeholder="Γράψτε την εμπειρία σας..." className="min-h-24 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs" />
                  <button type="submit" className="rounded-lg bg-[#e21b22] px-4 py-2 text-xs font-display font-bold  text-white hover:bg-[#c81016]">
                    Υποβολή κριτικής
                  </button>
                </form>
              )}

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
                    <span className="font-bold text-neutral-800">Γιώργος Π. (Εργολάβος)</span>
                    <span className="text-neutral-400">8 Ιαν 2026</span>
                  </div>
                  <div className="flex text-amber-500">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-600 leading-relaxed">
                    Στιβαρό μηχάνημα, εύκολο στη χρήση και πολύ καλή παράδοση. Θα το ξαναεπέλεγα.
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

      {/* Super deal offer */}
      {comboProducts.length > 0 && (
        <div className="mx-auto w-full max-w-7xl space-y-5 rounded-2xl border border-[#f2b8b8] bg-[#fff7f7] p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-black text-xl text-neutral-900  tracking-wide">SUPER DEAL</h2>
              <p className="text-xs text-neutral-600">Συνδύασε τα προϊόντα και κέρδισε επιπλέον έκπτωση.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right text-xs">
                <span className="mr-2 text-neutral-400 line-through">€{comboRegularTotal.toFixed(2)}</span>
                <strong className="text-lg text-[#e21b22]">€{comboDiscountedTotal.toFixed(2)}</strong>
              </div>
              <span className="rounded-full bg-[#e21b22] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">-10% ΠΡΟΣΦΟΡΑ</span>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-5 lg:gap-7">
            {comboProducts.map((p, index) => (
              <React.Fragment key={p.id}>
                <div className="min-w-0 flex-1">
                  <ProductCard product={p} onNavigate={onNavigate} hideAddToCart dealPrice={(p.salePrice || p.price) * 0.9} />
                </div>
                {index < comboProducts.length - 1 && (
                  <span className="flex shrink-0 items-center justify-center self-center px-1 text-5xl font-black leading-none text-[#e21b22]" aria-hidden="true">+</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-end border-t border-[#f2c7c7] pt-4">
            <button
              onClick={() => {
                comboProducts.forEach((p) => addToCart(p, 1, undefined, Math.round((p.salePrice || p.price) * 0.9 * 100) / 100, comboOfferId));
                showToast('Η προσφορά προστέθηκε στο καλάθι');
              }}
              className="rounded-xl bg-[#e21b22] px-5 py-3 text-xs font-display font-bold  tracking-wider text-white shadow hover:bg-[#c81016]"
            >
              ΠΡΟΣΘΗΚΗ ΟΛΩΝ ΣΤΟ ΚΑΛΑΘΙ
            </button>
          </div>
        </div>
      )}

      {/* Recommended products */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#cfd8dc] pb-2">
            <h2 className="font-display font-black text-xl text-neutral-900  tracking-wide">ΠΡΟΤΕΙΝΟΜΕΝΑ ΓΙΑ ΕΣΕΝΑ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedProducts.map((p) => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </div>
      )}

      {/* Alternatives / similar products */}
      {alternativeProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-[#cfd8dc] pb-2">
            <h2 className="font-display font-black text-xl text-neutral-900  tracking-wide">
              ΠΑΡΟΜΟΙΑ / ΕΝΑΛΛΑΚΤΙΚΑ ΠΡΟΪΟΝΤΑ
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAlternativeStart((start) => Math.max(0, start - 4))}
                disabled={alternativeStart === 0}
                className="rounded-full border border-neutral-300 bg-white p-2 text-neutral-700 shadow-sm transition hover:border-[#e21b22] hover:text-[#e21b22] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Προηγούμενα παρόμοια προϊόντα"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <button
                type="button"
                onClick={() => setAlternativeStart((start) => Math.min(Math.max(0, alternativeProducts.length - 4), start + 4))}
                disabled={alternativeStart + 4 >= alternativeProducts.length}
                className="rounded-full border border-neutral-300 bg-white p-2 text-neutral-700 shadow-sm transition hover:border-[#e21b22] hover:text-[#e21b22] disabled:cursor-not-allowed disabled:opacity-35"
                aria-label="Επόμενα παρόμοια προϊόντα"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleAlternativeProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
