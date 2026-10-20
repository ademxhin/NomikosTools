import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const path = `${process.cwd()}/outputs/categories-menu/categories-menu.xlsx`;
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const source = wb.worksheets.getItem('Όλες οι Κατηγορίες');
const vals = source.getRange('A2:H200').values.filter(r => r[0]);
const s = wb.worksheets.add('Τελικά Categories');
s.showGridLines = false;
const top = ['Ηλεκτρικά Εργαλεία','Εργαλεία Μπαταρίας','Εργαλεία Χειρός','Κοπτικά, Τρυπάνια & Εξαρτήματα','Υδραυλικά & Αποφρακτικά','Κήπος & Αγροτικά Εργαλεία','Μέτρηση & Ηλεκτρολογικά','Καθαρισμός','Αποθήκευση & Εργαστήριο','Ασφάλεια & Ρουχισμός Εργασίας','Μηχανήματα & Εξοπλισμός Εργοταξίου','Αναλώσιμα & Αξεσουάρ','Λοιπά / Χρειάζεται απόφαση'];
const rows = [['Επίπεδο','Parent category','Τελική category','Final path','Προέλευση']];
for (const t of top) rows.push([1,'',t,t,'Νέα βασική κατηγορία menu']);
for (const r of vals) {
  const group = r[6] || 'Λοιπά / Χρειάζεται απόφαση';
  const name = r[1];
  rows.push([2,group,name,`${group} > ${name}`,'Από υπάρχουσα κατηγορία']);
}
// Explicit final parent/child cleanups from the recommendation sheet.
rows.push([2,'Παγούρια','Παιδικά Παγούρια','Παγούρια > Παιδικά Παγούρια','Ενοποίηση parent/child']);
rows.push([2,'Καθαρισμός','Σακούλες Σκούπας','Καθαρισμός > Σακούλες Σκούπας','Ενοποίηση parent/child']);
s.getRange(`A1:E${rows.length}`).values = rows;
s.getRange('A1:E1').format = {fill:'#1F4E78',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},verticalAlignment:'center'};
s.getRange(`A2:E${rows.length}`).format = {font:{name:'Arial',size:10,color:'#1F2937'},verticalAlignment:'center'};
s.getRange(`A1:E${rows.length}`).format.borders = {preset:'inside',style:'thin',color:'#D9E2F3'};
s.getRange('A:A').format.columnWidth = 12; s.getRange('B:B').format.columnWidth = 36; s.getRange('C:C').format.columnWidth = 42; s.getRange('D:D').format.columnWidth = 72; s.getRange('E:E').format.columnWidth = 28;
s.getRange(`A1:E${rows.length}`).format.rowHeight = 20; s.freezePanes.freezeRows(1); s.tables.add(`A1:E${rows.length}`,true,'FinalCategoriesTable');
wb.recalculate();
const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:50},summary:'final formula error scan'});
console.log(errors.ndjson);
const out = await SpreadsheetFile.exportXlsx(wb); await out.save(path);
console.log(`Added ${rows.length-1} final category rows`);
