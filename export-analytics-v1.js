'use strict';
/* Read-only protected exported-report analytics. All data is loaded on demand. */
(()=>{
 const modal=document.createElement('div');modal.id='exportInsightModal';modal.className='exportInsightModal hidden';
 modal.innerHTML='<div class="insightShade" data-insight-close></div><div class="insightFrame"><header class="insightTop"><div><small>MONTHLY ACADEMIC REPORT</small><h2>Export Details & Analytics</h2></div><div><button type="button" class="ghostMini" data-insight-close>← Back</button><button type="button" class="ghostMini" data-insight-home>⌂ Home</button></div></header><div id="exportInsightBody" class="insightBody"></div></div>';
 document.body.appendChild(modal);
 const body=modal.querySelector('#exportInsightBody');
 const roman={1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII'};
 const h=v=>esc(v??'—');
 const number=v=>Number.isFinite(Number(v))?Math.max(0,Number(v)):0;
 const num=v=>Number(v??0)||0;
 const metric=(label,val)=>'<div class="insightMetric"><small>'+h(label)+'</small><strong>'+h(val)+'</strong></div>';
 function close(){modal.classList.add('hidden');body.replaceChildren()}
 function summary(state,report,school){
  const teachers=Array.isArray(state?.teachers)?state.teachers:[],teacherById=new Map(teachers.map(t=>[t.id,t]));
  const assigned=Object.entries(state?.books||{}).flatMap(([grade,books])=>(Array.isArray(books)?books:[]).filter(b=>b.active&&b.teacherId).map(b=>({grade:Number(grade),book:b,teacher:teacherById.get(b.teacherId)})));
  const grades=[...new Set(assigned.map(x=>x.grade))].sort((a,b)=>b-a);
  const chapters=assigned.reduce((n,x)=>n+(x.book.chapters?.length||0),0);
  const covered=assigned.reduce((n,x)=>n+num(x.book.previous)+num(x.book.current),0);
  const done=assigned.filter(x=>x.book.current!==null&&x.book.current!==undefined).length;
  const schoolName=school?.school_name||state?.schoolName||'School';
  const headName=school?.hm_name||state?.hmName||'Head Teacher';
  const designation=school?.hm_gender==='female'||state?.hmDesignation==='HEAD MISTRESS'?'Head Mistress':'Head Master';
  let html='<section class="insightSchool"><div><small>SCHOOL · SEMIS '+h(report.semis)+'</small><h3>'+h(schoolName)+'</h3><p>'+h(designation)+': <b>'+h(headName)+'</b></p></div><div class="insightFile"><span>✓ Export saved in History</span><b>'+h(report.filename)+'</b><small>'+h(report.period)+' · '+h(new Date(report.created_at).toLocaleString())+'</small><button type="button" class="flowAction premium" data-download-export="'+h(report.id)+'">⬇ Download Excel</button></div></section>';
  html+='<div class="insightGrid">'+metric('Teachers',teachers.length)+metric('Classes',grades.length)+metric('Assigned Subjects',assigned.length)+metric('Total Chapters',chapters)+metric('Covered Chapters',covered)+metric('Remaining Chapters',Math.max(0,chapters-covered))+'</div>';
  html+='<h3 class="insightSectionTitle">Teaching Team</h3><div class="insightTeacherGrid">'+teachers.map(t=>{const mine=assigned.filter(x=>x.book.teacherId===t.id);return '<article><b>'+h(t.name)+'</b><small>PID '+h(t.pid)+' · '+h(t.designation)+'</small><small>Classes: '+h([...new Set(mine.map(x=>' '+(roman[x.grade]||x.grade)))].join(', ')||'Not assigned')+'</small><small>'+mine.length+' assigned subjects</small></article>'}).join('')+'</div>';
  html+='<h3 class="insightSectionTitle">Classwise Subject & Chapter Analysis</h3>';
  for(const grade of grades){
   const subs=assigned.filter(x=>x.grade===grade);
   html+='<section class="insightGrade"><header><b>CLASS '+h(roman[grade]||grade)+'</b><small>'+subs.length+' Subjects</small></header><div class="insightSubjects">'+subs.map(x=>{
    const b=x.book,full=b.chapters?.length||0,prev=num(b.previous),cur=num(b.current),remaining=Math.max(0,full-prev-cur),p=full?Math.min(100,Math.round((prev+cur)/full*100)):0;
    return '<article><div class="insightSubHead"><div><strong>'+h(b.name)+'</strong><small>'+h(x.teacher?.name||'Unassigned')+'</small></div><span>'+p+'% covered</span></div><div class="insightBar"><i style="width:'+p+'%"></i></div><div class="insightStatRow"><span>Total <b>'+full+'</b></span><span>Previous <b>'+prev+'</b></span><span>This Month <b>'+cur+'</b></span><span>Remaining <b>'+remaining+'</b></span></div><div class="insightDetails"><p><b>Notebooks & Textbooks:</b> '+h(b.notebook===null?'Not assessed':b.notebook+'%')+'</p><p><b>Classroom Cleanliness & Management:</b> '+h(b.cleanliness)+'</p><p><b>Student Formative Feedback:</b> '+h(b.feedback)+'</p><p><b>Improvement Suggestions:</b> '+h(b.suggestion)+'</p></div></article>'
   }).join('')+'</div></section>'
  }
  return html;
 }
 async function open(id){modal.classList.remove('hidden');body.innerHTML='<div class="insightLoading">Opening the saved Excel details…</div>';
  try{const r=await request('export-details',{id});body.innerHTML=summary(r.report.state,r.report,r.school)}
  catch(e){body.textContent='Could not load export details: '+e.message}
 }
 window.openExportDetails=open;
 document.addEventListener('click',e=>{
  if(e.target.closest('[data-insight-close]'))return close();
  if(e.target.closest('[data-insight-home]')){close();if(typeof portalNavigateHome==='function')portalNavigateHome();return}
  const detail=e.target.closest('[data-export-details]');if(detail)return open(detail.dataset.exportDetails);
  const download=e.target.closest('[data-download-export]');if(download)downloadHistory(download.dataset.downloadExport)
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))close()});
})();
