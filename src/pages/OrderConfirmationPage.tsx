import React from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  Printer,
  FileText,
  ArrowRight,
  Barcode,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateBarcodeSvg } from '../utils/barcodeGenerator';

interface OrderConfirmationPageProps {
  orderNumber: string;
  onNavigate: (route: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderNumber,
  onNavigate,
}) => {
  const { orders } = useStore();

  const order = orders.find((o) => o.orderNumber === orderNumber) || orders[0];

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Η παραγγελία δεν βρέθηκε</h2>
        <button
          onClick={() => onNavigate('/')}
          className="mt-4 bg-[#af101a] text-white px-4 py-2 rounded text-xs uppercase font-display"
        >
          Αρχική Σελίδα
        </button>
      </div>
    );
  }

  const barcodeSvg = generateBarcodeSvg(order.orderNumber, { height: 45, showText: true });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 select-none">
      {/* Success Hero Header */}
      <div className="bg-white border border-[#cfd8dc] rounded-lg p-6 sm:p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-mono-spec font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Η ΠΑΡΑΓΓΕΛΙΑ ΚΑΤΑΧΩΡΗΘΗΚΕ ΕΠΙΤΥΧΩΣ
          </span>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 uppercase">
            ΕΥΧΑΡΙΣΤΟΥΜΕ ΓΙΑ ΤΗΝ ΠΡΟΤΙΜΗΣΗ ΣΑΣ!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto">
            Αριθμός Παραγγελίας: <strong className="font-mono-spec text-neutral-900">#{order.orderNumber}</strong>. Έχουμε στείλει επιβεβαίωση στο email <span className="font-medium text-neutral-800">{order.customer.email}</span>.
          </p>
        </div>

        {/* Tracking info banner */}
        <div className="bg-[#fcf9f9] border border-[#cfd8dc] p-4 rounded-lg inline-flex flex-col sm:flex-row items-center gap-4 text-xs text-left max-w-xl mx-auto">
          <Truck className="w-6 h-6 text-[#af101a] shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-neutral-800">
              Τρόπος Αποστολής: {order.shipping.carrierName}
            </div>
            {order.shipping.trackingNumber && (
              <div className="text-neutral-500 font-mono-spec text-[11px]">
                Αριθμός Voucher / Tracking: <strong>{order.shipping.trackingNumber}</strong>
              </div>
            )}
          </div>
          {order.shipping.trackingNumber && (
            <button
              onClick={() => onNavigate(`/track-order?voucher=${order.shipping.trackingNumber}`)}
              className="bg-[#af101a] text-white px-3 py-1.5 rounded font-display font-bold uppercase text-[11px] tracking-wider shrink-0"
            >
              ΕΝΤΟΠΙΣΜΟΣ
            </button>
          )}
        </div>
      </div>

      {/* Order Details & Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Ordered Items */}
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-5 shadow-sm space-y-3">
          <h3 className="font-display font-bold text-sm text-neutral-900 uppercase border-b border-neutral-200 pb-2">
            ΠΡΟΪΟΝΤΑ ΠΑΡΑΓΓΕΛΙΑΣ ({order.items.length})
          </h3>
          <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-neutral-900">{item.name}</div>
                  <div className="text-[11px] text-neutral-500 font-mono-spec">
                    SKU: {item.sku} | Ποσότητα: {item.quantity} × €{item.price.toFixed(2)}
                  </div>
                </div>
                <div className="font-mono-spec font-bold text-neutral-900">
                  €{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-200 pt-3 space-y-1 text-neutral-700">
            <div className="flex justify-between">
              <span>Υποσύνολο:</span>
              <span className="font-mono-spec font-bold">€{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Μεταφορικά:</span>
              <span className="font-mono-spec font-bold">
                {order.shippingCost === 0 ? 'ΔΩΡΕΑΝ' : `€${order.shippingCost.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-neutral-900 pt-1 border-t border-neutral-200">
              <span>Σύνολο Πληρωμής:</span>
              <span className="font-mono-spec">€{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Billing info */}
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-5 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-sm text-neutral-900 uppercase border-b border-neutral-200 pb-2">
            ΣΤΟΙΧΕΙΑ ΠΑΡΑΔΟΣΗΣ &amp; ΠΛΗΡΩΜΗΣ
          </h3>

          <div className="space-y-3 text-neutral-700">
            <div>
              <span className="font-bold text-neutral-900 block mb-0.5">Παραλήπτης:</span>
              <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
              <div>{order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</div>
              <div className="font-mono-spec">Τηλ: {order.shippingAddress.phone}</div>
            </div>

            <div>
              <span className="font-bold text-neutral-900 block mb-0.5">Τύπος Παραστατικού:</span>
              {order.billing.type === 'invoice' ? (
                <div>
                  <span className="font-bold text-[#af101a]">Τιμολόγιο B2B:</span> {order.billing.companyName} (ΑΦΜ: {order.billing.vatNumber})
                </div>
              ) : (
                <div>Απόδειξη Λιανικής Πώλησης</div>
              )}
            </div>

            <div>
              <span className="font-bold text-neutral-900 block mb-0.5">Τρόπος Πληρωμής:</span>
              <div>{order.payment.methodName}</div>
            </div>

            <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-center">
              <div
                className="flex justify-center"
                dangerouslySetInnerHTML={{ __html: barcodeSvg }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-neutral-200">
        <button
          onClick={() => onNavigate('/products')}
          className="bg-[#af101a] hover:bg-[#b71c1c] text-white text-xs font-display font-bold uppercase tracking-wider py-2.5 px-5 rounded shadow transition-colors"
        >
          ΣΥΝΕΧΕΙΑ ΣΤΟΝ ΚΑΤΑΛΟΓΟ
        </button>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold px-4 py-2 rounded border border-neutral-300"
          >
            <Printer className="w-4 h-4" />
            <span>Εκτύπωση Παραγγελίας</span>
          </button>
          <button
            onClick={() => onNavigate('/account')}
            className="text-[#af101a] font-bold hover:underline"
          >
            Προβολή στον Λογαριασμό μου →
          </button>
        </div>
      </div>
    </div>
  );
};
