import React from 'react';
import {
  ShieldCheck,
  Truck,
  Wrench,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface InfoPageProps {
  pageType: 'about' | 'services' | 'warranty' | 'contact' | 'terms' | 'shipping-payment';
  onNavigate: (route: string) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({ pageType, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 select-none">
      {pageType === 'about' && (
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-8 shadow-sm space-y-6 text-sm text-neutral-700 leading-relaxed">
          <div className="border-b border-neutral-200 pb-4">
            <span className="text-[11px] font-mono-spec font-bold text-[#af101a] uppercase tracking-wider block">
              ΠΟΙΟΙ ΕΙΜΑΣΤΕ
            </span>
            <h1 className="font-display font-black text-3xl text-neutral-900 uppercase">
              ΣΧΕΤΙΚΑ ΜΕ ΤΗ NOMIKOS TOOLS Α.Ε.Β.Ε.
            </h1>
          </div>

          <p>
            Η <strong>Nomikos Tools</strong> αποτελεί τον κορυφαίο προμηθευτή επαγγελματικών εργαλείων, μηχανημάτων επεξεργασίας και βιομηχανικού εξοπλισμού στην Ελλάδα από το 1994. Με ιδιόκτητο κέντρο logistics 4.500 τ.μ. στον Ασπρόπυργο Αττικής και εξειδικευμένο κατάστημα στον Αγ. Ιωάννη Ρέντη, εξυπηρετούμε καθημερινά τεχνικές εταιρείες, συνεργεία, βιομηχανίες και απαιτητικούς επαγγελματίες τεχνίτες.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#fbfbfb] border border-neutral-200 p-4 rounded text-center space-y-1">
              <div className="font-display font-black text-2xl text-[#af101a]">10,000+</div>
              <div className="text-xs font-bold text-neutral-800">Ετοιμοπαράδοτα Εργαλεία</div>
              <div className="text-[10px] text-neutral-500">Πλήρης παρακαταθήκη ανταλλακτικών</div>
            </div>
            <div className="bg-[#fbfbfb] border border-neutral-200 p-4 rounded text-center space-y-1">
              <div className="font-display font-black text-2xl text-[#af101a]">30+ ΧΡΟΝΙΑ</div>
              <div className="text-xs font-bold text-neutral-800">Εμπειρία &amp; Τεχνογνωσία</div>
              <div className="text-[10px] text-neutral-500">Συνεχής τεχνική υποστήριξη</div>
            </div>
            <div className="bg-[#fbfbfb] border border-neutral-200 p-4 rounded text-center space-y-1">
              <div className="font-display font-black text-2xl text-[#af101a]">24 ΩΡΕΣ</div>
              <div className="text-xs font-bold text-neutral-800">Express Παράδοση</div>
              <div className="text-[10px] text-neutral-500">Πανελλαδικό δίκτυο ACS &amp; Box Now</div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h3 className="font-display font-bold text-lg text-neutral-900 uppercase">
              ΕΠΙΣΗΜΕΣ ΑΝΤΙΠΡΟΣΩΠΕΥΣΕΙΣ
            </h3>
            <p>
              Είμαστε επίσημοι εξουσιοδοτημένοι διανομείς των κορυφαίων κατασκευαστών παγκοσμίως:
              <strong> Milwaukee Tool, DeWalt, Bosch Professional, Makita, Festool, Knipex, Wera, Stanley FatMax</strong> κ.ά. Όλα τα μηχανήματα συνοδεύονται από γνήσια εργοστασιακή εγγύηση και δυνατότητα επέκτασης έως 3 έτη.
            </p>
          </div>
        </div>
      )}

      {pageType === 'services' && (
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-8 shadow-sm space-y-6 text-sm text-neutral-700 leading-relaxed">
          <div className="border-b border-neutral-200 pb-4">
            <span className="text-[11px] font-mono-spec font-bold text-[#af101a] uppercase tracking-wider block">
              ΕΞΕΙΔΙΚΕΥΜΕΝΕΣ ΥΠΗΡΕΣΙΕΣ
            </span>
            <h1 className="font-display font-black text-3xl text-neutral-900 uppercase">
              ΕΞΟΥΣΙΟΔΟΤΗΜΕΝΟ SERVICE &amp; B2B ΛΥΣΕΙΣ
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="border border-neutral-200 p-5 rounded-lg space-y-2 bg-[#fafafa]">
              <div className="w-10 h-10 rounded-full bg-red-100 text-[#af101a] flex items-center justify-center">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                ΕΠΙΣΗΜΟ ΕΞΟΥΣΙΟΔΟΤΗΜΕΝΟ SERVICE
              </h3>
              <p className="text-xs text-neutral-600">
                Διαθέτουμε πλήρως εξοπλισμένο τεχνικό τμήμα επισκευών με πιστοποιημένους τεχνικούς Milwaukee, Bosch και DeWalt. Χρησιμοποιούμε αποκλειστικά 100% γνήσια ανταλλακτικά και παρέχουμε 12μηνη εγγύηση σε κάθε επισκευή.
              </p>
            </div>

            <div className="border border-neutral-200 p-5 rounded-lg space-y-2 bg-[#fafafa]">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0d47a1] flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
                ΠΩΛΗΣΕΙΣ ΧΟΝΔΡΙΚΗΣ &amp; ΕΡΓΟΤΑΞΙΑΚΕΣ ΠΡΟΜΗΘΕΙΕΣ
              </h3>
              <p className="text-xs text-neutral-600">
                Ειδικές κλίμακες τιμών για κατασκευαστικές εταιρείες, δήμους, βιομηχανίες και τεχνικά γραφεία. Δυνατότητα πίστωσης, άμεση έκδοση τιμολογίων με άρθρο 39α και παραδόσεις κατευθείαν στο εργοτάξιο.
              </p>
            </div>
          </div>
        </div>
      )}

      {pageType === 'contact' && (
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-8 shadow-sm space-y-6 text-sm text-neutral-700 leading-relaxed">
          <div className="border-b border-neutral-200 pb-4">
            <span className="text-[11px] font-mono-spec font-bold text-[#af101a] uppercase tracking-wider block">
              ΕΠΙΚΟΙΝΩΝΗΣΤΕ ΜΑΖΙ ΜΑΣ
            </span>
            <h1 className="font-display font-black text-3xl text-neutral-900 uppercase">
              ΚΑΤΑΣΤΗΜΑΤΑ &amp; ΕΞΥΠΗΡΕΤΗΣΗ ΠΕΛΑΤΩΝ
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="border border-neutral-200 p-5 rounded-lg space-y-3 bg-[#fafafa]">
              <h3 className="font-display font-bold text-sm text-neutral-900 uppercase flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-[#af101a]" />
                <span>ΚΕΝΤΡΙΚΑ ΓΡΑΦΕΙΑ &amp; LOGISTICS CENTER</span>
              </h3>
              <div className="space-y-1 text-neutral-600">
                <p className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Θέση Γκορυτσά, 19300 Ασπρόπυργος Αττικής</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono-spec">Τηλεφωνικό Κέντρο: 210 5550190</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Email: sales@nomikostools.gr</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Ωράριο: Δευτέρα - Παρασκευή 07:30 - 18:00, Σάββατο 08:00 - 14:00</span>
                </p>
              </div>
            </div>

            <div className="border border-neutral-200 p-5 rounded-lg space-y-3 bg-[#fafafa]">
              <h3 className="font-display font-bold text-sm text-neutral-900 uppercase flex items-center space-x-1.5">
                <Building2 className="w-4 h-4 text-[#af101a]" />
                <span>ΚΑΤΑΣΤΗΜΑ &amp; SERVICE POINT ΡΕΝΤΗ</span>
              </h3>
              <div className="space-y-1 text-neutral-600">
                <p className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Λεωφ. Κηφισού 92 &amp; Πειραιώς, 18233 Αγ. Ι. Ρέντης</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="font-mono-spec">Τηλ: 210 4812300</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Ωράριο: Δευτέρα - Παρασκευή 08:00 - 17:30</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {pageType === 'shipping-payment' && (
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-8 shadow-sm space-y-6 text-sm text-neutral-700 leading-relaxed">
          <div className="border-b border-neutral-200 pb-4">
            <span className="text-[11px] font-mono-spec font-bold text-[#af101a] uppercase tracking-wider block">
              ΟΡΟΙ ΣΥΝΑΛΛΑΓΩΝ
            </span>
            <h1 className="font-display font-black text-3xl text-neutral-900 uppercase">
              ΤΡΟΠΟΙ ΑΠΟΣΤΟΛΗΣ &amp; ΠΛΗΡΩΜΗΣ
            </h1>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-bold text-base text-neutral-900 uppercase">
              ΤΡΟΠΟΙ ΑΠΟΣΤΟΛΗΣ
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-600">
              <li>
                <strong>ACS Courier Express:</strong> Παράδοση σε 1-2 εργάσιμες ημέρες σε όλη την ηπειρωτική και νησιωτική Ελλάδα. Δωρεάν μεταφορικά για παραγγελίες άνω των 50€, διαφορετικά χρέωση 3,50€.
              </li>
              <li>
                <strong>BOX NOW 24/7 Lockers:</strong> Παραλαβή από αυτόματη θυρίδα οποιαδήποτε ώρα του 24ώρου. Δωρεάν για παραγγελίες άνω των 40€, διαφορετικά 2,50€.
              </li>
              <li>
                <strong>Παραλαβή από το Κατάστημα (Click &amp; Collect):</strong> Δωρεάν παραλαβή εντός 2 ωρών από το Logistics Center Ασπροπύργου.
              </li>
            </ul>

            <h3 className="font-display font-bold text-base text-neutral-900 uppercase pt-4">
              ΤΡΟΠΟΙ ΠΛΗΡΩΜΗΣ
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-xs text-neutral-600">
              <li><strong>Viva Wallet Smart Checkout:</strong> Με IRIS, Apple Pay, Google Pay ή χρεωστική/πιστωτική κάρτα.</li>
              <li><strong>Stripe:</strong> Ασφαλείς συναλλαγές με Visa, Mastercard, American Express με 3D Secure v2.</li>
              <li><strong>Klarna:</strong> Αγοράστε τώρα και πληρώστε σε 3 άτοκες δόσεις με τη χρεωστική σας κάρτα.</li>
              <li><strong>Αντικαταβολή Μετρητών:</strong> Πληρωμή στον διανομέα courier (+2.00€).</li>
              <li><strong>Τραπεζική Κατάθεση:</strong> Σε λογαριασμούς Eurobank, Εθνικής, Alpha Bank ή Τράπεζας Πειραιώς.</li>
            </ul>
          </div>
        </div>
      )}

      {pageType === 'warranty' && (
        <div className="bg-white border border-[#cfd8dc] rounded-lg p-8 shadow-sm space-y-6 text-sm text-neutral-700 leading-relaxed">
          <div className="border-b border-neutral-200 pb-4">
            <span className="text-[11px] font-mono-spec font-bold text-[#af101a] uppercase tracking-wider block">
              ΕΓΓΥΗΣΗ ΚΑΤΑΣΚΕΥΑΣΤΗ
            </span>
            <h1 className="font-display font-black text-3xl text-neutral-900 uppercase">
              ΕΓΓΥΗΣΗ &amp; ΠΟΛΙΤΙΚΗ ΕΠΙΣΤΡΟΦΩΝ
            </h1>
          </div>

          <p>
            Όλα τα ηλεκτρικά εργαλεία, εργαλεία μπαταρίας και μηχανήματα που διατίθενται από τη Nomikos Tools καλύπτονται από επίσημη ευρωπαϊκή εγγύηση 1 έως 3 ετών.
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded text-xs space-y-1 text-emerald-900">
            <span className="font-bold block">Διαδικασία Επέκτασης Εγγύησης:</span>
            <p>
              Επισκεφθείτε την επίσημη ιστοσελίδα του κατασκευαστή (π.χ. milwaukeetool.eu, bosch-professional.com) εντός 30 ημερών από την ημερομηνία έκδοσης του τιμολογίου ή της απόδειξης για να λάβετε το πιστοποιητικό επέκτασης εγγύησης στα 3 χρόνια χωρίς καμία επιπλέον χρέωση.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
