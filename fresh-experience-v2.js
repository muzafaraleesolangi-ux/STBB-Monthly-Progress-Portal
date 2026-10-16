'use strict';
/* Mobile-first progressive enhancement; retains secure school APIs and existing original Excel preview. */
(function(){
 const $=id=>document.getElementById(id);
 const landing=$('landing');
 const home=landing?.querySelector('.freshHome');
 if(home){
  const books=home.querySelector('.freshLibrary');
  const steps=home.querySelector('.freshQuickSteps');
  const hero=home.querySelector('.freshHero');
  if(hero)hero.setAttribute('aria-label','STBB Monthly Academic Progress school portal');
  const intro=document.createElement('section');
  intro.className='freshIdentitySteps';
  intro.innerHTML='<div class="freshSectionEyebrow">HOW THE PORTAL WORKS</div><div class="freshSectionTitle"><h2>Three focused workspaces.</h2><p>Each section does one job. Simple on any phone.</p></div><div class="freshJourneyGrid"><div class="freshJourneyCard navy"><span>01 / SCHOOL</span><b>Teachers & Subjects</b><small>Add teacher names, classes and their teaching subjects.</small></div><div class="freshJourneyCard blue"><span>02 / REPORT</span><b>Monthly Progress</b><small>Enter completed chapters and classroom assessments.</small></div><div class="freshJourneyCard violet"><span>03 / RESULTS</span><b>Preview & Download</b><small>Check the original Proforma before saving its Excel file.</small></div></div>';
  if(steps){steps.replaceWith(intro)}
  if(books){books.insertAdjacentHTML('afterbegin','<div class="freshLibraryBanner">SECTION 02 <span>OFFICIAL TEXTBOOK LIBRARY</span></div>')}
  const developer=document.createElement('section');
  developer.id='fresh-developer';
  developer.className='freshDeveloper';
  developer.innerHTML='<div class="freshDeveloperPhoto"><img id="freshDeveloperPortrait" alt="Developer portrait of Muzafar Ali Solangi"></div><div class="freshDeveloperInfo"><span class="freshSectionEyebrow">SECTION 03 / ABOUT THE DEVELOPER</span><h2>Built for teachers.<br><em>Designed for simplicity.</em></h2><span class="freshDeveloperKicker">DEVELOPED BY</span><h3>Muzafar Ali Solangi</h3><p>A digital academic reporting workspace for the schools of Sindh, supporting teachers and school heads with more accessible monthly reporting.</p></div>';
  const help=document.createElement('section');
  help.className='freshHelpDesk';
  help.id='fresh-support';
  help.innerHTML='<div class="freshHelpIcon" aria-hidden="true">✉</div><div class="freshHelpCopy"><span class="freshSectionEyebrow">SECTION 04 / HELP & SUPPORT</span><h2>Need help using the portal?</h2><p>Support for school setup, monthly reports and Excel downloads.</p><strong>WhatsApp: 0300 0357397</strong></div><a href="https://wa.me/923000357397?text=Assalamualaikum%2C%20I%20need%20help%20with%20the%20STBB%20Monthly%20Progress%20Portal" target="_blank" rel="noopener noreferrer" class="freshWhatsApp" aria-label="Contact portal support on WhatsApp">WhatsApp Support ↗</a>';
  home.append(developer,help);
  const src=window.__mprDeveloperPortrait||'';
  const photo=$('freshDeveloperPortrait');
  if(src){photo.src=src}else{photo.replaceWith(Object.assign(document.createElement('span'),{textContent:'MAS',className:'freshAvatarFallback'}))}
 }
 const dash=$('schooldash'), editorSection=$('school-editor'), frame=$('editor');
 const panel=$('studioPanel');
 if(!dash||!editorSection||!frame)return;
 dash.classList.add('freshSections');
 dash.querySelector('.heading')?.classList.add('freshSchoolHeading');
 const tabs=$('schoolTabs');
 if(tabs)tabs.setAttribute('aria-label','School workspace sections');
 const decorate=()=>{
  const labels=[['teachers','01 · Teachers & Subjects'],['progress','02 · Monthly Progress'],['history','03 · Excel History']];
  for(const [key,text] of labels){
   const button=tabs?.querySelector('[data-workflow-tab="'+key+'"]');
   if(button&&button.dataset.freshLabeled!=='1'){button.textContent=text;button.dataset.freshLabeled='1'}
  }
  const studio=$('studioPanel');
  if(studio&&!studio.dataset.freshDecorated){
   studio.dataset.freshDecorated='1';
   const title=studio.querySelector('.studioTop h2');
   if(title)title.textContent='Monthly Progress · Subject Entry';
   const intro=studio.querySelector('.studioTop p');
   if(intro)intro.textContent='Enter each subject, save your work and preview the original Excel report before downloading.';
  }
  const teacher=$('school-teachers');
  if(teacher&&!teacher.dataset.freshDecorated){teacher.dataset.freshDecorated='1';teacher.insertAdjacentHTML('afterbegin','<div class="freshWorkspaceRibbon teacher"><span>01 / SCHOOL SETUP</span><strong>Teaching Staff & Subject Assignments</strong><small>Manage your school team and their assigned books in one place.</small></div>')}
  const hist=$('school-history');
  if(hist&&!hist.dataset.freshDecorated){hist.dataset.freshDecorated='1';hist.insertAdjacentHTML('afterbegin','<div class="freshWorkspaceRibbon history"><span>03 / MONTH ARCHIVE</span><strong>Completed Excel Reports</strong><small>Your previously saved workbooks can be downloaded here again.</small></div>')}
 };
 decorate();
 new MutationObserver(decorate).observe(dash,{childList:true,subtree:false});
 const oldRow=editorSection.querySelector(':scope > .row');
 if(oldRow)oldRow.classList.add('freshOldToolbar');
 const header=document.createElement('div');header.className='freshPreviewHeader';
 header.innerHTML='<div class="freshPreviewHeaderCopy"><span class="freshSectionEyebrow">03 / ORIGINAL EXCEL PROFORMA</span><h2>Preview your report</h2><p>Check the school, month, teachers, subjects and progress before downloading the Excel workbook. Swipe the table sideways on mobile.</p><small id="freshPreviewMonth"></small></div><div class="freshPreviewActions"><button type="button" data-preview-edit class="freshPreviewEdit">← Edit Report</button><button type="button" id="freshPreviewDownload" class="freshPreviewDownload">↓ Download Excel (.xlsx)</button></div>';
 const status=document.createElement('p');status.id='freshPreviewStatus';status.className='freshPreviewStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 editorSection.prepend(header,status);
 let active=false,previewSnapshot=null,previewMonth='',busy=false;
 function isOpen(){return active&&!editorSection.classList.contains('hidden')}
 function tellFrame(){
  if(!isOpen()||!previewSnapshot||!frame.contentWindow)return;
  frame.contentWindow.postMessage({type:'mpr-hydrate',state:previewSnapshot,period:previewMonth,previewOnly:true},location.origin);
 }
 function close(){
  active=false;
  editorSection.classList.remove('freshPreviewActive');
  editorSection.classList.add('hidden');
  status.textContent='';
  busy=false;
 }
 async function open(snapshot,month){
  if(!snapshot||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month))throw Error('Valid saved school report and month are required.');
  previewSnapshot=snapshot;previewMonth=month;active=true;busy=false;
  for(const id of ['school-overview','school-history','school-teachers','studioPanel','school-feedbackschool']){
    $(id)?.classList.add('hidden');
  }
  editorSection.classList.remove('hidden');
  editorSection.classList.add('freshPreviewActive');
  $('freshPreviewMonth').textContent='Reporting month · '+month;
  const btn=$('freshPreviewDownload');btn.disabled=false;btn.textContent='↓ Download Excel (.xlsx)';
  status.textContent='This is a preview only. Nothing will be exported until you tap Download Excel.';
  document.querySelectorAll('#schoolTabs button').forEach(b=>b.classList.remove('active'));
  editorSection.scrollIntoView({block:'start',behavior:'smooth'});
  tellFrame();
 }
 function saved(){
  if(!active)return;
  busy=false;
  const btn=$('freshPreviewDownload');btn.disabled=false;btn.textContent='↓ Download Excel Again';
  status.textContent='✓ Excel saved to school history. If your phone did not download it automatically, use the visible Save file link or My Months.';
 }
 header.addEventListener('click',async event=>{
  if(event.target.closest('[data-preview-edit]')){
   close();if(window.Studio?.showPanel)Studio.showPanel();return
  }
  const button=event.target.closest('#freshPreviewDownload');
  if(!button||busy)return;
  if(!window.Studio||typeof Studio.directSaveExport!=='function'){status.textContent='Report export is not ready. Refresh and sign in again.';return}
  busy=true;button.disabled=true;button.textContent='Preparing Excel…';
  status.textContent='Saving the final report and generating your original Excel workbook…';
  try{await Studio.directSaveExport()}catch(error){busy=false;button.disabled=false;button.textContent='↓ Retry Excel Download';status.textContent='Export failed: '+error.message}
 });
 frame.addEventListener('load',()=>{if(isOpen())tellFrame()});
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  if(event.data?.type==='mpr-editor-ready'&&isOpen())tellFrame();
  if(event.data?.type==='mpr-export-error'&&isOpen()){
    busy=false;const b=$('freshPreviewDownload');b.disabled=false;b.textContent='↓ Retry Excel Download';
    status.textContent='Excel creation failed. Check the report and retry.';
  }
  if(event.data?.type==='mpr-export-ack'&&isOpen()&&!event.data.ok){
    busy=false;const b=$('freshPreviewDownload');b.disabled=false;b.textContent='↓ Retry Excel Download';
    status.textContent='Export was not saved: '+String(event.data.error||'Please retry');
  }
 });
 document.addEventListener('click',event=>{
  if(!isOpen())return;
  if(event.target.closest('#schoolTabs button,#headerLogout,.dashboardNavigation button'))close()
 },true);
 window.PortalExcelPreview={open,close,isOpen,onExportSaved:saved};
})();
