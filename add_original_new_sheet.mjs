import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const path = `${process.cwd()}/outputs/categories-menu/categories-menu.xlsx`;
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const old = wb.worksheets.getItem('Όλες οι Κατηγορίες');
const rec = wb.worksheets.getItem('Προτάσεις Menu');
const s = wb.worksheets.add('Original και New');
s.showGridLines = false;
const rows = [
  ['Original κατηγορία','New κατηγορία / θέση στο menu','Τύπος αλλαγής','Σχόλιο'],
  ['Μπαταρίες & Φορτιστές Εργαλείων','Εργαλεία Μπαταρίας > Μπαταρίες & Φορτιστές','Parent / child','Κρατάμε την κατηγορία ως υποκατηγορία'],
  ['Σετ Εργαλείων Μπαταρίας','Εργαλεία Μπαταρίας > Σετ Εργαλείων','Parent / child',''],
  ['Δραπανοκατσάβιδα & Ηλεκτρικά Κατσαβίδια','Εργαλεία Μπαταρίας > Δραπανοκατσάβιδα','Rename + parent','Πιο σύντομο όνομα στο menu'],
  ['Γερμανοπολύγωνα','Εργαλεία Χειρός > Κλειδιά','Merge / parent','Μπορεί να ομαδοποιηθεί με Γαλλικά Κλειδιά και Κλειδιά Allen'],
  ['Γαλλικά Κλειδιά','Εργαλεία Χειρός > Κλειδιά','Merge / parent',''],
  ['Κλειδιά Allen','Εργαλεία Χειρός > Κλειδιά','Merge / parent',''],
  ['Δίσκοι Κοπής','Κοπτικά, Τρυπάνια & Εξαρτήματα > Δίσκοι','Parent / child',''],
  ['Δίσκοι Λείανσης','Κοπτικά, Τρυπάνια & Εξαρτήματα > Δίσκοι','Parent / child',''],
  ['Τσοκ Τρυπανιών','Κοπτικά, Τρυπάνια & Εξαρτήματα > Εξαρτήματα Τρυπανιών','Rename + parent',''],
  ['Αποφρακτικά Εργαλεία','Υδραυλικά & Αποφρακτικά > Απόφραξη','Parent / child',''],
  ['Βοηθητικά Εργαλεία Υδραυλικών','Υδραυλικά & Αποφρακτικά > Υδραυλικά','Parent / child',''],
  ['Μηχανές Γκαζόν','Κήπος & Αγροτικά Εργαλεία > Μηχανές Γκαζόν','Parent / child',''],
  ['Αλυσοπρίονα','Κήπος & Αγροτικά Εργαλεία > Αλυσοπρίονα','Parent / child',''],
  ['Φυσητήρες / Απορροφητήρες Κήπου','Κήπος & Αγροτικά Εργαλεία > Φυσητήρες & Απορροφητήρες','Rename + parent',''],
  ['Ωτοασπίδες Εργασίας','Ασφάλεια & Ρουχισμός Εργασίας > Ωτοασπίδες','Merge / parent','Merge με Ωτοασπίδες'],
  ['Ωτοασπίδες','Ασφάλεια & Ρουχισμός Εργασίας > Ωτοασπίδες','Merge','Ενοποίηση διπλής κατηγορίας'],
  ['Παιδικά Παγούρια','Παγούρια > Παιδικά Παγούρια','Parent / child',''],
  ['Σακούλες Σκούπας','Καθαρισμός > Σακούλες Σκούπας','Parent / child',''],
  ['Εργαλειοθήκες με Εργαλεία','Αποθήκευση & Εργαστήριο > Εργαλειοθήκες','Rename + parent',''],
  ['Εργαλειοφόροι','Αποθήκευση & Εργαστήριο > Εργαλειοφόροι','Parent / child',''],
  ['Σκαφάκια Αποθήκευσης Εργαλείων','Αποθήκευση & Εργαστήριο > Σκαφάκια Αποθήκευσης','Rename + parent',''],
];
s.getRange(`A1:D${rows.length}`).values = rows;
s.getRange('A1:D1').format = {fill:'#1F4E78',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},verticalAlignment:'center'};
s.getRange(`A2:D${rows.length}`).format = {font:{name:'Arial',size:10,color:'#1F2937'},wrapText:true,verticalAlignment:'top'};
s.getRange(`A1:D${rows.length}`).format.borders = {preset:'inside',style:'thin',color:'#D9E2F3'};
s.getRange('A:A').format.columnWidth = 38; s.getRange('B:B').format.columnWidth = 58; s.getRange('C:C').format.columnWidth = 20; s.getRange('D:D').format.columnWidth = 42;
s.getRange(`A2:D${rows.length}`).format.rowHeight = 34; s.freezePanes.freezeRows(1); s.tables.add(`A1:D${rows.length}`,true,'OriginalNewTable');
wb.recalculate();
const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:50},summary:'final formula error scan'});
console.log(errors.ndjson);
const out = await SpreadsheetFile.exportXlsx(wb); await out.save(path);
console.log(`Updated ${path}`);
