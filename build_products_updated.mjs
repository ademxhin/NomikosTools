import fs from 'node:fs/promises';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';

const root = process.cwd();
const productsText = await fs.readFile(`${root}/src/data/productsData.ts`, 'utf8');
const products = JSON.parse(productsText.slice(productsText.indexOf('= [') + 2, productsText.lastIndexOf(']') + 1));
const pasted = await fs.readFile('C:/Users/ademx/.codex/attachments/e5ab209b-585f-49ea-ae3d-f7857f3d3be0/Pasted text.txt', 'utf8');
const mapping = {};
const re = /'([^']+)': \('([^']*)', '([^']*)', '([^']*)'\)/g;
for (const m of pasted.matchAll(re)) mapping[m[1]] = [m[2], m[3], m[4]];
mapping['Δράπανα'] = ['Ηλεκτρικά Εργαλεία & Εργαλεία Μπαταρίας', 'Δράπανα & Βιδώματα', 'Δραπανοκατσάβιδα & Ηλεκτρικά Κατσαβίδια'];
mapping['Κολλητήρια'] = ['Ηλεκτρικά Εργαλεία & Εργαλεία Μπαταρίας', 'Ειδικά & Πολυεργαλεία', 'Ειδικά Ηλεκτρικά Εργαλεία'];

const updated = products.map(p => {
  const old = p.category ?? p.attributes?.category ?? '';
  const [parent, subcategory, category] = mapping[old] ?? ['', '', old];
  return { ...p, category, parentCategory: parent, subcategory };
});
const categoryRows = [...new Map(updated.map(p => [p.category, [p.parentCategory, p.subcategory, p.category]])).values()];
const headers = ['id','name','slug','shortDescription','fullDescription','sku','ean','manufacturerCode','brandId','categoryIds','category','parentCategory','subcategory','price','costPrice','vatRate','stockQuantity','lowStockThreshold','availabilityStatus','unit','packageQuantity','images','specifications','featured','active'];
const productsRows = updated.map(p => headers.map(h => Array.isArray(p[h]) || (p[h] && typeof p[h] === 'object') ? JSON.stringify(p[h]) : (p[h] ?? '')));

const wb = Workbook.create();
const ps = wb.worksheets.add('Products');
const cs = wb.worksheets.add('New Categories');
ps.getRange(`A1:${String.fromCharCode(64 + headers.length)}1`).values = [headers];
ps.getRange(`A2:${String.fromCharCode(64 + headers.length)}${productsRows.length + 1}`).values = productsRows;
cs.getRange('A1:C1').values = [['Γονική Κατηγορία','Υποκατηγορία','Κατηγορία προϊόντος']];
cs.getRange(`A2:C${categoryRows.length + 1}`).values = categoryRows;
for (const s of [ps, cs]) { s.showGridLines = false; s.freezePanes.freezeRows(1); }
ps.getRange(`A1:${String.fromCharCode(64 + headers.length)}1`).format = {fill:'#1F4E78',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,verticalAlignment:'center'};
cs.getRange('A1:C1').format = {fill:'#1F4E78',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,verticalAlignment:'center'};
ps.getRange(`A1:${String.fromCharCode(64 + headers.length)}${productsRows.length + 1}`).format.font = {name:'Arial',size:10,color:'#1F2937'};
cs.getRange(`A1:C${categoryRows.length + 1}`).format.font = {name:'Arial',size:10,color:'#1F2937'};
ps.getRange(`A1:${String.fromCharCode(64 + headers.length)}${productsRows.length + 1}`).format.borders = {preset:'inside',style:'thin',color:'#D9E2F3'};
cs.getRange(`A1:C${categoryRows.length + 1}`).format.borders = {preset:'inside',style:'thin',color:'#D9E2F3'};
ps.getRange('A:A').format.columnWidth = 16; ps.getRange('B:B').format.columnWidth = 38; ps.getRange('C:C').format.columnWidth = 34;
ps.getRange('D:E').format.columnWidth = 42; ps.getRange('K:M').format.columnWidth = 34; ps.getRange('N:U').format.columnWidth = 14; ps.getRange('V:W').format.columnWidth = 24;
cs.getRange('A:C').format.columnWidth = 38;
ps.tables.add(`A1:${String.fromCharCode(64 + headers.length)}${productsRows.length + 1}`, true, 'ProductsTable');
cs.tables.add(`A1:C${categoryRows.length + 1}`, true, 'NewCategoriesTable');
wb.recalculate();
const unmatched = [...new Set(products.map(p => p.category ?? p.attributes?.category).filter(c => !mapping[c]))];
const check = await wb.inspect({kind:'table',range:'Products!J1:M6',include:'values,formulas',tableMaxRows:6,tableMaxCols:4});
console.log(check.ndjson);
console.log(JSON.stringify({products: products.length, originalCategories: new Set(products.map(p => p.category ?? p.attributes?.category)).size, mappedCategories: Object.keys(mapping).length, unmatched}));
const errors = await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'final formula error scan'});
console.log(errors.ndjson);
const outDir = `${root}/outputs/products-categories`;
await fs.mkdir(outDir,{recursive:true});
const preview = await wb.render({sheetName:'Products',range:'A1:M12',scale:1,format:'png'});
await fs.writeFile(`${outDir}/products-preview.png`, new Uint8Array(await preview.arrayBuffer()));
const out = await SpreadsheetFile.exportXlsx(wb);
await out.save(`${outDir}/Nomikos_Tools_Updated.xlsx`);
