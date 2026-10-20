import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
const path = `${process.cwd()}/outputs/categories-menu/categories-menu.xlsx`;
const wb = await SpreadsheetFile.importXlsx(await FileBlob.load(path));
const source = wb.worksheets.getItem('Τελικά Categories');
const vals = source.getRange('A2:E250').values.filter(r => r[2]);
const s = wb.worksheets.add('Τελικά με IDs');
s.showGridLines = false;
const slug = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const parentIds = new Map();
const rows = [['Επίπεδο','Category ID','Parent Category ID','Parent category','Τελική category','Final path','Προέλευση']];
let parentNo = 1;
for (const r of vals) {
  const level = r[0]; const parent = r[1] || ''; const name = r[2];
  if (level === 1) {
    const id = `menu-${String(parentNo++).padStart(3,'0')}-${slug(name) || 'category'}`;
    parentIds.set(name,id); rows.push([1,id,'', '',name,r[3],r[4]]);
  } else {
    const pid = parentIds.get(parent) || `menu-${slug(parent) || 'other'}`;
    const cid = r[4]?.includes('Ωτοασπίδες') && name === 'Ωτοασπίδες Εργασίας' ? 'cat-otoaspides-ergasias' : (r[4]?.includes('Ωτοασπίδες') && name === 'Ωτοασπίδες' ? 'cat-otoaspides' : `cat-${slug(name) || 'category'}`);
    rows.push([2,cid,pid,parent,name,r[3],r[4]]);
  }
}
s.getRange(`A1:G${rows.length}`).values = rows;
s.getRange('A1:G1').format = {fill:'#1F4E78',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},verticalAlignment:'center'};
s.getRange(`A2:G${rows.length}`).format = {font:{name:'Arial',size:10,color:'#1F2937'},verticalAlignment:'center'};
s.getRange(`A1:G${rows.length}`).format.borders = {preset:'inside',style:'thin',color:'#D9E2F3'};
s.getRange('A:A').format.columnWidth = 10; s.getRange('B:C').format.columnWidth = 34; s.getRange('D:D').format.columnWidth = 36; s.getRange('E:E').format.columnWidth = 42; s.getRange('F:F').format.columnWidth = 72; s.getRange('G:G').format.columnWidth = 28;
s.getRange(`A1:G${rows.length}`).format.rowHeight = 20; s.freezePanes.freezeRows(1); s.tables.add(`A1:G${rows.length}`,true,'FinalCategoriesIdsTable');
wb.recalculate();
const out = await SpreadsheetFile.exportXlsx(wb); await out.save(path);
console.log(`Added ${rows.length-1} rows with category IDs`);
