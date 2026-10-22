import React from 'react';
import {
  Heart,
  ArrowLeftRight,
  ShoppingCart,
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
  hideAddToCart?: boolean;
  dealPrice?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  layout = 'grid',
  hideAddToCart = false,
  dealPrice,
}) => {
  const {
    brands,
    addToCart,
    toggleWishlist,
    isInWishlist,
    toggleCompare,
    isInCompare,
    isB2BMode,
  } = useStore();

  const brand = brands.find((b) => b.id === product.brandId);
  const isWish = isInWishlist(product.id);
  const isComp = isInCompare(product.id);

  // Price calculations
  const grossPrice = dealPrice ?? product.salePrice ?? product.price;
  const oldGrossPrice = dealPrice !== undefined ? (product.salePrice || product.price) : (product.salePrice ? product.price : null);
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
        className="bg-white border border-[#cfd8dc] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:border-[#1e1e1e] hover:shadow-md transition-all group"
      >
        {/* Image & Badges */}
        <div
          onClick={handleCardClick}
          className="relative w-full md:w-44 h-44 shrink-0 bg-transparent p-3 flex items-center justify-center cursor-pointer overflow-hidden rounded"
        >
          {discountPercent > 0 && (
            <span className="absolute top-2 left-2 bg-[#e21b22] text-white text-[11px] font-display font-black px-1.5 py-0.5 rounded shadow z-10">
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
          <h3
            onClick={handleCardClick}
            className="font-semibold text-sm md:text-base text-neutral-900 hover:text-[#e21b22] cursor-pointer transition-colors line-clamp-2 leading-snug"
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

          <div className="flex items-center mt-3 text-xs">
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
            {oldGrossPrice && (
              <span className="mr-2 text-xs text-neutral-400 line-through font-mono-spec">
                €{(isB2BMode ? oldNetPrice! : oldGrossPrice).toFixed(2)}
              </span>
            )}
            <span className="text-2xl font-bold font-price text-[#e21b22]">
              €{grossPrice.toFixed(2)}
            </span>
          </div>

          <div className="w-full space-y-2 mt-4">
            <button
              onClick={() => addToCart(product, 1)}
              className="w-full bg-[#e21b22] hover:bg-[#c81016] text-white text-xs font-display font-bold  tracking-wider py-2.5 rounded flex items-center justify-center space-x-1.5 shadow transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Προσθήκη</span>
            </button>

            <div className="flex items-center justify-end w-full text-xs text-neutral-500 pt-1">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center space-x-1 ${isWish ? 'text-[#e21b22]' : 'hover:text-[#e21b22]'}`}
                title="Προσθήκη στα αγαπημένα"
              >
                <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-[#e21b22]' : ''}`} />
                <span>Wishlist</span>
              </button>
              <button
                onClick={() => toggleCompare(product.id)}
                className={`flex items-center space-x-1 ${isComp ? 'text-[#0d47a1]' : 'hover:text-[#0d47a1]'}`}
                title="Σύγκριση τεχνικών προδιαγραφών"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
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
        className="bg-white border border-[#cfd8dc] rounded-xl p-2.5 flex flex-col justify-between hover:border-[#1e1e1e] hover:shadow-lg transition-all duration-200 relative group sm:rounded-2xl sm:p-3.5"
    >
      {/* Top Badges & Actions */}
      <div>
        <div className="relative mb-0 min-h-0">
          {/* Discount badge */}
          {discountPercent > 0 ? (
            <span className="bg-[#e21b22] text-white text-[11px] font-display font-black px-1.5 py-0.5 rounded shadow">
              -{discountPercent}%
            </span>
          ) : (
            <span />
          )}

        </div>

        {/* Product Image */}
        <div
          onClick={handleCardClick}
          className="relative w-full aspect-square max-h-56 flex items-center justify-center cursor-pointer overflow-hidden mb-2 sm:mb-3"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="max-h-full max-w-full object-contain mix-blend-multiply pt-2 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          <div className="absolute right-2 top-2 z-10 flex flex-col items-center gap-1 rounded-full bg-white/90 p-1 shadow-sm">
            <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} className={`rounded-full p-1.5 ${isWish ? 'text-[#e21b22]' : 'text-neutral-600 hover:text-[#e21b22]'}`} title="Προσθήκη στα αγαπημένα" aria-label="Προσθήκη στα αγαπημένα"><Heart className={`h-4 w-4 ${isWish ? 'fill-[#e21b22]' : ''}`} /></button>
            <button onClick={(e) => { e.stopPropagation(); toggleCompare(product.id); }} className={`rounded-full p-1.5 ${isComp ? 'text-[#e21b22]' : 'text-neutral-600 hover:text-[#e21b22]'}`} title="Σύγκριση προϊόντος" aria-label="Σύγκριση προϊόντος"><ArrowLeftRight className="h-4 w-4" /></button>
          </div>

        </div>

        {/* Availability and product code */}
        <div className="flex items-center text-xs mb-1">
          {product.stockQuantity > 0 ? (
            <span className="inline-flex items-center text-[#2e7d32] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32] mr-1.5 animate-pulse" />
              Άμεσα διαθέσιμο
            </span>
          ) : (
            <span className="inline-flex items-center text-[#c62828] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c62828] mr-1.5" />
              Κατόπιν παραγγελίας
            </span>
          )}
        </div>
        <div className="text-[10px] sm:text-xs text-neutral-600 mb-1.5">
          Κωδ. προϊόντος: <span className="font-mono-spec text-neutral-700">{product.sku}</span>
        </div>

        {/* Product Name */}
        <h3
          onClick={handleCardClick}
          className="font-semibold text-xs sm:text-sm text-neutral-900 hover:text-[#e21b22] cursor-pointer transition-colors line-clamp-2 leading-snug mb-1 min-h-[1.25rem]"
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

      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="border-t border-[#f0f0f0] pt-2.5 pb-1.5">
        <div className="flex items-baseline justify-end gap-3 mb-3">
          {oldGrossPrice && (
            <span className="text-[11px] text-neutral-400 line-through font-mono-spec">
              €{(isB2BMode ? oldNetPrice! : oldGrossPrice).toFixed(2)}
            </span>
          )}
          <div className="text-base sm:text-xl font-black font-price text-[#e21b22] leading-none">
            €{grossPrice.toFixed(2)}
          </div>
        </div>

        {!hideAddToCart && (
          <button
            onClick={() => addToCart(product, 1)}
            className="w-full bg-[#e21b22] hover:bg-[#c81016] active:bg-[#a30b10] text-white text-xs font-display font-bold  tracking-wider py-2 rounded flex items-center justify-center space-x-1.5 shadow-sm transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Προσθήκη</span>
          </button>
        )}
      </div>
    </div>
  );
};
