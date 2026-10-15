'use strict';
/* Compact school details / team overview within the single school dashboard. */
const HMTeacherAdmin=(()=>{
 const parent=document.getElementById('school-teachers');if(!parent)return{refresh:async()=>{}};
 const block=document.createElement('section');block.id='hmTeacherAdmin';block.className='hmTeacherAdmin unifiedSchoolCard';
 block.innerHTML='<div class="hmAdminHeading"><div><span>SCHOOL SETTINGS</span><h2>School Details</h2><p>Save school details. Every teacher uses a name tab below.</p></div><span class="hmAdminIcon">🏫</span></div><div id="hmSchoolForm"></div><div id="hmTeacherRoster"></div>';
 parent.prepend(block);
 const $=q=>block.querySelector(q);
 function form(){
  const a=account||{};
  $('#hmSchoolForm').innerHTML='<div class="hmSchoolFields"><label>SEMIS<input type="text" value="'+esc(a.semis||'')+'" readonly></label><label>School Name<input id="hmSchoolName" maxlength="220" value="'+esc(a.school_name||'')+'"></label><label>Head Master / Head Teacher<input id="hmHeadName" maxlength="180" value="'+esc(a.hm_name||'')+'"></label><button type="button" data-hm-school-save>Save School Details</button></div>';
 }
 async function refresh(){
  if(!auth||auth.admin||auth.role==='teacher'){block.classList.add('hidden');return}
  block.classList.remove('hidden');
  if(!$('#hmSchoolName'))form();
  try{
   const result=await request('hm-teacher-list'),people=result.teachers||[];
   $('#hmTeacherRoster').innerHTML='<div class="unifiedRosterHead"><div><h3>Teaching Team</h3><p>'+people.length+' teacher name tab(s) saved to your school.</p></div><button type="button" data-open-team>Open Teacher Tabs →</button></div><div class="unifiedRosterList">'+(people.length?people.slice(0,8).map(t=>'<div class="unifiedRosterRow"><span>👤</span><strong>'+esc(t.name||'Teacher')+'</strong><small>'+esc(t.designation||'Teacher')+' · '+(t.subjects||[]).length+' subjects</small></div>').join(''):'<p class="desc">No teacher tabs yet. Open Teachers & Subjects to create the first one.</p>')+'</div>';
  }catch(error){$('#hmTeacherRoster').innerHTML='<p class="desc">Teaching team could not be refreshed: '+esc(error.message)+'</p>'}
 }
 async function save(){
  const school_name=$('#hmSchoolName')?.value.trim(),hm_name=$('#hmHeadName')?.value.trim();
  if(!school_name||!hm_name){alert('Enter school and Head Teacher names.');return}
  try{
   const result=await request('hm-school-save',{school_name,hm_name});
   account={...account,...result.school};localStorage.setItem('mpr_account_cache',JSON.stringify(account));
   document.getElementById('dashName').textContent=account.school_name;
   document.getElementById('dashSemis').textContent='SEMIS '+account.semis+' · '+account.hm_name;
   if(typeof StaffUI!=='undefined')StaffUI.toast('✓ School details saved');else alert('School details saved');
  }catch(e){alert('Cannot save school details: '+e.message)}
 }
 block.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-hm-school-save'))save();
  if(button.hasAttribute('data-open-team'))dashTab('teachers',document.querySelector('#schoolTabs button[onclick*="teachers"]'));
 });
 const oldRefresh=refreshSchool;
 refreshSchool=async function(...args){const result=await oldRefresh(...args);if(auth&&!auth.admin&&auth.role!=='teacher')refresh().catch(()=>{});return result};
 if(auth&&!auth.admin&&auth.role!=='teacher')setTimeout(refresh,700);
 return{refresh}
})();