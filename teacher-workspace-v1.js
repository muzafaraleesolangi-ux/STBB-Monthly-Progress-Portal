'use strict';
/* Teacher self-service — separate school-scoped, PID-bound sessions. */
const TeacherWorkspace=(()=>{
 const root=document.getElementById('teacherdash');
 if(!root)return{activate:async()=>{}};
 const API='https://oypqcizrlhdouygvazyb.supabase.co/functions/v1/mpr-workspace-v2';
 const gradeNames={1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII',9:'IX',10:'X',11:'XI',12:'XII'};
 const catalog={1:['Sindhi Reader','English','Mathematics','General Knowledge'],2:['Sindhi Reader','English','Mathematics','General Knowledge'],3:['Sindhi Reader','Asan Urdu','English','Mathematics','General Knowledge','Islamiat'],4:['Sindhi Reader','Asan Urdu','English','Mathematics','General Science','Social Studies','Islamiat'],5:['Sindhi Reader','Asan Urdu','English','Mathematics','General Science','Social Studies','Islamiat'],6:['Sindhi','Urdu','English','Mathematics','General Science','Social Studies','Islamiat','Computer Science'],7:['Sindhi','Urdu','English','Mathematics','General Science','Social Studies','Islamiat','Computer Science'],8:['Sindhi','Urdu','English','Mathematics','General Science','Social Studies','Islamiat','Computer Science'],9:['Sindhi','Urdu','English','Mathematics','Physics','Chemistry','Biology','Computer Science','Pakistan Studies','Islamiat'],10:['Sindhi','Urdu','English','Mathematics','Physics','Chemistry','Biology','Computer Science','Pakistan Studies','Islamiat'],11:['Urdu','English','Mathematics','Physics','Chemistry','Biology','Computer Science','Economics','Statistics','Accounting','Commerce','Education','Islamic Studies'],12:['Urdu','English','Mathematics','Physics','Chemistry','Biology','Computer Science','Economics','Statistics','Accounting','Commerce','Education','Islamic Studies']};
 const e=v=>esc(v??''),id=()=>('tbook_'+(crypto.randomUUID?.()||String(Date.now())+Math.random().toString(16).slice(2)).replace(/[^a-zA-Z0-9_-]/g,''));
 const rating=['Excellent','Very Good','Good','Fair','Needs Improvement'];
 let profile=null,school=null,tab='profile',tabTrail=[],months={},workingMonth=new Date().toISOString().slice(0,7),busy=false,dirty=false,saveLater=null,alertText='',lastStatus='';
 const $=s=>root.querySelector(s);
 const api=async(action,payload={})=>{
  if(!auth||auth.role!=='teacher')throw Error('Teacher sign in required');
  const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},body:JSON.stringify({action,...payload}),cache:'no-store'});
  const v=await r.json().catch(()=>({}));if(!r.ok||v.error)throw Error(v.error||'Cloud request failed');return v
 };
 function notice(text,bad=false){alertText=text;lastStatus=bad?'bad':'ok';const el=$('#teacherNotice');if(el){el.textContent=text;el.classList.toggle('isError',bad)}}
 function draftUpdate(){dirty=true;if(profile)profile.profile_status='draft';const el=$('#teacherDraftIndicator');if(el)el.textContent='● Unsaved changes';clearTimeout(saveLater);saveLater=setTimeout(()=>save(false,true),1500)}
 const className=n=>'Class '+gradeNames[n];
 function mine(){return(profile?.subjects||[]).slice().sort((a,b)=>b.grade-a.grade||a.name.localeCompare(b.name))}
 function renderNav(){
  const tabs=[['profile','My Profile'],['subjects','Classes & Subjects'],['progress','Monthly Progress']];
  const nav=$('#teacherTabs');nav.innerHTML=tabs.map(([key,label])=>'<button type="button" data-teacher-tab="'+key+'" class="'+(tab===key?'active':'')+'">'+label+'</button>').join('');
  $('#teacherHeading').textContent=school?.school_name||'My School';
  $('#teacherSemis').textContent='SEMIS '+(school?.semis||'')+' · '+(profile?.name||'Teacher');
  const sidebar=$('#teacherSide');
  sidebar.innerHTML='<div class="teacherIdentity"><span>MY TEACHER WORKSPACE</span><h3>'+e(profile?.name||'Teacher')+'</h3><small>PID '+e(profile?.pid)+' · '+e(profile?.designation)+'</small><div class="teacherProfileStatus '+(profile?.profile_status==='submitted'?'isSubmitted':'')+'">'+(profile?.profile_status==='submitted'?'✓ Profile Submitted':'✎ Profile Draft')+'</div></div><div class="teacherSteps">'+tabs.map(([key,label],i)=>'<button type="button" data-teacher-tab="'+key+'" class="'+(tab===key?'active':'')+'"><span>'+Number(i+1)+'</span>'+label+'</button>').join('')+'</div><div class="teacherSideNote">Only your classes and subjects appear here. Monthly Final Submit, Excel Export and school History are HM-only.</div>';
 }
 function renderProfile(){
  const classes=profile.classes||[];
  return '<section class="teacherTopCard"><span>STEP 1 · MY INFORMATION</span><h2>Teacher Profile</h2><p>Confirm your name, PID and designation. Pick all classes you teach, from Class I through XII.</p></section>'+
  '<div class="teacherFormGrid"><label>Teacher Name<input data-teacher-field="name" value="'+e(profile.name)+'" maxlength="120" placeholder="Full teacher name"></label><label>Personal ID (PID)<input readonly value="'+e(profile.pid)+'" title="PID is the unique teacher account identifier"></label><label>Designation<input data-teacher-field="designation" value="'+e(profile.designation)+'" maxlength="110" placeholder="PST, JEST, HST, etc."></label></div>'+
  '<h3 class="teacherSmallHeading">Which classes do you teach?</h3><div class="teacherGradeGrid">'+Array.from({length:12},(_,i)=>i+1).map(n=>'<label class="teacherGradeChoice '+(classes.includes(n)?'picked':'')+'"><input type="checkbox" data-teacher-grade="'+n+'" '+(classes.includes(n)?'checked':'')+'><strong>'+className(n)+'</strong><small>'+(n<=5?'Primary':n<=8?'Middle':n<=10?'Matric':'Intermediate')+'</small></label>').join('')+'</div>'+
  '<div class="teacherFoot"><span id="teacherDraftIndicator">'+(dirty?'● Unsaved changes':'✓ Profile saved to school')+'</span><button type="button" data-teacher-save>💾 Save Draft</button><button type="button" data-teacher-next="subjects">Continue to Subjects →</button></div>'
 }
 function renderSubjects(){
  const classes=profile.classes||[],books=mine();
  let out='<section class="teacherTopCard"><span>STEP 2 · MY CLASSES & SUBJECTS</span><h2>Teaching Subjects</h2><p>Select ready-made subjects or enter your own. Provide a total number of chapters/lessons. A subject already claimed by another teacher cannot be assigned twice.</p></section>';
  if(!classes.length)return out+'<div class="teacherEmpty">Choose teaching classes in My Profile first.</div><button type="button" class="teacherSubtleBtn" data-teacher-tab="profile">← Select Classes</button>';
  out+='<section class="teacherNewSubject"><h3>＋ Pick or Add Subject</h3><div class="teacherNewFields"><label>Class<select id="teacherNewGrade">'+classes.map(g=>'<option value="'+g+'">'+className(g)+'</option>').join('')+'</select></label><label>Subject<select id="teacherSubjectPicker"></select></label><label>Subject name (for custom)<input id="teacherNewName" maxlength="120" placeholder="Or type a custom subject"></label><label>Total Chapters / Lessons<input id="teacherNewTotal" type="number" min="1" max="250" value="1"></label><button type="button" data-teacher-add>＋ Add Subject</button></div></section>';
  for(const g of classes){
   const sub=books.filter(x=>x.grade===g);
   out+='<section class="teacherClassGroup"><div class="teacherClassTitle"><b>'+className(g)+'</b><small>'+sub.length+' picked subjects</small></div><div class="teacherBookGrid">'+(sub.length?sub.map(b=>'<article class="teacherBook" data-book="'+e(b.id)+'"><div class="teacherBookHead"><span>✓ PICKED · '+className(g)+'</span><button type="button" data-teacher-remove="'+e(b.id)+'" title="Remove this subject from your assignment">× Remove</button></div><label>Subject Name<input data-teacher-book-name="'+e(b.id)+'" maxlength="120" value="'+e(b.name)+'"></label><label>Total Chapters / Lessons<input type="number" min="1" max="250" data-teacher-book-total="'+e(b.id)+'" value="'+b.chapters.length+'"></label><details><summary>View / Edit Chapter Names (optional)</summary><textarea data-teacher-book-chapters="'+e(b.id)+'" rows="4" placeholder="Optional: one chapter title per line">'+e(b.chapters.filter(Boolean).join('\n'))+'</textarea><small>One line per chapter. Blank titles are allowed; total number is mandatory.</small></details></article>').join(''):'<p class="teacherEmpty">No subjects picked for '+className(g)+' yet.</p>')+'</div></section>';
  }
  out+='<div class="teacherFoot"><span id="teacherDraftIndicator">'+(dirty?'● Unsaved changes':'✓ Cloud draft available')+'</span><button type="button" data-teacher-save>💾 Save Draft</button><button type="button" class="teacherSubmitBtn" data-teacher-submit>✓ Submit Teacher Profile</button><button type="button" data-teacher-next="progress">Monthly Progress →</button></div>';
  return out
 }
 function opts(max,v,blank=true){let o=blank?'<option value="">— Select —</option>':'';for(let i=0;i<=max;i++)o+='<option value="'+i+'" '+(v!==null&&v!==undefined&&v!==''&&Number(v)===i?'selected':'')+'>'+i+'</option>';return o}
 function rateOpts(v){return '<option value="">— Select —</option>'+rating.map(r=>'<option '+(r===v?'selected':'')+'>'+r+'</option>').join('')}
 function monthRecords(){return months[workingMonth]||{subjects:[],status:'draft'}}
 function renderProgress(){
  const records=monthRecords(),closed=records.status!=='draft';
  let out='<section class="teacherTopCard"><span>STEP 3 · TEACHER MONTHLY PROGRESS</span><h2>Monthly Subject Reporting</h2><p>Only your assigned subjects appear. Save each subject independently. HM will review all teachers and handle Final Submit and Excel Export.</p></section><div class="teacherMonthSwitch"><label>Reporting Month<input type="month" id="teacherMonth" value="'+e(workingMonth)+'"></label><button type="button" data-teacher-month-refresh>↻ Open / Refresh</button><span class="teacherProfileStatus '+(closed?'isSubmitted':'')+'">'+(closed?'HM Finalized · Read Only':'Draft · Editable')+'</span></div>';
  if(!records.subjects?.length)return out+'<div class="teacherEmpty">No subjects available for this month. Save your class-subject profile first.</div>';
  for(const b of records.subjects){
   const d=b.details||{},total=b.total,completed=b.version>0&&d.current!==null&&d.notebook!==null&&!!d.cleanliness&&!!d.feedback&&!!d.suggestion;
   out+='<article class="teacherMonthlyCard '+(completed?'complete':'pending')+'" data-month-book="'+e(b.id)+'"><header><div><small>'+className(b.grade)+' · '+e(b.name)+'</small><h3>'+e(b.name)+'</h3></div><span>'+ (completed?'✓ Saved':'◉ Pending')+'</span></header><div class="teacherMonthlyFields" '+(closed?'inert':'')+'><label>Total Chapters / Lessons<strong>'+total+'</strong></label><label>Previous Months (auto-filled)<select data-month-value="previous">'+opts(total,d.previous)+'</select>'+(b.source_period?'<small>Carried from '+e(b.source_period)+'</small>':'')+'</label><label>This Month Chapters<select data-month-value="current">'+opts(total,d.current)+'</select></label><label>Still Remaining<strong>'+Math.max(0,total-(Number(d.previous)||0)-(Number(d.current)||0))+'</strong></label><label>Notebooks & Textbooks (%)<select data-month-value="notebook"><option value="">— Select —</option>'+[0,5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100].map(v=>'<option value="'+v+'" '+(d.notebook===v?'selected':'')+'>'+v+'%</option>').join('')+'</select></label><label>Classroom Management<select data-month-value="cleanliness">'+rateOpts(d.cleanliness)+'</select></label><label>Student Feedback<select data-month-value="feedback">'+rateOpts(d.feedback)+'</select></label><label class="full">Improvement Suggestion<textarea data-month-value="suggestion" rows="2" maxlength="900" placeholder="Enter suggestion or No further improvement suggested">'+e(d.suggestion||'')+'</textarea></label></div><div class="teacherMonthFooter"><small data-month-sync="'+e(b.id)+'">'+(completed?'✓ Saved in school report':'Fill this month and save')+'</small><button type="button" data-month-save="'+e(b.id)+'" '+(closed?'disabled':'')+'>💾 Save Subject Draft</button></div></article>'
  }
  return out
 }
 function updateCatalog(){
  const grade=Number($('#teacherNewGrade')?.value||0),select=$('#teacherSubjectPicker');if(!select)return;
  const available=(catalog[grade]||[]).filter(x=>!profile.subjects.some(b=>b.grade===grade&&b.name.toLowerCase()===x.toLowerCase()));
  select.innerHTML='<option value="">— Select a standard subject —</option>'+available.map(x=>'<option value="'+e(x)+'">'+e(x)+'</option>').join('')+'<option value="__custom">＋ Custom Subject</option>'
 }
 function render(){
  if(!profile||!school)return;
  renderNav();$('#teacherView').innerHTML=tab==='profile'?renderProfile():tab==='subjects'?renderSubjects():renderProgress();
  if(tab==='subjects')updateCatalog();
  notice(alertText, lastStatus==='bad')
 }
 async function activate(){
  if(auth?.role!=='teacher')return;
  root.classList.remove('hidden');
  root.querySelector('#teacherView').innerHTML='<div class="teacherLoading">Loading your private teacher workspace…</div>';
  try{const r=await api('teacher-load');school=r.school;profile=r.profile;profile.subjects=(profile.subjects||[]).map(x=>({...x,chapters:[...(x.chapters||[])]}));profile.classes=(profile.classes||[]).map(Number);
   tab='profile';render();
   if(tab==='progress')await openMonth(workingMonth)
  }catch(err){root.querySelector('#teacherView').textContent=err.message}
 }
 async function save(submit=false,silent=false){
  if(!profile||busy)return false;
  clearTimeout(saveLater);saveLater=null;busy=true;
  const button=$('[data-teacher-save]');if(button)button.disabled=true;
  try{
   const payload={name:profile.name,designation:profile.designation,classes:profile.classes,subjects:profile.subjects.map(b=>({id:b.id,grade:b.grade,name:b.name,total:b.chapters.length,chapters:b.chapters}))};
   const r=await api('teacher-save',{profile:payload,version:profile.version,submit});
   profile.version=r.version;profile.profile_status=r.status;dirty=false;notice(submit?'✓ Teacher Profile submitted to HM. You can continue monthly progress.':'✓ Teacher profile saved to cloud.');
   if(!silent)render();else{const label=$('#teacherDraftIndicator');if(label)label.textContent='✓ Cloud draft saved'}
   return true
  }catch(err){notice('⚠ Save failed: '+err.message,true);if(!silent)alert(err.message);return false}
  finally{busy=false;if(button)button.disabled=false}
 }
 async function openMonth(period){
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))return notice('Choose a valid month',true);
  workingMonth=period;$('#teacherView').innerHTML='<div class="teacherLoading">Loading '+e(period)+' academic progress…</div>';
  try{const data=await api('teacher-month-load',{period});months[period]=data;render();notice('✓ '+period+' progress opened.')}
  catch(err){notice('Cannot load month: '+err.message,true);render()}
 }
 async function saveMonth(id){
  const data=monthRecords(),b=data.subjects.find(s=>s.id===id),card=[...root.querySelectorAll('[data-month-book]')].find(x=>x.dataset.monthBook===id);
  if(!b||!card)return;
  const details={};for(const field of card.querySelectorAll('[data-month-value]'))details[field.dataset.monthValue]=field.value;
  for(const key of ['previous','current','notebook'])details[key]=details[key]===''?null:Number(details[key]);
  if((details.previous||0)+(details.current||0)>b.total)return notice('Previous + current chapters cannot exceed total chapters.',true);
  const button=card.querySelector('[data-month-save]');button.disabled=true;
  try{
   const r=await api('teacher-month-save',{period:workingMonth,book_id:id,details,version:b.version});
   b.version=r.version;b.details=details;
   notice('✓ '+b.name+' saved to monthly school report.');card.classList.remove('pending');card.classList.add('complete');
   card.querySelector('[data-month-sync]').textContent='✓ Saved to HM monthly report';
  }catch(err){notice('Save failed: '+err.message,true);alert(err.message)}
  finally{button.disabled=false}
 }
 async function view(next,fromBack=false){if(dirty&&!(await save(false,true)))return;if(!fromBack&&tab!==next)tabTrail.push(tab);tab=next;render();if(tab==='progress')await openMonth(workingMonth)}
 root.addEventListener('click',async ev=>{
  const t=ev.target.closest('button');if(!t)return;
  if(t.hasAttribute('data-teacher-home'))return view('profile');
  if(t.hasAttribute('data-teacher-back'))return view(tabTrail.pop()||'profile',true);
  if(t.dataset.teacherTab)return view(t.dataset.teacherTab);
  if(t.dataset.teacherNext)return view(t.dataset.teacherNext);
  if(t.hasAttribute('data-teacher-save'))return save();
  if(t.hasAttribute('data-teacher-submit')){if(!confirm('Submit your teacher profile, classes and subjects to the Head Master?'))return;return save(true)}
  if(t.hasAttribute('data-teacher-add')){
   const grade=Number($('#teacherNewGrade')?.value),choice=$('#teacherSubjectPicker')?.value,name=($('#teacherNewName')?.value||choice||'').trim(),total=Number($('#teacherNewTotal')?.value);
   if(!name||!Number.isInteger(total)||total<1||total>250)return notice('Enter a subject name and valid chapter total (1–250).',true);
   if(profile.subjects.some(b=>b.grade===grade&&b.name.toLowerCase()===name.toLowerCase()))return notice('You already picked this class-subject.',true);
   if(!profile.classes.includes(grade))return notice('Select this teaching class in My Profile.',true);
   profile.subjects.push({id:id(),grade,name,chapters:Array.from({length:total},()=>'')});draftUpdate();render();return
  }
  if(t.dataset.teacherRemove){if(!confirm('Remove this subject from your teaching assignment?'))return;profile.subjects=profile.subjects.filter(b=>b.id!==t.dataset.teacherRemove);draftUpdate();render();return}
  if(t.hasAttribute('data-teacher-month-refresh'))return openMonth($('#teacherMonth')?.value||workingMonth);
  if(t.dataset.monthSave)return saveMonth(t.dataset.monthSave)
 });
 root.addEventListener('input',ev=>{
  const t=ev.target;
  if(t.dataset.teacherField){profile[t.dataset.teacherField]=t.value;draftUpdate()}
  if(t.dataset.teacherBookName){const b=profile.subjects.find(x=>x.id===t.dataset.teacherBookName);if(b){b.name=t.value;draftUpdate()}}
  if(t.dataset.teacherBookTotal){const b=profile.subjects.find(x=>x.id===t.dataset.teacherBookTotal);if(b){const n=Number(t.value);if(Number.isInteger(n)&&n>=1&&n<=250){while(b.chapters.length<n)b.chapters.push('');b.chapters.length=n;draftUpdate()}}}
  if(t.dataset.teacherBookChapters){const b=profile.subjects.find(x=>x.id===t.dataset.teacherBookChapters);if(b){const arr=t.value.split(/\r?\n/);for(let i=0;i<b.chapters.length;i++)b.chapters[i]=(arr[i]||'').trim();draftUpdate()}}
 });
 root.addEventListener('change',ev=>{
  const t=ev.target;
  if(t.dataset.teacherGrade){const grade=Number(t.dataset.teacherGrade);if(t.checked&&!profile.classes.includes(grade))profile.classes.push(grade);else if(!t.checked){if(profile.subjects.some(b=>b.grade===grade)&&!confirm('Remove Class '+gradeNames[grade]+' and all assigned subjects in it?')){t.checked=true;return}profile.classes=profile.classes.filter(x=>x!==grade);profile.subjects=profile.subjects.filter(x=>x.grade!==grade)}draftUpdate();render()}
  if(t.id==='teacherNewGrade')updateCatalog();
  if(t.id==='teacherSubjectPicker'&&t.value&&t.value!=='__custom'){const field=$('#teacherNewName');if(field&&!field.value)field.value=t.value}
 });
 return{activate,view,save,profile:()=>profile,api}
})();