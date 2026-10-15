'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),{JSDOM}=require('jsdom');
async function main(){
 const dom=new JSDOM('<!doctype html><html><body><section id="teacherdash"><div class="teacherTopNav"></div><h1 id="teacherHeading"></h1><p id="teacherSemis"></p><nav id="teacherTabs"></nav><aside id="teacherSide"></aside><div id="teacherView"></div><p id="teacherNotice"></p></section></body></html>',{url:'https://portal.test/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;
 w.crypto.randomUUID=()=>'abcdef12-3456-7890-abcd-123456789012';
 w.confirm=()=>true;w.alert=x=>{throw Error('Unexpected alert: '+x)};
 w.esc=x=>String(x??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
 let stored=null,version=0,monthly=[],submitted=false,calls=[];
 w.fetch=async(url,opts)=>{
  const q=JSON.parse(opts.body);calls.push(q.action);
  assert.equal(opts.headers.Authorization,'Bearer school-staff-token','Staff requests must be authenticated');
  let payload={};
  if(q.action==='staff-load')payload={school:{semis:'123456789',school_name:'Fixture School',hm_name:'HM'},teachers:stored?[{id:stored.id,name:stored.name,pid:stored.pid,designation:stored.designation,classes:stored.classes,subjects:stored.subjects.length}]:[]};
  else if(q.action==='staff-save'){assert.ok(q.profile.name&&q.profile.pid&&q.profile.designation);stored=structuredClone(q.profile);payload={ok:true,version:++version,staff_revision:version}}
  else if(q.action==='staff-select')payload={profile:structuredClone(stored)};
  else if(q.action==='staff-month-load')payload={period:q.period,status:'draft',submitted:false,subjects:stored.subjects.map(x=>({id:x.id,grade:x.grade,name:x.name,total:x.chapters.length,version:0,details:{previous:2,current:null,notebook:null,cleanliness:'',feedback:'',suggestion:''},source_period:'2026-09'}))};
  else if(q.action==='staff-month-save'){monthly.push(q);payload={version:1}}
  else if(q.action==='staff-month-submit'){assert.equal(monthly.length,1,'Every subject must be saved before submission');submitted=true;payload={ok:true,status:'submitted'}}
  else throw Error('Unexpected action '+q.action);
  return{ok:true,status:200,json:async()=>payload}
 };
 w.eval("const auth={token:'school-staff-token',role:'staff'};"+fs.readFileSync('school-staff-v1.js','utf8')+'\nwindow.TestStaff=SharedStaff;');
 w.eval(fs.readFileSync('staff-ux-v2.js','utf8')+'\nwindow.TestStaffUI=StaffUI;');
 const staff=w.TestStaff,one=q=>{const x=d.querySelector(q);assert.ok(x,'Missing '+q);return x};
 const tick=()=>new Promise(ok=>setTimeout(ok,30));
 const input=(q,v)=>{const el=one(q);el.value=String(v);el.dispatchEvent(new w.Event('input',{bubbles:true}));return el};
 await staff.activate();
 assert.match(d.body.textContent,/Who is reporting today/);
 assert.ok(one('[data-staff-new]'),'Teacher can create their own name tab');
 staff.create();
 input('[data-staff-field="name"]','Teacher A');input('[data-staff-field="pid"]','12345');input('[data-staff-field="designation"]','PST');
 assert.equal(await staff.save(),true,'Teacher name tab saved');
 assert.equal(staff.profile().staffRev,1,'Teacher profile version increments on cloud save');
 assert.match(one('#staffSoundToggle').textContent,/Sound On/);
 one('#staffSoundToggle').click();assert.match(one('#staffSoundToggle').textContent,/Sound Off/);
 one('#staffSoundToggle').click();
 await staff.go('classes');
 const check=one('[data-staff-class="5"]');check.checked=true;check.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(staff.profile().classes.includes(5),'Class V chosen');
 await staff.go('subjects');
 input('#staffNewTitle','Mathematics');input('#staffNewTotal',10);one('[data-staff-add]').click();
 assert.equal(staff.profile().subjects.length,1,'Subject picked exactly once');
 assert.equal(staff.profile().subjects[0].chapters.length,10,'10 chapters retained');
 await staff.save();
 await staff.go('month');
 assert.equal(one('[data-staff-remaining]').textContent,'8','10 minus 2 previous = 8 before current');
 assert.equal(one('[data-staff-submit]').disabled,true,'HM submission locked until progress complete');
 const current=one('[data-staff-progress="current"]');current.value='3';current.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(one('[data-staff-remaining]').textContent,'5','10 - 2 previous - 3 current = 5 remaining LIVE');
 assert.equal(one('[data-staff-equation]').textContent,'10 − (2 previous + 3 this month) = 5 remaining');
 assert.equal(one('[data-staff-submit]').disabled,true,'Editing does not prematurely enable submission');
 for(const [key,val] of [['notebook','80'],['cleanliness','Good'],['feedback','Excellent'],['suggestion','Improve revision']]){
  const el=one('[data-staff-progress="'+key+'"]');el.value=val;el.dispatchEvent(new w.Event('input',{bubbles:true}))
 }
 await staff.saveBook(staff.profile().subjects[0].id);
 assert.equal(monthly.length,1);
 assert.equal(monthly[0].details.previous,2);
 assert.equal(monthly[0].details.current,3);
 assert.equal(staff.counters().done,1,'7 complete saved fields');
 assert.equal(one('[data-staff-submit]').disabled,false,'Submit enabled after final saved subject');
 const submitting=staff.submitMonth();
 assert.equal(one('#staffConfirmDialog').classList.contains('hidden'),false,'Submit confirmation appears in premium dialog');
 one('#staffConfirmDialog [data-confirm-yes]').click();await submitting;
 assert.equal(submitted,true,'Teacher can submit monthly progress only after saving it');
 assert.equal(one('[data-staff-submit]').disabled,true,'Submitted report no longer accepts duplicate click');
 const index=fs.readFileSync('index.html','utf8');
 assert.ok(index.includes('staff-signin'),'Shared school password sign-in enabled');
 assert.ok(index.includes('hmOfficeForm'),'HM Office PIN entry separate');
 assert.ok(!index.includes('id="teacherRegisterForm"'),'Separate teacher registration removed');
 assert.ok(index.includes('school-staff-v1.js'),'Teacher name tab client loaded');
 assert.ok(index.includes('staff-ux-v2.js'),'Premium confirmation and sound UX script loaded');
 assert.ok(!d.body.textContent.includes('Export Excel'),'Teacher dashboard contains no Excel Export actions');
 dom.window.close();console.log('PASS: shared school login, teacher name tab, classes, subjects, 10−2−3=5 live remaining, seven-field submission gate, HM-only export');
}
const watchdog=setTimeout(()=>{console.error('Shared-staff tests timed out');process.exit(2)},20000);
main().then(()=>{clearTimeout(watchdog);process.exit(0)}).catch(e=>{clearTimeout(watchdog);console.error(e);process.exit(1)});
