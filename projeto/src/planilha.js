/* EFCwork · planilha.js — gera .xlsx sem biblioteca e sem internet (zip sem compressão, Office Open XML). Prefixo: pl.
   Veio do EFClaudian (bkZipPartes, bkAbaXml…), reduzido a uma aba. */
const PL_CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const plUtf8 = s => new TextEncoder().encode(s);
function plCrc(u8) { let c = 0xFFFFFFFF; for (let i = 0; i < u8.length; i++) c = PL_CRC[(c ^ u8[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function plZip(arqs) {
  const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  const partes = [], central = []; let off = 0;
  arqs.forEach(f => {
    const nome = plUtf8(f.nome), d = typeof f.dados === 'string' ? plUtf8(f.dados) : f.dados, crc = plCrc(d);
    const loc = new Uint8Array([0x50, 0x4b, 3, 4].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(d.length), u32(d.length), u16(nome.length), u16(0)));
    partes.push(loc, nome, d);
    central.push(new Uint8Array([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(d.length), u32(d.length), u16(nome.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(off))), nome);
    off += loc.length + nome.length + d.length;
  });
  const tam = central.reduce((a, x) => a + x.length, 0);
  return partes.concat(central, [new Uint8Array([0x50, 0x4b, 5, 6].concat(u16(0), u16(0), u16(arqs.length), u16(arqs.length), u32(tam), u32(off), u16(0)))]);
}
function plXml(s) { return String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function plCol(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
function plCel(v, ref, est) {
  if (v == null || v === '') return '';
  if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"' + (est ? ' s="' + est + '"' : '') + '><v>' + v + '</v></c>';
  let t = String(v); if (t.length > 32000) t = t.slice(0, 32000) + '…';
  return '<c r="' + ref + '" t="inlineStr"' + (est ? ' s="' + est + '"' : '') + '><is><t xml:space="preserve">' + plXml(t) + '</t></is></c>';
}
function plAba(cab, linhas) {
  const larg = cab.map((h, i) => Math.min(60, Math.max(8, String(h).length + 2, ...linhas.slice(0, 200).map(l => l[i] == null ? 0 : Math.min(60, String(l[i]).length + 1)))));
  const row = (vals, r, est) => '<row r="' + r + '">' + vals.map((v, i) => plCel(v, plCol(i) + r, est)).join('') + '</row>';
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>' +
    '<cols>' + larg.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols><sheetData>' + row(cab, 1, 1) + linhas.map((l, n) => row(l, n + 2, 0)).join('') + '</sheetData></worksheet>';
}
function plXlsx(nomeAba, cab, linhas) {
  const aba = String(nomeAba || 'Planilha').replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31) || 'Planilha';
  return [
    { nome: '[Content_Types].xml', dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>' },
    { nome: '_rels/.rels', dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
    { nome: 'xl/workbook.xml', dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="' + plXml(aba) + '" sheetId="1" r:id="rId1"/></sheets></workbook>' },
    { nome: 'xl/_rels/workbook.xml.rels', dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
    { nome: 'xl/styles.xml', dados: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="10"/><name val="Arial"/></font><font><b/><sz val="10"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF2EEE4"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' },
    { nome: 'xl/worksheets/sheet1.xml', dados: plAba(cab, linhas) }
  ];
}
function plBaixar(arqs, nome) {
  const blob = new Blob(plZip(arqs), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  S._plUltimo = { nome: nome, arqs: arqs, tamanho: blob.size };
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => { try { URL.revokeObjectURL(a.href); } catch {} a.remove(); }, 4000); } catch {}
}
