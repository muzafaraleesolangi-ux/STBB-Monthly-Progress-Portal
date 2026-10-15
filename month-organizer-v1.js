'use strict';
/* School-scoped month navigator: linked draft -> submitted -> archived Excel, with next-month CTA. */
const MonthOrganizer=(()=>{
 const dash=document.getElementById('schooldash'),tabs=document.getElementById('schoolTabs');
 if(!dash||!tabs)return{refresh:async()=>{}};
 dash.classList.add('monthOrganized');
 const aside=document.createElement('aside');aside.id='monthOrganizer';aside.className='monthOrganizer';aside.setAttribute('aria-label','School monthly reports');
 aside.innerHTML='<div class="monthSidebarHeading"><div><span>ACADEMIC REPORTS</span><strong>My Reporting Months</strong></div><button type="button" data-month-refresh title="Refresh month history">↻</button></div><div class="monthSideContent" id="monthSideContent"><p>Checking school reports…</p></div><div class="monthSideBottom"><button type="button" data-month-new>＋ Start Next Month</button><small>All months remain linked to your school SEMIS.</small></div>';
 tabs.insertAdjacentElement('afterend',aside);
 const overview=document.getElementById('school-overview');
 const deck=document.createElement('div');deck.id='monthOverviewDeck';deck.className='monthOverviewDeck';deck.setAttribute('aria-label','Monthly reporting timeline');
 const oldTable=document.getElementById('periodTable');if(oldTable)oldTable.before(deck);
 let rows=[],lastError='',fetching=null,lastAt=0;
 const escHTML=v=>esc(v??'');
 const human=period=>{const a=String(period).split('-');const year=Number(a[0]),month=Number(a[1]);return Number.isFinite(year)&&month>=1&&month<=12?new Date(Date.UTC(year,month-1,1)).toLocaleDateString('en-PK',{month:'long',year:'numeric',timeZone:'UTC'}):String(period)};
 const monthAfter=s=>{const [y,m]=String(s).split('-').map(Number);return !y||!m?new Date().toISOString().slice(0,7):m===12?String(y+1)+'-01':String(y)+'-'+String(m+1).padStart(2,'0')};
 const title=row=>human(row.period);
 const state=row=>{if(row.status==='exported'||(row.exports?.length&&row.status!=='draft'))return 'exported';return row.status==='submitted'?'submitted':row.status==='final'?'final':'draft'};
 const badge=row=>({exported:'✓ Exported',submitted:'✓ Submitted',final:'✓ Final',draft:'✎ Draft'}[state(row)]);
 const files=row=>Array.isArray(row.exports)?row.exports:[];
 function render(){
  const sidebar=document.getElementById('monthSideContent');if(!sidebar)return;
  if(!auth||auth.admin){sidebar.innerHTML='<p>Sign into your school to see reports.</p>';deck.replaceChildren();return}
  if(lastError&&!rows.length){sidebar.textContent='Could not sync month history. '+lastError;return}
  const current=typeof Studio!=='undefined'?Studio.activePeriod?.():null;
  sidebar.innerHTML=rows.length?'<div class="monthSideList">'+rows.map(r=>'<article class="monthSideCard '+state(r)+(r.period===current?' selected':'')+'"><button type="button" class="monthSideOpen" data-month-open="'+escHTML(r.period)+'"><span class="monthSideTitle">'+escHTML(title(r))+'</span><span class="monthStatus '+state(r)+'">'+badge(r)+'</span></button><span class="monthSideSub">'+Number(r.subjects||0)+' subject record'+(Number(r.subjects||0)===1?'':'s')+' · '+files(r).length+' Excel</span>'+files(r).map(f=>'<div class="monthSideFile"><button type="button" data-month-download="'+escHTML(f.id)+'" title="Download '+escHTML(f.filename)+'">⬇ '+escHTML(f.filename)+'</button><button type="button" data-month-insights="'+escHTML(f.id)+'" title="Report details">↗</button></div>').join('')+(state(r)==='submitted'&&!files(r).length?'<small class="monthAwaiting">Submitted · Excel export is pending</small>':'')+'</article>').join('')+'</div>':'<p class="monthEmpty">No reports yet. Start your first monthly progress report.</p>';
  const recent=rows[0];
  const safeNext=recent&&['submitted','exported'].includes(state(recent));
  aside.querySelector('[data-month-new]').textContent=safeNext?'＋ Start '+human(monthAfter(recent.period)):'＋ Start Reporting Month';
  deck.innerHTML='<div class="monthTimelineHead"><div><span>SCHOOL MONTHLY ARCHIVE</span><h3>Academic Reporting Timeline</h3><p>Each month is linked to the preceding saved chapter progress. Teachers and assigned subjects stay ready for the next month.</p></div><span class="monthTotal">'+rows.length+' Month'+(rows.length===1?'':'s')+'</span></div><div class="monthTimelineGrid">'+(rows.length?rows.map(r=>'<article class="monthTimelineCard '+state(r)+'"><div class="monthTimelineTop"><strong>'+escHTML(title(r))+'</strong><span class="monthStatus '+state(r)+'">'+badge(r)+'</span></div><small>'+Number(r.subjects||0)+' subject records · '+files(r).length+' Excel export'+(files(r).length===1?'':'s')+'</small><div class="monthTimelineActions"><button type="button" data-month-open="'+escHTML(r.period)+'">'+(state(r)==='exported'?'View archived month':'Open Month')+'</button>'+files(r).map(f=>'<button type="button" data-month-download="'+escHTML(f.id)+'">⬇ Excel</button><button type="button" data-month-insights="'+escHTML(f.id)+'">Analytics ↗</button>').join('')+'</div></article>').join(''):'<div class="monthTimelineEmpty">Your first reporting month will appear here when you start it.</div>')+'</div>'+(safeNext?'<div class="monthNextBanner"><div><b>✓ '+escHTML(title(recent))+' report saved.</b><p>Continue with '+escHTML(human(monthAfter(recent.period)))+'. Previous covered chapters will carry forward automatically; classroom assessments start fresh.</p></div><button type="button" data-month-new>＋ Start New Month →</button></div>':'');
  if(oldTable)oldTable.hidden=true;
 }
 async function refresh(){
  if(!auth||auth.admin){rows=[];render();return}
  if(fetching)return fetching;
  fetching=(async()=>{try{
   if(typeof Studio==='undefined'||!Studio.api)throw Error('School workspace is still preparing');
   const result=await Studio.api('list-months');rows=result.months||[];lastError='';lastAt=Date.now();render()
  }catch(e){lastError=e.message||String(e);render();console.warn('Month archive sync:',e)}
  finally{fetching=null}
  })();
  return fetching
 }
 async function newMonth(){
  if(!auth||auth.admin)return;
  const recent=rows[0];
  if(recent&&['submitted','exported'].includes(state(recent))){
   const next=monthAfter(recent.period);
   // Opening via the Studio also refreshes this month's school calendar.
   await openMonth(next);return
  }
  if(recent){await openMonth(recent.period);return}
  const chosen=String(document.getElementById('newMonthYear')?.value||new Date().getFullYear())+'-'+String(document.getElementById('newMonthName')?.value||new Date().getMonth()+1).padStart(2,'0');
  await openMonth(chosen)
 }
 dash.addEventListener('click',async e=>{
  const open=e.target.closest('[data-month-open]');if(open){await openMonth(open.dataset.monthOpen);return}
  const dl=e.target.closest('[data-month-download]');if(dl){await downloadHistory(dl.dataset.monthDownload);return}
  const info=e.target.closest('[data-month-insights]');if(info){if(typeof openExportDetails==='function')await openExportDetails(info.dataset.monthInsights);return}
  if(e.target.closest('[data-month-new]')){await newMonth();return}
  if(e.target.closest('[data-month-refresh]')){await refresh()}
 });
 // Keep the sidebar accurate after submission, export or dashboard refresh.
 const prevRefresh=refreshSchool;refreshSchool=async function(...args){const out=await prevRefresh(...args);await refresh();return out};
 const prevHistory=loadHistory;loadHistory=async function(...args){const out=await prevHistory(...args);if(auth&&!auth.admin)refresh().catch(()=>{});return out};
 if(auth&&!auth.admin)setTimeout(refresh,600);
 return{refresh,render,rows:()=>rows,monthAfter}
})();