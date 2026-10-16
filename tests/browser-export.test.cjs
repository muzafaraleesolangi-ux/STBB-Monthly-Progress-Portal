'use strict';
/* Headless Chrome integration test: click actual preview, click actual Download, validate XLSX. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const os=require('node:os');
const {spawnSync}=require('node:child_process');
const {chromium}=require('playwright');

const ROOT=path.resolve(__dirname,'..'),OUT=path.join(__dirname,'artifacts');
fs.mkdirSync(OUT,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(ROOT,'.'+pathname);
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end('Forbidden');return}
 fs.readFile(file,(err,bytes)=>{
  if(err){res.writeHead(404).end('Not found');return}
  const ext=path.extname(file).toLowerCase();
  res.writeHead(200,{'content-type':ext==='.js'?'application/javascript':ext==='.css'?'text/css':ext==='.html'?'text/html; charset=utf-8':'application/octet-stream','cache-control':'no-store'});
  res.end(bytes);
 });
});

async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port;
 let browser;
 try{
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  for(const mode of ['desktop','mobile']){
   const context=await browser.newContext({viewport:mode==='mobile'?{width:390,height:844}:{width:1300,height:850},isMobile:mode==='mobile',hasTouch:mode==='mobile',acceptDownloads:true});
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.goto('http://127.0.0.1:'+port+'/tests/browser-export-harness.html',{waitUntil:'load'});
   await page.waitForFunction(()=>window.testSignals?.ready===true,{timeout:20000});
   await page.getByRole('button',{name:/Preview original Proforma/i}).click();
   const child=page.frameLocator('#editor');
   await child.locator('#previewSchool').waitFor({timeout:15000});
   await child.locator('#previewSchool').evaluate(el=>{if(!el.textContent.includes('STBB TEST SCHOOL'))throw Error('School name missing in preview: '+el.textContent)});
   const rows=await child.locator('#previewTable tbody tr').count();
   assert.equal(rows,1,'Preview must show exactly one sample subject, without defaults');
   const rowtext=await child.locator('#previewTable tbody tr').first().innerText();
   assert.match(rowtext,/Mathematics/);
   assert.match(rowtext,/Sample Teacher/);
   assert.match(rowtext,/Very Good/);
   let state=await page.evaluate(()=>window.testSignals);
   assert.equal(state.exportReceived,false,'Preview must not auto-export');
   const downloadPromise=page.waitForEvent('download',{timeout:45000});
   await page.getByRole('button',{name:/Download Excel/i}).click();
   const download=await downloadPromise;
   const output=path.join(OUT,'browser-export-'+mode+'.xlsx');
   await download.saveAs(output);
   state=await page.evaluate(()=>window.testSignals);
   assert.equal(state.exportReceived,true,'Real iframe must deliver a generated XLSX message');
   assert.equal(state.downloadInitiated,true,'Real browser download handler must execute');
   assert.deepEqual(state.errors,[],JSON.stringify(state.errors));
   assert.match(download.suggestedFilename(),/Monthly_Progress_STBB_TEST_SCHOOL_October_2026\.xlsx/);
   const bytes=fs.readFileSync(output);
   assert.ok(bytes.length>1000,'Downloaded Excel workbook should be non-trivial');
   assert.equal(bytes.readUInt32LE(0),0x04034b50,'Browser-downloaded .xlsx must be ZIP');
   assert.equal(errors.length,0,'Browser JS exceptions: '+errors.join(' | '));
   console.log('BROWSER EXPORT '+mode.toUpperCase()+' SUCCESS: '+bytes.length+' bytes, '+download.suggestedFilename()+'; preview '+rows+' subject row(s)');
   await context.close();
  }
  const py=String.raw`import sys,zipfile,xml.etree.ElementTree as ET, pathlib
for name in sys.argv[1:]:
 p=pathlib.Path(name)
 with zipfile.ZipFile(p) as z:
  assert z.testzip() is None, 'Corrupted xlsx'
  for required in ['[Content_Types].xml','xl/workbook.xml','xl/worksheets/sheet1.xml','xl/styles.xml']:
   assert required in z.namelist(), 'Missing '+required
  wb=ET.fromstring(z.read('xl/workbook.xml'))
  sh=ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
  assert any(el.attrib.get('name')=='Proforma' for el in wb.iter()),'Worksheet must be Proforma'
  content=z.read('xl/worksheets/sheet1.xml').decode('utf8')
  for needle in ['STBB TEST SCHOOL','Mathematics','Sample Teacher']:
   assert needle in content, 'Missing sample Excel cell: '+needle
  assert len(list(sh.iter()))>100,'Workbook should contain real cell/row XML'
  print('VERIFIED REAL EXCEL WORKBOOK:',p.name, 'bytes=',p.stat().st_size,'sheet=Proforma, ZIP and cells valid')
`;
  const verify=spawnSync('python3',['-c',py,path.join(OUT,'browser-export-desktop.xlsx'),path.join(OUT,'browser-export-mobile.xlsx')],{encoding:'utf8'});
  if(verify.status!==0)throw Error('XLSX validation failed:\n'+verify.stderr+'\n'+verify.stdout);
  console.log(verify.stdout);
 }finally{
  if(browser)await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
