'use strict';
const SharedStaff=(()=>{
const root=document.getElementById('teacherdash');
if(!root)return{activate:async()=>{}};
const API='https://oypqcizrlhdouygvazyb.supabase.co/functions/v1/mpr-workspace-v2',r=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'],ratings=['Excellent','Very Good','Good','Fair','Needs Improvement'],escapeText=v=>esc(v??''),$=q=>root.querySelector(q);
let school=null,teachers=[],person=null,step='pick',month=null,period=new Date().getFullYear()+'-'+String(new Date().getMonth()+1).padStart(2,'0'),dirty=false,busy=false,noticeText='',saveTimer=null,trail=[],editRevision=0,savingPromise=null;
const api=async(action,data={})=>{if(auth?.role!=='staff')throw Error('School staff login required');const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},body:JSON.stringify({action,...data}),cache:'no-store'}),value=await res.json();if(!res.ok||value.error)throw Error(value.error||'Network failure');return value};
const nid=prefix=>prefix+crypto.randomUUID().replace(/-/g,'');
const cname=g=>'Class '+r[g];
const shown=msg=>{noticeText=msg;const el=$('#teacherNotice');if(el){el.textContent=msg;el.classList.toggle('isError',/failed|invalid|could not|exceed|error|⚠/i.test(msg))}if(/^✓|^⚠|save failed|submission failed/i.test(msg)&&typeof StaffUI!=='undefined')StaffUI.toast(msg,/failed|⚠/i.test(msg))};
const classOpts=()=>Array.from({length:12},(_,i)=>i+1);
function renderShell(){
 $('#teacherHeading').textContent=school?.school_name||'Teaching Staff';
 $('#teacherSemis').textContent='SEMIS '+(school?.semis||'')+(person?' · '+person.name:' · Select your teacher tab');
 const steps=[['pick','Name Tabs'],['details','My Details'],['classes','Classes'],['subjects','Subjects'],['month','Monthly Progress']];
 $('#teacherTabs').innerHTML=steps.map(([key,label],i)=>'<button type="button" data-staff-stage="'+key+'" class="'+(step===key?'active':'')+'" '+(!person&&key!=='pick'?'disabled':'')+'>'+(i+1)+'. '+label+'</button>').join('');
 $('#teacherSide').innerHTML='<div class="teacherIdentity"><span>SCHOOL STAFF DASHBOARD</span><h3>'+escapeText(person?.name||'Select Name')+'</h3><small>'+escapeText(person?'PID '+person.pid+' · '+person.designation:'One school password, individual teacher tabs')+'</small></div><div class="teacherSteps">'+teachers.map(t=>'<button type="button" data-staff-pick="'+escapeText(t.id)+'" class="'+(person?.id===t.id?'active':'')+'">👤 '+escapeText(t.name||'Unnamed')+'</button>').join('')+'</div><div class="teacherSideNote">Teachers prepare draft reports. HM alone can finalize and export Excel.</div>';
}
function picker(){return '<section class="teacherTopCard"><span>STEP 1 · MY NAME TAB</span><h2>Who is reporting today?</h2><p>Tap your name to continue or create your own teacher tab. No separate registration, teacher password or PID login.</p></section><div class="staffPicker">'+teachers.map(t=>'<button type="button" class="staffNameCard" data-staff-pick="'+escapeText(t.id)+'"><b>👤 '+escapeText(t.name||'Unnamed Teacher')+'</b><small>PID '+escapeText(t.pid||'—')+' · '+escapeText(t.designation||'—')+'</small><span>'+Number(t.subjects||0)+' subjects · Open →</span></button>').join('')+'<button type="button" class="staffNameCard staffNewCard" data-staff-new><b>＋ Create My Name Tab</b><small>New staff member</small><span>Start →</span></button></div>'}
function footer(next){return '<div class="teacherFoot"><small id="staffDraftFlag">'+(dirty?'● Unsaved changes':'✓ Cloud draft')+'</small><button type="button" data-staff-save>💾 Save Draft</button><button type="button" data-staff-next="'+next+'">Continue →</button></div>'}
function details(){return '<section class="teacherTopCard"><span>STEP 2 · TEACHER DETAILS</span><h2>My Details</h2><p>One name tab per teacher. Enter your full name, PID and designation.</p></section><div class="teacherFormGrid">'+[['name','Full Teacher Name'],['pid','PID Number'],['designation','Designation / BPS']].map(([key,label])=>'<label>'+label+'<input data-staff-field="'+key+'" maxlength="120" value="'+escapeText(person[key]||'')+'" placeholder="'+label+'"></label>').join('')+'</div>'+footer('classes')}
function classes(){return '<section class="teacherTopCard"><span>STEP 3 · CLASSES I–XII</span><h2>Which Classes Do You Teach?</h2><p>Choose as many classes as you need — Primary, Middle, Matric and Intermediate.</p></section><div class="teacherGradeGrid">'+classOpts().map(g=>'<label class="teacherGradeChoice '+(person.classes.includes(g)?'picked':'')+'"><input type="checkbox" data-staff-class="'+g+'" '+(person.classes.includes(g)?'checked':'')+'><strong>'+cname(g)+'</strong><small>'+(g<=5?'Primary':g<=8?'Middle':g<=10?'Matric':'Inter')+'</small></label>').join('')+'</div>'+footer('subjects')}
function render(){renderShell();$('#teacherView').innerHTML=!person||step==='pick'?picker():step==='details'?details():step==='classes'?classes():step==='subjects'?subjects():monthly();if(step==='subjects')populateCatalog();if(step==='month')refreshCalculations();shown(noticeText)}
async function activate(){root.classList.remove('hidden');person=null;month=null;step='pick';try{const data=await api('staff-load');school=data.school;teachers=data.teachers||[];render()}catch(err){shown(err.message)}}
async function pick(id){if(dirty&&!await save())return;try{person=(await api('staff-select',{teacher_id:id})).profile;person.classes=(person.classes||[]).map(Number);person.staffRev=Number(person.staffRev||0);month=null;dirty=false;step='details';render()}catch(err){shown(err.message)}}
function create(){person={id:nid('staff_'),name:'',pid:'',designation:'',classes:[],subjects:[],staffRev:0};dirty=true;editRevision++;step='details';month=null;render()}
function edited(){dirty=true;editRevision++;const flag=$('#staffDraftFlag');if(flag)flag.textContent='● Unsaved changes';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(!busy&&dirty&&person?.name&&person?.pid&&person?.designation)save(true)},1700)}
async function save(silent=false){
 if(!person)return false;
 clearTimeout(saveTimer);
 if(busy){if(savingPromise)await savingPromise;return dirty?save(silent):true}
 if(!dirty)return true;
 if(!person.name?.trim()||!person.pid?.trim()||!person.designation?.trim()){shown('Enter teacher Name, PID and Designation first.');return false}
 busy=true;
 savingPromise=(async()=>{
  for(let attempt=0;attempt<4&&dirty;attempt++){
   const snapshot=JSON.parse(JSON.stringify(person)),started=editRevision;
   try{
    const result=await api('staff-save',{profile:snapshot});
    person.staffRev=Number(result.staff_revision??((person.staffRev||0)+1));
    if(started===editRevision){dirty=false;if(month)month.submitted=false}
    shown('✓ Saved to school cloud');
   }catch(err){shown('⚠ Save failed: '+err.message);return false}
  }
  if(dirty){clearTimeout(saveTimer);saveTimer=setTimeout(()=>save(true),650)}
  try{const row=await api('staff-load');teachers=row.teachers||teachers}catch(e){shown('✓ Draft saved. Teacher list refresh will retry.')}
  if(!silent&&!dirty)render();
  else if(!dirty){const flag=$('#staffDraftFlag');if(flag)flag.textContent='✓ Cloud Draft Saved'}
  return !dirty
 })();
 try{return await savingPromise}finally{busy=false;savingPromise=null}
}
async function go(next,fromBack=false){if(person&&dirty&&!await save())return;if(!fromBack&&step!==next)trail.push(step);step=next;render();if(next==='month')await openMonth(period)}
const defaults={1:['Sindhi Reader','English','Mathematics','General Knowledge'],2:['Sindhi Reader','English','Mathematics','General Knowledge'],3:['Sindhi Reader','Asan Urdu','English','Mathematics','General Knowledge','Islamiat'],4:['Sindhi Reader','Asan Urdu','English','Mathematics','Science','Social Studies','Islamiat'],5:['Sindhi Reader','Asan Urdu','English','Mathematics','Science','Social Studies','Islamiat'],6:['Sindhi','Urdu','English','Mathematics','Science','Social Studies','Islamiat'],7:['Sindhi','Urdu','English','Mathematics','Science','Social Studies','Islamiat'],8:['Sindhi','Urdu','English','Mathematics','Science','Social Studies','Islamiat'],9:['English','Mathematics','Physics','Chemistry','Biology','Computer Science','Urdu','Islamiat'],10:['English','Mathematics','Physics','Chemistry','Biology','Computer Science','Urdu','Pakistan Studies'],11:['English','Urdu','Mathematics','Physics','Chemistry','Biology','Computer Science','Commerce','Economics'],12:['English','Urdu','Mathematics','Physics','Chemistry','Biology','Computer Science','Commerce','Economics']};
function subjects(){
 if(!person.classes.length)return '<div class="teacherEmpty">Select at least one class before adding subjects.</div>'+footer('classes');
 let html='<section class="teacherTopCard"><span>STEP 4 · SUBJECTS & CHAPTERS</span><h2>Pick and Manage Your Subjects</h2><p>Choose a standard textbook subject or write a custom name. Enter total lessons or chapters. Each subject remains assigned to one teacher.</p></section><div class="teacherNewSubject"><h3>＋ Add Subject</h3><div class="teacherNewFields"><label>Class<select id="staffGrade">'+person.classes.map(g=>'<option value="'+g+'">'+cname(g)+'</option>').join('')+'</select></label><label>Suggested Subject<select id="staffCatalog"></select></label><label>Subject Name<input id="staffNewTitle" maxlength="120" placeholder="Or write custom subject"></label><label>Total Chapters / Lessons<input type="number" id="staffNewTotal" min="1" max="250" value="1"></label><button type="button" data-staff-add>＋ Pick Subject</button></div></div>';
 for(const g of person.classes){const assigned=person.subjects.filter(x=>x.grade===g);html+='<section class="teacherClassGroup"><div class="teacherClassTitle"><b>'+cname(g)+'</b><small>'+assigned.length+' subject(s)</small></div><div class="teacherBookGrid">'+(assigned.length?assigned.map(x=>'<article class="teacherBook"><div class="teacherBookHead"><span>✓ PICKED</span><button type="button" data-staff-remove="'+escapeText(x.id)+'">× Remove</button></div><label>Subject Name<input data-staff-subname="'+escapeText(x.id)+'" value="'+escapeText(x.name)+'"></label><label>Total Chapters / Lessons<input type="number" min="1" max="250" data-staff-total="'+escapeText(x.id)+'" value="'+x.chapters.length+'"></label><details><summary>Chapter Titles (optional)</summary><textarea rows="3" data-staff-titles="'+escapeText(x.id)+'">'+escapeText(x.chapters.join('\n'))+'</textarea></details></article>').join(''):'<div class="teacherEmpty">No subjects picked for '+cname(g)+'</div>')+'</div></section>'}
 return html+footer('month')
}
function populateCatalog(){const g=Number($('#staffGrade')?.value),box=$('#staffCatalog');if(!box)return;box.innerHTML='<option value="">— Select Subject —</option>'+(defaults[g]||[]).filter(x=>!person.subjects.some(t=>t.grade===g&&t.name===x)).map(x=>'<option>'+escapeText(x)+'</option>').join('')+'<option value="custom">＋ Custom Subject</option>'}
function addSubject(){const grade=Number($('#staffGrade')?.value),name=($('#staffNewTitle')?.value||$('#staffCatalog')?.value||'').trim(),total=Number($('#staffNewTotal')?.value);if(!name||name==='custom'||!Number.isInteger(total)||total<1||total>250){shown('Enter subject name and 1–250 chapters.');return}
 if(person.subjects.some(x=>x.grade===grade&&x.name.toLowerCase()===name.toLowerCase()))return shown('This class-subject has already been added.');
 person.subjects.push({id:nid('tbook_'),grade,name,chapters:Array(total).fill('')});edited();render()
}
async function removeSubject(id){const ok=typeof StaffUI!=='undefined'?await StaffUI.confirm('Remove this subject from your teacher tab? Existing saved monthly records stay in History.',{title:'Remove Subject?',confirmLabel:'Remove Subject',danger:true}):confirm('Remove this subject?');if(!ok)return;person.subjects=person.subjects.filter(x=>x.id!==id);edited();render()}

const good=v=>v!==null&&v!==undefined&&v!==''&&Number.isInteger(Number(v))&&Number(v)>=0;
const complete=b=>{const d=b.details||{};return !b.dirty&&b.version>0&&good(d.previous)&&good(d.current)&&Number(d.previous)+Number(d.current)<=b.total&&good(d.notebook)&&Number(d.notebook)<=100&&ratings.includes(d.cleanliness)&&ratings.includes(d.feedback)&&String(d.suggestion||'').trim().length>0};
const counters=()=>{const rows=month?.subjects||[];return{total:rows.length,done:rows.filter(complete).length}};
function nums(total,value){let out='<option value="">— Select —</option>';for(let i=0;i<=total;i++)out+='<option value="'+i+'" '+(value!==null&&value!==undefined&&value!==''&&Number(value)===i?'selected':'')+'>'+i+'</option>';return out}
function gradeOptions(v){return '<option value="">— Select —</option>'+ratings.map(x=>'<option '+(x===v?'selected':'')+'>'+x+'</option>').join('')}
function monthly(){
 const c=counters(),lock=month?.status!=='draft';
 let html='<section class="teacherTopCard teacherFinalIntro"><span>FINAL STEP · MONTHLY REPORT</span><h2>'+escapeText(person.name)+' · Monthly Progress</h2><p>Complete all subject fields. Remaining chapters update immediately while you enter numbers. Final Submit and Excel Export belong to HM.</p><div class="teacherStageProgress"><span data-staff-counter>'+c.done+' / '+c.total+' Subjects Complete</span><div><i data-staff-totalbar style="width:'+(c.total?c.done/c.total*100:0)+'%"></i></div></div></section><div class="teacherMonthSwitch"><label>Month<input id="staffPeriod" type="month" value="'+escapeText(period)+'"></label><button type="button" data-staff-openmonth>↻ Open Month</button><span class="teacherProfileStatus '+(month?.submitted?'isSubmitted':'')+'">'+(month?.submitted?'✓ Submitted':'Draft')+'</span></div>';
 if(!month)return html+'<div class="teacherLoading">Select your reporting month.</div>';
 for(const b of month.subjects){const d=b.details||{},done=complete(b);html+='<article class="teacherMonthlyCard '+(done?'complete':'pending')+'" data-staff-card="'+escapeText(b.id)+'" data-staff-chapters="'+b.total+'"><header><div><small>'+cname(b.grade)+'</small><h3>'+escapeText(b.name)+'</h3></div><span data-staff-state>'+(done?'✓ Complete':'○ Pending')+'</span></header><div class="teacherMonthlyFields" '+(lock?'inert':'')+'><label>Total Chapters<strong>'+b.total+'</strong></label><label>Previous Months<select data-staff-progress="previous">'+nums(b.total,d.previous)+'</select></label><label>This Month<select data-staff-progress="current">'+nums(b.total,d.current)+'</select></label><label>Remaining Chapters<strong class="teacherRemainingNumber" data-staff-remaining>0</strong></label><label>Notebooks & Textbooks (%)<select data-staff-progress="notebook">'+nums(100,d.notebook)+'</select></label><label>Classroom Management<select data-staff-progress="cleanliness">'+gradeOptions(d.cleanliness)+'</select></label><label>Student Feedback<select data-staff-progress="feedback">'+gradeOptions(d.feedback)+'</select></label><label class="full">Improvement Suggestion<textarea data-staff-progress="suggestion" maxlength="900" rows="2">'+escapeText(d.suggestion||'')+'</textarea></label></div><div class="staffMath"><strong data-staff-equation></strong><div class="teacherChapterTrack"><i data-staff-line></i></div></div><div class="teacherMonthFooter"><small data-staff-saved>'+(done?'✓ Cloud Saved':'Fill and save all fields')+'</small><button type="button" data-staff-savebook="'+escapeText(b.id)+'" '+(lock?'disabled':'')+'>💾 Save Subject Draft</button></div></article>'}
 return html+(month.subjects.length?'':'<div class="teacherEmpty">No subjects yet. Add subjects in your teacher tab first.</div>')+'<section class="teacherFinalSubmit"><div><span>FINAL TEACHER STEP</span><h3>'+(month.submitted?'✓ Submitted to HM':'Submit Completed Progress to HM')+'</h3><p data-staff-hint>'+(c.done===c.total&&c.total?'Ready for HM':'Save '+(c.total-c.done)+' pending subjects first')+'</p></div><button type="button" data-staff-submit '+(lock||month.submitted||!c.total||c.done!==c.total?'disabled':'')+'>'+(month.submitted?'✓ Submitted':'✓ Submit to HM →')+'</button></section>'
}
function remaining(card){
 if(!card)return;const total=Number(card.dataset.staffChapters),p=card.querySelector('[data-staff-progress="previous"]'),c=card.querySelector('[data-staff-progress="current"]'),a=Number(p.value||0),b=Number(c.value||0),left=total-a-b,ok=left>=0;
 card.querySelector('[data-staff-remaining]').textContent=ok?String(left):'Invalid';
 card.querySelector('[data-staff-equation]').textContent=ok?total+' − ('+a+' previous + '+b+' this month) = '+left+' remaining':'⚠ Previous + Current exceeds '+total;
 card.querySelector('[data-staff-line]').style.width=(ok&&total?Math.min(100,(a+b)/total*100):0)+'%';
 card.classList.toggle('invalidChapterCount',!ok);
 for(const opt of p.options)if(opt.value!=='')opt.disabled=Number(opt.value)>total-b;
 for(const opt of c.options)if(opt.value!=='')opt.disabled=Number(opt.value)>total-a;
 const button=card.querySelector('[data-staff-savebook]');if(button)button.disabled=!ok||month?.status!=='draft'
}
function refreshCalculations(){for(const card of root.querySelectorAll('[data-staff-card]'))remaining(card);updateSubmit()}
function updateSubmit(){const n=counters();const button=$('[data-staff-submit]');if(button)button.disabled=!n.total||n.total!==n.done||month?.submitted||month?.status!=='draft'||dirty||busy;const counter=$('[data-staff-counter]');if(counter)counter.textContent=n.done+' / '+n.total+' Subjects Complete';const line=$('[data-staff-totalbar]');if(line)line.style.width=(n.total?n.done/n.total*100:0)+'%';const hint=$('[data-staff-hint]');if(hint)hint.textContent=n.done===n.total?'✓ All subjects saved — ready to submit to HM':'Complete and Save '+(n.total-n.done)+' remaining subjects'}
async function openMonth(m){if(!/^20\d\d-(0[1-9]|1[0-2])$/.test(m))return shown('Choose a valid month.');if(dirty&&!await save())return;period=m;step='month';try{month=await api('staff-month-load',{period,teacher_id:person.id});render()}catch(err){shown('Month not loaded: '+err.message)}}
async function saveBook(id){
 const b=month?.subjects.find(x=>x.id===id),card=[...root.querySelectorAll('[data-staff-card]')].find(x=>x.dataset.staffCard===id);if(!b||!card)return;
 const d={};for(const input of card.querySelectorAll('[data-staff-progress]'))d[input.dataset.staffProgress]=input.value;
 for(const k of ['previous','current','notebook'])d[k]=d[k]===''?null:Number(d[k]);
 if((d.previous||0)+(d.current||0)>b.total)return shown('Chapter counts exceed total chapters.');
 const button=card.querySelector('[data-staff-savebook]');button.disabled=true;
 try{const result=await api('staff-month-save',{period,teacher_id:person.id,book_id:id,details:d,version:b.version});b.version=result.version;b.details=d;b.dirty=false;month.submitted=false;const done=complete(b);card.classList.toggle('complete',done);card.classList.toggle('pending',!done);card.querySelector('[data-staff-state]').textContent=done?'✓ Complete':'○ Pending';card.querySelector('[data-staff-saved]').textContent=done?'✓ All fields saved':'✓ Partial draft saved';shown('✓ '+b.name+' saved');updateSubmit()}catch(err){shown('Save failed: '+err.message)}finally{remaining(card)}
}
async function submitMonth(){const c=counters();if(!c.total||c.done!==c.total||dirty||month?.status!=='draft')return shown('Complete and Save all subject fields before submitting.');const accepted=typeof StaffUI!=='undefined'?await StaffUI.confirm('Submit '+c.total+' fully saved subjects for '+period+' to the Head Master? Changes remain accessible while the month is Draft.',{title:'Submit Monthly Progress',confirmLabel:'Submit to HM ✓'}):confirm('Submit '+c.total+' completed subjects for '+period+' to the HM?');if(!accepted)return;try{await api('staff-month-submit',{teacher_id:person.id,period});month.submitted=true;shown('✓ Monthly report submitted to HM.');render()}catch(err){shown('Submission failed: '+err.message)}}

root.addEventListener('click',async event=>{
 const b=event.target.closest('button');if(!b)return;
 if(b.dataset.staffPick)return pick(b.dataset.staffPick);
 if(b.hasAttribute('data-staff-new'))return create();
 if(b.dataset.staffStage)return go(b.dataset.staffStage);
 if(b.dataset.staffNext)return go(b.dataset.staffNext);
 if(b.hasAttribute('data-staff-save'))return save();
 if(b.hasAttribute('data-staff-add'))return addSubject();
 if(b.dataset.staffRemove)return removeSubject(b.dataset.staffRemove);
 if(b.hasAttribute('data-staff-openmonth'))return openMonth($('#staffPeriod')?.value||period);
 if(b.dataset.staffSavebook)return saveBook(b.dataset.staffSavebook);
 if(b.hasAttribute('data-staff-submit'))return submitMonth();
 if(b.hasAttribute('data-teacher-home'))return go('pick');
 if(b.hasAttribute('data-teacher-back'))return go(trail.pop()||'pick',true)
});
root.addEventListener('input',event=>{
 const t=event.target;if(!person)return;
 if(t.dataset.staffField){person[t.dataset.staffField]=t.value;edited()}
 if(t.dataset.staffSubname){const b=person.subjects.find(x=>x.id===t.dataset.staffSubname);if(b){b.name=t.value;edited()}}
 if(t.dataset.staffTotal){const b=person.subjects.find(x=>x.id===t.dataset.staffTotal),n=Number(t.value);if(b&&Number.isInteger(n)&&n>=1&&n<=250){while(b.chapters.length<n)b.chapters.push('');b.chapters.length=n;edited()}}
 if(t.dataset.staffTitles){const b=person.subjects.find(x=>x.id===t.dataset.staffTitles);if(b){const lines=t.value.split(/\r?\n/);b.chapters=b.chapters.map((x,i)=>(lines[i]||'').trim());edited()}}
 if(t.dataset.staffProgress!==undefined&&month){const card=t.closest('[data-staff-card]'),b=month.subjects.find(x=>x.id===card?.dataset.staffCard);if(b){b.dirty=true;b.details={...b.details,[t.dataset.staffProgress]:t.value};month.submitted=false;card.classList.remove('complete');card.classList.add('pending');card.querySelector('[data-staff-saved]').textContent='● Unsaved Changes';card.querySelector('[data-staff-state]').textContent='○ Changed'}remaining(card);updateSubmit()}
});
root.addEventListener('change',async event=>{
 const t=event.target;
 if(t.dataset.staffClass){const g=Number(t.dataset.staffClass);if(t.checked&&!person.classes.includes(g))person.classes.push(g);else if(!t.checked){if(person.subjects.some(x=>x.grade===g)&&!(typeof StaffUI!=='undefined'?await StaffUI.confirm('Removing Class '+r[g]+' also removes its subject assignments from your tab.',{title:'Remove '+cname(g)+'?',confirmLabel:'Remove Class',danger:true}):confirm('Remove Class '+r[g]+' and all its subjects?'))){t.checked=true;return}person.classes=person.classes.filter(n=>n!==g);person.subjects=person.subjects.filter(x=>x.grade!==g)}person.classes.sort((a,b)=>b-a);edited();render()}
 if(t.id==='staffGrade')populateCatalog();
 if(t.id==='staffCatalog'&&t.value&&t.value!=='custom'){const name=$('#staffNewTitle');if(name)name.value=t.value}
 if(t.dataset.staffProgress!==undefined)t.dispatchEvent(new window.Event('input',{bubbles:true}))
});

return{activate,pick,create,save,go,api,openMonth,saveBook,submitMonth,remaining,counters,profile:()=>person,month:()=>month}
})();