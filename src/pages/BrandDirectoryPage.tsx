import React from 'react';
import { Award, ChevronRight, ExternalLink } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';

interface BrandDirectoryPageProps {
  brandSlug?: string;
  onNavigate: (route: string) => void;
}

export const BrandDirectoryPage: React.FC<BrandDirectoryPageProps> = ({
  brandSlug,
  onNavigate,
}) => {
  const { brands, products } = useStore();

  const currentBrand = brands.find((b) => b.slug === brandSlug);
  const brandProducts = currentBrand
    ? products.filter((p) => p.brandId === currentBrand.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-xs text-neutral-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-neutral-900">
          Αρχική
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => onNavigate('/brands')} className="hover:text-neutral-900">
          Brands
        </button>
        {currentBrand && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 font-bold">{currentBrand.name}</span>
          </>
        )}
      </nav>

      {/* Brand Header */}
      {currentBrand ? (
        <div className="bg-[#181818] text-white p-6 sm:p-8 rounded-lg border border-[#2e2e2e] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-[#af101a] text-white text-[10px] font-bold px-2.5 py-0.5 rounded uppercase font-mono-spec">
              ΕΠΙΣΗΜΟΣ ΔΙΑΝΟΜΕΑΣ ΕΛΛΑΔΟΣ
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white">
              {currentBrand.name} HEAVY-DUTY EQUIPMENT
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {currentBrand.description}
            </p>
          </div>

          <div className="text-right shrink-0 bg-[#222] p-4 rounded border border-[#333]">
            <div className="text-2xl font-bold font-mono-spec text-[#ffb3ac]">
              {brandProducts.length}
            </div>
            <div className="text-xs text-neutral-400">Διαθέσιμα Εργαλεία &amp; Αξεσουάρ</div>
          </div>
        </div>
      ) : (
        <div className="border-b border-[#cfd8dc] pb-4">
          <h1 className="font-display font-black text-3xl text-neutral-900 uppercase tracking-tight">
            ΚΑΤΑΛΟΓΟΣ ΚΑΤΑΣΚΕΥΑΣΤΩΝ &amp; BRANDS
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Επιλέξτε κατασκευαστή για να δείτε όλα τα διαθέσιμα μηχανήματα και εξαρτήματα.
          </p>
        </div>
      )}

      {/* Brand Selector Strip */}
      <div className="flex flex-wrap gap-2">
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => onNavigate(`/brand/${b.slug}`)}
            className={`px-4 py-2 rounded text-xs font-display font-bold uppercase tracking-wider transition-colors border ${
              currentBrand?.id === b.id
                ? 'bg-[#af101a] text-white border-[#af101a]'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            {b.name} ({products.filter((p) => p.brandId === b.id).length})
          </button>
        ))}
      </div>

      {/* Brand Products Grid */}
      {brandProducts.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-neutral-900 uppercase">
            ΕΡΓΑΛΕΙΑ {currentBrand?.name} ({brandProducts.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brandProducts.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ) : currentBrand ? (
        <div className="text-center py-12 text-neutral-500">
          Δεν υπάρχουν διαθέσιμα προϊόντα για αυτόν τον κατασκευαστή αυτή τη στιγμή.
        </div>
      ) : null}
    </div>
  );
};
