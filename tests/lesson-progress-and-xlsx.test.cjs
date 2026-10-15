/* Master Proforma exact-field, mandatory completion, blank zeros & native Excel regression. */
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
async function main(){
 const monthly=fs.readFileSync('month-organizer-v1.js','utf8');
 assert.ok(monthly.includes("Studio.api('list-months')"),'Sidebar pulls submitted and exported months from school-scoped backend');
 assert.ok(monthly.includes("data-month-download"),'Each archived month has a direct Excel download control');
 assert.ok(monthly.includes("data-month-open"),'Previous months remain individually accessible');
 assert.ok(monthly.includes("data-month-new"),'Completed reports offer Start New Month');
 const studioSource=fs.readFileSync('studio-core-v2.js','utf8');
 assert.ok(studioSource.includes("api('initialize-month',{period:p})"),'Rollover is persisted in month-specific backend entries');
 assert.ok(studioSource.includes('startFollowingMonth'),'Quick next-month handoff is implemented');
 const guideSource=fs.readFileSync('progress-guidance-v4.js','utf8');
 assert.doesNotMatch(guideSource,/\.observe\(document\.body\s*,\s*\{[^}]*attributes\s*:\s*true/,'Guide must not observe document.body attributes (infinite self-triggering mutation loop)');
 assert.match(guideSource,/observer\.observe\(studioBody,\{childList:true\}\)/,'Guide observes only school content replacement, not its own class mutations');
 const page=fs.readFileSync('index.html','utf8');
 assert.ok(page.includes('mpr-export-ack'),'Parent confirms persisted History export before download completion');
 assert.ok(page.includes('refreshSchool()'),'School export metric counter reloads from database');
 assert.ok(page.includes('data-export-details'),'Export history includes detailed analytics action');
 const nav=fs.readFileSync('home-navigation-v3.js','utf8');
 assert.ok(nav.includes("area==='admin'?'admin:home'"),'Admin Home remains inside logged in Admin workspace');
 assert.ok(nav.includes("area==='school'?'school:overview'"),'School Home remains inside logged in school dashboard');
 const insights=fs.readFileSync('export-analytics-v1.js','utf8');
 assert.ok(insights.includes("export-details"),'Report summary is read from protected backend');
 const source=fs.readFileSync('MPR_Online_Editor.html','utf8');
 assert.ok(source.includes('blob.arrayBuffer()'),'Excel uses actual Blob bytes for reliable server upload');
 assert.doesNotMatch(source,/for\s*\(let\s+c\s+of\s+blob\)/,'Non-iterable Blob must never be looped over');
 assert.ok(source.includes('mpr-export-ack'),'Editor must show result of server History confirmation');
 const start=source.indexOf('const XLSX_PARTS = '),end=source.indexOf(';\n',start);
 assert.ok(start>0&&end>start,'Embedded master workbook package available');
 const parts=JSON.parse(source.slice(start+'const XLSX_PARTS = '.length,end));
 const xml=Buffer.from(parts['xl/worksheets/sheet1.xml'],'base64').toString('utf8'),tmp=new JSDOM('').window;
 const doc=new tmp.DOMParser().parseFromString(xml,'application/xml');
 assert.equal(doc.getElementsByTagName('parsererror').length,0,'Embedded Excel is valid XML');
 assert.ok(doc.getElementsByTagNameNS('*','mergeCell').length,'Original merged cell formatting preserved');
 const headings=['Total No. of Chapters','Chapters covered up to previous month','Chapters covered during the instant month','No of chapters still remaining','Preparation & Maintenance of Note Books and Text Books','Cleanliness & Class Room management','Feedback from the students during formative tests','Suggestions given to the Honourable Teacher for further improvement'];
 for(const h of headings)assert.ok(source.includes(h),'Master preview column missing '+h);
 const school={selectedClasses:[5],subjectCatalogInitialized:{1:true,2:true,3:true,4:true,5:true,6:true,7:true,8:true},
  teachers:[{id:'t1',name:'Teacher One',pid:'111',designation:'PST',classes:[5]},{id:'t2',name:'Teacher Two',pid:'222',designation:'PST',classes:[5]}],
  books:{5:[{id:'5-english',name:'English',chapters:['A','B','C','D','E'],active:true,teacherId:'t1'},{id:'5-maths',name:'Mathematics',chapters:['One','Two','Three'],active:true,teacherId:'t2'}]}};
 const saved={},versions={};let reportStatus='draft',priorMonthRecords=null;const dom=new JSDOM('<html><body><section id="schooldash"><div id="schoolTabs"></div><div id="school-overview"></div><div id="school-editor"></div><iframe id="editor"></iframe></section></body></html>',{url:'https://portal.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;w.structuredClone=global.structuredClone;w.scrollTo=()=>{};w.confirm=()=>true;w.alert=msg=>{throw Error('Unexpected alert: '+msg)};
 w.fetch=async(url,options={})=>{
  const data=JSON.parse(options.body||'{}');let result;
  if(data.action==='load-setup')result={setup:school,version:1};
  else if(data.action==='load-workflow')result={workflow:{status:reportStatus}};
  else if(data.action==='set-workflow'){
   if(data.status==='final'){assert.equal(reportStatus,'draft');assert.equal(Object.keys(saved).length,2,'Two saved subjects needed');reportStatus='final'}
   else if(data.status==='submitted'){assert.equal(reportStatus,'final');reportStatus='submitted'}
   else if(data.status==='draft'){assert.ok(['final','submitted','exported'].includes(reportStatus));reportStatus='draft'}
   else throw Error('Invalid transition');
   result={workflow:{status:reportStatus}}
  }
  else if(data.action==='load-period')result={entries:Object.keys(saved).map(id=>({book_id:id,details:saved[id],version:versions[id]}))};
  else if(data.action==='initialize-month'){
   if(data.period==='2026-11'&&priorMonthRecords){
    for(const [id,old] of Object.entries(priorMonthRecords)){
     if(saved[id])continue;
     saved[id]={previous:(Number(old.previous)||0)+(Number(old.current)||0),current:null,notebook:null,cleanliness:'',feedback:'',suggestion:'',updatedBy:'Auto carry-forward · 2026-10'};versions[id]=1
    }
   }
   result={source_period:data.period==='2026-11'?'2026-10':null,initialized:data.period==='2026-11'?2:0,entries:Object.keys(saved).map(id=>({book_id:id,details:saved[id],version:versions[id]}))}
  }
  else if(data.action==='save-setup')result={version:data.version+1};
  else if(data.action==='save-subject'){
   assert.ok(Object.hasOwn(data.details,'previous'),'Explicit pending counts persist');
   saved[data.book_id]=JSON.parse(JSON.stringify(data.details));versions[data.book_id]=(versions[data.book_id]||0)+1;result={version:versions[data.book_id]};
  }else throw Error('Unexpected cloud call: '+data.action);
  return {ok:true,status:200,json:async()=>result}
 };
 const fixture=[
  "const auth={token:'fixture',admin:false},account={semis:'123456789',school_name:'Fixture School',hm_name:'HM'},template={books:{}};",
  "let period=null,version=0,pendingState=null,periods=[],saving=false,saveTimer=null;",
  "async function postLogin(){}", "function dashTab(){}","function refreshSaveDock(){}",
  "async function request(action,body={}){if(action==='open-period')return{version:1,state:body.initial_state};if(action==='save-draft')throw Error('Do not save a Draft after report has been Submitted');return {}}",
  "async function refreshSchool(){}",
  "function esc(x){return String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\\\"','&quot;')}"
 ].join('\n');
 w.eval(fixture+'\n'+fs.readFileSync('studio-core-v2.js','utf8')+'\nwindow.TestStudio=Studio;');
 const studio=w.TestStudio;await studio.activate();await studio.openPeriod('2026-10');
 const one=q=>{const x=d.querySelector(q);assert.ok(x,'Missing '+q);return x};
 const select=(q,v)=>{const el=one(q);el.value=String(v);el.dispatchEvent(new w.Event('change',{bubbles:true}));assert.equal(el.value,String(v),'Selected choice exists for '+q)};
 const card=id=>'[data-progress-card="'+id+'"]';
 assert.equal(one(card('5-english')+' [data-progress-bid][data-pkey="previous"]').value,'','Previous count is initially blank');
 assert.equal(one(card('5-english')+' [data-progress-bid][data-pkey="current"]').value,'','Current count is initially blank');
 assert.equal(one(card('5-english')+' [data-progress-total]').value,'5','Total is loaded from actual subject master');
 assert.equal(one('[data-quick-pending]').textContent,'2','All assigned subjects are pending');
 assert.equal(one('#studioReviewAction').hidden,true,'Review option hidden until all selected subjects complete');
 for(const h of headings)assert.ok(one(card('5-english')).textContent.includes(h),'Exact heading absent in teacher tab: '+h);
 select(card('5-english')+' [data-pkey="previous"]','0');
 select(card('5-english')+' [data-pkey="current"]','2');
 assert.equal(one(card('5-english')+' [data-progress-metric="remaining"]').textContent,'3','Remaining auto-recalculated');
 select(card('5-english')+' [data-pkey="notebook"]','80');
 select(card('5-english')+' [data-pkey="cleanliness"]','Good');
 select(card('5-english')+' [data-pkey="feedback"]','Fair');
 select(card('5-english')+' [data-progress-suggestionselect]','Improve lesson planning and preparation');
 await studio.settle();
 assert.equal(one('[data-quick-done]').textContent,'1','Only fully completed saved subject counted');
 assert.equal(one('[data-quick-pending]').textContent,'1','Other teacher remains pending');
 assert.equal(one('#studioReviewAction').hidden,true,'One incomplete teacher still blocks export');
 select(card('5-maths')+' [data-pkey="previous"]','0');
 select(card('5-maths')+' [data-pkey="current"]','0');
 select(card('5-maths')+' [data-pkey="notebook"]','0');
 select(card('5-maths')+' [data-pkey="cleanliness"]','Excellent');
 select(card('5-maths')+' [data-pkey="feedback"]','Very Good');
 select(card('5-maths')+' [data-progress-suggestionselect]','No further improvement suggested');
 await studio.settle();
 assert.equal(one('#studioReviewAction').hidden,true,'Export remains hidden until Final and Submit');
 assert.equal(one('#studioFinalAction').disabled,false,'Mark Final unlocks when all subjects complete');
 assert.equal(one(card('5-english')).classList.contains('isCollapsed'),true,'Saved subject automatically minimizes');
 assert.equal(one('#studioSubjectCards').lastElementChild.dataset.progressCard,'5-maths','Latest completed card floats to bottom');
 await studio.setStatus('final');
 assert.equal(studio.status(),'final');
 assert.equal(one('[data-workflow-submit]')!==null,true,'Submit option appears after Final');
 await studio.setStatus('submitted');
 assert.equal(studio.status(),'submitted');
 assert.equal(one('#studioReviewAction').hidden,false,'Export appears only once report is Submitted');
 assert.equal(one('[data-quick-pending]').textContent,'0');
 assert.equal(saved['5-maths'].previous,0,'Explicitly entered zero persists');
 assert.equal(saved['5-maths'].notebook,0,'Explicit zero percent persists');
 const reviewFrame=one('#editor');
 reviewFrame.contentWindow.postMessage=message=>{if(message.type==='mpr-hydrate'){w.capturedReviewState=message.state;w.reviewAutoExport=message.autoExport;w.reviewMonth=message.period}};
 await studio.review();
 assert.equal(w.reviewAutoExport,true,'Submitted month automatically generates Excel from hydrated state');
 assert.equal(w.reviewMonth,'2026-10','Exact reporting month is passed through to Excel');
 const review=w.capturedReviewState;assert.ok(review&&review.books[5].length===2,'Complete review snapshot generated for Excel');
 assert.equal(review.books[5][0].notebook,80,'Notebook maintenance percentage is carried into original Excel state');
 assert.equal(review.books[5][0].cleanliness,'Good','Classroom management rating preserved for export');
 assert.equal(review.books[5][0].feedback,'Fair','Formative student feedback preserved for export');
 assert.equal(review.books[5][0].suggestion,'Improve lesson planning and preparation','Selected improvement suggestion preserved');
 assert.equal(review.books[5][1].notebook,0,'Selected 0% is preserved in review state');
 reportStatus='exported';await studio.markExported();studio.showPanel();
 assert.equal(studio.status(),'exported','History export locks and archives the month');
 assert.ok(one('.monthArchiveTray'),'All monthly subject cards are placed inside an archived details tray');
 assert.equal(one(card('5-english')).classList.contains('isCollapsed'),true,'Exported subject details are minimized');
 assert.ok(one('[data-workflow-history]'),'Direct export history link available after export');
 await studio.setStatus('draft');
 assert.equal(studio.status(),'draft','Reopen allows editing a submitted report');
 select(card('5-maths')+' [data-pkey="previous"]','');
 await studio.settle();
 assert.equal(saved['5-maths'].previous,null,'Blank selection remains NULL, not fabricated zero');
 assert.equal(one('#studioReviewAction').hidden,true,'Editing a reopened draft locks Excel export');
 assert.equal(one('[data-quick-pending]').textContent,'1','Incomplete report shown pending after edit');
 assert.equal(d.querySelector('[data-progress-details]'),null,'No unrelated assessment section is displayed');
 // A new November report must inherit October's cumulative chapter counts, and NOTHING else.
 priorMonthRecords=structuredClone(saved);
 for(const id of Object.keys(saved)){delete saved[id];delete versions[id]}
 await studio.openPeriod('2026-11');
 assert.equal(studio.activePeriod(),'2026-11','Following calendar month is selected');
 assert.equal(studio.followingMonth('2026-12'),'2027-01','Next month correctly crosses year boundaries');
 assert.equal(one(card('5-english')+' [data-pkey="previous"]').value,'2','October covered chapters become November previous count');
 assert.equal(one(card('5-english')+' [data-pkey="current"]').value,'','New month current chapters start empty');
 assert.equal(one(card('5-english')+' [data-pkey="notebook"]').value,'','New month assessment resets to blank');
 assert.equal(one(card('5-english')+' [data-pkey="cleanliness"]').value,'','Classroom rating does not copy into new month');
 assert.equal(one(card('5-english')+' [data-pkey="feedback"]').value,'','Formative feedback does not copy into new month');
 assert.equal(one(card('5-english')+' [data-progress-suggestionselect]').value,'','Previous month suggestion does not copy');
 assert.equal(studio.getSetup().teachers.length,2,'Teachers are retained automatically');
 assert.equal(studio.getSetup().books[5].filter(b=>b.active).length,2,'Class and subject assignments are unchanged');
 assert.equal(one('[data-quick-pending]').textContent,'2','Carry-forward counts do not falsely complete a new report');
 dom.window.close();tmp.close();
 console.log('PASS: master columns, collapsed premium cards, pending sorting, blank vs zero, Final → Submit → Export authorization and Reopen Draft; new month carries only chapter counts, retains teacher assignments and resets assessments')
}
const watchdog=setTimeout(()=>{console.error('DOM test timed out');process.exit(2)},20000);
main().then(()=>{clearTimeout(watchdog);process.exit(0)}).catch(e=>{clearTimeout(watchdog);console.error(e);process.exit(1)});
