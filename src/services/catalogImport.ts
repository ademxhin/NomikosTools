export function parseCsv(text: string): string[][] {
  text = text.replace(/^\uFEFF/, '');
  const separator = (text.split(/\r?\n/)[0].match(/;/g)?.length ?? 0) > (text.split(/\r?\n/)[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const result: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if (c === separator && !quoted) { row.push(field); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); result.push(row); row = []; field = ''; }
    else field += c;
  }
  if (quoted) throw new Error('Το CSV έχει μη κλεισμένα εισαγωγικά.');
  if (field || row.length) result.push([...row, field]);
  if (result.length > 5001) throw new Error('Έως 5.000 γραμμές ανά δοκιμαστική εισαγωγή.');
  return result;
}
