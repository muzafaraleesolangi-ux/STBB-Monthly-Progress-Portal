'use strict';
/* HM school profile and teacher registration controls; visible only in HM account. */
const HMTeacherAdmin=(()=>{
 const root=document.getElementById('school-overview');
 if(!root)return{refresh:async()=>{}};
 const card=document.createElement('section');card.id='hmTeacherAdmin';card.className='hmTeacherAdmin';
 card.innerHTML='<div class="hmAdminHeading"><div><span>HEAD MASTER WORKSPACE</span><h2>School Profile & Teaching Team</h2><p>Save basic school information, create a teacher registration code, and let each teacher build their own profile from their phone.</p></div><span class="hmAdminIcon">🏫</span></div><div id="hmSchoolForm"></div><div id="hmAccessForm"></div><div class="hmTeacherRoster" id="hmTeacherRoster"></div>';
 root.prepend(card);
 const $=s=>card.querySelector(s);
 function html(){
  const school=account||{},teacherCode=$('#hmAccessForm');
  $('#hmSchoolForm').innerHTML='<div class="hmSchoolFields"><label>School SEMIS Code<input type="text" value="'+esc(school.semis||'')+'" readonly></label><label>Official School Name<input id="hmSchoolName" maxlength="220" value="'+esc(school.school_name||'')+'" required></label><label>Head Master / Head Mistress<input id="hmHeadName" maxlength="180" value="'+esc(school.hm_name||'')+'" required></label><button type="button" data-hm-school-save>💾 Save School Draft</button></div>';
  teacherCode.innerHTML='<div class="hmCodeSetup"><div><strong>Teacher Registration Code</strong><small>Share this code with teaching staff — never share the HM school password. Teachers register using the school SEMIS, this code and their own PID.</small></div><label><input type="password" id="hmTeacherCode" minlength="8" maxlength="128" autocomplete="new-password" placeholder="Set a private teacher code (8+ characters)"><button type="button" id="hmCodeVisibility" aria-label="Show or hide code">👁</button></label><button type="button" data-hm-code-save>Set / Replace Code</button></div>';
  $('#hmTeacherRoster').innerHTML='<p class="hmRosterLoading">Loading teacher registrations…</p>'
 }
 async function refresh(){
  if(!auth||auth.admin||auth.role==='teacher'){card.classList.add('hidden');return}
  card.classList.remove('hidden');if(!$('#hmSchoolName'))html();
  try{
   const r=await request('hm-teacher-list'),teachers=r.teachers||[];
   $('#hmTeacherRoster').innerHTML='<div class="hmRosterTitle"><div><h3>Registered Teacher Profiles</h3><p>Each teacher can sign in separately, choose classes I–XII and submit their subject assignments.</p></div><span>'+teachers.length+' Teacher'+(teachers.length===1?'':'s')+'</span></div><div class="hmRosterGrid">'+(teachers.length?teachers.map(t=>'<article class="hmRosterCard"><div class="hmRosterAvatar">👤</div><div><strong>'+esc(t.name)+'</strong><small>PID '+esc(t.pid)+' · '+esc(t.designation)+'</small></div><span class="hmRosterBadge '+(t.profile_status==='submitted'?'submitted':'draft')+'">'+(t.profile_status==='submitted'?'✓ Submitted':'✎ Draft')+'</span></article>').join(''):'<div class="hmRosterEmpty">No teachers registered yet. Set the registration code and ask each teacher to create their own profile from a phone.</div>')+'</div><div class="hmRosterFoot"><button type="button" data-hm-roster-refresh>↻ Refresh Teachers</button><small>Monthly Final Submit, Export Excel and report History are exclusively available in this HM dashboard.</small></div>';
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
 async function setCode(){
  const teacher_code=$('#hmTeacherCode')?.value||'';
  if(teacher_code.length<8)return alert('Please set an 8-character or longer Teacher Registration Code.');
  if(!confirm('Save the new teacher registration code? Existing registered teachers will continue using their own passwords.'))return;
  try{await request('hm-set-teacher-code',{teacher_code});$('#hmTeacherCode').value='';alert('✓ Teacher Registration Code saved. Share it privately with staff (not the HM password).')}
  catch(e){alert('Code could not be saved: '+e.message)}
 }
 card.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-hm-school-save'))saveSchool();
  if(b.hasAttribute('data-hm-code-save'))setCode();
  if(b.hasAttribute('data-hm-roster-refresh'))refresh();
  if(b.id==='hmCodeVisibility'){const input=$('#hmTeacherCode');input.type=input.type==='password'?'text':'password'}
 });
 const originalRefreshSchool=refreshSchool;
 refreshSchool=async function(...args){const out=await originalRefreshSchool(...args);if(auth&&!auth.admin&&auth.role!=='teacher')refresh().catch(()=>{});return out};
 if(auth&&!auth.admin&&auth.role!=='teacher')setTimeout(refresh,900);
 return{refresh}
})();