'use strict';
/* Premium V1: one-page library + simple school month archive. Existing backend stays authoritative. */
(function(){
 const official='https://portal.stbb.edu.pk/ebooks/';
 const grades=[
  ['Kachi',2],['I',1],['II',3],['III',4],['IV',5],['V',6],['VI',7],['VII',8],['VIII',9],
  ['IX',10],['X',11],['XI',12],['XII',13]
 ];
 // Verified official STBB book-detail IDs. Missing editions open the official class catalogue.
 // Entries: [title, official book id, medium].
 const library={
  I:[['Sindhi Reader',42,'Sindhi'],['Riazi / Mathematics',271,'Sindhi'],['My English',139,'English'],['General Knowledge',47,'Sindhi']],
  II:[['Sindhi Reader',88,'Sindhi'],['Riazi / Mathematics',280,'Sindhi'],['My English',140,'English'],['General Knowledge',79,'Sindhi']],
  III:[['Sindhi Reader',null,'Sindhi'],['Asan Urdu',236,'Urdu'],['My English',141,'English'],['Riazi / Mathematics',192,'Sindhi'],['General Knowledge',105,'Sindhi'],['Islamiat',256,'English']],
  IV:[['Sindhi Reader',90,'Sindhi'],['Asan Urdu',237,'Urdu'],['My English',142,'English'],['Riazi / Mathematics',278,'Sindhi'],['Science',103,'Sindhi'],['Social Studies',107,'Sindhi'],['Islamiat',258,'English']],
  V:[['Sindhi Reader',91,'Sindhi'],['Asan Urdu',10,'Urdu'],['My English',144,'English'],['Riazi / Mathematics',268,'Sindhi'],['Science',120,'Sindhi'],['Social Studies',null,'Sindhi'],['Islamiat',259,'English']],
  VI:[['Sindhi Reader',null,'Sindhi'],['Asan Urdu',null,'Urdu'],['My English',143,'English'],['Riazi / Mathematics',270,'Sindhi'],['Science',null,'Sindhi'],['Social Studies',null,'Sindhi'],['Islamiat',260,'English'],['Computer Education',289,'Sindhi']],
  VII:[['Sindhi Reader',93,'Sindhi'],['Asan Urdu',12,'Sindhi'],['My English',145,'English'],['Riazi / Mathematics',282,'Sindhi'],['Science',125,'Sindhi'],['Islamiat',137,'Sindhi'],['Computer Education',319,'Sindhi']],
  VIII:[['Sindhi Reader',94,'Sindhi'],['My English',146,'English'],['Riazi / Mathematics',272,'Sindhi'],['Science',126,'Sindhi'],['Social Studies',226,'English'],['Islamiat',138,'Sindhi']]
 };
 const $=id=>document.getElementById(id);
 const escapeHTML=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const bookURL=id=>official+'book.php?id='+encodeURIComponent(id);
 const classURL=id=>official+'class.php?id='+encodeURIComponent(id);
 const bookRow=(book,classId)=>{
  const [name,id,medium]=book;
  const link=id?bookURL(id):classURL(classId);
  return '<div class="freshBookRow" data-book-row data-book-search="'+escapeHTML(name.toLowerCase())+'"><span class="bookMark" aria-hidden="true"></span><div class="freshBookTitle">'+escapeHTML(name)+'<span class="freshBookType">'+escapeHTML(medium)+' medium</span></div><a href="'+link+'" target="_blank" rel="noopener noreferrer" title="'+(id?'Open official STBB PDF download page':'Find book in official STBB class catalogue')+'">'+(id?'PDF ↗':'Browse ↗')+'</a></div>';
 };
 const card=([title,id])=>{
  const books=library[title]||[];
  const label=title==='Kachi'?'ECCE / Kachi':'Class '+title;
  return '<section class="freshClassCard" id="fresh-class-'+escapeHTML(title.toLowerCase())+'" data-class-card data-class-search="'+escapeHTML(label.toLowerCase())+'"><header class="freshClassHeader"><span class="freshClassAvatar">'+escapeHTML(title==='Kachi'?'★':title)+'</span><div><h3>'+escapeHTML(label)+'</h3><small>'+ (books.length?books.length+' featured textbooks':'Official STBB collection')+'</small></div></header><div class="freshBookList">'+(books.length?books.map(b=>bookRow(b,id)).join(''):'<p class="freshSideEmpty">Open the official STBB catalogue for this class to choose its current books and medium.</p>')+'</div><a class="freshClassAll" href="'+classURL(id)+'" target="_blank" rel="noopener noreferrer">View all official '+escapeHTML(label)+' books ↗</a></section>';
 };
 const landing=$('landing');
 if(landing){
  landing.innerHTML='<div class="freshHome"><div class="freshHero"><div class="freshHeroContent"><span class="freshEyebrow">STBB · Sindh schools · academic reporting</span><h1>One school.<br><em>Every month, simplified.</em></h1><p>A clean workspace for Heads and Teachers. Set up your school, enter each subject once, save and export the official Monthly Progress Excel report.</p><div class="freshHeroButtons"><button type="button" class="join" data-home-signup>Create School Account →</button><button type="button" class="sign" data-home-signin>School Sign In ↗</button></div></div><div class="freshHeroStat"><div><b>01</b><span>School login<br>One shared workspace</span></div><div><b>02</b><span>Fill & save<br>Subject progress</span></div><div><b>03</b><span>Export<br>Excel and history</span></div></div></div><div class="freshQuickSteps"><span><b>1</b>School & teachers</span><span><b>2</b>Monthly subjects</span><span><b>3</b>Save & Export</span></div><section class="freshLibrary" id="fresh-library"><div class="freshLibraryTop"><div><span class="freshEyebrow">Official STBB digital library</span><h2>Textbooks, class by class.</h2><p>Free official eBooks · Choose any class and open its book PDF download page.</p></div><input class="freshLibrarySearch" id="freshBookSearch" type="search" placeholder="Search textbooks…" aria-label="Search official textbooks"></div><nav class="freshClassNav" aria-label="Jump to class">'+grades.map(g=>'<button type="button" data-jump-class="'+escapeHTML(g[0].toLowerCase())+'">'+escapeHTML(g[0]==='Kachi'?'Kachi':g[0])+'</button>').join('')+'</nav><div class="freshBookGrid" id="freshBookGrid">'+grades.map(card).join('')+'</div><p class="freshLibraryFoot">Book links open STBB official pages, where the PDF can be read or downloaded. Titles and editions are maintained by the Sindh Textbook Board. For other media or updated books, use each class’s complete catalogue. <a href="'+official+'" target="_blank" rel="noopener noreferrer" style="color:#315be8;font-weight:800">Open STBB eBooks ↗</a></p></section></div>';
  landing.addEventListener('click',event=>{
   if(event.target.closest('[data-home-signup]'))return typeof show==='function'&&show('signup');
   if(event.target.closest('[data-home-signin]'))return typeof show==='function'&&show('signin');
   const btn=event.target.closest('[data-jump-class]');
   if(btn){const el=$('fresh-class-'+btn.dataset.jumpClass);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}
  });
  $('freshBookSearch')?.addEventListener('input',event=>{
   const q=event.target.value.trim().toLowerCase();
   document.querySelectorAll('#freshBookGrid [data-class-card]').forEach(section=>{
     let hits=0;
     const classMatch=section.dataset.classSearch.includes(q);
     section.querySelectorAll('[data-book-row]').forEach(row=>{const visible=!q||classMatch||row.dataset.bookSearch.includes(q);row.hidden=!visible;if(visible)hits++});
     section.hidden=Boolean(q&&!classMatch&&!hits);
   });
  });
 }
 const dash=$('schooldash');
 if(!dash)return;
 const side=document.createElement('aside');
 side.id='freshMonthSidebar';side.className='freshMonthSidebar';side.setAttribute('aria-label','My completed reporting months');
 side.innerHTML='<div class="freshSideHead"><h3>My Months</h3><button type="button" class="freshSideRefresh" data-fresh-refresh aria-label="Refresh months">↻</button></div><button class="freshMonthNew" type="button" data-fresh-new>＋ New Month</button><div class="freshSideList" id="freshSideList"><p class="freshSideEmpty">Sign in to load saved reports.</p></div>';
 $('schoolTabs')?.insertAdjacentElement('afterend',side);
 dash.classList.add('monthEnhanced');
 let rows=[],loading=false,lastFetch=0,lastSemis='';
 function validSchool(){return Boolean(typeof auth!=='undefined'&&auth&&!auth.admin&&auth.role!=='staff'&&typeof Studio!=='undefined'&&Studio.api)}
 function monthName(period){if(!/^20\d\d-(0[1-9]|1[0-2])$/.test(period||''))return String(period||'');const [y,m]=period.split('-').map(Number);return new Date(Date.UTC(y,m-1,1)).toLocaleDateString('en-PK',{month:'long',year:'numeric',timeZone:'UTC'});}
 function escapedAttr(v){return escapeHTML(v);}
 function renderMonths(){
  if(!validSchool()){$('freshSideList').innerHTML='<p class="freshSideEmpty">School reports appear after sign in.</p>';return}
  const active=Studio.activePeriod?.()||'';
  $('freshSideList').innerHTML=rows.length?rows.map(r=>{
    const files=Array.isArray(r.exports)?r.exports:[];
    const status=String(r.status||'draft');
    const complete=files.length>0||status==='exported';
    return '<article class="freshSideMonth '+(r.period===active?'active':'')+'"><button type="button" class="freshSideOpen" data-fresh-open="'+escapedAttr(r.period)+'">'+escapeHTML(monthName(r.period))+' ↗</button><small class="freshSideMeta">'+(complete?'✓ Completed · Excel available':status==='submitted'||status==='final'?'Ready for Excel':'Draft · Continue editing')+'</small>'+files.map(file=>'<button type="button" class="freshSideDownload" data-fresh-download="'+escapedAttr(file.id)+'">↓ Download Excel</button>').join('')+'</article>';
  }).join(''):'<p class="freshSideEmpty">No reports yet. Choose New Month to start. Completed months will stay here with Excel downloads.</p>';
 }
 async function refreshMonths(force=false){
  if(!validSchool()||loading)return;
  const semis=String(account?.semis||'');
  if(lastSemis!==semis){lastSemis=semis;rows=[];lastFetch=0;}
  if(!force&&Date.now()-lastFetch<12000)return;
  loading=true;
  try{const data=await Studio.api('list-months');rows=(data.months||[]).slice().sort((a,b)=>String(b.period).localeCompare(String(a.period)));lastFetch=Date.now();renderMonths();}
  catch(error){if(!rows.length)$('freshSideList').textContent='Unable to load months: '+error.message;}
  finally{loading=false}
 }
 async function startMonth(){
  if(!validSchool())return typeof show==='function'&&show('signin');
  try{
   const newest=rows[0];
   const done=newest&&(newest.status==='submitted'||newest.status==='exported'||(newest.exports||[]).length);
   const date=done?String(newest.period).split('-'):null;
   const next=date?(Number(date[1])===12?String(Number(date[0])+1)+'-01':date[0]+'-'+String(Number(date[1])+1).padStart(2,'0')):new Date().toISOString().slice(0,7);
   await Studio.openPeriod(done?next:(newest?.period||next));
   Studio.showPanel();await refreshMonths(true);
  }catch(e){alert('Unable to open reporting month: '+e.message)}
 }
 dash.addEventListener('click',async event=>{
  if(event.target.closest('[data-fresh-new]'))return startMonth();
  if(event.target.closest('[data-fresh-refresh]'))return refreshMonths(true);
  const month=event.target.closest('[data-fresh-open]');
  if(month){await Studio.openPeriod(month.dataset.freshOpen);Studio.showPanel();renderMonths();return}
  const file=event.target.closest('[data-fresh-download]');
  if(file){if(typeof downloadHistory==='function')await downloadHistory(file.dataset.freshDownload);return}
 });
 if(typeof refreshSchool==='function'){
  const prev=refreshSchool;
  refreshSchool=async function(...args){const result=await prev(...args);refreshMonths(true).catch(()=>{});return result;};
 }
 if(typeof loadHistory==='function'){
  const prev=loadHistory;
  loadHistory=async function(...args){const result=await prev(...args);refreshMonths(true).catch(()=>{});return result;};
 }
 const signInState=()=>{if(!validSchool()){rows=[];lastSemis='';renderMonths();return;}refreshMonths().catch(()=>{});};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&validSchool())refreshMonths(true)});
 setInterval(()=>{if(!document.hidden&&validSchool()&&!dash.classList.contains('hidden'))refreshMonths()},24000);
 setTimeout(signInState,1000);setTimeout(signInState,4200);
})();
