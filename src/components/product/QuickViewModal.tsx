import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Heart,
  Scale,
  CheckCircle2,
  AlertCircle,
  Truck,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface QuickViewModalProps {
  onNavigate: (route: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ onNavigate }) => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    toggleCompare,
    isInWishlist,
    isInCompare,
    brands,
    isB2BMode,
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!quickViewProduct) return null;

  const brand = brands.find((b) => b.id === quickViewProduct.brandId);
  const inWishlist = isInWishlist(quickViewProduct.id);
  const inCompare = isInCompare(quickViewProduct.id);

  const priceToUse = quickViewProduct.salePrice || quickViewProduct.price;
  const displayPrice = isB2BMode ? priceToUse / 1.24 : priceToUse;
  const originalPrice = quickViewProduct.salePrice
    ? isB2BMode
      ? quickViewProduct.price / 1.24
      : quickViewProduct.price
    : null;

  const handleClose = () => {
    setQuickViewProduct(null);
    setQuantity(1);
    setSelectedImageIndex(0);
  };

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity);
  };

  const handleGoToDetails = () => {
    handleClose();
    onNavigate(`/product/${quickViewProduct.slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Dialog */}
      <div
        id="quick-view-modal-dialog"
        className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 border border-neutral-200"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors z-20"
          aria-label="Κλείσιμο"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-[#fcfcfc] border border-neutral-200 rounded-lg p-4 flex items-center justify-center overflow-hidden">
              <img
                src={quickViewProduct.images[selectedImageIndex] || quickViewProduct.images[0]}
                alt={quickViewProduct.name}
                className="max-h-full max-w-full object-contain"
              />

              {quickViewProduct.salePrice && (
                <div className="absolute top-3 left-3 bg-[#e21b22] text-white text-[11px] font-bold px-2.5 py-1 rounded shadow  font-display tracking-wider">
                  ΕΚΠΤΩΣΗ -{Math.round((1 - quickViewProduct.salePrice / quickViewProduct.price) * 100)}%
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-16 h-16 p-1 border rounded bg-white shrink-0 transition-all ${
                      idx === selectedImageIndex
                        ? 'border-[#e21b22] ring-2 ring-red-100'
                        : 'border-neutral-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              {/* Brand and SKU */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <span className="font-bold text-[#e21b22]  tracking-wider">
                  {brand?.name || 'Nomikos Pro'}
                </span>
                <span className="font-mono-spec">SKU: {quickViewProduct.sku}</span>
              </div>

              <h2 className="font-display font-black text-xl md:text-2xl text-neutral-900 leading-snug">
                {quickViewProduct.name}
              </h2>

              {/* Stock Status */}
              <div className="flex items-center space-x-3 my-2 text-xs">
                {quickViewProduct.stockQuantity > 0 ? (
                  <span className="inline-flex items-center text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Άμεσα Διαθέσιμο ({quickViewProduct.stockQuantity} τεμ.)
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" />
                    Κατόπιν παραγγελίας (2-4 ημέρες)
                  </span>
                )}
                <span className="text-neutral-400 font-mono-spec">EAN: {quickViewProduct.ean}</span>
              </div>

              {/* Price */}
              <div className="my-4 p-3 bg-neutral-50 border border-neutral-200 rounded">
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-black font-mono-spec text-neutral-900">
                    €{displayPrice.toFixed(2)}
                  </span>
                  {originalPrice && (
                    <span className="text-sm text-neutral-400 line-through font-mono-spec">
                      €{originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-xs text-neutral-500">
                    {isB2BMode ? 'καθαρή αξία (χωρίς ΦΠΑ)' : 'συμπεριλαμβανομένου ΦΠΑ 24%'}
                  </span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                {quickViewProduct.shortDescription}
              </p>

              {/* Highlights Specifications */}
              {quickViewProduct.specifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="text-[11px] font-bold text-neutral-700  tracking-wider font-display mb-2">
                    ΒΑΣΙΚΕΣ ΠΡΟΔΙΑΓΡΑΦΕΣ
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {quickViewProduct.specifications.slice(0, 4).map((spec, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-neutral-100">
                        <span className="text-neutral-500">{spec.key}:</span>
                        <span className="font-semibold text-neutral-800 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-3 pt-4 border-t border-neutral-200">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-neutral-300 rounded">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-bold font-mono-spec min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 text-neutral-600 hover:bg-neutral-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#e21b22] hover:bg-[#c81016] text-white py-2.5 px-4 rounded font-display font-bold text-xs  tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>ΠΡΟΣΘΗΚΗ ΣΤΟ ΚΑΛΑΘΙ</span>
                </button>
              </div>

              {/* Wishlist, Compare & Full Details links */}
              <div className="flex items-center justify-between pt-2 text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(quickViewProduct.id)}
                    className={`flex items-center space-x-1 ${
                      inWishlist ? 'text-[#e21b22] font-bold' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                    <span>{inWishlist ? 'Στη Λίστα' : 'Επιθυμητά'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleCompare(quickViewProduct.id)}
                    className={`flex items-center space-x-1 ${
                      inCompare ? 'text-sky-700 font-bold' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    <span>{inCompare ? 'Σε Σύγκριση' : 'Σύγκριση'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleGoToDetails}
                  className="text-[#e21b22] hover:underline font-bold flex items-center space-x-1"
                >
                  <span>Πλήρης Σελίδα Προϊόντος</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
