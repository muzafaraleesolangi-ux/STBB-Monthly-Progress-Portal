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
 const fill=(selector,value)=>{const el=one(selector);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 const previous='[data-progress-bid="5-english"][data-pkey="previous"]';
 const current='[data-progress-bid="5-english"][data-pkey="current"]';
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,0,0,5]);
 assert.equal(d.querySelectorAll('[data-lesson-status],[data-lesson-row],[data-lesson-bulk]').length,0,'No lesson-by-lesson tick selectors');
 fill(previous,'1');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,1,0,4],'Previous changes remaining automatically');
 fill(current,'2');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,1,2,2],'This Month changes remaining automatically');
 assert.equal(one('[data-remaining-output]').textContent,'2');
 fill(previous,'5');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,3,2,0],'Previous clamped to avoid exceeding total');
 assert.equal(one(previous).value,'3','Input shows the clamped count');
 fill(previous,'1');
 await studio.settle();
 assert.equal(savedSubject.previous,1);
 assert.equal(savedSubject.current,2);
 assert.equal(Object.hasOwn(savedSubject,'lessonSelections'),false,'No checklist selections needed');
 click('[data-studio-lessons="5-english"]');
 assert.equal(d.querySelectorAll('[data-lesson-status],[data-lesson-row]').length,0,'Chapter names only, no tick buttons');
 assert.equal(d.querySelectorAll('.simpleLessonNames li').length,5,'Optional names view has 5 lessons');
 // Editable lesson names: type a title, paste multiple lines, and preserve progress.
 click('[data-lesson-write-open="5-english"]');
 const input=(selector,value)=>{const el=one(selector);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 input('[data-lesson-title-index="0"]','My Written Lesson');
 input('[data-lesson-pasteinput="5-english"]','Lesson Six\nLesson Seven');
 click('[data-lesson-applypaste="5-english"]');
 assert.equal(d.querySelectorAll('[data-lesson-title-index]').length,7,'Paste adds two draft titles');
 assert.equal(metric('total'),5,'Do not change official totals until names are saved');
 click('[data-lesson-savewrite="5-english"]');
 await new Promise(ok=>setTimeout(ok,90));
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[7,1,2,4],'After saving names all counters reflect revised total');
 const currentBook=studio.getSetup().books[5][0];
 assert.deepEqual(Array.from(currentBook.chapters),['My Written Lesson','Lesson Two','Lesson Three','Lesson Four','Lesson Five','Lesson Six','Lesson Seven']);
 assert.ok([...d.querySelectorAll('.simpleLessonNames li')].some(el=>el.textContent.includes('Lesson Seven')),'Updated lesson names appear without tick controls');
 // Remove the last unfinished chapter without shifting existing saved lesson status indexes.
 click('[data-lesson-write-open="5-english"]');
 click('[data-lesson-remove-last="5-english"]');
 click('[data-lesson-savewrite="5-english"]');
 await new Promise(ok=>setTimeout(ok,90));
 assert.equal(currentBook.chapters.length,6);
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[6,1,2,3]);
 // Bulk paste fills existing blank names before appending new chapters.
 click('[data-lesson-write-open="5-english"]');
 input('[data-lesson-title-index="1"]','');
 input('[data-lesson-pasteinput="5-english"]','Handwritten Second Lesson');
 click('[data-lesson-applypaste="5-english"]');
 assert.equal(d.querySelectorAll('[data-lesson-title-index]').length,6,'Blank-fill does not add extra lessons');
 click('[data-lesson-savewrite="5-english"]');
 await new Promise(ok=>setTimeout(ok,90));
 assert.equal(currentBook.chapters[1],'Handwritten Second Lesson');
 assert.equal(metric('total'),6);
 // Cancel must discard edits and leave server setup unchanged.
 click('[data-lesson-write-open="5-english"]');
 input('[data-lesson-title-index="1"]','Unsaved Replacement');
 click('[data-lesson-cancelwrite="5-english"]');
 assert.equal(currentBook.chapters[1],'Handwritten Second Lesson');
 await studio.settle();
 dom.window.close();
 console.log('PASS: unfreeze Proforma, no lesson ticks, live previous/current/remaining numeric totals, autosave, manual lesson names');
}
const watchdog=setTimeout(()=>{console.error('Test timed out');process.exit(2)},18000);
main().then(()=>{clearTimeout(watchdog);process.exit(0)}).catch(error=>{clearTimeout(watchdog);console.error(error);process.exit(1)});
