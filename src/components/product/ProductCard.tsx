import React from 'react';
import {
  Heart,
  Scale,
  Eye,
  ShoppingCart,
  Star,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Product } from '../../types/product';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onNavigate: (route: string) => void;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  layout = 'grid',
}) => {
  const {
    brands,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    setQuickViewProduct,
    isB2BMode,
  } = useStore();

  const brand = brands.find((b) => b.id === product.brandId);
  const isWish = isInWishlist(product.id);
  const isComp = isInCompare(product.id);

  // Price calculations
  const grossPrice = product.salePrice || product.price;
  const oldGrossPrice = product.salePrice ? product.price : null;
  const netPrice = grossPrice / 1.24;
  const oldNetPrice = oldGrossPrice ? oldGrossPrice / 1.24 : null;

  const discountPercent = oldGrossPrice
    ? Math.round(((oldGrossPrice - grossPrice) / oldGrossPrice) * 100)
    : 0;

  const handleCardClick = () => {
    onNavigate(`/product/${product.slug}`);
  };

  // List layout view
  if (layout === 'list') {
    return (
      <div
        id={`product-card-${product.id}`}
        className="bg-white border border-[#cfd8dc] rounded p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-[#1e1e1e] hover:shadow-md transition-all group"
      >
        {/* Image & Badges */}
        <div
          onClick={handleCardClick}
          className="relative w-full md:w-44 h-44 shrink-0 bg-[#fbfbfb] p-3 flex items-center justify-center cursor-pointer overflow-hidden rounded"
        >
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-[#af101a] text-white text-[11px] font-display font-black px-1.5 py-0.5 rounded shadow z-10">
              -{discountPercent}%
            </span>
          )}
          <img
            src={product.images[0]}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 text-xs mb-1">
            <span className="font-display font-bold text-[#af101a] tracking-wider uppercase">
              {brand?.name}
            </span>
            <span className="text-neutral-400">•</span>
            <span className="text-neutral-500 font-mono-spec text-[11px]">SKU: {product.sku}</span>
          </div>

          <h3
            onClick={handleCardClick}
            className="font-semibold text-sm md:text-base text-neutral-900 hover:text-[#af101a] cursor-pointer transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </h3>

          <p className="text-xs text-neutral-600 line-clamp-2 mt-1">
            {product.shortDescription}
          </p>

          {/* Quick Technical Specs micro-chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {product.attributes.voltage && (
              <span className="bg-[#0d47a1]/10 text-[#0d47a1] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#0d47a1]/20 font-mono-spec">
                {product.attributes.voltage}
              </span>
            )}
            {product.attributes.motor && (
              <span className="bg-[#37474f]/10 text-[#37474f] text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#37474f]/20 font-mono-spec">
                {product.attributes.motor}
              </span>
            )}
            {product.attributes.maxTorque && (
              <span className="bg-neutral-100 text-neutral-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-neutral-300 font-mono-spec">
                {product.attributes.maxTorque}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-3 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold ml-1 text-neutral-800">{product.rating}</span>
              <span className="text-neutral-400 text-[11px] ml-0.5">({product.reviewCount})</span>
            </div>

            {product.stockQuantity > 0 ? (
              <span className="inline-flex items-center text-[11px] text-[#2e7d32] font-semibold">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Σε απόθεμα ({product.stockQuantity} τεμ.)
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] text-[#c62828] font-semibold">
                <AlertCircle className="w-3 h-3 mr-1" /> Κατόπιν παραγγελίας
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="w-full md:w-56 shrink-0 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-[#cfd8dc] pt-3 md:pt-0 md:pl-4">
          <div className="text-right w-full">
            {/* Dual Pricing Display */}
            {isB2BMode ? (
              <div>
                <div className="text-2xl font-bold font-mono-spec text-neutral-900">
                  €{netPrice.toFixed(2)}
                  <span className="text-[11px] font-normal text-neutral-500 ml-1">χωρίς ΦΠΑ</span>
                </div>
                <div className="text-xs text-[#af101a] font-medium font-mono-spec">
                  €{grossPrice.toFixed(2)} με ΦΠΑ 24%
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold font-mono-spec text-[#af101a]">
                  €{grossPrice.toFixed(2)}
                  <span className="text-[11px] font-normal text-neutral-500 ml-1">με ΦΠΑ</span>
                </div>
                <div className="text-xs text-neutral-600 font-medium font-mono-spec">
                  €{netPrice.toFixed(2)} χωρίς ΦΠΑ
                </div>
              </div>
            )}

            {oldGrossPrice && (
              <div className="text-xs text-neutral-400 line-through font-mono-spec mt-0.5">
                €{(isB2BMode ? oldNetPrice! : oldGrossPrice).toFixed(2)}
              </div>
            )}
          </div>

          <div className="w-full space-y-2 mt-4">
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full bg-[#af101a] hover:bg-[#b71c1c] text-white text-xs font-display font-bold uppercase tracking-wider py-2.5 rounded flex items-center justify-center space-x-1.5 shadow transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>ΠΡΟΣΘΗΚΗ</span>
            </button>

            <div className="flex items-center justify-between w-full text-xs text-neutral-500 pt-1">
              <button
                onClick={() => setQuickViewProduct(product)}
                className="hover:text-neutral-900 flex items-center space-x-1"
                title="Γρήγορη Προεπισκόπηση"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Quick View</span>
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center space-x-1 ${isWish ? 'text-[#af101a]' : 'hover:text-[#af101a]'}`}
                title="Προσθήκη στα αγαπημένα"
              >
                <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-[#af101a]' : ''}`} />
                <span>Wishlist</span>
              </button>
              <button
                onClick={() => toggleCompare(product.id)}
                className={`flex items-center space-x-1 ${isComp ? 'text-[#0d47a1]' : 'hover:text-[#0d47a1]'}`}
                title="Σύγκριση τεχνικών προδιαγραφών"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Σύγκριση</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid layout (Standard)
  return (
    <div
      id={`product-card-${product.id}`}
      className="bg-white border border-[#cfd8dc] rounded p-3.5 flex flex-col justify-between hover:border-[#1e1e1e] hover:shadow-lg transition-all duration-200 relative group"
    >
      {/* Top Badges & Actions */}
      <div>
        <div className="flex items-start justify-between relative mb-2">
          {/* Discount badge */}
          {discountPercent > 0 ? (
            <span className="bg-[#af101a] text-white text-[11px] font-display font-black px-1.5 py-0.5 rounded shadow">
              -{discountPercent}%
            </span>
          ) : (
            <span className="text-[10px] font-display font-bold tracking-wider text-neutral-400 uppercase">
              {brand?.name}
            </span>
          )}

          {/* Quick Action Floating Icons */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-1.5 rounded-full hover:bg-neutral-100 transition-colors ${
                isWish ? 'text-[#af101a]' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              title="Προσθήκη στη λίστα επιθυμιών"
            >
              <Heart className={`w-4 h-4 ${isWish ? 'fill-[#af101a]' : ''}`} />
            </button>
            <button
              onClick={() => toggleCompare(product.id)}
              className={`p-1.5 rounded-full hover:bg-neutral-100 transition-colors ${
                isComp ? 'text-[#0d47a1]' : 'text-neutral-400 hover:text-neutral-700'
              }`}
              title="Σύγκριση τεχνικών χαρακτηριστικών"
            >
              <Scale className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Image */}
        <div
          onClick={handleCardClick}
          className="relative w-full h-44 bg-[#fafafa] rounded p-2 flex items-center justify-center cursor-pointer overflow-hidden mb-3"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Quick View Button on Hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="absolute bottom-2 inset-x-4 bg-[#1e1e1e]/90 hover:bg-[#1e1e1e] text-white text-xs font-semibold py-1.5 rounded flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Γρήγορη Ματιά</span>
          </button>
        </div>

        {/* Brand & SKU info */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
          <span className="font-display font-bold text-[#af101a] tracking-wider uppercase">
            {brand?.name}
          </span>
          <span className="font-mono-spec">SKU: {product.sku}</span>
        </div>

        {/* Product Name */}
        <h3
          onClick={handleCardClick}
          className="font-semibold text-xs md:text-sm text-neutral-900 hover:text-[#af101a] cursor-pointer transition-colors line-clamp-2 leading-snug mb-2 min-h-[2.5rem]"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Spec tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {product.attributes.voltage && (
            <span className="bg-[#0d47a1]/10 text-[#0d47a1] text-[10px] font-bold px-1.5 py-0.5 rounded font-mono-spec">
              {product.attributes.voltage}
            </span>
          )}
          {product.attributes.motor && (
            <span className="bg-[#37474f]/10 text-[#37474f] text-[10px] font-bold px-1.5 py-0.5 rounded font-mono-spec">
              {product.attributes.motor.includes('Brushless') ? 'BRUSHLESS' : product.attributes.motor}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between text-[11px] mb-3">
          {product.stockQuantity > 0 ? (
            <span className="inline-flex items-center text-[#2e7d32] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] mr-1.5 animate-pulse" />
              ΣΕ ΑΠΟΘΕΜΑ
            </span>
          ) : (
            <span className="inline-flex items-center text-[#c62828] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c62828] mr-1.5" />
              ΚΑΤΟΠΙΝ ΠΑΡΑΓΓΕΛΙΑΣ
            </span>
          )}

          <div className="flex items-center text-amber-500 text-[11px]">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
            <span className="font-bold text-neutral-700">{product.rating}</span>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="border-t border-[#f0f0f0] pt-2.5 mt-auto">
        <div className="flex items-baseline justify-between mb-2">
          {isB2BMode ? (
            <div>
              <div className="text-lg md:text-xl font-bold font-mono-spec text-neutral-900 leading-none">
                €{netPrice.toFixed(2)}
              </div>
              <div className="text-[10px] text-[#af101a] font-mono-spec">
                (€{grossPrice.toFixed(2)} με ΦΠΑ)
              </div>
            </div>
          ) : (
            <div>
              <div className="text-lg md:text-xl font-bold font-mono-spec text-[#af101a] leading-none">
                €{grossPrice.toFixed(2)}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono-spec">
                (€{netPrice.toFixed(2)} χωρ. ΦΠΑ)
              </div>
            </div>
          )}

          {oldGrossPrice && (
            <span className="text-[11px] text-neutral-400 line-through font-mono-spec">
              €{(isB2BMode ? oldNetPrice! : oldGrossPrice).toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={() => addToCart(product, 1)}
          className="w-full bg-[#af101a] hover:bg-[#b71c1c] active:bg-[#8e0c14] text-white text-xs font-display font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>ΠΡΟΣΘΗΚΗ</span>
        </button>
      </div>
    </div>
  );
};
