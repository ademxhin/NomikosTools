export interface CategoryGroup {
  id: string;
  name: string;
  keywords: string[];
}

export const categoryGroups: CategoryGroup[] = [
  { id: 'parent-apothikeysi-organosi-exoplismos-synergeioy', name: 'Αποθήκευση, Οργάνωση & Εξοπλισμός Συνεργείου', keywords: [] },
  { id: 'parent-exartimata-analosima-ergaleion', name: 'Εξαρτήματα & Αναλώσιμα Εργαλείων', keywords: [] },
  { id: 'parent-ergaleia-cheiros', name: 'Εργαλεία Χειρός', keywords: [] },
  { id: 'parent-ilektrika-ergaleia-ergaleia-mpatarias', name: 'Ηλεκτρικά Εργαλεία & Εργαλεία Μπαταρίας', keywords: [] },
  { id: 'parent-kipos-katharismos-lifestyle', name: 'Κήπος, Καθαρισμός & Lifestyle', keywords: [] },
  { id: 'parent-mesa-atomikis-prostasias-endysi', name: 'Μέσα Ατομικής Προστασίας & Ένδυση', keywords: [] },
  { id: 'parent-michanimata-aeros-exoplismos-domikon-ergon', name: 'Μηχανήματα, Αέρος & Εξοπλισμός Δομικών Έργων', keywords: [] },
  { id: 'parent-organa-metrisis-anichneysis-fotismos', name: 'Όργανα Μέτρησης, Ανίχνευσης & Φωτισμός', keywords: [] },
  { id: 'parent-ydraylika-apofraktika-ergaleia-solinoseon', name: 'Υδραυλικά, Αποφρακτικά & Εργαλεία Σωληνώσεων', keywords: [] },
];

export const getCategoryGroup = (name: string): CategoryGroup =>
  categoryGroups.find((group) => group.name === name) ?? categoryGroups[0];

export const formatSubcategoryName = (name: string): string => {
  const normalized = name.trim().toLocaleLowerCase('el-GR');
  return normalized ? normalized[0].toLocaleUpperCase('el-GR') + normalized.slice(1) : normalized;
};
