import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Send,
  ExternalLink,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useWorkspace } from '../../context/WorkspaceContext';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { state: workspace } = useWorkspace();
  const { showToast } = useStore();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Παρακαλώ εισάγετε έγκυρο email', 'warning');
      return;
    }
    showToast('Η εγγραφή newsletter δεν έχει συνδεθεί ακόμη με υπηρεσία αποστολής.', 'info');
  };

  return (
    <footer className="bg-[#141414] text-neutral-300 border-t border-[#262626] mt-16 select-none">
      {/* 4 Value Pillars Banner */}
      <div className="border-b border-[#262626] bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded bg-[#e21b22]/20 border border-[#e21b22]/40 flex items-center justify-center shrink-0 text-[#ffb4b7]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white  tracking-wider">
                ΑΜΕΣΗ ΑΠΟΣΤΟΛΗ ΠΑΝΕΛΛΑΔΙΚΑ
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Δωρεάν μεταφορικά άνω των 50€. Παράδοση σε 24 ώρες με ACS ή Box Now Locker.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded bg-[#2e7d32]/20 border border-[#2e7d32]/40 flex items-center justify-center shrink-0 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white  tracking-wider">
                100% ΓΝΗΣΙΑ ΠΡΟΪΟΝΤΑ &amp; ΕΓΓΥΗΣΗ
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Επίσημη εγγύηση ελληνικής &amp; ευρωπαϊκής αντιπροσωπείας έως 3 έτη.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded bg-sky-900/30 border border-sky-800/40 flex items-center justify-center shrink-0 text-sky-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white  tracking-wider">
                ΕΠΙΣΤΡΟΦΗ ΕΝΤΟΣ 14 ΗΜΕΡΩΝ
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Δυνατότητα εύκολης αλλαγής ή επιστροφής χρημάτων χωρίς περίπλοκες διαδικασίες.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded bg-amber-900/30 border border-amber-800/40 flex items-center justify-center shrink-0 text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white  tracking-wider">
                ΑΣΦΑΛΕΙΣ ΠΛΗΡΩΜΕΣ &amp; ΔΟΣΕΙΣ
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Viva Wallet, Stripe, 3 άτοκες δόσεις Klarna, Αντικαταβολή &amp; Τραπεζική κατάθεση.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-3 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:px-4 sm:py-12 sm:gap-8 text-xs">
        {/* Col 1: Brand Info */}
        <div className="lg:col-span-2 space-y-4">
          <img src="/assets/nomikos-tools-logo.png" alt="Nomikos Tools" className="h-16 w-[320px] max-w-full object-contain object-left origin-left" />

          <p className="text-neutral-400 leading-relaxed max-w-sm">
            Η <strong>Nomikos Tools Α.Ε.Β.Ε.</strong> εξειδικεύεται στον βιομηχανικό εξοπλισμό, στα επαγγελματικά εργαλεία μπαταρίας, στα μηχανήματα συνεργείου και στις ολοκληρωμένες λύσεις εργοταξίου από το 1994.
          </p>

          <div className="space-y-2 text-neutral-300">
            <div className="flex items-center space-x-2.5">
              <MapPin className="w-4 h-4 text-[#e21b22] shrink-0" />
              <span>Κατάστημα: Λεωφ. Σαλαμίνος 111, Κερατσίνι 187 56</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Phone className="w-4 h-4 text-[#e21b22] shrink-0" />
              <span>Τηλεφωνικό Κέντρο: {workspace.content?.phone ?? '2110069347'} (Δευτ-Παρ 08:00 - 17:00)</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Mail className="w-4 h-4 text-[#e21b22] shrink-0" />
              <span>Email: {workspace.content?.email ?? 'sales@nomikostools.gr'}</span>
            </div>
          </div>
        </div>

        {/* Col 2: Customer Service */}
        <div className="space-y-3">
          <h5 className="font-display font-bold text-sm text-white  tracking-wider border-b border-[#2a2a2a] pb-2">
            ΕΞΥΠΗΡΕΤΗΣΗ ΠΕΛΑΤΩΝ
          </h5>
          <ul className="space-y-2 text-neutral-400">
            <li>
              <button onClick={() => onNavigate('/track-order')} className="hover:text-white transition-colors">
                Εντοπισμός Παραγγελίας
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/shipping')} className="hover:text-white transition-colors">
                Τρόποι &amp; Έξοδα Αποστολής
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/payments')} className="hover:text-white transition-colors">
                Τρόποι Πληρωμής &amp; Δόσεις
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/returns')} className="hover:text-white transition-colors">
                Πολιτική Επιστροφών &amp; Service
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                Επικοινωνία &amp; Καταστήματα
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/account')} className="hover:text-white transition-colors">
                Ο Λογαριασμός μου
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Information & Legal */}
        <div className="space-y-3">
          <h5 className="font-display font-bold text-sm text-white  tracking-wider border-b border-[#2a2a2a] pb-2">
            ΧΡΗΣΙΜΕΣ ΠΛΗΡΟΦΟΡΙΕΣ
          </h5>
          <ul className="space-y-2 text-neutral-400">
            <li>
              <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                Σχετικά με την Εταιρεία
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                Όροι Χρήσης &amp; Συναλλαγών
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">
                Πολιτική Απορρήτου &amp; GDPR
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/offers')} className="hover:text-white transition-colors">
                Εβδομαδιαίες Προσφορές
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/brand/milwaukee')} className="hover:text-white transition-colors">
                Milwaukee Heavy Duty
              </button>
            </li>
            <li>
            </li>
          </ul>
        </div>

        {/* Col 4: Newsletter & Partner Badges */}
        <div className="space-y-4">
          <h5 className="font-display font-bold text-sm text-white  tracking-wider border-b border-[#2a2a2a] pb-2">
            NEWSLETTER &amp; ΕΚΠΤΩΣΕΙΣ
          </h5>
          <p className="text-neutral-400 leading-relaxed text-[11px]">
            Εγγραφείτε για να λαμβάνετε πρώτοι ειδικές τιμές B2B, νέες αφίξεις Milwaukee &amp; DeWalt και τεχνικούς οδηγούς.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Εισάγετε το επαγγελματικό email σας..."
                className="w-full bg-[#242424] text-white px-3 py-2 text-xs rounded border border-[#383838] focus:border-[#e21b22] focus:outline-none"
              />
              <button
                type="submit"
                className="mt-1.5 w-full bg-[#e21b22] hover:bg-[#c81016] text-white font-display font-bold  py-2 px-3 rounded text-xs tracking-wider flex items-center justify-center space-x-1.5 transition-colors"
              >
                <span>ΕΓΓΡΑΦΗ</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Logistics & Couriers */}
          <div className="pt-2">
            <span className="text-[10px] text-neutral-400  font-mono-spec font-semibold block mb-1.5">
              ΣΥΝΕΡΓΑΤΕΣ ΔΙΑΝΟΜΗΣ
            </span>
            <div className="flex items-center space-x-2">
              <span className="bg-[#2a2a2a] text-red-400 font-bold px-2 py-1 rounded text-[11px] border border-red-950">
                ACS Express
              </span>
              <span className="bg-[#2a2a2a] text-emerald-400 font-bold px-2 py-1 rounded text-[11px] border border-emerald-950">
                BOX NOW 24/7
              </span>
              <span className="bg-[#2a2a2a] text-neutral-300 font-bold px-2 py-1 rounded text-[11px] border border-neutral-700">
                Store Pickup
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal Copyright Bar */}
      <div className="border-t border-[#222] bg-[#0d0d0d] py-4 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} <strong>NOMIKOS TOOLS Α.Ε.Β.Ε.</strong> - Αρ. ΓΕΜΗ: 123456789000. Με την επιφύλαξη παντός δικαιώματος.
            <span className="ml-2 text-neutral-400">Created by CSAX</span>
          </div>
          <div className="flex items-center space-x-3 text-[11px] text-neutral-400">
            <span>ΑΦΜ: 094827102 (ΔΟΥ ΦΑΕ Πειραιά)</span>
            <span>•</span>
            <button onClick={() => onNavigate('/privacy')} className="hover:text-white">
              Cookies &amp; Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
