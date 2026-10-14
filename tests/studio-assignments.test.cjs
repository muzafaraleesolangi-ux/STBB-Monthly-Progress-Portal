/* DOM regression tests for classwise subject assignment. No production data. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
async function main(){
 const html='<!doctype html><html><body><section id="schooldash"><div id="schoolTabs"></div><div id="school-overview"></div><div id="school-editor"></div></section></body></html>';
 const dom=new JSDOM(html,{url:'https://portal.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 w.structuredClone=global.structuredClone;w.scrollTo=()=>{};w.confirm=()=>true;
 w.alert=msg=>{throw Error('Unexpected alert: '+msg)};
 w.crypto.randomUUID=()=>'e2d113ee-7a22-4091-888e-c96c88d983f5';
 let school={
  selectedClasses:[4,5],
  teachers:[
   {id:'t1',name:'Teacher One',pid:'111',designation:'PST',classes:[4,5]},
   {id:'t2',name:'Teacher Two',pid:'222',designation:'PST',classes:[4,5]}
  ],
  books:{
   5:[
    {id:'5-english',name:'English',chapters:['A','B'],active:false,teacherId:''},
    {id:'5-maths',name:'Mathematics',chapters:['One','Two'],active:false,teacherId:''},
    {id:'5-science',name:'Science',chapters:['Cells'],active:false,teacherId:''}
   ],
   4:[
    {id:'4-english',name:'English',chapters:['Reading'],active:false,teacherId:''},
    {id:'4-sindhi',name:'Sindhi',chapters:['Lesson'],active:false,teacherId:''}
   ]
  }
 };
 let cloudVersion=1,saveCount=0;
 w.fetch=async(url,opts={})=>{
  const body=JSON.parse(opts.body||'{}');
  let response={};
  if(body.action==='load-setup')response={setup:school,version:cloudVersion};
  else if(body.action==='save-setup'){
   if(body.version!==cloudVersion)return {ok:false,status:409,json:async()=>({error:'Concurrent setup change'})};
   school=JSON.parse(JSON.stringify(body.setup));cloudVersion++;saveCount++;response={version:cloudVersion}
  }else throw Error('Unexpected request: '+body.action);
  return {ok:true,status:200,json:async()=>response};
 };
 const fixture="const auth={token:'fixture',admin:false},account={semis:'123456789',school_name:'Fixture School',hm_name:'HM'};const template={books:{}};let period=null,version=0,pendingState=null,periods=[],saving=false,saveTimer=null;async function postLogin(){};function dashTab(){};function refreshSaveDock(){};async function request(){return {}};async function refreshSchool(){};";
 const helper="function esc(x){return String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}";
 w.eval(fixture+"\n"+helper+"\n"+fs.readFileSync('studio-core-v2.js','utf8')+"\nwindow.StudioForTest=Studio;");
 const studio=w.StudioForTest;
 await studio.activate();studio.stage(3);
 const one=selector=>{const el=d.querySelector(selector);assert.ok(el,'Missing element: '+selector);return el};
 const absent=selector=>assert.equal(d.querySelector(selector),null,'Should not exist: '+selector);
 const click=selector=>one(selector).click();
 const change=(selector,value)=>{const el=one(selector);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 const book=id=>Object.values(studio.getSetup().books).flat().find(x=>x.id===id);
 assert.equal(d.querySelectorAll('[data-assign-bid]').length,5,'Existing subjects offered by checklist');
 click('[data-assign-bid="5-english"]');
 assert.equal(book('5-english').teacherId,'t1');
 assert.equal(one('[data-assign-bid="5-english"]').checked,true);
 await studio.settle();
 click('[data-assignment-teacher="1"]');
 await new Promise(ok=>setTimeout(ok,40));
 absent('[data-assign-bid="5-english"]');
 one('[data-assign-bid="5-maths"]');one('[data-assign-bid="4-english"]');
 click('[data-assign-bid="4-english"]');
 assert.equal(book('4-english').teacherId,'t2','Same subject name in a different class can have different teacher');
 click('[data-assignment-selectall="5"]');
 assert.equal(book('5-english').teacherId,'t1','Other teacher subject retained');
 assert.equal(book('5-maths').teacherId,'t2');
 assert.equal(book('5-science').teacherId,'t2');
 click('[data-assignment-togglegrade="5"]');
 absent('[data-assign-bid="5-maths"]');
 click('[data-assignment-togglegrade="5"]');
 one('[data-assign-bid="5-maths"]');
 click('[data-assignment-addsubject="4"]');
 change('#assignmentNewName','Art');
 click('[data-assignment-confirmadd="4"]');
 let custom=studio.getSetup().books[4].find(x=>x.name==='Art');
 assert.ok(custom,'New subject created');
 assert.equal(custom.teacherId,'t2');
 click('[data-assignment-addsubject="4"]');
 change('#assignmentNewName','Art');
 click('[data-assignment-confirmadd="4"]');
 assert.equal(studio.getSetup().books[4].filter(x=>x.name==='Art').length,1,'Duplicate names blocked');
 click('[data-assignment-canceladd]');
 click('[data-assignment-edit="'+custom.id+'"]');
 change('[data-assignment-editname]','Art & Craft');
 click('[data-assignment-saveclose]');
 await new Promise(ok=>setTimeout(ok,60));
 custom=studio.getSetup().books[4].find(x=>x.id===custom.id);
 assert.equal(custom.name,'Art & Craft','Inline edit saved');
 absent('[data-assignment-editname]');
 click('[data-assignment-remove="'+custom.id+'"]');
 assert.equal(studio.getSetup().books[4].some(x=>x.id===custom.id),false,'Subject removal');
 await studio.settle();
 click('[data-assignment-teacher="0"]');
 await new Promise(ok=>setTimeout(ok,40));
 assert.equal(one('[data-assign-bid="5-english"]').checked,true);
 absent('[data-assign-bid="5-maths"]');
 assert.equal(book('4-english').teacherId,'t2');
 assert.ok(saveCount>=3,'Cloud saves occurred');
 dom.window.close();
 console.log('PASS: checklist, overlapping teacher classes, exclusive class-subject assignment, bulk tick, collapse, add/edit/remove, saves');
}
const watchdog=setTimeout(()=>{console.error('DOM test timed out at 15 seconds');process.exit(2)},15000);
main().then(()=>{clearTimeout(watchdog);process.exit(0)}).catch(e=>{clearTimeout(watchdog);console.error(e);process.exit(1)});
