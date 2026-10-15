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
 await studio.activate();
 assert.ok(d.querySelector('[data-studio-refresh]'),'Returning school resumes in the monthly progress step');
 assert.ok(d.querySelector('[data-progress-card="5-english"]'),'Assigned subject available without repeating setup');
 assert.equal(d.querySelector('.progressFields'),null,'Extra assessments are collapsed for fast entry');
 d.querySelector('[data-progress-details="5-english"]').click();
 assert.ok(d.querySelector('.progressFields'),'Optional assessments can be expanded');
 d.querySelector('[data-progress-details="5-english"]').click();
 assert.equal(d.querySelector('.progressFields'),null,'Extra assessments can be collapsed');
 const searchBox=d.querySelector('#studioProgressSearch');
 searchBox.value='No Such Subject';searchBox.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(d.querySelector('[data-progress-card="5-english"]').hidden,true,'Subject search hides irrelevant cards');
 searchBox.value='English';searchBox.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(d.querySelector('[data-progress-card="5-english"]').hidden,false,'Subject search restores matches');
 // Restore filter before editing and verify pending-only button.
 searchBox.value='';searchBox.dispatchEvent(new w.Event('input',{bubbles:true}));
 d.querySelector('[data-progress-pending]').click();
 assert.equal(d.querySelector('[data-progress-card="5-english"]').hidden,false,'Unsaved subject appears under Pending Only');
 d.querySelector('[data-progress-show-all]').click();

 // Regression: HM should be able to TYPE in the visible Previous cell even without pressing Open / Continue Month.
 const first=d.querySelector('[data-progress-bid="5-english"][data-pkey="previous"]');
 assert.ok(first&&!first.disabled,'Monthly progress inputs must not be disabled before opening a reporting month');
 first.focus();first.value='1';first.dispatchEvent(new w.Event('input',{bubbles:true}));
 first.value='3';first.dispatchEvent(new w.Event('input',{bubbles:true}));
 await new Promise(ok=>setTimeout(ok,120));
 assert.equal(Number(d.querySelector('[data-progress-bid="5-english"][data-pkey="previous"]').value),3,'Latest number typed during automatic month open is preserved');
 assert.equal(Number(d.querySelector('[data-progress-metric="remaining"]').textContent),2,'Remaining recalculated after direct edit');
 const initialInput=d.querySelector('[data-progress-bid="5-english"][data-pkey="previous"]');
 initialInput.value='0';initialInput.dispatchEvent(new w.Event('input',{bubbles:true}));
 const one=sel=>{const e=d.querySelector(sel);assert.ok(e,'Missing '+sel);return e};
 const metric=type=>{const el=one('[data-progress-metric="'+type+'"]');return Number(el.tagName==='INPUT'?el.value:el.textContent)};
 const previous='[data-progress-bid="5-english"][data-pkey="previous"]';
 const current='[data-progress-bid="5-english"][data-pkey="current"]';
 const fill=(selector,value)=>{const el=one(selector);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,0,0,5],'Initial summary');
 assert.equal(one(previous).closest('.chapterKpis')!==null,true,'Previous is editable inside upper summary cell');
 assert.equal(one(current).closest('.chapterKpis')!==null,true,'This Month is editable inside upper summary cell');
 assert.equal(d.querySelectorAll('.chapterKpis input').length,2,'Exactly two editable summary cells');
 assert.equal(d.querySelectorAll('.simpleCountInputs').length,0,'No duplicate lower count boxes');
 assert.equal(d.querySelectorAll('[data-studio-lessons],[data-lesson-write-open],[data-lesson-status],[data-lesson-bulk]').length,0,'No View/Edit lessons or tick buttons in monthly progress');
 assert.equal(d.querySelectorAll('[data-progress-metric="total"] input,[data-progress-metric="remaining"] input').length,0,'Total and Remaining are read-only figures');
 fill(previous,'2');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,2,0,3],'Previous updates remaining live');
 fill(current,'2');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,2,2,1],'This Month updates remaining live');
 fill(previous,'5');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,3,2,0],'Count exceeding available chapters is clamped');
 assert.equal(one(previous).value,'3','Clamped input is corrected in the upper cell');
 fill(previous,'1.7');
 assert.deepEqual(['total','previous','current','remaining'].map(metric),[5,1,2,2],'Counts use whole chapters');
 fill(previous,'1');
 await studio.settle();
 assert.equal(savedSubject.previous,1);
 assert.equal(savedSubject.current,2);
 assert.equal(Object.hasOwn(savedSubject,'lessonSelections'),false,'No lesson checklist state required');
 assert.equal(Number(one('[data-progress-metric="remaining"]').textContent),2);
 assert.equal(one(previous).getAttribute('max'),'3','Maximum Previous accounts for current count');
 assert.equal(one(current).getAttribute('max'),'4','Maximum Current accounts for previous count');
 const focused=one(previous);focused.focus();
 await studio.refresh();
 assert.equal(d.querySelector(previous),focused,'Cloud refresh must not replace an input while teacher is typing');
 const enter=new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true});
 focused.dispatchEvent(enter);
 assert.equal(d.activeElement,one(current),'Enter moves to the next count cell for faster keyboard entry');
 d.activeElement.blur();
 d.querySelector('[data-progress-pending]').click();
 assert.equal(d.querySelector('[data-progress-card="5-english"]').hidden,true,'Saved subjects are hidden by Pending Only filter');
 d.querySelector('[data-progress-show-all]').click();
 assert.equal(d.querySelector('[data-progress-card="5-english"]').hidden,false,'All Subjects restores saved rows');
 dom.window.close();
 console.log('PASS: original Excel unfreeze, inline Previous/This Month cells, auto Remaining, count limits, cloud save and no extra progress editing UI');
}
const watchdog=setTimeout(()=>{console.error('Test timed out');process.exit(2)},18000);
main().then(()=>{clearTimeout(watchdog);process.exit(0)}).catch(error=>{clearTimeout(watchdog);console.error(error);process.exit(1)});
