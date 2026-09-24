# Ωριαίος συγχρονισμός προϊόντων

Το εργαλείο κατεβάζει το XML του προμηθευτή, αντιστοιχίζει τα προϊόντα του Excel με `MPN → Alternativecode` και εναλλακτικά `EAN → Barcode`, και δημιουργεί νέο ενημερωμένο workbook χωρίς να αλλάζει το αρχικό.

## Αποτελέσματα

- `outputs/nomikos-hourly-sync/Nomikos Tools - Ενημερωμένο.xlsx`: το τελευταίο επιτυχές αποτέλεσμα.
- `outputs/nomikos-hourly-sync/τελευταία_αναφορά.csv`: οι εξαιρέσεις της τελευταίας εκτέλεσης.
- `automation/logs/sync.log`: ιστορικό εκτελέσεων και σφαλμάτων.

Αν το σταθερό αρχείο Excel είναι ανοικτό, η εκτέλεση αποθηκεύει timestamped αρχείο και δεν καταστρέφει το προηγούμενο αποτέλεσμα.

## Εγκατάσταση

1. Αντιγράψτε το `.env.example` ως `.env` και συμπληρώστε τον σύνδεσμο XML και τη διαδρομή του Excel.
2. Εκτελέστε από PowerShell:

   `powershell -ExecutionPolicy Bypass -File .\automation\install_task.ps1`

Η εργασία `Nomikos Tools Hourly Sync` εκτελείται ανά μία ώρα όταν ο συγκεκριμένος χρήστης είναι συνδεδεμένος στα Windows. Η πρώτη εκτέλεση γίνεται κατά την εγκατάσταση.

## Χειροκίνητη εκτέλεση

`powershell -ExecutionPolicy Bypass -File .\automation\run_now.ps1`

## Αφαίρεση προγραμματισμού

`powershell -ExecutionPolicy Bypass -File .\automation\uninstall_task.ps1`
