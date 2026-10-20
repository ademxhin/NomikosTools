# Admin και λογαριασμός πελάτη

## Έλεγχος 2026-10-20
React 19 / Vite / TypeScript / Tailwind 4, custom History API routing, Lucide.
Δεν βρέθηκε AGENTS.md. Δεν υπάρχει server, database, WooCommerce ή πραγματικό authentication.
Ο κατάλογος `productsData.ts` προέρχεται από Excel. StoreContext χρησιμοποιεί browser storage.
Orders, stock movements και audit είναι fixtures. Payment/courier services προσομοιώνουν επιτυχία.
Η προηγούμενη AuthContext συνέδεε αυτόματα όλους ως Super Admin. Το /admin ήταν κρυμμένο.

## Σειρά και κατάσταση
- [ ] Διαχωρισμός demo, πρόσβαση, συμβόλαια, layouts
- [ ] Κατάλογος, φόρμες και κατηγορίες
- [ ] Παραγγελίες, αποθήκη και συλλογή
- [ ] Λογαριασμός, διευθύνσεις, αιτήματα
- [ ] Εισαγωγές, ρυθμίσεις και dashboard
- [ ] Typecheck, build, domain tests, οπτικός έλεγχος

Το υπάρχον StoreContext παραμένει η μοναδική πηγή καταλόγου και παραγγελιών στο demo.
Η δοκιμαστική πρόσβαση δεν αποτελεί ασφάλεια παραγωγής. Production endpoints και server permissions
θα χρειαστούν backend. Καμία πληρωμή, email, voucher ή refund δεν πρέπει να παρουσιάζεται ως πραγματικό.
