import React from 'react';
import { Phone, Truck, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  onNavigate: (route: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onNavigate }) => {
  const { isB2BMode, setIsB2BMode, activeRole, setActiveRole } = useStore();
  const { user } = useAuth();

  return (
    <div id="top-contact-bar" className="bg-[#121212] text-xs text-neutral-300 border-b border-[#2a2a2a] px-4 py-1.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: Contact & Value Props */}
        <div className="flex items-center space-x-4">
          <a
            href="tel:2105550190"
            className="flex items-center space-x-1.5 text-neutral-200 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#e21b22]" />
            <span className="font-semibold tracking-wide">210 5550190</span>
            <span className="hidden sm:inline text-neutral-400 font-normal">(08:00 - 17:30)</span>
          </a>
          <span className="hidden md:inline text-neutral-600">|</span>
          <div className="hidden md:flex items-center space-x-1.5 text-neutral-300">
            <Truck className="w-3.5 h-3.5 text-[#e21b22]" />
            <span>Δωρεάν Μεταφορικά άνω των 50€</span>
          </div>
          <span className="hidden lg:inline text-neutral-600">|</span>
          <div className="hidden lg:flex items-center space-x-1.5 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>Επίσημος Αντιπρόσωπος &amp; Service</span>
          </div>
        </div>

        {/* Right: B2B VAT Switcher, Admin Logistics Portal, Support */}
        <div className="flex items-center space-x-4 ml-auto">
          {/* B2B Toggle */}
          <div className="flex items-center space-x-1.5 bg-[#1e1e1e] px-2 py-0.5 rounded border border-[#333]">
            <span className="text-[11px] font-medium text-neutral-300">Τιμολόγιο B2B (Χωρίς ΦΠΑ):</span>
            <button
              id="b2b-vat-toggle"
              onClick={() => setIsB2BMode(!isB2BMode)}
              className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                isB2BMode ? 'bg-[#e21b22]' : 'bg-neutral-600'
              }`}
              title="Εναλλαγή προβολής τιμών με/χωρίς ΦΠΑ 24%"
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isB2BMode ? 'translate-x-4' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-[10px] font-bold ${isB2BMode ? 'text-[#ffb4b7]' : 'text-neutral-400'}`}>
              {isB2BMode ? 'NET' : 'GROSS'}
            </span>
          </div>

          {/* Quick link to Logistics Admin */}
          <button
            id="top-admin-portal-btn"
            onClick={() => onNavigate('/admin')}
            className="flex items-center space-x-1 text-[#ffb4b7] hover:text-white bg-[#e21b22]/20 hover:bg-[#e21b22] px-2.5 py-0.5 rounded border border-[#e21b22]/40 transition-colors text-[11px] font-semibold"
          >
            <ShieldAlert className="w-3 h-3 text-[#ffe0e1]" />
            <span className="font-display uppercase tracking-wider">Logistics &amp; Admin</span>
          </button>

          {/* Role selector badge for testing */}
          <div className="hidden xl:flex items-center space-x-1 text-neutral-400 text-[11px]">
            <span>Ρόλος:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className="bg-[#1e1e1e] text-neutral-200 border border-[#333] rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Catalog Manager">Catalog Manager</option>
              <option value="Warehouse Operator">Warehouse Operator</option>
              <option value="Order Manager">Order Manager</option>
              <option value="Support Agent">Support Agent</option>
              <option value="Read Only">Read Only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
