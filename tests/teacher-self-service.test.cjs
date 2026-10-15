'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
async function main(){
 const html='<!doctype html><html><body><section id="teacherdash"><div id="teacherHeading"></div><div id="teacherSemis"></div><div id="teacherTabs"></div><div id="teacherSide"></div><div id="teacherView"></div><p id="teacherNotice"></p></section></body></html>';
 const dom=new JSDOM(html,{url:'https://school.test/',runScripts:'outside-only',pretendToBeVisual:true}),w=dom.window,d=w.document;
 w.crypto.randomUUID=()=>'ae1e4deb-95cb-4c98-973c-f3c4cd6ff115';
 w.confirm=()=>true;w.alert=msg=>{throw Error('Alert: '+msg)};
 w.esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 let version=0,savedSubjects=[],monthSaved=[],lastProfile=null;
 const token='unit-test-teacher',source=fs.readFileSync('teacher-workspace-v1.js','utf8');
 w.fetch=async(url,opts={})=>{
  const request=JSON.parse(opts.body||'{}');let res;
  assert.ok(String(opts.headers.Authorization).includes(token),'Teacher authenticated cloud API');
  if(request.action==='teacher-load')res={school:{semis:'123456789',school_name:'Fixture School',hm_name:'HM'},profile:{id:'teacher1',pid:'112233',name:'Test Teacher',designation:'PST',classes:[],subjects:[],profile_status:'draft',version:0}};
  else if(request.action==='teacher-save'){
   assert.equal(request.version,version,'Profile version must use optimistic concurrency');
   version++;lastProfile=request.profile;savedSubjects=request.profile.subjects;res={status:request.submit?'submitted':'draft',version};
  }else if(request.action==='teacher-month-load'){
   res={period:request.period,status:'draft',subjects:savedSubjects.map(b=>({id:b.id,name:b.name,grade:b.grade,total:b.total,version:0,details:{previous:2,current:null,notebook:null,cleanliness:'',feedback:'',suggestion:''},source_period:'2026-09'}))};
  }else if(request.action==='teacher-month-save'){
   monthSaved.push(request);res={version:1}
  }else throw Error('Unexpected cloud action: '+request.action);
  return{ok:true,status:200,json:async()=>res}
 };
 w.eval("const auth={role:'teacher',token:'"+token+"'};"+source+"\nwindow.TestTeacher=TeacherWorkspace;");
 const t=w.TestTeacher,one=selector=>{const x=d.querySelector(selector);assert.ok(x,'Missing '+selector);return x};
 const click=selector=>one(selector).click();
 await t.activate();
 assert.equal(one('#teacherHeading').textContent,'Fixture School');
 assert.ok(d.body.textContent.includes('112233'),'Teacher PID shown at entry');
 assert.equal(d.querySelector('[data-workflow-final]'),null,'Teacher cannot Final submit');
 assert.equal(d.querySelector('[data-month-download]'),null,'Teacher sees no Excel History download');
 for(const n of [5,10,12]){const cb=one('[data-teacher-grade="'+n+'"]');cb.checked=true;cb.dispatchEvent(new w.Event('change',{bubbles:true}))}
 assert.deepEqual(Array.from(t.profile().classes).sort((a,b)=>a-b),[5,10,12],'Teacher may select Primary, Matric and Intermediate');
 assert.equal(await t.save(),true,'Save Draft succeeds');
 await t.view('subjects');
 const set=(selector,val)=>{const el=one(selector);el.value=String(val);el.dispatchEvent(new w.Event('input',{bubbles:true}))};
 set('#teacherNewGrade','5');one('#teacherNewGrade').dispatchEvent(new w.Event('change',{bubbles:true}));
 set('#teacherNewName','Mathematics');set('#teacherNewTotal','9');click('[data-teacher-add]');
 assert.equal(t.profile().subjects.length,1);
 set('[data-teacher-book-chapters]',"Numbers\nFactors and Multiples\nFractions");
 assert.equal(t.profile().subjects[0].chapters[2],'Fractions','Edited lesson names persist in draft');
 await t.save();
 assert.equal(savedSubjects[0].total,9);
 assert.equal(savedSubjects[0].chapters[2],'Fractions');
 set('#teacherNewGrade','12');one('#teacherNewGrade').dispatchEvent(new w.Event('change',{bubbles:true}));
 set('#teacherNewName','Physics');set('#teacherNewTotal','11');click('[data-teacher-add]');
 await t.save(true);
 assert.equal(t.profile().profile_status,'submitted','Teacher may submit completed own profile');
 assert.ok(savedSubjects.some(b=>b.grade===12&&b.name==='Physics'),'Inter teaching assignment reaches server');
 await t.view('progress');
 assert.equal(one('[data-month-value="previous"]').value,'2','Previous month chapters carry forward');
 assert.equal(one('[data-month-value="current"]').value,'','Instant month requires new entry');
 assert.equal(one('[data-month-value="notebook"]').value,'','Notebook rating must start blank');
 const first=one('[data-month-book]');
 first.querySelector('[data-month-value="current"]').value='1';
 first.querySelector('[data-month-value="notebook"]').value='80';
 first.querySelector('[data-month-value="cleanliness"]').value='Good';
 first.querySelector('[data-month-value="feedback"]').value='Excellent';
 first.querySelector('[data-month-value="suggestion"]').value='Improve revision';
 first.querySelector('[data-month-save]').click();
 await new Promise(ok=>setTimeout(ok,30));
 assert.equal(monthSaved.length,1,'Only own progress subject saved');
 assert.equal(monthSaved[0].details.previous,2);
 assert.equal(monthSaved[0].details.current,1);
 assert.equal(monthSaved[0].details.notebook,80);
 const studioSource=fs.readFileSync('studio-core-v2.js','utf8'),index=fs.readFileSync('index.html','utf8');
 assert.ok(studioSource.includes("auth.role==='teacher'"),'HM Studio must skip teacher sessions');
 assert.ok(index.includes('teacher-register'),'Teacher private enrollment is linked from public page');
 assert.ok(index.includes('teacher-signin'),'Teacher PID-bound sign in is linked from public page');
 assert.ok(index.includes('role:r.role'),'Client session stores role securely');
 assert.ok(index.includes('hm-set-teacher-code')===false,'Enrollment secret is submitted from HM-only management script, not inline in public HTML');
 dom.window.close();console.log('PASS: teacher personal login, primary/matric/inter grade picks, subject chapters, cloud draft, submit and monthly progress; HM reports absent')
}
const timer=setTimeout(()=>{console.error('Teacher dashboard test timed out');process.exit(2)},20000);
main().then(()=>{clearTimeout(timer);process.exit(0)}).catch(e=>{clearTimeout(timer);console.error(e);process.exit(1)});
