import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';

interface WishlistPageProps {
  onNavigate: (route: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate }) => {
  const { wishlist, products, addToCart } = useStore();

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 select-none">
      <div className="border-b border-[#cfd8dc] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase tracking-tight flex items-center space-x-2">
            <span>ΛΙΣΤΑ ΕΠΙΘΥΜΙΩΝ ({wishlistProducts.length})</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Αποθηκευμένα εργαλεία για μελλοντικές αγορές ή έγκριση προϋπολογισμού B2B.
          </p>
        </div>

        {wishlistProducts.length > 0 && (
          <button
            onClick={() => {
              wishlistProducts.forEach((p) => addToCart(p, 1));
            }}
            className="bg-[#e21b22] hover:bg-[#c81016] text-white text-xs font-display font-bold uppercase tracking-wider px-4 py-2 rounded flex items-center space-x-1.5 shadow"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>ΠΡΟΣΘΗΚΗ ΟΛΩΝ ΣΤΟ ΚΑΛΑΘΙ</span>
          </button>
        )}
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistProducts.map((p) => (
            <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-12 text-center space-y-4">
          <Heart className="w-16 h-16 text-neutral-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-neutral-800 uppercase">
            ΔΕΝ ΕΧΕΤΕ ΑΠΟΘΗΚΕΥΣΕΙ ΕΡΓΑΛΕΙΑ ΣΤΗ ΛΙΣΤΑ ΣΑΣ
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Κάντε κλικ στο εικονίδιο καρδιάς σε οποιοδήποτε προϊόν για να το προσθέσετε στη λίστα επιθυμιών σας.
          </p>
          <button
            onClick={() => onNavigate('/products')}
            className="bg-[#e21b22] text-white px-6 py-2.5 rounded font-display font-bold uppercase text-xs tracking-wider"
          >
            ΕΞΕΡΕΥΝΗΣΗ ΠΡΟΪΟΝΤΩΝ
          </button>
        </div>
      )}
    </div>
  );
};
