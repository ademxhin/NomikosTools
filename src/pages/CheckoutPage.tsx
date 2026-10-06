import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Building2,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { courierService } from '../services/courierService';
import { paymentService } from '../services/paymentService';
import { Order, OrderItem, Address } from '../types/order';

interface CheckoutPageProps {
  onNavigate: (route: string) => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, onOrderCompleted }) => {
  const { cart, getCartSubtotal, getCartVat, addOrder, adjustProductStock, showToast } = useStore();
  const { user } = useAuth();

  // Form states
  const [invoiceType, setInvoiceType] = useState<'receipt' | 'invoice'>('invoice');
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || 'Γιώργος',
    lastName: user?.name?.split(' ')[1] || 'Νομικός',
    email: user?.email || 'g.nomikos@nomikostools.gr',
    phone: user?.phone || '2105550190',
    address: 'Θέση Γκορυτσά',
    city: 'Ασπρόπυργος',
    postalCode: '19300',
    notes: 'Παράδοση στην αποθήκη Logistics 2.',
    // B2B Invoice specific fields
    companyName: user?.companyName || 'ΝΟΜΙΚΟΣ TOOLS Α.Ε.Β.Ε.',
    vatNumber: user?.vatNumber || '094827102',
    taxOffice: user?.taxOffice || 'ΦΑΕ ΠΕΙΡΑΙΑ',
    profession: 'Εμπόριο Επαγγελματικών Εργαλείων',
  });

  const [shippingMethod, setShippingMethod] = useState<'acs' | 'boxnow' | 'store_pickup'>('acs');
  const [boxNowLocker, setBoxNowLocker] = useState('Locker 104 - Λεωφ. Δημοκρατίας 45, Ασπρόπυργος');
  const [paymentMethod, setPaymentMethod] = useState<'viva' | 'stripe' | 'klarna' | 'cod' | 'bank'>('viva');
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = getCartSubtotal();
  const vat = getCartVat();
  const shippingCost = courierService.calculateShipping(shippingMethod, subtotal, 3.5);
  const codFee = paymentMethod === 'cod' ? 2.00 : 0;
  const totalAmount = Number((subtotal + shippingCost + codFee).toFixed(2));

  if (cart.length === 0) {
    onNavigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckVat = () => {
    if (!formData.vatNumber || formData.vatNumber.length < 9) {
      showToast('Παρακαλώ εισάγετε έγκυρο 9ψήφιο ΑΦΜ', 'warning');
      return;
    }
    showToast(`Το ΑΦΜ ${formData.vatNumber} επικυρώθηκε στο VIES / Taxisnet επιτυχώς!`);
    setFormData((prev) => ({
      ...prev,
      companyName: prev.companyName || 'ΤΕΧΝΙΚΗ ΕΡΓΟΛΗΠΤΙΚΗ Ο.Ε.',
      taxOffice: prev.taxOffice || 'ΔΟΥ ΑΘΗΝΩΝ',
      profession: prev.profession || 'Κατασκευές & Εγκαταστάσεις',
    }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderNumber = `NT-${Math.floor(10000 + Math.random() * 90000)}`;

      // 1. Process payment adapter
      const paymentRes = await paymentService.processPayment(paymentMethod, totalAmount, orderNumber);

      // 2. Create courier shipment voucher adapter
      const shipmentRes = await courierService.createShipment(shippingMethod, orderNumber, {
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
      });

      // 3. Build order items
      const orderItems: OrderItem[] = cart.map((item) => ({
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        image: item.product.images[0] || '',
        price: item.product.salePrice || item.product.price,
        quantity: item.quantity,
        pickedQuantity: 0,
        weight: item.product.weight,
      }));

      // 4. Construct complete Order model
      const addressObj: Address = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        street: formData.address,
        number: '',
        city: formData.city,
        postalCode: formData.postalCode,
        region: 'Αττική',
        notes: formData.notes,
      };

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
        status: 'Νέα',
        statusHistory: [
          {
            status: 'Νέα',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            user: 'Σύστημα Checkout',
            note: 'Η παραγγελία καταχωρήθηκε αυτόματα.',
          },
        ],
        items: orderItems,
        customer: addressObj,
        billing: {
          type: invoiceType,
          companyName: invoiceType === 'invoice' ? formData.companyName : undefined,
          vatNumber: invoiceType === 'invoice' ? formData.vatNumber : undefined,
          taxOffice: invoiceType === 'invoice' ? formData.taxOffice : undefined,
          profession: invoiceType === 'invoice' ? formData.profession : undefined,
        },
        shippingAddress: addressObj,
        shipping: {
          carrier: shippingMethod,
          carrierName:
            shippingMethod === 'acs'
              ? 'ACS Courier Express'
              : shippingMethod === 'boxnow'
              ? `Box Now Locker (${boxNowLocker})`
              : 'Παραλαβή από Κεντρικό Κατάστημα (Ασπρόπυργος)',
          cost: shippingCost,
          trackingNumber: shipmentRes.trackingNumber,
          lockerId: shippingMethod === 'boxnow' ? boxNowLocker : undefined,
        },
        payment: {
          method: paymentMethod,
          methodName:
            paymentMethod === 'viva'
              ? 'Viva Wallet Smart Checkout'
              : paymentMethod === 'stripe'
              ? 'Πιστωτική / Χρεωστική Κάρτα (Stripe)'
              : paymentMethod === 'klarna'
              ? 'Klarna - 3 Άτοκες Δόσεις'
              : paymentMethod === 'cod'
              ? 'Αντικαταβολή κατά την παράδοση'
              : 'Τραπεζική Κατάθεση',
          status: paymentMethod === 'cod' || paymentMethod === 'bank' ? 'pending' : 'paid',
          transactionId: paymentRes.transactionId,
        },
        subtotal,
        vatTotal: vat,
        shippingCost,
        discountTotal: 0,
        total: totalAmount,
        notes: formData.notes,
        isB2B: invoiceType === 'invoice',
      };

      // 5. Decrement inventory stock
      cart.forEach((item) => {
        adjustProductStock(
          item.product.id,
          -item.quantity,
          'sale',
          `Πώληση μέσω e-shop - Παραγγελία #${orderNumber}`
        );
      });

      // 6. Save order
      addOrder(newOrder);
      onOrderCompleted(newOrder);
      onNavigate(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      showToast('Σφάλμα κατά την επεξεργασία της παραγγελίας', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 space-y-5 select-none sm:px-4 sm:py-8 sm:space-y-8">
      {/* Title */}
      <div className="border-b border-[#cfd8dc] pb-4">
        <h1 className="font-display font-black text-xl sm:text-3xl text-neutral-900 uppercase tracking-tight flex items-center space-x-2">
          <Lock className="w-6 h-6 text-[#e21b22]" />
          <span>ΑΣΦΑΛΗΣ ΟΛΟΚΛΗΡΩΣΗ ΠΑΡΑΓΓΕΛΙΑΣ</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Συμπληρώστε τα στοιχεία τιμολόγησης, επιλέξτε τρόπο αποστολής και μέθοδο πληρωμής.
        </p>
      </div>

      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 3-Step Checkout Accordion (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Step 1: Customer & Invoice details */}
            <div className="bg-white border border-[#cfd8dc] rounded-lg p-3.5 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-col items-stretch gap-3 border-b border-neutral-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#e21b22] text-white flex items-center justify-center font-display font-bold text-xs">
                    1
                  </div>
                  <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                    ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ &amp; ΠΑΡΑΣΤΑΤΙΚΟ
                  </h3>
                </div>

                {/* Receipt vs Invoice Toggle */}
                <div className="flex w-full bg-neutral-100 p-0.5 rounded border border-neutral-300 text-[10px] sm:w-auto sm:text-xs">
                  <button
                    type="button"
                    onClick={() => setInvoiceType('receipt')}
                      className={`flex-1 px-2 py-2 rounded font-medium transition-colors sm:flex-initial sm:px-3 sm:py-1 ${
                      invoiceType === 'receipt'
                        ? 'bg-white text-neutral-900 shadow font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Απόδειξη Λιανικής
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType('invoice')}
                      className={`flex-1 px-2 py-2 rounded font-medium transition-colors sm:flex-initial sm:px-3 sm:py-1 ${
                      invoiceType === 'invoice'
                        ? 'bg-[#e21b22] text-white shadow font-bold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Τιμολόγιο B2B
                  </button>
                </div>
              </div>

              {/* B2B Extra Fields */}
              {invoiceType === 'invoice' && (
                <div className="p-3 bg-red-50/50 border border-red-200 rounded-lg space-y-3 text-xs">
                  <div className="flex items-center justify-between text-neutral-800 font-bold">
                    <span className="flex items-center space-x-1.5 text-[#e21b22]">
                      <Building2 className="w-4 h-4" />
                      <span>ΣΤΟΙΧΕΙΑ ΕΠΑΓΓΕΛΜΑΤΙΚΟΥ ΤΙΜΟΛΟΓΙΟΥ (ΑΡΘΡΟ 39α / ΕΛΤΑ)</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCheckVat}
                      className="bg-white hover:bg-neutral-100 text-[#e21b22] border border-[#e21b22] px-2.5 py-0.5 rounded font-mono-spec font-bold"
                    >
                      Έλεγχος ΑΦΜ (Taxis)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        ΑΦΜ Επιχείρησης *
                      </label>
                      <input
                        type="text"
                        name="vatNumber"
                        required
                        value={formData.vatNumber}
                        onChange={handleInputChange}
                        placeholder="π.χ. 094827102"
                        className="w-full p-2 border border-neutral-300 rounded font-mono-spec text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Δ.Ο.Υ. *
                      </label>
                      <input
                        type="text"
                        name="taxOffice"
                        required
                        value={formData.taxOffice}
                        onChange={handleInputChange}
                        placeholder="π.χ. ΦΑΕ ΠΕΙΡΑΙΑ"
                        className="w-full p-2 border border-neutral-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Επωνυμία Εταιρείας *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="π.χ. ΝΟΜΙΚΟΣ TOOLS Α.Ε.Β.Ε."
                        className="w-full p-2 border border-neutral-300 rounded text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Δραστηριότητα / Επάγγελμα
                      </label>
                      <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        placeholder="π.χ. Τεχνική Εταιρεία"
                        className="w-full p-2 border border-neutral-300 rounded text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Standard contact inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Όνομα *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Επώνυμο *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Τηλέφωνο Επικοινωνίας *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Διεύθυνση Παράδοσης *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Οδός και αριθμός ή θέση εργοταξίου"
                    className="w-full p-2 border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Πόλη / Περιοχή *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Ταχυδρομικός Κώδικας (Τ.Κ.) *</label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-neutral-300 rounded text-xs font-mono-spec"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white border border-[#cfd8dc] rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-neutral-200 pb-3">
                <div className="w-6 h-6 rounded-full bg-[#e21b22] text-white flex items-center justify-center font-display font-bold text-xs">
                  2
                </div>
                <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                  ΤΡΟΠΟΣ ΑΠΟΣΤΟΛΗΣ
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* ACS Courier */}
                <label
                  className={`flex items-start justify-between p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    shippingMethod === 'acs'
                      ? 'border-[#e21b22] bg-red-50/30 ring-1 ring-[#e21b22]'
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'acs'}
                      onChange={() => setShippingMethod('acs')}
                      className="mt-0.5 text-[#e21b22] focus:ring-[#e21b22]"
                    />
                    <div>
                      <div className="font-bold text-neutral-900 text-sm flex items-center space-x-2">
                        <span>ACS Courier Express Πανελλαδικά</span>
                        <span className="text-[10px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded">
                          1-2 Ημέρες
                        </span>
                      </div>
                      <p className="text-neutral-500 mt-0.5">
                        Παράδοση στην πόρτα σας ή στο εργοτάξιο με ζωντανό tracking SMS.
                      </p>
                    </div>
                  </div>
                  <div className="font-mono-spec font-bold text-sm text-neutral-900">
                    {subtotal >= 50 ? <span className="text-emerald-700">ΔΩΡΕΑΝ</span> : '€3.50'}
                  </div>
                </label>

                {/* Box Now */}
                <label
                  className={`flex items-start justify-between p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    shippingMethod === 'boxnow'
                      ? 'border-[#e21b22] bg-red-50/30 ring-1 ring-[#e21b22]'
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'boxnow'}
                      onChange={() => setShippingMethod('boxnow')}
                      className="mt-0.5 text-[#e21b22] focus:ring-[#e21b22]"
                    />
                    <div>
                      <div className="font-bold text-neutral-900 text-sm flex items-center space-x-2">
                        <span>BOX NOW 24/7 Lockers</span>
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                          24 ΩΡΕΣ
                        </span>
                      </div>
                      <p className="text-neutral-500 mt-0.5">
                        Παραλαβή οποιαδήποτε ώρα της ημέρας από 2.000+ θυρίδες σε όλη την Ελλάδα.
                      </p>
                      {shippingMethod === 'boxnow' && (
                        <div className="mt-2 text-neutral-700 bg-white p-2 rounded border border-neutral-300">
                          <label className="block text-[10px] font-bold text-neutral-500 mb-0.5">
                            ΕΠΙΛΕΓΜΕΝΟ LOCKER:
                          </label>
                          <input
                            type="text"
                            value={boxNowLocker}
                            onChange={(e) => setBoxNowLocker(e.target.value)}
                            className="w-full text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-mono-spec font-bold text-sm text-neutral-900">
                    {subtotal >= 40 ? <span className="text-emerald-700">ΔΩΡΕΑΝ</span> : '€2.50'}
                  </div>
                </label>

                {/* Store Pickup */}
                <label
                  className={`flex items-start justify-between p-3.5 rounded-lg border cursor-pointer transition-colors ${
                    shippingMethod === 'store_pickup'
                      ? 'border-[#e21b22] bg-red-50/30 ring-1 ring-[#e21b22]'
                      : 'border-neutral-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'store_pickup'}
                      onChange={() => setShippingMethod('store_pickup')}
                      className="mt-0.5 text-[#e21b22] focus:ring-[#e21b22]"
                    />
                    <div>
                      <div className="font-bold text-neutral-900 text-sm">
                        Παραλαβή από Κεντρικό Logistics Center (Ασπρόπυργος)
                      </div>
                      <p className="text-neutral-500 mt-0.5">
                        Άμεσα διαθέσιμο για παραλαβή εντός 2 ωρών (Δευτ-Παρ 08:00 - 17:30).
                      </p>
                    </div>
                  </div>
                  <div className="font-mono-spec font-bold text-sm text-emerald-700">
                    ΔΩΡΕΑΝ
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-[#cfd8dc] rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-neutral-200 pb-3">
                <div className="w-6 h-6 rounded-full bg-[#e21b22] text-white flex items-center justify-center font-display font-bold text-xs">
                  3
                </div>
                <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                  ΤΡΟΠΟΣ ΠΛΗΡΩΜΗΣ
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                {/* Viva Wallet */}
                <label
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer ${
                    paymentMethod === 'viva' ? 'border-[#e21b22] bg-red-50/20' : 'border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'viva'}
                      onChange={() => setPaymentMethod('viva')}
                    />
                    <div>
                      <span className="font-bold text-neutral-900">Viva Wallet Smart Checkout</span>
                      <p className="text-[11px] text-neutral-500">Πληρωμή με IRIS, Apple Pay, Google Pay ή κάρτα</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-[#e21b22]">ΠΡΟΤΕΙΝΟΜΕΝΟ</span>
                </label>

                {/* Stripe */}
                <label
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer ${
                    paymentMethod === 'stripe' ? 'border-[#e21b22] bg-red-50/20' : 'border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                    />
                    <div>
                      <span className="font-bold text-neutral-900">Πιστωτική / Χρεωστική Κάρτα (Stripe)</span>
                      <p className="text-[11px] text-neutral-500">Visa, Mastercard, Maestro με 3D-Secure</p>
                    </div>
                  </div>
                </label>

                {/* Klarna */}
                <label
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer ${
                    paymentMethod === 'klarna' ? 'border-[#e21b22] bg-red-50/20' : 'border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'klarna'}
                      onChange={() => setPaymentMethod('klarna')}
                    />
                    <div>
                      <span className="font-bold text-neutral-900">Klarna: 3 Άτοκες Δόσεις</span>
                      <p className="text-[11px] text-neutral-500">
                        3 πληρωμές των €{(totalAmount / 3).toFixed(2)} χωρίς επιπλέον τόκους
                      </p>
                    </div>
                  </div>
                </label>

                {/* Cash on delivery */}
                <label
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer ${
                    paymentMethod === 'cod' ? 'border-[#e21b22] bg-red-50/20' : 'border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div>
                      <span className="font-bold text-neutral-900">Αντικαταβολή μετρητών</span>
                      <p className="text-[11px] text-neutral-500">Πληρωμή στον διανομέα κατά την παράδοση (+€2.00)</p>
                    </div>
                  </div>
                  <span className="font-mono-spec font-bold text-neutral-800">+€2.00</span>
                </label>

                {/* Bank transfer */}
                <label
                  className={`flex items-center justify-between p-3 rounded border cursor-pointer ${
                    paymentMethod === 'bank' ? 'border-[#e21b22] bg-red-50/20' : 'border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                    />
                    <div>
                      <span className="font-bold text-neutral-900">Τραπεζική Κατάθεση</span>
                      <p className="text-[11px] text-neutral-500">Eurobank, Εθνική Τράπεζα, Alpha Bank, Πειραιώς</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Sticky Order Summary & Submit (Col 4) */}
          <div className="lg:col-span-4 space-y-4 sticky top-20">
            <div className="bg-white border border-[#cfd8dc] rounded-lg p-5 shadow-sm space-y-4 text-xs">
              <h3 className="font-display font-black text-lg text-neutral-900 uppercase border-b border-neutral-200 pb-2">
                ΕΠΙΒΕΒΑΙΩΣΗ ΠΑΡΑΓΓΕΛΙΑΣ
              </h3>

              {/* Items summary */}
              <div className="max-h-56 overflow-y-auto divide-y divide-neutral-100 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-900 truncate">{item.product.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono-spec">
                        {item.quantity} × €{(item.product.salePrice || item.product.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="font-mono-spec font-bold text-neutral-800 shrink-0">
                      €{((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-neutral-200 pt-3 space-y-1.5 text-neutral-700">
                <div className="flex justify-between">
                  <span>Καθαρή Αξία:</span>
                  <span className="font-mono-spec">€{(subtotal / 1.24).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ΦΠΑ 24%:</span>
                  <span className="font-mono-spec">€{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Μεταφορικά:</span>
                  <span className="font-mono-spec">
                    {shippingCost === 0 ? <strong className="text-emerald-700">ΔΩΡΕΑΝ</strong> : `€${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between">
                    <span>Κόστος Αντικαταβολής:</span>
                    <span className="font-mono-spec">€{codFee.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="border-t border-neutral-300 pt-3 flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-bold font-mono-spec text-neutral-900">
                    €{totalAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-500">Τελικό ποσό προς πληρωμή</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Εγγύηση Nomikos
                </span>
              </div>

              {/* Submit Button */}
              <button
                id="submit-order-btn"
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#e21b22] hover:bg-[#c81016] disabled:opacity-50 text-white font-display font-bold uppercase tracking-wider py-3.5 px-4 rounded shadow-lg flex items-center justify-center space-x-2 text-sm transition-all"
              >
                {isProcessing ? (
                  <span>ΕΠΕΞΕΡΓΑΣΙΑ ΠΑΡΑΓΓΕΛΙΑΣ...</span>
                ) : (
                  <>
                    <span>ΕΠΙΒΕΒΑΙΩΣΗ &amp; ΠΛΗΡΩΜΗ</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-[10px] text-neutral-400 text-center leading-tight">
                Πατώντας επιβεβαίωση, αποδέχεστε τους Όρους Χρήσης και την Πολιτική Απορρήτου της Nomikos Tools Α.Ε.Β.Ε.
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
