'use strict';
/* Admin-only school directory. Deactivate preserves existing records. */
const AdminSchools=(()=>{
 let records=[],ready=false;
 const API='https://oypqcizrlhdouygvazyb.supabase.co/functions/v1/mpr-workspace-v2';
 async function api(action,payload={}){if(!auth?.admin)throw Error('Admin login required');const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},body:JSON.stringify({action,...payload}),cache:'no-store'});const v=await r.json().catch(()=>({}));if(!r.ok||v.error)throw Error(v.error||'Request failed');return v}
 let modal=document.createElement('div');modal.id='adminSchoolModal';modal.className='adminSchoolModal hidden';modal.innerHTML='<div class="adminModalShade" data-close-school-modal></div><div class="adminModalCard"><button class="adminClose" type="button" data-close-school-modal aria-label="Close">✕</button><div id="adminSchoolModalBody"></div></div>';document.body.appendChild(modal);
 const body=document.getElementById('adminSchoolModalBody');
 const modalNav=document.createElement('nav');modalNav.className='modalContextNav';
 modalNav.innerHTML='<button type="button" data-close-school-modal>← Back</button><button type="button" data-admin-modal-home>⌂ Admin Home</button>';
 modal.querySelector('.adminModalCard')?.prepend(modalNav);
 modalNav.querySelector('[data-admin-modal-home]').addEventListener('click',()=>{modal.classList.add('hidden');body.replaceChildren();if(typeof portalNavigateHome==='function')portalNavigateHome()});

 function open(content){body.innerHTML=content;modal.classList.remove('hidden');body.querySelector('input,button')?.focus()}
 function close(){modal.classList.add('hidden');body.replaceChildren()}
 function message(text,success=false){const b=body.querySelector('.adminModalMessage');if(b){b.textContent=text;b.className='adminModalMessage '+(success?'success':'error')}else alert(text)}
 function normal(phone){let n=String(phone||'').replace(/\D/g,'');if(n.startsWith('00'))n=n.slice(2);if(n.startsWith('0'))n='92'+n.slice(1);if(n.length===10&&n.startsWith('3'))n='92'+n;return /^[0-9]{11,15}$/.test(n)?n:null}
 function waLink(semis,token){const link=new URL(location.origin+location.pathname);link.hash=new URLSearchParams({reset:token,semis}).toString();return link.toString()}
 async function refresh(){if(!auth?.admin)return;try{records=(await api('admin-list-schools')).schools||[];ready=true;render()}catch(e){console.warn(e);ready=false}}
 function render(){
  if(!auth?.admin)return;
  const root=document.getElementById('admin-schools');if(!root)return;
  const search=(document.getElementById('adminSearch')?.value||'').trim().toLowerCase();
  const list=records.filter(r=>(r.semis+' '+r.school_name+' '+r.hm_name).toLowerCase().includes(search));
  root.innerHTML='<div class="adminSchoolToolbar"><div><h2>School Profiles <span class="adminCount">'+list.length+'</span></h2><p>Private school directory — inspect, edit, reset, permanently delete, or create a school account.</p></div><button class="btn primary" type="button" data-admin-school="add">＋ Add School</button></div><div class="adminSchoolGrid">'+list.map(x=>'<article class="adminSchoolCard '+(!x.is_active?'inactive':'')+'"><div class="adminProfileTitle"><span class="adminSchoolEmblem">🏫</span><div><strong>'+esc(x.school_name)+'</strong><small>SEMIS '+esc(x.semis)+'</small></div></div><p>Head Teacher: <b>'+esc(x.hm_name)+'</b></p><span class="adminStatus '+(x.is_active?'active':'')+'">'+(x.is_active?'● Active':'● Inactive')+'</span><div class="adminProfileButtons"><button data-admin-school="view" data-semis="'+esc(x.semis)+'">View</button><button data-admin-school="edit" data-semis="'+esc(x.semis)+'">Edit</button><button data-admin-school="reset" data-semis="'+esc(x.semis)+'">Reset Password</button><button class="danger" data-admin-school="delete" data-semis="'+esc(x.semis)+'">Delete</button></div></article>').join('')+'</div>';
 }
 async function view(semis){open('<h2>Loading School Profile…</h2>');try{
 const x=await api('admin-school',{semis}),a=x.account,t=x.setup?.teachers||[],grades=x.setup?.selectedClasses||[],books=Object.entries(x.setup?.books||{}).flatMap(([grade,v])=>v.filter(b=>b.active).map(b=>({grade,name:b.name,chapters:b.chapters?.length||0,teacher:t.find(y=>y.id===b.teacherId)?.name||'Unassigned'})));
 open('<h2>School Profile</h2><div class="adminModalInfo"><b>'+esc(a.school_name)+'</b><span>SEMIS '+esc(a.semis)+'</span><span>HM: '+esc(a.hm_name)+'</span><span>'+ (a.is_active?'Active':'Deactivated') +'</span></div><h3>Selected Classes</h3><p>'+grades.slice().sort().map(n=>'Class '+['','I','II','III','IV','V'][n]).join(' · ')+'</p><h3>School Teachers ('+t.length+')</h3><div class="adminProfileScroll">'+(t.map(z=>'<p>'+esc(z.name)+' · PID '+esc(z.pid)+' · '+esc(z.designation)+' · Classes '+(z.classes||[]).map(n=>['','I','II','III','IV','V'][n]).join(', ')+'</p>').join('')||'<p>No staff entered yet.</p>')+'</div><h3>Assigned Subjects ('+books.length+')</h3><div class="adminProfileScroll">'+books.map(z=>'<p>Class '+esc(z.grade)+' · '+esc(z.name)+' · '+z.chapters+' chapters · '+esc(z.teacher)+'</p>').join('')+'</div><h3>Saved Data</h3><p>'+x.drafts.length+' legacy monthly drafts · '+x.entries.length+' new subject progress entries · '+x.reports.length+' Excel exports</p><p class="adminModalMessage">Open "Saved Work" or "Exported Files" tabs to inspect the report files.</p>')
 }catch(e){open('<h2>Could not load school</h2><p>'+esc(e.message)+'</p>')}}
 function edit(semis){const a=records.find(z=>z.semis===semis);if(!a)return;
 open('<h2>Edit School Details</h2><p>Changes affect future report headers; drafts and export history remain saved.</p><form id="adminEditSchoolForm"><label>SEMIS<input value="'+esc(semis)+'" readonly></label><label>Official School Name<input name="school_name" required maxlength="220" value="'+esc(a.school_name)+'"></label><label>Head Teacher Name<input name="hm_name" required maxlength="180" value="'+esc(a.hm_name)+'"></label><button class="btn primary">Save Changes</button><p class="adminModalMessage"></p></form>');
 body.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);try{await api('admin-edit-school',{semis,school_name:f.get('school_name'),hm_name:f.get('hm_name')});message('School details saved successfully.',true);await refresh()}catch(x){message(x.message)}}}
 function add(){open('<h2>Register a New School</h2><p>Create a school profile directly from the private admin dashboard.</p><form id="adminAddSchoolForm"><label>School SEMIS Code<input name="new_semis" inputmode="numeric" pattern="[0-9]{8,12}" maxlength="12" required></label><label>Official School Name<input name="school_name" maxlength="220" required></label><label>Head Teacher<input name="hm_name" maxlength="180" required></label><label>HM Gender<select name="hm_gender" required><option value="">Select</option><option value="male">Male · Head Master</option><option value="female">Female · Head Mistress</option></select></label><label>New School Password<input name="password" type="password" minlength="8" maxlength="128" autocomplete="new-password" required placeholder="8–128 characters"></label><button class="btn primary">Create School Account</button><p class="adminModalMessage"></p></form>');
 body.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));try{await api('admin-create-school',f);message('School account created. Its SEMIS username and password can now be used to sign in.',true);e.target.reset();await refresh()}catch(x){message(x.message)}}}
 async function deleteSchool(semis){
 const row=records.find(x=>x.semis===semis);if(!row)return;
 open('<h2>⚠ Permanently Delete School</h2><p><b>'+esc(row.school_name)+'</b> (SEMIS '+esc(semis)+')</p><div class="permanentWarning"><strong>Permanent, irreversible deletion.</strong><p>This deletes the school account, teacher setup, monthly drafts, subject progress, recovery requests and exported Excel file history. It cannot be undone. Password RESET is different and always preserves reports.</p></div><form id="deleteSchoolForm"><label>Type exact SEMIS Code to confirm<input name="confirm_semis" autocomplete="off" placeholder="'+esc(semis)+'" required></label><label class="deleteCheckbox"><input type="checkbox" name="agree" required> I understand that this will permanently erase school records.</label><button class="btn danger" type="submit">Permanently Delete School & Data</button><p class="adminModalMessage"></p></form>');
 body.querySelector('form').onsubmit=async e=>{
  e.preventDefault();const form=new FormData(e.target);
  if(form.get('confirm_semis')!==semis)return message('Typed SEMIS Code does not match. Deletion cancelled.');
  if(form.get('agree')!=='on')return message('Confirm permanent deletion.');
  if(!confirm('FINAL CONFIRMATION: Permanently DELETE '+row.school_name+' ('+semis+') and all associated drafts/reports?'))return;
  try{const response=await api('admin-delete-school',{semis,confirm_semis:semis,confirm_irreversible:true});close();await refresh();await loadAdmin();alert(response.notice||'School and all associated data permanently deleted.')}
  catch(err){message(err.message)}
 };
}
function reset(semis){
 const row=records.find(x=>x.semis===semis);
 if(!row)return;
 const reqs=(adminData?.resets||[]).filter(r=>r.semis===semis&&(r.status==='pending'||r.status==='approved'));
 if(!reqs.length){open('<h2>School Password Reset</h2><p>For <b>'+esc(row.school_name)+'</b>, the Head Teacher must first select <b>Forgot Password</b> on the portal and submit SEMIS, school name, HM name and WhatsApp number.</p><div class="premiumIntro">The submitted phone number will appear automatically in Account Recovery Requests, with an Approve & WhatsApp button. No number needs to be entered by the administrator. All drafts and reports remain saved.</div><button class="btn ghost" type="button" data-close-school-modal>Close</button>');return}
 close();
 document.getElementById('adminSearch').value=semis;
 const buttons=document.querySelectorAll('#adminTabs button');
 const btn=[...buttons].find(x=>/Reset Requests/i.test(x.textContent))||buttons[4];
 adminTab('resets',btn);
 document.getElementById('admin-resets')?.scrollIntoView({behavior:'smooth'});
}
document.addEventListener('click',e=>{
  if(e.target.closest('[data-close-school-modal]'))close();
  const button=e.target.closest('#admin-schools [data-admin-school]');if(!button)return;
  const action=button.dataset.adminSchool,semis=button.dataset.semis;
  if(action==='view')view(semis);if(action==='edit')edit(semis);if(action==='add')add();if(action==='delete')deleteSchool(semis);if(action==='reset')reset(semis);
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))close()});
 const previousLoad=loadAdmin;loadAdmin=async function(){await previousLoad();await refresh()};
 const previousRender=renderAdminTables;renderAdminTables=function(){previousRender();if(ready)render()};
 if(auth?.admin)setTimeout(refresh,950);
 return{refresh,view,edit,add};
})();
