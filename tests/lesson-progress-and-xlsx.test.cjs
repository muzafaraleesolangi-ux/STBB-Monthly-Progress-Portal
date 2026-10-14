/* Proforma Excel view and lesson-progress regression tests. No production login. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
async function main(){
 const source=fs.readFileSync('MPR_Online_Editor.html','utf8');
 const start=source.indexOf('const XLSX_PARTS = '),end=source.indexOf(';\n',start);
 assert.ok(start>0&&end>start,'Embedded original Excel Proforma available');
 const packageParts=JSON.parse(source.slice(start+'const XLSX_PARTS = '.length,end));
 const original=Buffer.from(packageParts['xl/worksheets/sheet1.xml'],'base64').toString('utf8');
 const xmlDom=new JSDOM('').window;
 const doc=new xmlDom.DOMParser().parseFromString(original,'application/xml');
 assert.equal(doc.getElementsByTagName('parsererror').length,0);
 const qname=(root,name)=>Array.from(root.children).find(el=>el.localName===name);
 const views=qname(doc.documentElement,'sheetViews');
 assert.ok(views,'original template sheet view present');
 const originalFrozen=views.getElementsByTagNameNS('*','pane').length;
 assert.ok(originalFrozen>0,'Original template has frozen pane');
 const removal=source.match(/const sheetViews=qname\(root,'sheetViews'\);[^\n]*/);
 assert.ok(removal,'Live export has unfreeze logic');
 new Function('doc','qname','const root=doc.documentElement;'+removal[0]+';')(doc,qname);
 assert.equal(doc.getElementsByTagNameNS('*','pane').length,0,'No frozen panes after export');
 assert.equal(doc.getElementsByTagNameNS('*','selection').length,0,'No leftover split selections');
 const school={
  selectedClasses:[5],subjectCatalogInitialized:{1:true,2:true,3:true,4:true,5:true},
  teachers:[{id:'t1',name:'Teacher One',pid:'123',designation:'PST',classes:[5]}],
  books:{5:[{id:'5-english',name:'English',chapters:['Lesson One','Lesson Two','Lesson Three','Lesson Four','Lesson Five'],active:true,teacherId:'t1'}]}
 };
 let cloudVersion=1,savedSubject=null,subjectVersion=0;
 const dom=new JSDOM('<html><body><section id="schooldash"><div id="schoolTabs"></div><div id="school-overview"></div><div id="school-editor"></div></section></body></html>',{url:'https://portal.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=dom.window.document;
 w.structuredClone=global.structuredClone;w.scrollTo=()=>{};w.confirm=()=>true;
 w.alert=message=>{throw Error('Unexpected alert: '+message)};
 w.fetch=async(url,opts)=>{
  const body=JSON.parse(opts.body||'{}'),action=body.action;
  let out;
  if(action==='load-setup')out={setup:school,version:cloudVersion};
  else if(action==='load-period')out={entries:savedSubject?[{book_id:'5-english',version:subjectVersion,details:savedSubject}]:[]};
  else if(action==='save-setup'){cloudVersion++;out={version:cloudVersion}}
  else if(action==='save-subject'){
   assert.equal(body.book_id,'5-english');
   const details=body.details;
   assert.ok(details.previous+details.current<=5);
   if(details.lessonSelections){
    assert.equal(details.lessonSelections.previous.length,details.previous);
    assert.equal(details.lessonSelections.current.length,details.current);
    assert.equal(new Set([...details.lessonSelections.previous,...details.lessonSelections.current]).size,details.previous+details.current,'No double-counted lessons');
   }
   savedSubject=JSON.parse(JSON.stringify(details));subjectVersion++;out={version:subjectVersion};
  }else throw Error('Unexpected cloud call: '+action);
  return {ok:true,status:200,json:async()=>out}
 };
 const fixture=[
 "const auth={token:'fixture',admin:false},account={semis:'123456789',school_name:'Fixture School',hm_name:'HM'},template={books:{}};",
 "let period=null,version=0,pendingState=null,periods=[],saving=false,saveTimer=null;",
 "async function postLogin(){}",
 "function dashTab(){}",
 "function refreshSaveDock(){}",
 "async function request(action,body={}){if(action==='open-period')return{version:1,state:body.initial_state};if(action==='save-draft')return{version:2};return {}}",
 "async function refreshSchool(){}",
 "function esc(x){return String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;')}"
 ].join('\n');
 w.eval(fixture+'\n'+fs.readFileSync('studio-core-v2.js','utf8')+'\nwindow.TestStudio=Studio;');
 const studio=w.TestStudio;
 await studio.activate();await studio.openPeriod('2026-10');
 const one=sel=>{const e=d.querySelector(sel);assert.ok(e,'Missing '+sel);return e};
 const metric=type=>Number(one('[data-progress-metric="'+type+'"]').textContent);
 const click=sel=>one(sel).click();
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,0,0,5]);
 click('[data-studio-lessons="5-english"]');
 assert.equal(d.querySelectorAll('[data-lesson-row="5-english"]').length,5);
 click('[data-lesson-status="previous"][data-lesson-index="0"]');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,1,0,4]);
 click('[data-lesson-status="current"][data-lesson-index="1"]');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,1,1,3]);
 click('[data-lesson-status="current"][data-lesson-index="0"]');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,0,2,3]);
 click('[data-lesson-bulk="next1"]');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,0,3,2]);
 click('[data-lesson-bulk="clear"]');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,0,0,5]);
 click('[data-lesson-status="previous"][data-lesson-index="2"]');
 click('[data-lesson-status="current"][data-lesson-index="4"]');
 await studio.settle();
 assert.deepEqual(savedSubject.lessonSelections.previous,[2]);
 assert.deepEqual(savedSubject.lessonSelections.current,[4]);
 assert.equal(savedSubject.previous,1);assert.equal(savedSubject.current,1);
 click('[data-studio-lessons="5-english"]');
 const number=one('[data-progress-bid="5-english"][data-pkey="current"]');
 number.value='2';number.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,1,2,2]);
 await studio.settle();
 assert.equal(Object.hasOwn(savedSubject,'lessonSelections'),false);
 dom.window.close();
 console.log('PASS: unfreeze Proforma, live counters, individual lesson statuses, quick select, autosave, manual counts');
}
const watchdog=setTimeout(()=>{console.error('Test timed out');process.exit(2)},18000);
main().then(()=>{clearTimeout(watchdog);process.exit(0)}).catch(error=>{clearTimeout(watchdog);console.error(error);process.exit(1)});
