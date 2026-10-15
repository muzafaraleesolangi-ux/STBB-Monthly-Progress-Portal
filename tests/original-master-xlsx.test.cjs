'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {TextDecoder,TextEncoder}=require('node:util');
const {JSDOM}=require('jsdom');

async function main(){
 const html=fs.readFileSync('MPR_Online_Editor.html','utf8');
 const doc=new JSDOM(html,{url:'https://school.example/MPR_Online_Editor.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=doc.window;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.structuredClone=structuredClone;w.scrollTo=()=>{};
 const inline=[...w.document.querySelectorAll('script')].find(x=>x.textContent.includes('const XLSX_PARTS ='));
 assert.ok(inline,'Official original master XLSX contents embedded in editor.');
 // The editor's inline script uses strict mode, so functions are scoped to
 // this one eval. Collect the exported workbook in that very same evaluation.
 const result=w.eval(inline.textContent+"\n(()=>{const xml=updateXlsx(),out={};for(const [filename,value] of Object.entries(XLSX_PARTS))out[filename]=filename==='xl/worksheets/sheet1.xml'?new TextEncoder().encode(xml):base64bytes(value);return {blob:zipFile(out),xml,sourceStyles:XLSX_PARTS['xl/styles.xml'],sourceWorkbook:XLSX_PARTS['xl/workbook.xml']}})()");
 assert.equal(typeof result.xml,'string','Original spreadsheet row XML was generated');
 assert.ok(result.xml.includes('sheetData'),'Master worksheet must contain sheetData');
 assert.ok(result.xml.includes('mergeCells'),'Master worksheet must keep original merge layout');
 assert.ok(result.xml.includes('sheetData')&&result.xml.includes('<'),'Master worksheet XML generated');
 const bytes=await new Promise((resolve,reject)=>{
  const reader=new w.FileReader();reader.onload=()=>resolve(Buffer.from(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsArrayBuffer(result.blob)
 });
 assert.equal(bytes.readUInt32LE(0),0x04034b50,'An actual XLSX ZIP file, not merely base64 text');
 const parts=new Map();let offset=0;
 while(offset+30<=bytes.length&&bytes.readUInt32LE(offset)===0x04034b50){
  const method=bytes.readUInt16LE(offset+8),len=bytes.readUInt32LE(offset+18),
        nameLen=bytes.readUInt16LE(offset+26),extraLen=bytes.readUInt16LE(offset+28);
  assert.equal(method,0,'Master ZIP should use supported lossless storage');
  const name=bytes.toString('utf8',offset+30,offset+30+nameLen);
  const start=offset+30+nameLen+extraLen,stop=start+len;
  assert.ok(stop<=bytes.length,'ZIP entry fits within file');
  parts.set(name,bytes.subarray(start,stop));offset=stop
 }
 for(const key of ['[Content_Types].xml','xl/workbook.xml','xl/styles.xml','xl/worksheets/sheet1.xml'])
  assert.ok(parts.has(key),'Original master workbook missing '+key);
 assert.deepEqual(parts.get('xl/styles.xml'),Buffer.from(result.sourceStyles,'base64'),'Original master styles preserved byte for byte');
 assert.deepEqual(parts.get('xl/workbook.xml'),Buffer.from(result.sourceWorkbook,'base64'),'Original master workbook definition preserved byte for byte');
 const sheetText=parts.get('xl/worksheets/sheet1.xml').toString('utf8');
 const parsed=new w.DOMParser().parseFromString(sheetText,'application/xml');
 assert.equal(parsed.querySelector('parsererror'),null,'Generated master worksheet XML is valid');
 assert.ok(parsed.getElementsByTagNameNS('*','mergeCell').length>0,'Proforma header merges preserved');
 console.log('PASS: Original master .xlsx ZIP generated successfully, original workbook and styles byte-identical, merged cells and worksheet XML valid ('+bytes.length+' bytes)');
 doc.window.close()
}
main().catch(err=>{console.error(err);process.exitCode=1});
