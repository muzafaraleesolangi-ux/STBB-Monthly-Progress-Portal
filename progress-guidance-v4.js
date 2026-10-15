'use strict';
/* Contextual click/focus explanations; no data fields or collection added. */
(()=>{
  const guide=document.createElement('aside');guide.className='premiumGuidePopover';guide.hidden=true;guide.setAttribute('aria-live','polite');
  guide.innerHTML='<div class="premiumGuideInner"><span class="premiumGuideStep">SMART ENTRY GUIDE</span><div class="premiumGuideTitle"></div><p class="premiumGuideText"></p><div class="premiumGuideControls"><button type="button" class="dismiss">Close</button><button type="button" class="next">Next Field →</button></div></div>';
  document.body.appendChild(guide);
  let last=null;
  const help=el=>{
    if(el.matches('[data-progress-total]'))return ['Total Chapters / Lessons','Enter the total NUMBER from your textbook. Lesson names are optional. Remaining updates automatically.'];
    if(el.matches('[data-progress-bid][data-pkey="previous"]'))return ['Previous Month','Enter the total chapters or lessons completed BEFORE the selected reporting month.'];
    if(el.matches('[data-progress-bid][data-pkey="current"]'))return ['This Month','Enter only the new chapters or lessons completed DURING this month. Do not repeat previous entries.'];
    if(el.matches('[data-tid][data-field="name"]'))return ['Teacher Name','Use the official teacher name. Then continue to PID and designation.'];
    if(el.matches('[data-tid][data-field="pid"]'))return ['Teacher PID','Enter the official PID number exactly as recorded.'];
    if(el.matches('[data-tid][data-field="designation"]'))return ['Teacher Designation','Enter the teacher designation (for example PST, JEST, HST).'];
    if(el.matches('#studioNewSubjectTotal'))return ['Subject Chapter Total','Chapter or lesson count is required; individual titles are not.'];
    if(el.matches('#studioNewSubjectName'))return ['Teacher Subject','Type only a subject actually taught by this teacher in the selected class.'];
    if(el.matches('#studioNewSubjectClass'))return ['Teaching Class','Select one of this teacher’s assigned school classes.'];
    if(el.matches('[data-class-tid]'))return ['Multiple Classes','Tick every class this teacher teaches. More than one class is allowed.'];
    if(el.matches('[data-assign-tid]'))return ['Unique Subject Assignment','Tick subjects this teacher teaches. A subject assigned to another teacher is displayed but locked.'];
    return null;
  };
  function close(){guide.hidden=true;last=null}
  function focusNext(){
    if(!last)return close();
    const scope=last.closest('[data-progress-card]')||last.closest('.studioCard')||last.closest('#studioPanel');
    const fields=[...document.querySelectorAll('#studioPanel input, #studioPanel select')].filter(el=>!el.disabled&&el.getClientRects().length&&help(el));
    let idx=fields.indexOf(last),next=fields[idx+1];
    if(next){close();next.focus();next.scrollIntoView({behavior:'smooth',block:'center'})}else close();
  }
  guide.querySelector('.dismiss').addEventListener('click',close);
  guide.querySelector('.next').addEventListener('click',focusNext);
  document.addEventListener('focusin',e=>{if(!e.target.closest('#studioPanel'))return;const tips=help(e.target);if(!tips)return;last=e.target;guide.querySelector('.premiumGuideTitle').textContent=tips[0];guide.querySelector('.premiumGuideText').textContent=tips[1];guide.hidden=false;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  document.addEventListener('click',e=>{if(!guide.hidden&&!e.target.closest('.premiumGuidePopover')&&!e.target.closest('#studioPanel'))close()});
})();