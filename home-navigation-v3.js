'use strict';
/* Premium home shortcuts and predictable Home/Back navigation for school and admin dashboards. */
(()=>{
 const portrait=document.querySelector('#landing .portrait');
 if(portrait){
  portrait.classList.add('portraitWithAdmin');
  const access=document.createElement('button');
  access.id='portraitAdminLogin';access.type='button';access.className='profileAdminButton';
  access.setAttribute('aria-label','Open administrator login');
  access.innerHTML='<span class="adminButtonIcon">♛</span><span class="adminButtonCaption"><strong>Admin Login</strong><small>PRIVATE CONTROL CENTER</small></span><span class="adminButtonArrow">↗</span>';
  access.addEventListener('click',()=>show('admin-login'));
  portrait.appendChild(access);
 }
 let currentSchoolTab='overview',previousSchoolTabs=[],currentAdminTab='schools',previousAdminTabs=[];
 const sections=['schooldash','admindash'];
 for(const sectionId of sections){
   const section=document.getElementById(sectionId),header=section?.querySelector('.heading .row');
   if(!header)continue;
   const links=document.createElement('div');
   links.className='dashboardNavigation';
   const back=document.createElement('button');
   back.className='dashNavigationBtn back';back.type='button';back.innerHTML='<span aria-hidden="true">←</span> Back';
   back.title='Return to the previous dashboard step';
   const home=document.createElement('button');
   home.className='dashNavigationBtn home';home.type='button';home.innerHTML='<span aria-hidden="true">⌂</span> Home';
   home.title='Return to the home page without signing out';
   back.addEventListener('click',()=>dashboardBack(sectionId));
   home.addEventListener('click',()=>navigateHome());
   links.append(back,home);
   header.prepend(links);
 }
 function studioVisible(){return !!document.getElementById('studioPanel')&&!document.getElementById('studioPanel').classList.contains('hidden')}
 function activeStudioStep(){const node=document.querySelector('#studioPanel .wizardTrack button.current');return node?Number(node.dataset.studioStage):-1}
 async function commitUnsaved(){
   if(typeof Studio!=='undefined'&&Studio.unsaved?.()){
    try{await Studio.settle()}catch(error){alert('Your school draft could not be saved: '+error.message+'\nPlease fix this before leaving the dashboard.');return false}
   }
   if(typeof flushDraft==='function'&&(pendingState||saveTimer||saving)){
    try{const result=await flushDraft();if(result===false)return false}
    catch(error){alert('Could not save your monthly report: '+error.message);return false}
   }
   return !(typeof Studio!=='undefined'&&Studio.unsaved?.());
 }
 async function navigateHome(){
   if(auth&&!auth.admin){
    const ok=await commitUnsaved();if(!ok){if(typeof manualSaveDraft==='function')manualSaveDraft();return}
   }
   show('landing');
 }
 async function dashboardBack(sectionId){
   if(sectionId==='schooldash'){
     if(!(await commitUnsaved()))return;
     if(studioVisible()){
       const step=activeStudioStep();
       if(step>0){Studio.stage(step-1);return}
       dashTab('overview',document.querySelector('#schoolTabs button[onclick*="overview"]'));return;
     }
     if(previousSchoolTabs.length){
       const tab=previousSchoolTabs.pop();dashTab(tab,[...document.querySelectorAll('#schoolTabs button')].find(b=>b.getAttribute('onclick')?.includes("'"+tab+"'")));return;
     }
     if(currentSchoolTab!=='overview'){dashTab('overview',document.querySelector('#schoolTabs button[onclick*="overview"]'));return}
     return navigateHome();
   }
   if(previousAdminTabs.length){
     const tab=previousAdminTabs.pop();adminTab(tab,[...document.querySelectorAll('#adminTabs button')].find(b=>b.getAttribute('onclick')?.includes("'"+tab+"'")));return;
   }
   if(currentAdminTab!=='schools'){adminTab('schools',document.querySelector('#adminTabs button[onclick*="schools"]'));return}
   return navigateHome();
 }
 // Track user-initiated tab navigation, not programmatic history restoration.
 const schoolTabs=document.getElementById('schoolTabs'),adminTabs=document.getElementById('adminTabs');
 schoolTabs?.addEventListener('click',e=>{
  const btn=e.target.closest('button'),action=btn?.getAttribute('onclick')||'';
  const m=action.match(/dashTab\('([^']+)'/);
  if(m&&m[1]!==currentSchoolTab){previousSchoolTabs.push(currentSchoolTab);if(previousSchoolTabs.length>12)previousSchoolTabs.shift();currentSchoolTab=m[1]}
 });
 adminTabs?.addEventListener('click',e=>{
  const btn=e.target.closest('button'),action=btn?.getAttribute('onclick')||'';
  const m=action.match(/adminTab\('([^']+)'/);
  if(m&&m[1]!==currentAdminTab){previousAdminTabs.push(currentAdminTab);if(previousAdminTabs.length>12)previousAdminTabs.shift();currentAdminTab=m[1]}
 });
 window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.querySelector('#adminSchoolModal:not(.hidden)'))return;
  if(e.altKey&&e.key==='ArrowLeft'&&!e.repeat){
   const area=document.getElementById('schooldash')?.classList.contains('hidden')===false?'schooldash':
    document.getElementById('admindash')?.classList.contains('hidden')===false?'admindash':null;
   if(area){e.preventDefault();dashboardBack(area)}
  }
 });
})();