import React, { useState } from 'react';
import { Truck, Search, CheckCircle2, Clock, MapPin, Package, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface TrackOrderPageProps {
  initialVoucher?: string;
  onNavigate: (route: string) => void;
}

export const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  initialVoucher = '',
  onNavigate,
}) => {
  const { orders } = useStore();
  const [voucher, setVoucher] = useState(initialVoucher);
  const [searchedVoucher, setSearchedVoucher] = useState(initialVoucher);

  const matchingOrder = orders.find(
    (o) =>
      (o.shipping.trackingNumber &&
        o.shipping.trackingNumber.toLowerCase() === searchedVoucher.toLowerCase()) ||
      o.orderNumber.toLowerCase() === searchedVoucher.toLowerCase()
  );

  const trackingInfo = { status: matchingOrder?.status ?? 'Δεν βρέθηκε διαθέσιμη παραγγελία για αυτόν τον λογαριασμό', history: matchingOrder?.statusHistory.map(s => ({ event: s.status, date: s.timestamp, location: 'Δοκιμαστική καταχώριση καταστήματος' })) ?? [] };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucher.trim()) return;
    setSearchedVoucher(voucher.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 select-none">
      <div className="text-center space-y-2">
        <h1 className="font-display font-black text-3xl sm:text-4xl text-neutral-900 uppercase tracking-tight">
          ΠΟΡΕΙΑ ΠΑΡΑΓΓΕΛΙΑΣ
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto">
          Εισάγετε τον αριθμό voucher της ACS, τον κωδικό Box Now ή τον αριθμό παραγγελίας σας (π.χ. NT-84920).
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2 pt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
              placeholder="Αριθμός Voucher (π.χ. ACS-893049102GR)..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#cfd8dc] rounded text-xs font-mono-spec focus:border-[#e21b22] focus:outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            className="bg-[#e21b22] hover:bg-[#c81016] text-white px-5 py-2.5 rounded font-display font-bold text-xs uppercase tracking-wider"
          >
            ΑΝΑΖΗΤΗΣΗ
          </button>
        </form>
      </div>

      {/* Tracking Result Card */}
      {searchedVoucher && (
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-6 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4">
            <div>
              <span className="text-[10px] font-mono-spec font-bold text-neutral-400 uppercase tracking-wider block">
                ΑΡΙΘΜΟΣ ΑΠΟΣΤΟΛΗΣ
              </span>
              <div className="font-display font-bold text-xl text-neutral-900">
                {searchedVoucher}
              </div>
              {matchingOrder && (
                <div className="text-xs text-[#e21b22] font-semibold mt-0.5">
                  Συνδεδεμένη με Παραγγελία #{matchingOrder.orderNumber}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{trackingInfo.status}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-neutral-900 uppercase">
              ΠΟΡΕΙΑ ΔΙΑΚΙΝΗΣΗΣ
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200 text-xs">
              {trackingInfo.history.map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-[#e21b22] text-white flex items-center justify-center border-2 border-white shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900">{step.event}</div>
                    <div className="text-neutral-500 flex items-center space-x-2 mt-0.5 text-[11px]">
                      <span>{step.location}</span>
                      <span>•</span>
                      <span className="font-mono-spec">{step.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Courier help */}
          <div className="bg-neutral-50 p-3.5 rounded border border-neutral-200 text-xs flex items-center justify-between">
            <span className="text-neutral-600">
              Χρειάζεστε άμεση βοήθεια με την αποστολή σας;
            </span>
            <a
              href="tel:2110069347"
              className="text-[#e21b22] font-bold hover:underline"
            >
              Καλέστε στο 2110069347 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
