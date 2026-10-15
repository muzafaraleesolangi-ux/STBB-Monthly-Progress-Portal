'use strict';
/* Small contextual hints: appearance on focus, automatic fade-out, no modal or mandatory steps. */
(()=>{
 const guide=document.createElement('aside');guide.className='premiumGuidePopover';guide.hidden=true;guide.setAttribute('aria-live','polite');
 guide.innerHTML='<div class="premiumGuideInner"><span class="premiumGuideStep">QUICK GUIDE</span><div class="premiumGuideTitle"></div><p class="premiumGuideText"></p></div>';
 const launch=document.createElement('button');launch.type='button';launch.className='miniGuideLauncher';launch.hidden=true;launch.textContent='?';launch.title='Show entry tip';launch.setAttribute('aria-label','Show entry guide');
 document.body.append(guide,launch);
 let timer=null,fade=null,last=null;
 function info(el){
  if(el.matches('[data-progress-total]'))return ['Total No. of Chapters','Select how many chapters or lessons the subject contains.'];
  if(el.matches('[data-progress-bid][data-pkey="previous"]'))return ['Chapters covered up to previous month','Select 0 if none were completed. Blank means not filled.'];
  if(el.matches('[data-progress-bid][data-pkey="current"]'))return ['Chapters covered during the instant month','Choose the newly covered lessons. Remaining is automatic.'];
  if(el.matches('[data-progress-bid][data-pkey="notebook"]'))return ['Preparation & Maintenance','Select the observed notebook/textbook maintenance percentage.'];
  if(el.matches('[data-progress-bid][data-pkey="cleanliness"]'))return ['Cleanliness & Class Room management','Select the classroom condition rating.'];
  if(el.matches('[data-progress-bid][data-pkey="feedback"]'))return ['Feedback from the students during formative tests','Select a rating supported by actual formative observations.'];
  if(el.matches('[data-progress-suggestionselect]'))return ['Suggestions for further improvement','Pick an appropriate suggestion or choose custom.'];
  if(el.matches('[data-progress-bid][data-pkey="suggestion"]'))return ['Custom suggestion','Write a short, specific improvement recommendation.'];
  if(el.matches('[data-tid][data-field="name"]'))return ['Teacher Name','Enter the full official teacher name.'];
  if(el.matches('[data-tid][data-field="pid"]'))return ['Teacher PID','Enter the teacher’s official PID number.'];
  if(el.matches('[data-tid][data-field="designation"]'))return ['Designation','Select or enter the official teaching designation.'];
  if(el.matches('#studioNewSubjectTotal,#assignmentNewTotal'))return ['Total Chapters','Chapter count is required; lesson titles are optional.'];
  if(el.matches('#studioNewSubjectClass,[data-class-tid]'))return ['Teaching Class','A teacher can teach several classes.'];
  if(el.matches('[data-assign-tid]'))return ['Subject Assignment','Each class-subject can have one assigned teacher.'];
  return null
 }
 function close(){clearTimeout(timer);clearTimeout(fade);guide.hidden=true;guide.classList.remove('isFading')}
 function reveal(el){
  const h=info(el);if(!h)return;last=el;close();guide.querySelector('.premiumGuideTitle').textContent=h[0];guide.querySelector('.premiumGuideText').textContent=h[1];guide.hidden=false;
  timer=setTimeout(()=>{guide.classList.add('isFading');fade=setTimeout(close,350)},2450);
 }
 launch.addEventListener('click',()=>{if(last)reveal(last)});
 document.addEventListener('focusin',e=>{if(!e.target.closest('#studioPanel'))return;reveal(e.target)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
 const updateLauncher=()=>{launch.hidden=!(document.getElementById('studioPanel')?.offsetParent&&document.querySelector('#studioPanel [data-progress-card]'));if(launch.hidden)close()};
 // Observe only the Studio shell and its immediate content replacements.
 // Watching all body class changes causes a self-triggering MutationObserver loop:
 // close() toggles the guide's own class, which must NEVER be observed here.
 const studioPanel=document.getElementById('studioPanel');
 const studioBody=document.getElementById('studioBody');
 const observer=new MutationObserver(updateLauncher);
 if(studioPanel)observer.observe(studioPanel,{attributes:true,attributeFilter:['class','data-stage']});
 if(studioBody)observer.observe(studioBody,{childList:true});

 document.addEventListener('click',e=>{if(e.target.matches('[data-studio-stage],[data-teacher-tab]'))setTimeout(updateLauncher,30)});
 updateLauncher();
})();
