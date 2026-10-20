import React, { useState } from 'react';
import {
  User,
  Package,
  Heart,
  Settings,
  Truck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { OrderStatusBadge } from '../components/common/OrderStatusBadge';

interface AccountPageProps {
  onNavigate: (route: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { orders, wishlist, products } = useStore();
  const { user, logout, updateUser, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'wishlist'>('orders');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.companyName || '',
    vatNumber: user?.vatNumber || '',
    taxOffice: user?.taxOffice || '',
  });

  const visibleOrders = isAdmin ? orders : orders.filter((order) => order.customer.email === user?.email);
  const wishlistProducts = products.filter((product) => wishlist.includes(product.id));

  const saveProfile = () => {
    updateUser(profile);
    setSavedMessage('Τα στοιχεία αποθηκεύτηκαν επιτυχώς.');
    window.setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Profile Header */}
      <div className="bg-[#181818] text-white p-6 rounded-lg border border-[#2a2a2a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-[#e21b22] text-white flex items-center justify-center font-display font-black text-2xl">
            {user?.name?.slice(0, 1) || 'N'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display font-bold text-xl uppercase tracking-wider text-white">
                {user?.name || 'Επαγγελματίας Πελάτης'}
              </h1>
              {user?.isB2B && (
                <span className="text-[10px] font-mono-spec font-bold bg-[#e21b22] text-white px-2 py-0.5 rounded">
                  B2B PRO
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {user?.email} | ΑΦΜ: {user?.vatNumber || '094827102'} ({user?.taxOffice || 'ΦΑΕ Πειραιά'})
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="text-neutral-400 hover:text-white px-3 py-2 border border-neutral-700 rounded font-semibold"
          >
            Αποσύνδεση
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#cfd8dc] bg-white rounded-t-lg px-4 gap-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-[#e21b22] text-[#e21b22]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΙΣΤΟΡΙΚΟ ΠΑΡΑΓΓΕΛΙΩΝ ({visibleOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-[#e21b22] text-[#e21b22]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
            ΠΡΟΣΩΠΙΚΑ ΣΤΟΙΧΕΙΑ
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'addresses'
              ? 'border-[#e21b22] text-[#e21b22]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΔΙΕΥΘΥΝΣΕΙΣ ΠΑΡΑΔΟΣΗΣ
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'wishlist'
              ? 'border-[#e21b22] text-[#e21b22]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΑΓΑΠΗΜΕΝΑ ({wishlistProducts.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-200">
            <span>Όλες οι καταχωρημένες παραγγελίες σας</span>
            <span>Σύνολο: {visibleOrders.length} παραγγελίες</span>
          </div>

          <div className="divide-y divide-neutral-200">
            {visibleOrders.length === 0 ? (
              <div className="py-12 text-center text-neutral-500">
                <Package className="mx-auto mb-3 h-8 w-8 text-neutral-300" />
                <p className="font-semibold">Δεν υπάρχουν παραγγελίες για αυτόν τον λογαριασμό.</p>
                <button onClick={() => onNavigate('/products')} className="mt-3 text-[#e21b22] font-bold hover:underline">Ξεκινήστε τις αγορές σας →</button>
              </div>
            ) : visibleOrders.map((ord) => {
              const isExpanded = expandedOrderId === ord.id;
              return (
              <div key={ord.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-display font-bold text-base text-neutral-900">
                      Παραγγελία #{ord.orderNumber}
                    </span>
                    <span className="text-neutral-400 ml-2 font-mono-spec">
                      {ord.createdAt}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300">
                      {ord.status}
                    </span>
                    <span className="font-mono-spec font-bold text-sm text-neutral-900">
                      €{ord.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order items: compact preview, expandable to full product details */}
                <div className="bg-[#fbfbfb] rounded border border-neutral-200 overflow-hidden">
                  {ord.items.map((item, idx) => {
                    const product = products.find((candidate) => candidate.id === item.productId);
                    const itemImage = item.image || product?.images?.[0];
                    const lineTotal = (item.price || 0) * (item.quantity || 0);
                    return (
                    <div key={idx} className="flex items-center gap-3 px-3 py-2.5 border-b last:border-b-0 border-neutral-200">
                      {isExpanded && itemImage ? (
                        <img src={itemImage} alt={item.name || product?.name || 'Προϊόν'} className="w-14 h-14 rounded border border-neutral-200 bg-white object-contain p-1 shrink-0" />
                      ) : <div className="w-2 h-2 rounded-full bg-[#e21b22] shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-neutral-800 truncate">{item.name || product?.name || 'Προϊόν'}</div>
                        {isExpanded && <div className="text-[11px] text-neutral-500 mt-0.5">SKU: {item.sku || product?.sku || '—'}</div>}
                        {!isExpanded && <div className="text-[11px] text-neutral-500 mt-0.5">{item.quantity || 0} τεμ.</div>}
                      </div>
                      <div className="text-right shrink-0 text-xs">
                        {isExpanded && <div className="text-neutral-500">€{(item.price || 0).toFixed(2)} × {item.quantity || 0}</div>}
                        <div className="font-mono-spec font-semibold text-neutral-900">€{lineTotal.toFixed(2)}</div>
                      </div>
                    </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-neutral-500 pt-1">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-[#e21b22]" />
                    <span>{ord.shipping?.carrierName || 'Δεν έχει οριστεί μεταφορέας'}</span>
                    {ord.shipping?.trackingNumber && (
                      <span className="font-mono-spec font-bold text-neutral-700">
                        [{ord.shipping.trackingNumber}]
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {ord.shipping?.trackingNumber && (
                      <button
                        onClick={() => onNavigate(`/track-order?voucher=${ord.shipping?.trackingNumber}`)}
                        className="text-[#e21b22] font-bold hover:underline"
                      >
                        Ζωντανός Εντοπισμός Αποστολής →
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                      className="text-neutral-700 hover:text-black font-semibold"
                    >
                      {isExpanded ? 'Απόκρυψη προϊόντων' : 'Προβολή προϊόντων'}
                    </button>
                    <button
                      onClick={() => onNavigate(`/order-confirmation/${ord.orderNumber}`)}
                      className="text-[#e21b22] hover:underline font-semibold"
                    >
                      Λεπτομέρειες παραγγελίας
                    </button>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-6 shadow-sm space-y-6 max-w-2xl text-xs">
          <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
            ΣΤΟΙΧΕΙΑ ΕΠΑΓΓΕΛΜΑΤΙΚΟΥ ΛΟΓΑΡΙΑΣΜΟΥ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Ονοματεπώνυμο Εκπροσώπου</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Email Επικοινωνίας</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">ΑΦΜ Εταιρείας</label>
              <input
                type="text"
                value={profile.vatNumber}
                onChange={(e) => setProfile({ ...profile, vatNumber: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded font-mono-spec"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Δ.Ο.Υ.</label>
              <input
                type="text"
                value={profile.taxOffice}
                onChange={(e) => setProfile({ ...profile, taxOffice: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-700 mb-1">Επωνυμία Επιχείρησης</label>
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={saveProfile}
              className="bg-[#e21b22] text-white px-5 py-2.5 rounded font-display font-bold uppercase"
            >
              ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ
            </button>
            {savedMessage && <span className="text-emerald-700 font-semibold">{savedMessage}</span>}
          </div>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
            ΑΠΟΘΗΚΕΥΜΕΝΕΣ ΔΙΕΥΘΥΝΣΕΙΣ ΠΑΡΑΔΟΣΗΣ &amp; ΕΡΓΟΤΑΞΙΩΝ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-[#e21b22] p-4 rounded-lg bg-red-50/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 uppercase">Κεντρικά Γραφεία / Έδρα</span>
                <span className="text-[10px] font-bold text-[#e21b22] bg-white px-2 py-0.5 rounded border border-[#e21b22]">
                  ΠΡΟΕΠΙΛΟΓΗ
                </span>
              </div>
              <p className="text-neutral-700">Θέση Γκορυτσά, 19300 Ασπρόπυργος Αττικής</p>
              <p className="text-neutral-500 font-mono-spec">Τηλ: 2110069347</p>
            </div>

            <div className="border border-neutral-200 p-4 rounded-lg bg-white space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 uppercase">Εργοτάξιο Πειραιά</span>
              </div>
              <p className="text-neutral-700">Ακτή Μιαούλη 85, 18538 Πειραιάς</p>
              <p className="text-neutral-500 font-mono-spec">Τηλ: 6940000000</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wishlist' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-6 shadow-sm">
          <h3 className="font-display font-bold text-base text-neutral-900 uppercase mb-4">ΑΓΑΠΗΜΕΝΑ ΠΡΟΪΟΝΤΑ</h3>
          {wishlistProducts.length === 0 ? (
            <p className="py-10 text-center text-neutral-500">Δεν έχετε αποθηκεύσει αγαπημένα προϊόντα.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map((product) => (
                <button key={product.id} onClick={() => onNavigate(`/product/${product.slug}`)} className="text-left border border-neutral-200 rounded-lg p-3 hover:border-[#e21b22] transition-colors">
                  <div className="flex gap-3 items-center">
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded bg-neutral-100" />
                    <div className="min-w-0"><p className="font-semibold text-neutral-900 line-clamp-2">{product.name}</p><p className="text-[#e21b22] font-bold mt-1">€{(product.salePrice || product.price).toFixed(2)}</p></div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
