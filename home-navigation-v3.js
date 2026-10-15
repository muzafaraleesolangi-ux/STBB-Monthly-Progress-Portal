'use strict';
/* Session-aware dashboard home/back navigation, modal support, lightweight click audio. */
(()=>{
 const $=id=>document.getElementById(id);
 const portrait=document.querySelector('#landing .portrait');
 if(portrait&&!$('portraitAdminLogin')){
  portrait.classList.add('portraitWithAdmin');
  const access=document.createElement('button');
  access.id='portraitAdminLogin';access.type='button';access.className='profileAdminButton';
  access.setAttribute('aria-label','Open administrator login');
  access.innerHTML='<span class="adminButtonIcon">♛</span><span class="adminButtonCaption"><strong>Admin Login</strong><small>SCHOOL PORTAL ADMINISTRATION</small></span><span class="adminButtonArrow">↗</span>';
  access.addEventListener('click',()=>show('admin-login'));portrait.appendChild(access)
 }
 const adminTabs=$('adminTabs'),schoolTabs=$('schoolTabs');
 if(adminTabs&&!$('adminHomeTab')){const home=document.createElement('button');home.id='adminHomeTab';home.type='button';home.textContent='⌂ Overview';home.onclick=()=>adminTab('home',home);adminTabs.prepend(home)}
 if($('admindash')&&!$('admin-home')){const content=document.createElement('div');content.id='admin-home';content.className='panel adminHomeOverview';content.style.marginTop='16px';content.innerHTML='<div class="adminHomeLead"><span>ADMINISTRATOR · DASHBOARD</span><h2>School Reporting Overview</h2><p>School registrations, monthly drafts and the latest Excel exports in one place.</p></div><div id="adminHomeNumbers" class="adminHomeNumbers"></div><div class="adminHomeActions"><button type="button" data-admin-shortcut="schools">🏫 School Profiles</button><button type="button" data-admin-shortcut="drafts">✎ Monthly Drafts</button><button type="button" data-admin-shortcut="reports">📁 Exported Excel Files</button><button type="button" data-admin-shortcut="resets">🔐 Recovery Requests</button></div><div id="adminHomeRecent"></div>';adminTabs?.after(content)}
 const views=['home','schools','drafts','reports','feedback','resets'];
 const originalAdminTab=adminTab;
 adminTab=function(tab,button){
  if(tab!=='home'){const home=$('admin-home');home?.classList.add('hidden');return originalAdminTab(tab,button)}
  for(const x of ['schools','drafts','reports','feedback','resets'])$('admin-'+x)?.classList.add('hidden');
  $('admin-home')?.classList.remove('hidden');
  document.querySelectorAll('#adminTabs button').forEach(b=>b.classList.toggle('active',b===(button||$('adminHomeTab'))));
  renderAdminHome()
 };
 function renderAdminHome(){
  const data=adminData;if(!data)return;
  const total=(arr)=>Array.isArray(arr)?arr.length:0;
  const numbers=$('adminHomeNumbers');
  if(numbers)numbers.innerHTML=[['Registered Schools',total(data.schools)],['Monthly Drafts',total(data.drafts)],['Excel Exports',total(data.exports)],['Recovery Requests',total(data.resets?.filter(x=>x.status==='pending'))]].map(([label,count])=>'<div><small>'+label+'</small><strong>'+count+'</strong></div>').join('');
  const recent=$('adminHomeRecent');
  if(recent)recent.innerHTML='<h3>Recent Export Files</h3>'+(total(data.exports)?'<div class="recentExportCards">'+data.exports.slice(0,6).map(x=>'<div><b>'+esc(x.filename)+'</b><small>SEMIS '+esc(x.semis)+' · '+esc(x.period)+' · '+esc(new Date(x.created_at).toLocaleString())+'</small><button type="button" data-export-details="'+esc(x.id)+'">View full report ↗</button></div>').join('')+'</div>':'<p class="desc">No Excel report saved in cloud History yet. A successful submitted export will appear here.</p>')
 }
 window.renderAdminHome=renderAdminHome;
 // Track meaningful dashboard routes with no browser reload or session loss.
 let route=null,stack=[],restoring=false;
 function currentArea(){return auth?(auth.admin?'admin':'school'):'public'}
 function record(next){if(restoring||route===next)return;if(route&&stack.length<40)stack.push(route);else if(route){stack.shift();stack.push(route)}route=next}
 function schoolButton(tab){return [...(schoolTabs?.querySelectorAll('button')||[])].find(b=>b.getAttribute('onclick')?.includes("dashTab('"+tab+"'"))}
 function adminButton(tab){return [...(adminTabs?.querySelectorAll('button')||[])].find(b=>b.id==='adminHomeTab'&&tab==='home'||b.getAttribute('onclick')?.includes("adminTab('"+tab+"'"))}
 const oldDashTab=dashTab;dashTab=function(tab,button){const res=oldDashTab(tab,button||schoolButton(tab));record('school:'+tab);return res};
 const adminTabImpl=adminTab;adminTab=function(tab,button){const res=adminTabImpl(tab,button||adminButton(tab));record('admin:'+tab);return res};
 function navigate(target,fromBack=false){
  restoring=fromBack;
  try{
   if(target==='admin:home'||target.startsWith('admin:')){show('admindash');adminTab(target.slice(6),adminButton(target.slice(6)))}
   else if(target==='school:studio'){show('schooldash');if(typeof Studio!=='undefined')Studio.showPanel()}
   else if(target.startsWith('school:')){show('schooldash');dashTab(target.slice(7),schoolButton(target.slice(7)))}
   else show(target.replace('public:',''))
   route=target
  }finally{restoring=false}
 }
 async function saveBeforeLeave(){
  if(auth&&!auth.admin&&typeof Studio!=='undefined'&&Studio.unsaved?.()){
   try{await Studio.settle()}catch(e){alert('Save Draft before navigating: '+e.message);return false}
  }
  return true
 }
 async function goHome(){
  if(!(await saveBeforeLeave()))return;
  const area=currentArea();
  const target=area==='admin'?'admin:home':area==='school'?'school:overview':'public:landing';
  navigate(target)
 }
 async function goBack(){
  const openModal=$('adminSchoolModal');
  if(openModal&&!openModal.classList.contains('hidden')){openModal.querySelector('[data-close-school-modal]')?.click();return}
  if(!(await saveBeforeLeave()))return;
  const target=stack.pop()|| (currentArea()==='admin'?'admin:home':currentArea()==='school'?'school:overview':'public:landing');
  navigate(target,true)
 }
 window.portalNavigateHome=goHome;window.portalNavigateBack=goBack;
 // Reuse the one Home/Back toolbar for every subpage, including the school report Studio.
 for(const id of ['schooldash','admindash']){
  const section=$(id),head=section?.querySelector('.heading .row');
  if(!head)continue;
  const nav=document.createElement('div');nav.className='dashboardNavigation premiumNav';
  const back=document.createElement('button');back.className='dashNavigationBtn back';back.type='button';back.innerHTML='← Back';back.title='Previous page';back.onclick=goBack;
  const home=document.createElement('button');home.className='dashNavigationBtn home';home.type='button';home.innerHTML='⌂ Home';home.title='Your dashboard home without logout';home.onclick=goHome;
  nav.append(back,home);head.prepend(nav);
 }
 // Mark Studio navigation, even when opened directly using a report/month action.
 document.addEventListener('click',e=>{
  if(!auth)return;
  if(e.target.closest('#studioTab,[data-studio-quick-progress]')){record('school:studio')}
  const shortcut=e.target.closest('[data-admin-shortcut]');
  if(shortcut){const t=shortcut.dataset.adminShortcut;adminTab(t,adminButton(t))}
 });
 const previousShow=show;
 show=function(id){const res=previousShow(id);if(!auth&&id==='landing'){stack=[];route='public:landing';return res}
  if(auth?.admin&&id==='admindash'&&!restoring){if(!route?.startsWith('admin:')){setTimeout(()=>{if(auth?.admin)adminTab('home',adminButton('home'))},0)}}
  if(auth&&!['schooldash','admindash'].includes(id))record('public:'+id);
  return res
 };
 const brand=document.querySelector('.topbar .wordmark')?.closest('a');
 if(brand){brand.removeAttribute('onclick');brand.addEventListener('click',e=>{e.preventDefault();goHome()})}
 // Gentle chime on genuine click only, with a prominent accessible sound toggle.
 let soundOn=true;try{soundOn=localStorage.getItem('mpr_sound')!=='off'}catch{}
 let audio=null;
 function chime(){if(!soundOn||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio=audio||new Audio();if(audio.state==='suspended')audio.resume().catch(()=>{});
   const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.type='sine';o.frequency.setValueAtTime(880,t);o.frequency.exponentialRampToValueAtTime(620,t+.065);
   g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.037,t+.009);g.gain.exponentialRampToValueAtTime(.0001,t+.105);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.11)
  }catch{}
 }
 const sound=document.createElement('button');sound.type='button';sound.id='portalSoundToggle';sound.className='portalSoundToggle';sound.setAttribute('aria-label','Toggle portal click sounds');
 function renderSound(){sound.textContent=soundOn?'♫ On':'♫ Off';sound.title=soundOn?'Mute click sounds':'Enable click sounds';sound.setAttribute('aria-pressed',String(soundOn))}
 renderSound();sound.addEventListener('click',()=>{soundOn=!soundOn;try{localStorage.setItem('mpr_sound',soundOn?'on':'off')}catch{}renderSound();if(soundOn)chime()});
 document.querySelector('.topbar .topinner')?.appendChild(sound);
 document.addEventListener('click',e=>{if(e.target.closest('button:not(#portalSoundToggle),a[href],summary'))chime()},{capture:true});
 document.addEventListener('keydown',e=>{if(e.key==='Alt'&&e.repeat)return;if(e.altKey&&e.key==='ArrowLeft'){e.preventDefault();goBack()}});
 // Existing browser session: preserve signed-in dashboard routing.
 if(auth?.admin)route='admin:home';else if(auth)route='school:overview';else route='public:landing';
})();
