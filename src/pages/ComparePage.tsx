import React, { useState } from 'react';
import {
  Scale,
  X,
  ShoppingCart,
  Star,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ComparePageProps {
  onNavigate: (route: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({ onNavigate }) => {
  const {
    compareList,
    products,
    brands,
    toggleCompare,
    clearCompare,
    addToCart,
    isB2BMode,
  } = useStore();

  const [highlightDifferences, setHighlightDifferences] = useState(false);

  const comparedProducts = products.filter((p) => compareList.includes(p.id));

  if (comparedProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="font-display font-black text-2xl text-neutral-900 uppercase">
          Η ΛΙΣΤΑ ΣΥΓΚΡΙΣΗΣ ΕΙΝΑΙ ΑΔΕΙΑ
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Προσθέστε έως και 4 επαγγελματικά εργαλεία για να συγκρίνετε αναλυτικά τις τεχνικές τους προδιαγραφές, την τιμή και την απόδοση.
        </p>
        <button
          onClick={() => onNavigate('/products')}
          className="bg-[#e21b22] text-white px-6 py-2.5 rounded font-display font-bold uppercase text-xs tracking-wider shadow"
        >
          ΠΕΡΙΗΓΗΣΗ ΣΤΑ ΕΡΓΑΛΕΙΑ
        </button>
      </div>
    );
  }

  // Helper to extract unique spec keys
  const allSpecKeys = Array.from(
    new Set(
      comparedProducts.flatMap((p) => [
        ...p.specifications.map((s) => s.key),
        ...Object.keys(p.attributes || {}),
      ])
    )
  );

  const getSpecValue = (p: (typeof comparedProducts)[0], key: string) => {
    const spec = p.specifications.find((s) => s.key === key);
    if (spec) return spec.value;
    if (p.attributes && p.attributes[key]) return p.attributes[key];
    return '-';
  };

  return (
    <div className="nt-compare-page max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfd8dc] pb-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase tracking-tight flex items-center space-x-2">
            <span>ΣΥΓΚΡΙΣΗ ΕΠΑΓΓΕΛΜΑΤΙΚΩΝ ΕΡΓΑΛΕΙΩΝ</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Συγκρίνετε δίπλα-δίπλα χαρακτηριστικά, ισχύ, βάρος και τιμές χονδρικής &amp; λιανικής.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs font-semibold text-neutral-700 cursor-pointer bg-neutral-100 px-3 py-1.5 rounded border border-neutral-200">
            <input
              type="checkbox"
              checked={highlightDifferences}
              onChange={(e) => setHighlightDifferences(e.target.checked)}
              className="rounded text-[#e21b22] focus:ring-[#e21b22]"
            />
            <span>Επισήμανση Διαφορών</span>
          </label>

          <button
            onClick={clearCompare}
            className="text-xs text-[#e21b22] hover:underline font-bold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Καθαρισμός Όλων</span>
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="nt-compare-table bg-white border border-[#d4d4d4] rounded-2xl overflow-x-auto shadow-sm">
        <table className="w-full text-xs text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-neutral-200 bg-[#fbfbfb]">
              <th className="p-4 w-48 font-display font-bold uppercase text-neutral-500">
                ΧΑΡΑΚΤΗΡΙΣΤΙΚΟ
              </th>
              {comparedProducts.map((p) => {
                const brand = brands.find((b) => b.id === p.brandId);
                const gross = p.salePrice || p.price;
                const net = gross / 1.24;

                return (
                  <th key={p.id} className="p-4 w-64 align-top border-l border-neutral-200">
                    <div className="relative space-y-2">
                      <button
                        onClick={() => toggleCompare(p.id)}
                        className="absolute -top-2 -right-2 p-1 text-neutral-400 hover:text-red-600 rounded-full hover:bg-neutral-100"
                        title="Αφαίρεση"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div
                        onClick={() => onNavigate(`/product/${p.slug}`)}
                        className="h-36 bg-transparent p-2 rounded-xl border border-[#d4d4d4] flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div>
                        <span className="font-display font-bold text-[#e21b22] uppercase text-[11px]">
                          {brand?.name}
                        </span>
                        <h4
                          onClick={() => onNavigate(`/product/${p.slug}`)}
                          className="font-bold text-neutral-900 text-xs line-clamp-2 hover:text-[#e21b22] cursor-pointer mt-0.5 leading-snug"
                        >
                          {p.name}
                        </h4>
                        <div className="text-[10px] text-neutral-400 font-mono-spec mt-0.5">
                          SKU: {p.sku}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="pt-1">
                        <div className="text-base font-bold font-mono-spec text-neutral-900">
                          €{(isB2BMode ? net : gross).toFixed(2)}
                          <span className="text-[10px] font-normal text-neutral-500 ml-1">
                            {isB2BMode ? 'χωρ. ΦΠΑ' : 'με ΦΠΑ'}
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart */}
                      <button
                        onClick={() => addToCart(p, 1)}
                        className="w-full bg-[#e21b22] hover:bg-[#c81016] text-white py-1.5 px-2 rounded text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center space-x-1"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>ΠΡΟΣΘΗΚΗ</span>
                      </button>
                    </div>
                  </th>
                );
              })}
              {comparedProducts.length < 4 && (
                <th className="p-4 w-48 border-l border-neutral-200 text-center align-middle bg-neutral-50/50">
                  <button
                    onClick={() => onNavigate('/products')}
                    className="border-2 border-dashed border-neutral-300 hover:border-[#e21b22] text-neutral-500 hover:text-[#e21b22] p-6 rounded flex flex-col items-center justify-center space-y-2 w-full transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="font-display font-bold uppercase text-[11px]">ΠΡΟΣΘΗΚΗ ΕΡΓΑΛΕΙΟΥ</span>
                  </button>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200">
            {/* Stock status */}
            <tr className="bg-white">
              <td className="p-3 font-bold text-neutral-700 bg-neutral-50">ΔΙΑΘΕΣΙΜΟΤΗΤΑ</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-3 border-l border-neutral-200">
                  {p.stockQuantity > 0 ? (
                    <span className="text-[#2e7d32] font-semibold flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Σε απόθεμα ({p.stockQuantity} τεμ.)
                    </span>
                  ) : (
                    <span className="text-[#c62828] font-semibold flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Κατόπιν παραγγελίας
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Rating */}
            <tr className="bg-[#fafafa]">
              <td className="p-3 font-bold text-neutral-700 bg-neutral-50">ΑΞΙΟΛΟΓΗΣΗ</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-3 border-l border-neutral-200 font-bold text-amber-600 flex items-center">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                  <span>{p.rating} / 5</span>
                  <span className="text-neutral-400 font-normal ml-1">({p.reviewCount})</span>
                </td>
              ))}
            </tr>

            {/* Core Specs */}
            <tr className="bg-white">
              <td className="p-3 font-bold text-neutral-700 bg-neutral-50">ΤΑΣΗ / ΤΡΟΦΟΔΟΣΙΑ</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-3 border-l border-neutral-200 font-mono-spec font-semibold">
                  {p.attributes.voltage || '-'}
                </td>
              ))}
            </tr>

            <tr className="bg-[#fafafa]">
              <td className="p-3 font-bold text-neutral-700 bg-neutral-50">ΜΟΤΕΡ</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-3 border-l border-neutral-200 font-mono-spec">
                  {p.attributes.motor || '-'}
                </td>
              ))}
            </tr>

            <tr className="bg-white">
              <td className="p-3 font-bold text-neutral-700 bg-neutral-50">ΜΕΓΙΣΤΗ ΡΟΠΗ</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-3 border-l border-neutral-200 font-mono-spec font-bold text-[#e21b22]">
                  {p.attributes.maxTorque || '-'}
                </td>
              ))}
            </tr>

            <tr className="bg-[#fafafa]">
              <td className="p-3 font-bold text-neutral-700 bg-neutral-50">ΒΑΡΟΣ (KG)</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-3 border-l border-neutral-200 font-mono-spec">
                  {p.weight ? `${p.weight} kg` : '-'}
                </td>
              ))}
            </tr>

            <tr className="bg-white">
              <td className="p-3 font-bold text-neutral-700 bg-neutral-50">ΕΓΓΥΗΣΗ</td>
              {comparedProducts.map((p) => (
                <td key={p.id} className="p-3 border-l border-neutral-200 font-medium text-emerald-800">
                  {p.warranty}
                </td>
              ))}
            </tr>

            {/* Dynamic Specific Attributes */}
            {allSpecKeys.map((key) => {
              const values = comparedProducts.map((p) => getSpecValue(p, key));
              const isDiff = new Set(values).size > 1;

              return (
                <tr
                  key={key}
                  className={
                    highlightDifferences && isDiff
                      ? 'bg-amber-50/80 font-medium'
                      : 'bg-white'
                  }
                >
                  <td className="p-3 font-bold text-neutral-700 bg-neutral-50">{key}</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="p-3 border-l border-neutral-200 font-mono-spec">
                      {getSpecValue(p, key)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
