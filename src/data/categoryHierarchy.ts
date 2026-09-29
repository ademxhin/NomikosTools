export interface CategoryGroup {
  id: string;
  name: string;
  keywords: string[];
}

// First-pass merchandising hierarchy. Categories are matched by their Greek
// names until the catalog records receive explicit parentId/level values.
export const categoryGroups: CategoryGroup[] = [
  { id: 'power-tools', name: 'Ηλεκτρικά Εργαλεία', keywords: ['δράπανα', 'γωνιακοί τροχοί', 'τριβεία', 'πριόνια', 'φρέζες', 'πιστόλια θερμού', 'πριτσιναδόροι', 'κολλητήρια', 'πλάνες', 'καρφωτικά'] },
  { id: 'cordless-tools', name: 'Εργαλεία Μπαταρίας', keywords: ['μπαταρία', 'μπαταριών', 'μπουλονόκλειδα', 'δραπανοκατσάβιδα', 'πολυεργαλεία', 'καστάνιες'] },
  { id: 'hand-tools', name: 'Εργαλεία Χειρός', keywords: ['κατσαβίδια χειρός', 'πένσες', 'κόφτες', 'σφυριά', 'βαριοπούλες', 'γερμαν', 'κλειδιά', 'κάβουρες'] },
  { id: 'cutting-accessories', name: 'Κοπτικά, Τρυπάνια & Εξαρτήματα', keywords: ['τρυπάνια', 'μύτες', 'λάμες', 'δίσκοι', 'ποτηροτρύπανα', 'κοπτικά', 'εξαρτήματα'] },
  { id: 'plumbing-drainage', name: 'Υδραυλικά & Αποφρακτικά', keywords: ['υδραυλ', 'αποφρακ', 'σωληνοκόφτες', 'βιδολόγοι', 'ατσαλίνες'] },
  { id: 'garden', name: 'Κήπος & Αγροτικά Εργαλεία', keywords: ['κήπου', 'χλοο', 'αλυσοπρίονα', 'κλαδέματος', 'ψαλίδια μπορντούρας', 'ψεκαστήρες', 'φυσητήρες', 'τσεκούρια'] },
  { id: 'measurement-electrical', name: 'Μέτρηση & Ηλεκτρολογικά', keywords: ['αλφάδια', 'μέτρα laser', 'μέτρα', 'πολύμετρα', 'τάσης', 'αμπεροτσιμπίδες', 'θερμόμετρα'] },
  { id: 'cleaning', name: 'Καθαρισμός', keywords: ['σκούπες', 'σκουπάκια', 'καθαρισμού', 'απορροφητήρες'] },
  { id: 'storage-workshop', name: 'Αποθήκευση & Εξοπλισμός Εργαστηρίου', keywords: ['εργαλειοθήκες', 'εργαλειοφόροι', 'τσάντες εργαλείων', 'βαλιτσάκια', 'συρταριέρες', 'πάγκοι εργασίας', 'μπαούλα'] },
  { id: 'safety-workwear', name: 'Ασφάλεια & Ρουχισμός Εργασίας', keywords: ['κράνη', 'παπούτσια εργασίας', 'ωτοασπίδες', 'γάντια', 'πρώτων βοηθειών'] },
  { id: 'site-equipment', name: 'Μηχανήματα & Εξοπλισμός Εργοταξίου', keywords: ['μηχανήματα', 'μπετονιέρες', 'κομπρεσέρ', 'αντλίες', 'μετάγγισης', 'μεταφορά', 'ανύψωση'] },
  { id: 'consumables', name: 'Αναλώσιμα & Αξεσουάρ', keywords: ['αναλώσιμα', 'μαρκαδόροι', 'αξεσουάρ', 'διάφορα αναλώσιμα'] },
];

export const getCategoryGroup = (name: string): CategoryGroup => {
  const normalized = name.toLocaleLowerCase('el-GR');
  return categoryGroups.find((group) => group.keywords.some((keyword) => normalized.includes(keyword))) ?? categoryGroups[11];
};
