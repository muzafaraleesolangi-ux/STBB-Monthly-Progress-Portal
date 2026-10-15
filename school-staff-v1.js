'use strict';
const SharedStaff=(()=>{
const root=document.getElementById('teacherdash');
if(!root)return{activate:async()=>{}};
const API='https://oypqcizrlhdouygvazyb.supabase.co/functions/v1/mpr-workspace-v2',r=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'],ratings=['Excellent','Very Good','Good','Fair','Needs Improvement'],escapeText=v=>esc(v??''),$=q=>root.querySelector(q);
let school=null,teachers=[],person=null,step='pick',month=null,period=new Date().toISOString().slice(0,7),dirty=false,busy=false,noticeText='',saveTimer=null,trail=[];
const api=async(action,data={})=>{if(auth?.role!=='staff')throw Error('School staff login required');const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},body:JSON.stringify({action,...data}),cache:'no-store'}),value=await res.json();if(!res.ok||value.error)throw Error(value.error||'Network failure');return value};
const nid=prefix=>prefix+crypto.randomUUID().replace(/-/g,'');
const cname=g=>'Class '+r[g];
const shown=msg=>{noticeText=msg;const el=$('#teacherNotice');if(el)el.textContent=msg};
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
async function pick(id){if(dirty&&!await save())return;try{person=(await api('staff-select',{teacher_id:id})).profile;person.classes=(person.classes||[]).map(Number);month=null;dirty=false;step='details';render()}catch(err){shown(err.message)}}
function create(){person={id:nid('staff_'),name:'',pid:'',designation:'',classes:[],subjects:[]};dirty=true;step='details';month=null;render()}
function edited(){dirty=true;const flag=$('#staffDraftFlag');if(flag)flag.textContent='● Unsaved changes';clearTimeout(saveTimer);saveTimer=setTimeout(()=>{if(!busy&&dirty&&person?.name&&person?.pid&&person?.designation)save(true)},1700)}
async function save(silent=false){if(!person||busy)return false;clearTimeout(saveTimer);if(!person.name?.trim()||!person.pid?.trim()||!person.designation?.trim()){shown('Enter Name, PID and Designation first.');return false}busy=true;try{await api('staff-save',{profile:person});const row=await api('staff-load');teachers=row.teachers||teachers;dirty=false;if(month)month.submitted=false;shown('✓ School Draft Saved');if(!silent)render();return true}catch(err){shown('Save failed: '+err.message);return false}finally{busy=false}}
async function go(next){if(person&&dirty&&!await save())return;trail.push(step);step=next;render();if(next==='month')await openMonth(period)}
// SUBJECTS
// MONTHLY
// EVENTS
return{activate,pick,create,save,go,api,profile:()=>person,month:()=>month}
})();