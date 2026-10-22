import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Truck,
  ShieldCheck,
  Check,
  ChevronLeft,
  Percent,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { couponDiscount } from '../services/coupons';

interface CartPageProps {
  onNavigate: (route: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { state } = useWorkspace();
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    getCartSubtotal,
    getCartVat,
    getCartTotal,
    isB2BMode,
    showToast,
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = getCartSubtotal();
  const freeShippingThreshold = 50.0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingCost = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 3.50;

  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const coupon = state.coupons?.find(c => c.code === couponCode.trim().toUpperCase());
      if (!coupon) throw new Error('Το κουπόνι δεν βρέθηκε.');
      const discount = couponDiscount(coupon, cart.map(i => ({ price: i.product.salePrice ?? i.product.price, quantity: i.quantity, categoryIds: i.product.categoryIds, onSale: i.product.salePrice !== undefined })), state.couponUses?.[coupon.code] ?? 0);
      setDiscountAmount(discount);
      sessionStorage.setItem('nt-demo-coupon', coupon.code);
      showToast('Το κουπόνι εφαρμόστηκε. Θα επανελεγχθεί στο checkout.');
    } catch(e) { setDiscountAmount(0); sessionStorage.removeItem('nt-demo-coupon'); showToast((e as Error).message, 'warning'); }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 select-none">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="font-display font-black text-2xl text-neutral-900 ">
          ΤΟ ΚΑΛΑΘΙ ΣΑΣ ΕΙΝΑΙ ΑΔΕΙΟ
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">
          Δεν έχετε προσθέσει ακόμη εργαλεία ή αναλώσιμα στο καλάθι των αγορών σας.
        </p>
        <button
          onClick={() => onNavigate('/products')}
          className="bg-[#e21b22] text-white px-6 py-2.5 rounded font-display font-bold  text-xs tracking-wider shadow"
        >
          ΕΝΑΡΞΗ ΑΓΟΡΩΝ
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 space-y-5 select-none sm:px-4 sm:py-8 sm:space-y-8">
      <div className="border-b border-[#cfd8dc] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-black text-xl sm:text-3xl text-neutral-900  tracking-tight flex items-center space-x-2">
            <span>ΚΑΛΑΘΙ ΑΓΟΡΩΝ ({cart.reduce((s, i) => s + i.quantity, 0)} ΠΡΟΪΟΝΤΑ)</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Ελέγξτε τις ποσότητες, εφαρμόστε εκπτωτικά κουπόνια και προχωρήστε στην ασφαλή ολοκλήρωση.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-neutral-500 hover:text-red-700 flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Άδειασμα Καλαθιού</span>
        </button>
      </div>

      {/* Free shipping progress bar */}
      <div className="bg-[#fcf9f9] border border-[#cfd8dc] p-4 rounded-lg space-y-2">
        <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2 font-bold text-neutral-800">
            <Truck className="w-4 h-4 text-[#e21b22]" />
            {remainingForFreeShipping > 0 ? (
              <span>
                Προσθέστε ακόμη <strong className="text-[#e21b22]">€{remainingForFreeShipping.toFixed(2)}</strong> για ΔΩΡΕΑΝ ΜΕΤΑΦΟΡΙΚΑ!
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center space-x-1">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Συγχαρητήρια! Δικαιούστε ΔΩΡΕΑΝ ΜΕΤΑΦΟΡΙΚΑ πανελλαδικά.</span>
              </span>
            )}
          </div>
          <span className="font-mono-spec font-bold text-neutral-600">
            €{subtotal.toFixed(2)} / €{freeShippingThreshold.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#e21b22] h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Item List (Col 8) + Summary (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-8 bg-white border border-[#cfd8dc] rounded-lg divide-y divide-neutral-200 overflow-hidden shadow-sm">
          {cart.map((item) => {
            const unitGross = item.unitPrice ?? item.product.salePrice ?? item.product.price;
            const unitNet = unitGross / 1.24;
            const lineGross = unitGross * item.quantity;
            const lineNet = unitNet * item.quantity;

            return (
              <div
                key={item.product.id}
                className="p-3 flex flex-row flex-wrap sm:flex-nowrap sm:p-4 items-center justify-between gap-3 sm:gap-4 hover:bg-neutral-50/50 transition-colors"
              >
                {/* Image */}
                <div
                  onClick={() => onNavigate(`/product/${item.product.slug}`)}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-[#fafafa] p-1.5 rounded border border-neutral-200 shrink-0 cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Title & SKU */}
                <div className="flex-1 min-w-[calc(100%-5rem)] sm:min-w-0 text-left">
                  <h3
                    onClick={() => onNavigate(`/product/${item.product.slug}`)}
                    className="font-bold text-xs sm:text-sm text-neutral-900 hover:text-[#e21b22] cursor-pointer line-clamp-2"
                  >
                    {item.product.name}
                  </h3>
                  <div className="text-[11px] text-neutral-500 font-mono-spec mt-0.5">
                    SKU: {item.product.sku} | EAN: {item.product.ean}
                  </div>
                  <div className="text-xs text-neutral-700 font-mono-spec mt-1">
                    Τιμή μονάδας:{' '}
                    <strong>
                      €{(isB2BMode ? unitNet : unitGross).toFixed(2)}{' '}
                      <span className="text-[10px] text-neutral-500">
                        {isB2BMode ? 'χωρίς ΦΠΑ' : 'με ΦΠΑ'}
                      </span>
                    </strong>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="ml-auto flex items-center border border-neutral-300 rounded overflow-hidden shrink-0">
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-mono-spec font-bold text-xs bg-white min-w-[2.2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Line Total */}
                <div className="text-right shrink-0 min-w-[6.5rem]">
                  <div className="text-base font-bold font-mono-spec text-neutral-900">
                    €{(isB2BMode ? lineNet : lineGross).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono-spec">
                    {isB2BMode ? `€${lineGross.toFixed(2)} με ΦΠΑ` : `€${lineNet.toFixed(2)} χωρίς ΦΠΑ`}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-700 rounded transition-colors"
                  title="Αφαίρεση"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          <div className="p-4 bg-neutral-50 flex items-center justify-between text-xs">
            <button
              onClick={() => onNavigate('/products')}
              className="text-[#e21b22] font-bold hover:underline flex items-center space-x-1  font-display"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Συνέχεια Αγορών</span>
            </button>
          </div>
        </div>

        {/* Cart Summary (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#cfd8dc] rounded-lg p-5 shadow-sm space-y-4 text-xs">
            <h3 className="font-display font-black text-lg text-neutral-900  border-b border-neutral-200 pb-2">
              ΣΥΝΟΨΗ ΠΑΡΑΓΓΕΛΙΑΣ
            </h3>

            {/* Calculations */}
            <div className="space-y-2 text-neutral-700">
              <div className="flex justify-between">
                <span>Υποσύνολο (χωρίς ΦΠΑ):</span>
                <span className="font-mono-spec font-bold">
                  €{(subtotal / 1.24).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Αναλογούν ΦΠΑ (24%):</span>
                <span className="font-mono-spec font-bold">
                  €{getCartVat().toFixed(2)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Έκπτωση κουπονιού:</span>
                  <span className="font-mono-spec">-€{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Έξοδα Αποστολής (ACS / Box Now):</span>
                <span className="font-mono-spec font-bold">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-700 font-bold">ΔΩΡΕΑΝ</span>
                  ) : (
                    `€${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>

            {/* Final Total */}
            <div className="border-t border-neutral-300 pt-3 flex items-baseline justify-between">
              <div>
                <div className="font-display font-black text-xl text-neutral-900">
                  €{finalTotal.toFixed(2)}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono-spec">
                  {isB2BMode
                    ? `€${(finalTotal / 1.24).toFixed(2)} καθαρή αξία B2B`
                    : 'Τελικό ποσό πληρωμής με ΦΠΑ 24%'}
                </div>
              </div>

              <div className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ασφαλής Πληρωμή
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              id="proceed-to-checkout-btn"
              onClick={() => onNavigate('/checkout')}
              className="w-full bg-[#e21b22] hover:bg-[#c81016] text-white font-display font-bold  tracking-wider py-3.5 px-4 rounded shadow flex items-center justify-center space-x-2 text-sm transition-colors"
            >
              <span>ΟΛΟΚΛΗΡΩΣΗ ΠΑΡΑΓΓΕΛΙΑΣ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Coupon Code Box */}
          <div className="bg-white border border-[#cfd8dc] rounded-lg p-4 shadow-sm text-xs">
            <span className="font-bold text-neutral-800  block mb-2 flex items-center space-x-1.5">
              <Percent className="w-4 h-4 text-[#e21b22]" />
              <span>ΕΧΕΤΕ ΕΚΠΤΩΤΙΚΟ ΚΟΥΠΟΝΙ;</span>
            </span>
            <form onSubmit={handleApplyCoupon} className="flex space-x-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Κωδικός κουπονιού"
                className="flex-1 p-2 border border-neutral-300 rounded font-mono-spec  text-xs focus:border-[#e21b22] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#1e1e1e] hover:bg-black text-white font-display font-bold px-3 py-2 rounded  text-xs"
              >
                ΕΦΑΡΜΟΓΗ
              </button>
            </form>
          </div>

          {/* Payment Badges */}
          <div className="bg-neutral-50 p-3 rounded border border-neutral-200 text-center text-xs text-neutral-500 space-y-1">
            <div className="flex items-center justify-center space-x-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Προστασία Αγορών &amp; SSL 256-bit Encryption</span>
            </div>
            <p className="text-[10px]">Δεχόμαστε όλες τις κάρτες, Viva Wallet, Klarna 3 δόσεις &amp; Αντικαταβολή.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
