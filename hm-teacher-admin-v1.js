'use strict';
/* HM school profile and teacher registration controls; visible only in HM account. */
const HMTeacherAdmin=(()=>{
 const root=document.getElementById('school-overview');
 if(!root)return{refresh:async()=>{}};
 const card=document.createElement('section');card.id='hmTeacherAdmin';card.className='hmTeacherAdmin';
 card.innerHTML='<div class="hmAdminHeading"><div><span>HEAD MASTER WORKSPACE</span><h2>School Profile & Teaching Team</h2><p>Save school details and view staff name-tabs. Teachers enter through the common School Sign In. Set a private HM Office PIN to protect final submission and exports.</p></div><span class="hmAdminIcon">🏫</span></div><div id="hmSchoolForm"></div><div id="hmAccessForm"></div><div class="hmTeacherRoster" id="hmTeacherRoster"></div>';
 root.prepend(card);
 const $=s=>card.querySelector(s);
 function html(){
  const school=account||{},teacherCode=$('#hmAccessForm');
  $('#hmSchoolForm').innerHTML='<div class="hmSchoolFields"><label>School SEMIS Code<input type="text" value="'+esc(school.semis||'')+'" readonly></label><label>Official School Name<input id="hmSchoolName" maxlength="220" value="'+esc(school.school_name||'')+'" required></label><label>Head Master / Head Mistress<input id="hmHeadName" maxlength="180" value="'+esc(school.hm_name||'')+'" required></label><button type="button" data-hm-school-save>💾 Save School Draft</button></div>';
  teacherCode.innerHTML='<div class="hmCodeSetup"><div><strong>🔐 HM Office PIN</strong><small>Staff share the school password. This separate private HM PIN protects office sign-in, Final Submit, Excel and History. Set an 8+ character PIN/passphrase and keep it only with the HM.</small></div><label><input type="password" id="hmOfficePin" minlength="8" maxlength="128" autocomplete="new-password" placeholder="Private HM-only PIN / Passphrase"><button type="button" id="hmPinVisibility" aria-label="Show or hide PIN">👁</button></label><button type="button" data-hm-pin-save>Save HM PIN</button></div>';
  $('#hmTeacherRoster').innerHTML='<p class="hmRosterLoading">Loading teacher registrations…</p>'
 }
 async function refresh(){
  if(!auth||auth.admin||auth.role==='teacher'||auth.role==='staff'){card.classList.add('hidden');return}
  card.classList.remove('hidden');if(!$('#hmSchoolName'))html();
  try{
   const r=await request('hm-teacher-list'),teachers=r.teachers||[];
   $('#hmTeacherRoster').innerHTML='<div class="hmRosterTitle"><div><h3>School Teacher Name Tabs</h3><p>All teachers use school SEMIS/password, select their name tab and save their classes, subjects and monthly progress.</p></div><span>'+teachers.length+' Teacher'+(teachers.length===1?'':'s')+'</span></div><div class="hmRosterGrid">'+(teachers.length?teachers.map(t=>'<article class="hmRosterCard"><div class="hmRosterAvatar">👤</div><div><strong>'+esc(t.name)+'</strong><small>PID '+esc(t.pid)+' · '+esc(t.designation)+'</small><small>'+((t.classes||[]).length?'Classes: '+(t.classes||[]).map(c=>c<=8?['','I','II','III','IV','V','VI','VII','VIII'][c]:c===9?'IX':c===10?'X':c===11?'XI':'XII').join(', '):'Classes pending')+' · '+(t.subjects||[]).length+' subjects</small></div><span class="hmRosterBadge '+(t.profile_status==='submitted'?'submitted':'draft')+'">'+(t.profile_status==='submitted'?'✓ Submitted':'✎ Draft')+'</span></article>').join(''):'<div class="hmRosterEmpty">No teacher name tabs yet. Teachers can sign in using the shared school password and create their own name tabs.</div>')+'</div><div class="hmRosterFoot"><button type="button" data-hm-roster-refresh>↻ Refresh Teachers</button><small>Monthly Final Submit, Export Excel and report History are exclusively available in this HM dashboard.</small></div>';
  const target=document.getElementById('hmTeacherDirectory');
   if(target){target.innerHTML='<div class="hmDirectorActions"><button type="button" data-hm-directory-refresh>↻ Refresh Teacher Tabs</button><span>'+teachers.length+' registered teacher(s)</span></div>'+(document.querySelector('#hmTeacherRoster .hmRosterGrid')?.outerHTML||'');}
  }catch(e){$('#hmTeacherRoster').textContent='Unable to load teaching roster: '+e.message}
 }
 async function saveSchool(){
  const school_name=$('#hmSchoolName')?.value.trim(),hm_name=$('#hmHeadName')?.value.trim();
  if(!school_name||!hm_name)return alert('Enter school and Head Teacher names.');
  try{
   const r=await request('hm-school-save',{school_name,hm_name});
   account={...account,...r.school};localStorage.setItem('mpr_account_cache',JSON.stringify(account));
   document.getElementById('dashName').textContent=account.school_name;
   document.getElementById('dashSemis').textContent='SEMIS '+account.semis+' · '+account.hm_name;
   alert('✓ School profile cloud draft saved.');
  }catch(e){alert('School draft not saved: '+e.message)}
 }
 async function setPIN(){
  const hm_pin=$('#hmOfficePin')?.value||'';
  if(hm_pin.length<8)return alert('HM Office PIN must contain at least 8 characters.');
  if(!confirm('Set this private HM Office PIN? Staff continue signing in with only the school password.'))return;
  try{await request('hm-set-pin',{hm_pin});$('#hmOfficePin').value='';alert('✓ Private HM Office PIN saved. Next HM login will require this PIN in addition to the school password.')}
  catch(err){alert('Could not save HM PIN: '+err.message)}
 }
 card.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-hm-school-save'))saveSchool();
  if(b.hasAttribute('data-hm-pin-save'))setPIN();
  if(b.hasAttribute('data-hm-roster-refresh'))refresh();
  if(b.id==='hmPinVisibility'){const input=$('#hmOfficePin');input.type=input.type==='password'?'text':'password'}
 });
 const originalRefreshSchool=refreshSchool;
 refreshSchool=async function(...args){const out=await originalRefreshSchool(...args);if(auth&&!auth.admin&&auth.role!=='teacher'&&auth.role!=='staff')refresh().catch(()=>{});return out};
 document.getElementById('school-teachers')?.addEventListener('click',e=>{if(e.target.closest('[data-hm-directory-refresh]'))refresh()});
 if(auth&&!auth.admin&&auth.role!=='teacher')setTimeout(refresh,900);
 return{refresh}
})();