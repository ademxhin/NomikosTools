import React from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';

interface SearchResultsPageProps {
  query: string;
  onNavigate: (route: string) => void;
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({ query, onNavigate }) => {
  const { products, brands, categories } = useStore();

  const q = query.toLowerCase().trim();

  const results = products.filter((prod) => {
    const brand = brands.find((b) => b.id === prod.brandId)?.name.toLowerCase() || '';
    const matchTitle = prod.name.toLowerCase().includes(q);
    const matchSku = prod.sku.toLowerCase().includes(q);
    const matchEan = prod.ean.includes(q);
    const matchBrand = brand.includes(q);
    const matchDesc = prod.shortDescription.toLowerCase().includes(q);
    const matchCategory = categories.some(
      (c) => prod.categoryIds.includes(c.id) && c.name.toLowerCase().includes(q)
    );
    return matchTitle || matchSku || matchEan || matchBrand || matchDesc || matchCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 select-none">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1.5 text-xs text-neutral-500 font-medium">
        <button onClick={() => onNavigate('/')} className="hover:text-neutral-900">
          Αρχική
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-neutral-900 font-bold">Αποτελέσματα Αναζήτησης</span>
      </nav>

      <div className="border-b border-[#cfd8dc] pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase tracking-tight flex items-center space-x-2">
            <Search className="w-7 h-7 text-[#af101a]" />
            <span>ΑΠΟΤΕΛΕΣΜΑΤΑ ΓΙΑ: "{query}"</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Βρέθηκαν {results.length} επαγγελματικά προϊόντα &amp; ανταλλακτικά
          </p>
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#cfd8dc] rounded p-12 text-center space-y-4">
          <Search className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-neutral-800 uppercase">
            ΔΕΝ ΒΡΕΘΗΚΑΝ ΠΡΟΪΟΝΤΑ ΓΙΑ "{query}"
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Ελέγξτε την ορθογραφία ή δοκιμάστε πιο γενικούς όρους αναζήτησης όπως "Milwaukee", "Τροχός", "Κρουστικό", "Knipex".
          </p>
          <button
            onClick={() => onNavigate('/products')}
            className="bg-[#af101a] text-white px-6 py-2.5 rounded font-display font-bold uppercase text-xs tracking-wider"
          >
            ΠΡΟΒΟΛΗ ΟΛΩΝ ΤΩΝ ΠΡΟΪΟΝΤΩΝ
          </button>
        </div>
      )}
    </div>
  );
};
