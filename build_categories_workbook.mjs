import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const root = process.cwd();
const text = await fs.readFile(`${root}/src/data/categoriesData.ts`, 'utf8');
const hierarchyText = await fs.readFile(`${root}/src/data/categoryHierarchy.ts`, 'utf8');
const objectBlocks = [...text.matchAll(/\{\s*"id":\s*"([^"]+)"([\s\S]*?)\n\s*\},?/g)];
const cats = objectBlocks.map((m) => {
  const b = m[0];
  const get = (key) => { const q = b.match(new RegExp(`"${key}"\\s*:\\s*"([^"]*)"`)); return q?.[1] ?? ''; };
  const num = (key) => Number(b.match(new RegExp(`"${key}"\\s*:\\s*(\\d+)`))?.[1] ?? 0);
  const bool = (key) => b.includes(`"${key}": true`);
  return { id: m[1], name: get('name'), slug: get('slug'), level: num('level'), order: num('order'), active: bool('active'), featured: bool('featured') };
});

const groups = [
  ['Ηλεκτρικά Εργαλεία', ['δράπανα','γωνιακοί τροχοί','τριβεία','πριόνια','φρέζες','πιστόλια θερμού','πριτσιναδόροι','κολλητήρια','πλάνες','καρφωτικά']],
  ['Εργαλεία Μπαταρίας', ['μπαταρία','μπαταριών','μπουλονόκλειδα','δραπανοκατσάβιδα','πολυεργαλεία','καστάνιες']],
  ['Εργαλεία Χειρός', ['κατσαβίδια χειρός','πένσες','κόφτες','σφυριά','βαριοπούλες','γερμαν','κλειδιά','κάβουρες']],
  ['Κοπτικά, Τρυπάνια & Εξαρτήματα', ['τρυπάνια','μύτες','λάμες','δίσκοι','κοπτικά','εξαρτήματα']],
  ['Υδραυλικά & Αποφρακτικά', ['υδραυλ','αποφρακ','σωληνοκόφτες','βιδολόγοι','ατσαλίνες']],
  ['Κήπος & Αγροτικά Εργαλεία', ['κήπου','χλοο','αλυσοπρίονα','κλαδέματος','ψαλίδια μπορντούρας','ψεκαστήρες','φυσητήρες','τσεκούρια']],
  ['Μέτρηση & Ηλεκτρολογικά', ['αλφάδια','μέτρα laser','μέτρα','πολύμετρα','τάσης','αμπεροτσιμπίδες','θερμόμετρα']],
  ['Καθαρισμός', ['σκούπες','σκουπάκια','καθαρισμού','απορροφητήρες']],
  ['Αποθήκευση & Εργαστήριο', ['εργαλειοθήκες','εργαλειοφόροι','τσάντες εργαλείων','βαλιτσάκια','συρταριέρες','πάγκοι εργασίας','μπαούλα']],
  ['Ασφάλεια & Ρουχισμός Εργασίας', ['κράνη','παπούτσια εργασίας','ωτοασπίδες','γάντια','πρώτων βοηθειών','εργασίας']],
  ['Μηχανήματα & Εξοπλισμός Εργοταξίου', ['μηχανήματα','μπετονιέρες','κομπρεσέρ','αντλίες','μετάγγισης','μεταφορά','ανύψωση']],
  ['Αναλώσιμα & Αξεσουάρ', ['αναλώσιμα','μαρκαδόροι','αξεσουάρ','διάφορα αναλώσιμα']]
];
const classify = (name) => { const n = name.toLocaleLowerCase('el-GR'); return groups.find(([_, kws]) => kws.some(k => n.includes(k)))?.[0] ?? 'Λοιπά / Χρειάζεται απόφαση'; };
cats.forEach(c => c.proposedGroup = classify(c.name));

const recommendations = [
  ['Ηλεκτρικά Εργαλεία','Δράπανα Επεξεργασίας Μετάλλου; Καροτιέρες Διάτρησης; Γωνιακοί Τροχοί; Ηλεκτρικά Τριβεία; Φρέζες & Πλάνες; Δισκοπρίονα; Σέγες & Σπαθοσέγες','Ομαδοποίηση σε ενιαίο βασικό menu με υποκατηγορίες ανά εργαλείο','Ισχυρή πρόταση'],
  ['Εργαλεία Μπαταρίας','Μπαταρίες & Φορτιστές Εργαλείων; Σετ Εργαλείων Μπαταρίας; Μπουλονόκλειδα; Δραπανοκατσάβιδα & Ηλεκτρικά Κατσαβίδια','Κρατήστε τα προϊόντα μπαταρίας κάτω από ξεχωριστό menu και χρησιμοποιήστε φίλτρο τάσης/πλατφόρμας','Ισχυρή πρόταση'],
  ['Εργαλεία Χειρός','Γερμανοπολύγωνα; Γαλλικά Κλειδιά; Κλειδιά Allen; Ψαλίδια; Λοστοί - Προκοβγάλτες; Εξωλκείς','Merge σε “Εργαλεία Χειρός” με υποκατηγορίες','Ισχυρή πρόταση'],
  ['Κοπτικά, Τρυπάνια & Εξαρτήματα','Δίσκοι Κοπής; Δίσκοι Λείανσης; Τσοκ Τρυπανιών; Αντάπτορες για Καρυδάκια και Μύτες; Καλέμια & Βελόνια Σκαπτικών','Ένα menu για αναλώσιμα/εξαρτήματα, με ξεχωριστές υποκατηγορίες ανά εφαρμογή','Ισχυρή πρόταση'],
  ['Υδραυλικά & Αποφρακτικά','Αποφρακτικά Εργαλεία; Βοηθητικά Εργαλεία Υδραυλικών; Πρέσες Σύσφιξης Σωλήνων; Βιδολόγοι Υδραυλικών; Σωληνοκόφτες Υδραυλικών','Ενιαία κατηγορία με υποκατηγορίες “Σωλήνες”, “Απόφραξη”, “Πρεσάρισμα”','Ισχυρή πρόταση'],
  ['Κήπος & Αγροτικά Εργαλεία','Μηχανές Γκαζόν; Αλυσοπρίονα; Φυσητήρες / Απορροφητήρες Κήπου; Σύνδεσμοι / Ρακόρ Ποτίσματος','Ενιαίο menu κήπου με υποκατηγορίες μηχανημάτων και ποτίσματος','Ισχυρή πρόταση'],
  ['Ασφάλεια & Ρουχισμός Εργασίας','Γάντια Εργασίας; Μάσκες Εργασίας; Ωτοασπίδες; Ωτοασπίδες Εργασίας; Γιλέκα Εργασίας; Μπλούζες Εργασίας; Σκούφοι & Καπέλα Εργασίας','Merge ομοειδών κατηγοριών και διατήρηση τύπου προϊόντος ως υποκατηγορία','Άμεση βελτίωση'],
  ['Αποθήκευση & Εργαστήριο','Εργαλειοθήκες με Εργαλεία; Εργαλειοφόροι; Σκαφάκια Αποθήκευσης Εργαλείων','Ενιαίο menu “Αποθήκευση Εργαλείων”','Ισχυρή πρόταση'],
  ['Καθαρισμός','Σκούπες Υγρών Στερεών; Σακούλες Σκούπας; Πετσέτες Microfiber','Η “Σακούλες Σκούπας” μπορεί να είναι παιδί της κατηγορίας σκούπες/καθαρισμός','Πρόταση ιεραρχίας'],
  ['Μηχανήματα & Εξοπλισμός Εργοταξίου','Μηχανήματα Επεξεργασίας Δαπέδου & Οδοστρώματος; Δονητές Μπετόν; Αντλίες Νερού Επιφάνειας','Ενιαίο menu εργοταξίου, με υποκατηγορίες ανά χρήση','Ισχυρή πρόταση'],
  ['Ειδική ιεραρχία','Παγούρια; Παιδικά Παγούρια','“Παιδικά Παγούρια” κάτω από “Παγούρια”','Πρόταση ιεραρχίας']
];

const wb = Workbook.create();
const s1 = wb.worksheets.add('Όλες οι Κατηγορίες');
const s2 = wb.worksheets.add('Προτάσεις Menu');
s1.showGridLines = false; s2.showGridLines = false;
s1.getRange('A1:H1').values = [['ID','Κατηγορία','Slug','Επίπεδο','Σειρά','Ενεργή','Προτεινόμενη ομάδα menu','Featured']];
s1.getRange(`A2:H${cats.length+1}`).values = cats.map(c=>[c.id,c.name,c.slug,c.level,c.order,c.active,c.proposedGroup,c.featured]);
s1.getRange(`A1:H${cats.length+1}`).format.font = {name:'Arial',size:10,color:'#1F2937'};
s1.getRange('A1:H1').format = {fill:'#1F4E78',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},verticalAlignment:'center'};
s1.getRange(`A1:H${cats.length+1}`).format.borders = {preset:'inside',style:'thin',color:'#D9E2F3'};
s1.getRange(`D2:E${cats.length+1}`).format.numberFormat = '0';
s1.getRange(`F2:F${cats.length+1}`).format.numberFormat = '@';
s1.getRange(`A1:H${cats.length+1}`).format.wrapText = false;
s1.getRange('A1:H1').format.rowHeight = 24; s1.getRange(`A2:H${cats.length+1}`).format.rowHeight = 18;
s1.getRange('A:A').format.columnWidth = 36; s1.getRange('B:B').format.columnWidth = 38; s1.getRange('C:C').format.columnWidth = 34; s1.getRange('D:H').format.columnWidth = 16;
s1.freezePanes.freezeRows(1); s1.tables.add(`A1:H${cats.length+1}`,true,'CategoriesTable');

s2.getRange('A1:D1').values = [['Προτεινόμενο menu / parent','Κατηγορίες που μπορούν να μπουν από κάτω ή να ενοποιηθούν','Σκεπτικό για το menu','Προτεραιότητα']];
s2.getRange(`A2:D${recommendations.length+1}`).values = recommendations;
s2.getRange('F1:G1').values = [['Σημείωση','Οι προτάσεις είναι merchandising πρόταση βάσει ομοιότητας ονομασίας και της υπάρχουσας πρώτης ταξινόμησης του project.']];
s2.getRange('A1:D1').format = {fill:'#1F4E78',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},verticalAlignment:'center'};
s2.getRange(`A2:D${recommendations.length+1}`).format = {font:{name:'Arial',size:10,color:'#1F2937'},wrapText:true,verticalAlignment:'top'};
s2.getRange(`A1:D${recommendations.length+1}`).format.borders = {preset:'inside',style:'thin',color:'#D9E2F3'};
s2.getRange('F1:G1').format = {fill:'#EAF2F8',font:{name:'Arial',size:10,bold:true,color:'#1F2937'},wrapText:true};
s2.getRange('A:A').format.columnWidth = 34; s2.getRange('B:B').format.columnWidth = 72; s2.getRange('C:C').format.columnWidth = 55; s2.getRange('D:D').format.columnWidth = 20; s2.getRange('F:F').format.columnWidth = 16; s2.getRange('G:G').format.columnWidth = 55;
s2.getRange(`A2:D${recommendations.length+1}`).format.rowHeight = 66; s2.getRange('F1:G1').format.rowHeight = 48;
s2.freezePanes.freezeRows(1); s2.tables.add(`A1:D${recommendations.length+1}`,true,'MenuRecommendationsTable');

wb.recalculate();
const check = await wb.inspect({kind:'table',range:`Όλες οι Κατηγορίες!A1:H8`,include:'values,formulas',tableMaxRows:8,tableMaxCols:8});
console.log(check.ndjson);
const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:50},summary:'final formula error scan'});
console.log(errors.ndjson);
const outDir = `${root}/outputs/categories-menu`;
await fs.mkdir(outDir,{recursive:true});
const preview = await wb.render({sheetName:'Προτάσεις Menu',range:'A1:G13',scale:1,format:'png'});
await fs.writeFile(`${outDir}/menu-preview.png`,new Uint8Array(await preview.arrayBuffer()));
const xlsx = await SpreadsheetFile.exportXlsx(wb); await xlsx.save(`${outDir}/categories-menu.xlsx`);
console.log(`Created ${cats.length} categories and ${recommendations.length} menu recommendations`);
