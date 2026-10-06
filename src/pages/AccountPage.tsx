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
  const { user, logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

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
            onClick={() => onNavigate('/admin')}
            className="bg-[#2a2a2a] hover:bg-[#333] text-amber-300 border border-amber-900/40 px-3.5 py-2 rounded font-display font-bold uppercase tracking-wider"
          >
            Πύλη Logistics &amp; ERP
          </button>
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
          ΙΣΤΟΡΙΚΟ ΠΑΡΑΓΓΕΛΙΩΝ ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-4 font-display font-bold text-xs sm:text-sm uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === 'profile'
              ? 'border-[#e21b22] text-[#e21b22]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          ΣΤΟΙΧΕΙΑ ΕΠΙΧΕΙΡΗΣΗΣ (B2B)
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
      </div>

      {/* Tab Panels */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-[#cfd8dc] rounded-b-lg p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-neutral-200">
            <span>Όλες οι καταχωρημένες παραγγελίες σας</span>
            <span>Σύνολο: {orders.length} παραγγελίες</span>
          </div>

          <div className="divide-y divide-neutral-200">
            {orders.map((ord) => (
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

                {/* Items preview */}
                <div className="bg-[#fbfbfb] p-3 rounded border border-neutral-200 text-xs space-y-1">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-neutral-700">
                      <span>• {item.name || 'Προϊόν'} ({item.quantity || 0} τεμ.)</span>
                      <span className="font-mono-spec font-semibold">€{((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
                    </div>
                  ))}
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
                      onClick={() => onNavigate(`/order-confirmation/${ord.orderNumber}`)}
                      className="text-neutral-700 hover:text-black font-semibold"
                    >
                      Λεπτομέρειες
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                defaultValue={user?.name}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Email Επικοινωνίας</label>
              <input
                type="email"
                defaultValue={user?.email}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">ΑΦΜ Εταιρείας</label>
              <input
                type="text"
                defaultValue={user?.vatNumber || '094827102'}
                className="w-full p-2 border border-neutral-300 rounded font-mono-spec"
              />
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Δ.Ο.Υ.</label>
              <input
                type="text"
                defaultValue={user?.taxOffice || 'ΦΑΕ ΠΕΙΡΑΙΑ'}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-700 mb-1">Επωνυμία Επιχείρησης</label>
              <input
                type="text"
                defaultValue={user?.companyName || 'ΝΟΜΙΚΟΣ TOOLS Α.Ε.Β.Ε.'}
                className="w-full p-2 border border-neutral-300 rounded"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Τα στοιχεία αποθηκεύτηκαν επιτυχώς')}
              className="bg-[#e21b22] text-white px-5 py-2.5 rounded font-display font-bold uppercase"
            >
              ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ
            </button>
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
              <p className="text-neutral-500 font-mono-spec">Τηλ: 210 5550190</p>
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
    </div>
  );
};
