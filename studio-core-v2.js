'use strict';
/* STBB Collaborative Studio v2 — school setup + subject-level optimistic concurrency */
const Studio=(()=>{
 const V2='https://oypqcizrlhdouygvazyb.supabase.co/functions/v1/mpr-workspace-v2';
 const numbers=[5,4,3,2,1],monthLabels=['January','February','March','April','May','June','July','August','September','October','November','December'];
 let setup=null,setupVersion=0,setupBusy=false,setupTimer=null,setupDirty=false,stage=0,grade=5,expanded='',schoolPeriod='',baseState=null,progressVersions={},
 progressEntries={},saveTimers={},progressDirty=new Set(),progressBusy=new Set(),filterTeacher='all',warnings=[],refreshHandle=null,initializing=false,setupConflict=false,assignmentTeacherIndex=0,assignmentEditorId='',assignmentEditorDraft=null,addingSubjectGrade=null;
 const $s=id=>document.getElementById(id);
 const clone=x=>structuredClone(x),safe=x=>esc(x),roman={1:'I',2:'II',3:'III',4:'IV',5:'V'};
 async function api(action,body={}){if(!auth?.token)throw Error('Please sign in');const r=await fetch(V2,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth.token},body:JSON.stringify({action,...body}),cache:'no-store'});const a=await r.json().catch(()=>({}));if(!r.ok||a.error)throw Error(a.error||'Cloud request failed');return a}
 function notify(message,bad=false){const box=$s('studioAlert');if(box){box.textContent=message;box.className='studioAlert'+(bad?' bad':'')}if(bad)console.warn(message)}
 function selectedGrades(){return numbers.filter(n=>setup?.selectedClasses?.includes(n))}
 function bookList(){return selectedGrades().flatMap(n=>(setup?.books?.[n]||[]).map(b=>({...b,grade:n})))}
 function assigned(){return bookList().filter(b=>b.active&&b.teacherId&&setup.teachers.some(t=>t.id===b.teacherId))}
 function tname(id){return setup?.teachers.find(t=>t.id===id)?.name||'Unassigned'}
 function teacher(id){return setup.teachers.find(t=>t.id===id)}
 function selectedTeacher(){return teacher(filterTeacher)||null}
 function firstStep(){return stage===0}
 async function waitTemplate(){let i=0;while(!template&&i++<55)await new Promise(ok=>setTimeout(ok,100));return template||{teachers:[{id:'t1',name:account?.hm_name||'',pid:'',designation:'PST (BPS-14)'}],books:{}}}
 function seed(t){const bs=clone(t.books||{});for(const g of numbers)for(const b of bs[g]||[]){b.active=false;b.teacherId='';b.previous=0;b.current=0}return{selectedClasses:[],teachers:[{id:'t1',name:account?.hm_name||'',pid:'',designation:'PST (BPS-14)',classes:[]}],books:bs}}
 function ensure(){if(!auth||auth.admin||!account)throw Error('School sign-in required');if(!setup)throw Error('Finish loading your school setup')}
 function markSetup(){setupDirty=true;if(setupConflict){notify('School setup changed on another device. Refresh this page to review the latest school setup before further saving.',true);return}notify('Changes detected · saving school setup…');clearTimeout(setupTimer);setupTimer=setTimeout(saveSetup,900)}
 async function saveSetup(){setupTimer=null;if(setupBusy||!setupDirty||!auth||auth.admin||setupConflict)return;setupBusy=true;setupDirty=false;const snapshot=clone(setup),atVersion=setupVersion;try{const result=await api('save-setup',{setup:snapshot,version:atVersion});setupVersion=result.version;notify('✓ School setup saved to cloud · version '+setupVersion)}catch(e){setupDirty=true;notify('⚠ '+e.message,true);if(/changed|Concurrent|Reload/i.test(e.message)){setupConflict=true;clearTimeout(setupTimer);alert('School setup was updated elsewhere. Please finish reviewing and reload the latest school setup before saving over it.');return}}finally{setupBusy=false;if(setupDirty&&!setupTimer&&!setupConflict)setupTimer=setTimeout(()=>{setupTimer=null;saveSetup()},1600)}}
 async function settleSetup(){if(setupConflict)throw Error('School setup changed on another device. Please refresh before continuing.');clearTimeout(setupTimer);setupTimer=null;if(setupBusy){let wait=0;while(setupBusy&&wait++<60)await new Promise(ok=>setTimeout(ok,100))}if(setupDirty)await saveSetup();if(setupDirty)throw Error('School setup needs saving. Please resolve the warning.')}
 function setupStage(n){if(!setup)return;stage=Math.max(0,Math.min(5,n));if(stage===4&&!selectedGrades().includes(grade))grade=selectedGrades()[0]||5;render();}
 function counts(){const bs=assigned(),completed=bs.filter(b=>progressVersions[b.id]>0),left=bs.filter(b=>!(progressVersions[b.id]>0));return{total:bs.length,done:completed.length,left}}
 function shell(){
 const dashboard=$s('schooldash'),tabs=$s('schoolTabs');if(!dashboard||$s('studioPanel'))return;
 const b=document.createElement('button');b.textContent='✦ Guided School Studio';b.id='studioTab';b.type='button';b.onclick=()=>showPanel();tabs.prepend(b);
 const panel=document.createElement('div');panel.id='studioPanel';panel.className='studioPanel hidden';
 panel.innerHTML='<div class="studioTop"><div><span class="studioEyebrow">SMART SCHOOL WORKSPACE · CLASS I–V</span><h2>School Academic Setup & Reporting</h2><p>First select the classes offered by your school, then add teachers, choose their classes and subjects. Every assigned teacher can update monthly progress on their own phone.</p></div><div class="studioCloud"><span id="studioCloudDot">●</span><span id="studioCloudText">Cloud sync ready</span></div></div><div id="studioStageNav" class="studioStageNav"></div><div id="studioAlert" class="studioAlert">Your school setup is loading…</div><div id="studioBody"></div><div id="studioFooter" class="studioFooter"></div>';
 dashboard.insertBefore(panel,$s('school-overview'));return panel
 }
 function showPanel(){shell();['overview','editor','history','feedbackschool'].forEach(x=>$s('school-'+x)?.classList.add('hidden'));$s('studioPanel').classList.remove('hidden');document.querySelectorAll('#schoolTabs button').forEach(x=>x.classList.toggle('active',x.id==='studioTab'));render();refreshSaveDock();window.scrollTo({top:0,behavior:'smooth'})}
 async function activate(){if(!auth||auth.admin||!account||initializing)return;initializing=true;try{
 shell();let r=await api('load-setup');setupVersion=r.version;setup=r.setup;
 if(!setup){const t=await waitTemplate();setup=seed(t);setupVersion=0;stage=0;notify('Step 1: Select which classes your school teaches. Add or remove Class I–V as needed.');}
 else{for(const x of setup.teachers||[])if(!Array.isArray(x.classes))x.classes=[];if(!Array.isArray(setup.selectedClasses)){setup.selectedClasses=numbers.filter(n=>setup.teachers.some(t=>t.classes.includes(n))||(setup.books[n]||[]).some(b=>b.active));}setup.selectedClasses=setup.selectedClasses.map(Number).filter(n=>numbers.includes(n));for(const t of setup.teachers)t.classes=t.classes.filter(n=>setup.selectedClasses.includes(n));grade=selectedGrades()[0]||5;stage=setup.selectedClasses.length?5:0;notify('✓ Your school setup has been restored from cloud.')}
 showPanel();
 }catch(e){notify(e.message,true)}finally{initializing=false}}
 function stageBar(){const names=['School Classes','Teachers','Teaching Classes','Subjects','Textbooks','Monthly Progress'];return '<div class="wizardTrack">'+names.map((name,i)=>'<button type="button" data-studio-stage="'+i+'" class="'+(i===stage?'current':i<stage?'finished':'')+'"><span>'+(i<stage?'✓':i+1)+'</span>'+safe(name)+'</button>').join('')+'</div>'}
 function render(){if(!setup||!$s('studioPanel')||$s('studioPanel').classList.contains('hidden'))return;
 $s('studioStageNav').innerHTML=stageBar();
 const body=$s('studioBody');body.innerHTML=[renderSchoolClasses,renderTeachers,renderClasses,renderAssignments,renderCourses,renderProgress][stage]();
 $s('studioFooter').innerHTML=(stage>0?'<button class="btn line" type="button" data-studio-back>← Back</button>':'')+'<span class="spacer"></span><button class="btn primary" type="button" data-studio-save>💾 Save Draft</button>'+(stage<5?'<button class="btn primary" type="button" data-studio-next>Next: '+['Teachers','Teaching Classes','Subjects','Textbooks','Monthly Progress'][stage]+' →</button>':'<button class="btn primary" type="button" data-studio-review>Review & Export Excel →</button>');
 }
 function renderSchoolClasses(){const selected=selectedGrades();return '<div class="studioHead"><div><h3>1. Select Classes Offered by Your School</h3><p>Only selected classes will appear in teacher assignments, textbooks, progress and Excel export. Add or remove classes any time; your textbook lesson lists stay available.</p></div><span class="studioCountBadge">'+selected.length+' Selected</span></div><div class="schoolClassCards">'+[1,2,3,4,5].map(n=>'<button type="button" class="schoolClassCard '+(selected.includes(n)?'chosen':'')+'" data-school-class="'+n+'"><span class="classEmblem">'+roman[n]+'</span><strong>Class '+roman[n]+'</strong><small>'+(selected.includes(n)?'✓ Added · Click to Remove':'+ Add Class')+'</small></button>').join('')+'</div><div class="classQuickButtons"><button class="ghostMini" data-classes-all>Select All Classes</button><button class="ghostMini" data-classes-none>Remove All</button></div><p class="studioHint">Next: Enter teachers, then assign them to these selected classes.</p>'}
 function renderTeachers(){return '<div class="studioHead"><div><h3>2. Enter Your School Teachers</h3><p>Add each teacher once. Enter full name, official PID and designation. Use Add Teacher for additional staff.</p></div><button class="btn ghost" data-studio-addteacher>＋ Add Teacher</button></div><div class="teacherCards">'+setup.teachers.map((t,i)=>'<article class="studioCard"><div class="studioCardTitle"><span class="indexBubble">'+(i+1)+'</span><strong>Teacher '+(i+1)+'</strong>'+(setup.teachers.length>1?'<button class="ghostMini" data-studio-removeteacher="'+safe(t.id)+'">Remove</button>':'')+'</div><div class="studioFormGrid"><label>Full Name<input data-tid="'+safe(t.id)+'" data-field="name" value="'+safe(t.name)+'" placeholder="As per school staff record"></label><label>PID Number<input data-tid="'+safe(t.id)+'" data-field="pid" value="'+safe(t.pid)+'" placeholder="Official PID"></label><label>Designation / BPS<input data-tid="'+safe(t.id)+'" data-field="designation" value="'+safe(t.designation)+'" placeholder="PST (BPS-14), JEST, HST…"></label></div></article>').join('')+'</div>'}
 function renderClasses(){return '<div class="studioHead"><div><h3>3. Choose Classes for Each Teacher</h3><p>One teacher may teach more than one class. Select every class they actually teach.</p></div></div>'+setup.teachers.map(t=>'<article class="studioCard"><h3>'+safe(t.name||'Unnamed Teacher')+'</h3><p class="studioHint">Choose one or more classes for this teacher:</p><div class="multiChips">'+selectedGrades().slice().reverse().map(n=>'<label class="multiChip '+(t.classes?.includes(n)?'checked':'')+'"><input type="checkbox" data-class-tid="'+safe(t.id)+'" value="'+n+'" '+(t.classes?.includes(n)?'checked':'')+'>Class '+roman[n]+'</label>').join('')+'</div></article>').join('')}
 function normalizedSubject(name){return String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en')}
 function duplicateName(grade,name,exceptId=''){return (setup.books[grade]||[]).find(b=>b.id!==exceptId&&normalizedSubject(b.name)===normalizedSubject(name))}
 function currentAssignedTeacher(){const index=Math.max(0,Math.min(setup.teachers.length-1,assignmentTeacherIndex));assignmentTeacherIndex=index;return setup.teachers[index]}
 function editableSubjectCard(b,g){
 const draft=assignmentEditorId===b.id&&assignmentEditorDraft?assignmentEditorDraft:null;
 if(!draft)return '';
 return '<div class="assignmentInlineEditor" id="assignmentEditor-'+safe(b.id)+'"><div class="assignmentInlineHeading"><strong>✎ Edit Subject & Chapters</strong><button class="ghostMini" type="button" data-assignment-close>✕ Close</button></div>'+
 '<div class="studioFormGrid"><label>Subject Name<input data-assignment-editname value="'+safe(draft.name)+'" maxlength="120" placeholder="Subject name"></label><label>Total Chapters / Units<input data-assignment-edittotal type="number" min="0" max="250" value="'+draft.chapters.length+'"></label></div>'+
 '<div class="lessonHead"><strong>Chapter / Lesson Titles</strong><button class="ghostMini" type="button" data-assignment-addchapter>＋ Add Lesson</button></div>'+
 '<div class="lessonInputs">'+draft.chapters.map((x,i)=>'<div><span>'+(i+1)+'</span><input data-assignment-chapter="'+i+'" value="'+safe(x)+'" placeholder="Lesson '+(i+1)+'"><button class="ghostMini danger" type="button" data-assignment-removechapter="'+i+'" aria-label="Remove lesson '+(i+1)+'">✕</button></div>').join('')+'</div>'+
 '<div class="assignmentEditFoot"><button class="btn primary" type="button" data-assignment-saveclose>✓ Save & Close</button></div></div>';
 }
 function renderAssignments(){
 if(!setup.teachers.length)return '<div class="studioMissing">Add teachers first.</div>';
 const t=currentAssignedTeacher(),selected=[...(t.classes||[])].filter(g=>selectedGrades().includes(g)).sort((a,b)=>b-a);
 const totalSubjects=selectedGrades().flatMap(g=>setup.books[g]||[]);
 let out='<div class="studioHead"><div><h3>4. Select Subjects — One Teacher at a Time</h3><p>Assign subjects for the selected teacher only. Subjects already given to other teachers are completely hidden from this teacher’s list. Every subject can have only one responsible teacher per class.</p></div><span class="studioCountBadge">'+(assignmentTeacherIndex+1)+' / '+setup.teachers.length+' Teachers</span></div>';
 out+='<div class="teacherAssignRail">'+setup.teachers.map((person,i)=>{const count=selectedGrades().reduce((sum,g)=>sum+(setup.books[g]||[]).filter(b=>b.active&&b.teacherId===person.id).length,0);return '<button type="button" data-assignment-teacher="'+i+'" class="teacherRailCard '+(i===assignmentTeacherIndex?'current':'')+'"><span class="teacherRailIndex">'+(i+1)+'</span><span><strong>'+safe(person.name||'Teacher '+(i+1))+'</strong><small>'+count+' subject'+(count===1?'':'s')+' assigned</small></span>'+(count?'<span class="teacherRailCheck">✓</span>':'')+'</button>'}).join('')+'</div>';
 out+='<div class="assignmentCurrentTeacher"><div><span class="studioEyebrow">CURRENT TEACHER</span><h3>'+safe(t.name||'Teacher '+(assignmentTeacherIndex+1))+'</h3><p>'+safe(t.designation||'')+' · '+selected.length+' teaching class'+(selected.length===1?'':'es')+'</p></div><div class="assignmentSwitch"><button type="button" class="ghostMini" data-assignment-prev '+(assignmentTeacherIndex===0?'disabled':'')+'>← Previous Teacher</button><button type="button" class="btn primary" data-assignment-next '+(assignmentTeacherIndex>=setup.teachers.length-1?'disabled':'')+'>Save & Next Teacher →</button></div></div>';
 if(!selected.length)out+='<div class="studioMissing">No class has been selected for '+safe(t.name)+'. Go to Teaching Classes and select at least one class first.</div>';
 for(const g of selected){
   const books=setup.books[g]||[];
   const mine=books.filter(b=>!b.active||!b.teacherId||b.teacherId===t.id);
   const hidden=books.length-mine.length;
   const assignedMine=books.filter(b=>b.active&&b.teacherId===t.id).length;
   out+='<article class="studioCard assignmentGradeCard"><div class="assignmentGradeHead"><div><h4>CLASS '+roman[g]+'</h4><small>'+assignedMine+' assigned to '+safe(t.name)+' · '+mine.length+' available'+(hidden?' · '+hidden+' already assigned elsewhere and hidden':'')+'</small></div><button class="ghostMini" type="button" data-assignment-addsubject="'+g+'">＋ Add Subject</button></div>';
   if(addingSubjectGrade===g)out+='<div class="assignmentAddForm"><label>New Subject Name<input id="assignmentNewName" maxlength="120" placeholder="e.g. English, Mathematics"></label><button class="btn primary" type="button" data-assignment-confirmadd="'+g+'">Add to Class '+roman[g]+'</button><button class="ghostMini" type="button" data-assignment-canceladd>Cancel</button><small>Duplicate names in the same class are not allowed.</small></div>';
   if(!mine.length)out+='<div class="studioMissing">Every existing subject in this class is assigned to other teachers. Use Add Subject only if the school teaches another subject.</div>';
   out+='<div class="assignmentSubjectGrid">'+mine.map(b=>{
     const selectedHere=b.active&&b.teacherId===t.id;
     return '<div class="assignmentSubjectCard '+(selectedHere?'selected':'')+'"><div class="assignmentSubjectSummary"><label class="assignmentSelect"><input type="checkbox" data-assign-tid="'+safe(t.id)+'" data-assign-grade="'+g+'" data-assign-bid="'+safe(b.id)+'" '+(selectedHere?'checked':'')+'><span><strong>'+safe(b.name)+'</strong><small>'+b.chapters.length+' chapters · '+(selectedHere?'Assigned to this teacher':'Available for assignment')+'</small></span></label><div class="assignmentSubjectActions"><button class="ghostMini" type="button" data-assignment-edit="'+safe(b.id)+'" data-grade="'+g+'">'+(assignmentEditorId===b.id?'Hide':'✎ Edit')+'</button><button class="ghostMini danger" type="button" data-assignment-remove="'+safe(b.id)+'" data-grade="'+g+'">Remove</button></div></div>'+editableSubjectCard(b,g)+'</div>'
   }).join('')+'</div></article>';
 }
 out+='<div class="assignmentSummary"><span>✓ '+totalSubjects.filter(b=>b.active&&b.teacherId).length+' total school assignments</span><span>Only unassigned subjects and this teacher’s own subjects are selectable.</span></div>';
 return out
 }
 function renderCourses(){if(!selectedGrades().length)return '<div class="studioMissing">First select the classes taught in your school. Only those classes will be available for subjects and textbook chapters.</div>';if(!selectedGrades().includes(grade))grade=selectedGrades()[0];const bs=setup.books[grade]||[];return '<div class="studioHead"><div><h3>5. Edit Your Subject & Chapter Master</h3><p>Only assigned subjects will appear in monthly reports. Edit names, add/remove textbooks and correct lesson totals below.</p></div><button class="btn ghost" data-studio-addbook>＋ Add Subject</button></div><div class="gradePills">'+selectedGrades().map(n=>'<button class="'+(n===grade?'active':'')+'" data-studio-grade="'+n+'">Class '+roman[n]+'</button>').join('')+'</div>'+bs.map(b=>{
 const open=expanded===b.id;
 return '<article class="studioCard"><div class="studioBookHeader"><div><b>'+safe(b.name)+'</b><small>Teacher: '+safe(tname(b.teacherId))+' · '+b.chapters.length+' chapters</small></div><div class="bookActions"><span class="stateDot '+(b.active?'isAssigned':'')+'">'+(b.active?'Assigned':'Not assigned')+'</span><button class="ghostMini" data-studio-editbook="'+safe(b.id)+'">'+(open?'Close':'Edit')+'</button><button class="ghostMini danger" data-studio-removebook="'+safe(b.id)+'">Remove</button></div></div>'+(open?'<div class="studioBookEdit"><label>Subject Name<input data-studio-subname="'+safe(b.id)+'" value="'+safe(b.name)+'"></label><label>Total Chapters / Units<input type="number" min="0" max="250" data-studio-count="'+safe(b.id)+'" value="'+b.chapters.length+'"></label><div class="lessonHead"><strong>Chapter / Lesson Titles</strong><button class="ghostMini" data-studio-addchapter="'+safe(b.id)+'">＋ Add</button></div><div class="lessonInputs">'+b.chapters.map((title,i)=>'<div><span>'+(i+1)+'</span><input data-studio-chapter="'+safe(b.id)+'" data-i="'+i+'" value="'+safe(title)+'" placeholder="Lesson '+(i+1)+'"><button type="button" class="ghostMini danger" data-studio-removechapter="'+safe(b.id)+'" data-i="'+i+'" title="Remove this lesson">✕</button></div>').join('')+'</div><button type="button" class="btn primary studioSaveClose" data-studio-saveclose="'+safe(b.id)+'">✓ Save & Close Subject</button></div>':'')+'</article>'}).join('')}
 function progressBy(b){const x=progressEntries[b.id]?.details;if(x)return clone(x);const from=(baseState?.books?.[b.grade]||[]).find(z=>z.id===b.id);return{previous:Number(from?.previous)||0,current:Number(from?.current)||0,notebook:70,cleanliness:'Good',feedback:'Good',suggestion:'',updatedBy:''}}
 function renderProgress(){const c=counts(),selected=filterTeacher==='all'?null:selectedTeacher(),list=assigned().filter(b=>!selected||b.teacherId===selected.id);
 let html='<div class="studioHead"><div><h3>6. Monthly Subject Progress</h3><p>Each teacher chooses their name and fills only their assigned classes and subjects. Subject entries save separately, so other teachers can work at the same time.</p></div><button class="btn ghost" data-studio-refresh>↻ Refresh Other Teachers’ Work</button></div>';
 html+='<div class="reportPeriodPanel"><div><label>Reporting Month</label><input type="month" id="studioMonthInput" value="'+safe(schoolPeriod||new Date().toISOString().slice(0,7))+'"></div><button class="btn primary" data-studio-openmonth>Open / Continue Month</button><div><label>Teacher Profile</label><select id="studioTeacherFilter"><option value="all">All Teachers · HM Review</option>'+setup.teachers.map(t=>'<option value="'+safe(t.id)+'" '+(filterTeacher===t.id?'selected':'')+'>'+safe(t.name)+'</option>').join('')+'</select></div></div>';
 if(!schoolPeriod)html+='<div class="studioMissing">Choose the reporting month and press Open / Continue Month to start your online draft.</div>';
 html+='<div class="studioMetrics"><div><b>'+c.total+'</b><small>Assigned Subjects</small></div><div><b>'+c.done+'</b><small>Saved This Month</small></div><div><b>'+c.left.length+'</b><small>Pending Entries</small></div></div>';
 if(c.left.length)html+='<details class="pendingBox" open><summary>⚠ Pending subject entries ('+c.left.length+')</summary>'+c.left.map(b=>'<span>Class '+roman[b.grade]+' · '+safe(b.name)+' — '+safe(tname(b.teacherId))+'</span>').join('')+'</details>';
 if(!list.length)html+='<div class="studioMissing">No subjects assigned to this teacher yet. Complete Subjects step first.</div>';
 for(const b of list){const d=progressBy(b),total=b.chapters.length,prev=Math.min(total,Number(d.previous)||0),curr=Math.min(total-prev,Number(d.current)||0),saved=!!progressVersions[b.id],pct=total?Math.round(100*(prev+curr)/total):0;
 html+='<article class="studioCard progressCard"><div class="progressCardHeader"><div><span class="subGrade">CLASS '+roman[b.grade]+'</span><h3>'+safe(b.name)+'</h3><small>'+safe(tname(b.teacherId))+' · '+total+' total chapters</small></div><span class="progressState '+(saved?'saved':'pending')+'" id="status-'+safe(b.id)+'">'+(saved?'✓ Saved':'Pending entry')+'</span></div><div class="barBg"><i style="width:'+pct+'%"></i></div><div class="studioFormGrid progressFields"><label>Covered Previous Months<input type="number" min="0" max="'+total+'" data-progress-bid="'+safe(b.id)+'" data-pkey="previous" value="'+prev+'"></label><label>Covered This Month<input type="number" min="0" max="'+total+'" data-progress-bid="'+safe(b.id)+'" data-pkey="current" value="'+curr+'"></label><label>Notebook Maintenance (%)<select data-progress-bid="'+safe(b.id)+'" data-pkey="notebook">'+[50,60,70,80,90,100].map(n=>'<option '+(Number(d.notebook)===n?'selected':'')+'>'+n+'</option>').join('')+'</select></label><label>Classroom Cleanliness<select data-progress-bid="'+safe(b.id)+'" data-pkey="cleanliness">'+['Good','Very Good','Fair','Excellent','Needs Improvement'].map(v=>'<option '+(d.cleanliness===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><label>Formative Test Feedback<select data-progress-bid="'+safe(b.id)+'" data-pkey="feedback">'+['Good','Fair','Very Good','Excellent','Needs Improvement'].map(v=>'<option '+(d.feedback===v?'selected':'')+'>'+v+'</option>').join('')+'</select></label><label class="wideField">Improvement Suggestions<textarea data-progress-bid="'+safe(b.id)+'" data-pkey="suggestion" rows="2" placeholder="Subject-wise suggestions">'+safe(d.suggestion||'')+'</textarea></label></div><div class="subjectBottom"><span>'+pct+'% completed · '+Math.max(0,total-prev-curr)+' remaining</span><button class="btn ghost" data-studio-savesub="'+safe(b.id)+'">Save This Subject</button></div></article>';
 }
 return html}
 function summaryForCheck(){if(!selectedGrades().length)return 'Please select at least one class offered by your school.';if(!setup.teachers.every(t=>t.name.trim()&&t.pid.trim()&&t.designation.trim()))return 'Please complete teacher name, PID and designation.';if(stage>=1&&!setup.teachers.every(t=>t.classes?.length))return 'Select at least one teaching class for every teacher.';if(stage>=2&&!assigned().length)return 'Assign at least one subject to a teacher.';return null}
 async function next(){if(stage===0&&!selectedGrades().length)return notify('Add at least one school class before continuing.',true);if(stage===1&&!setup.teachers.every(t=>t.name.trim()&&t.pid.trim()&&t.designation.trim()))return notify('Complete Name, PID and Designation for each teacher before continuing.',true);if(stage===2&&!setup.teachers.every(t=>t.classes?.length))return notify('Choose at least one teaching class for each teacher.',true);if(stage===3){if(!await saveAssignmentEditor())return;if(!assigned().length)return notify('Assign at least one subject before continuing.',true)}
 try{await settleSetup()}catch(e){return notify(e.message,true)}setupStage(stage+1)}
 async function openPeriod(p){ensure();if(!selectedGrades().length)return notify('Select the school classes first, then assign teachers and subjects.',true);if(!/^20\d\d-(0[1-9]|1[0-2])$/.test(p||''))return notify('Choose a valid reporting month.',true);
 try{
 await settleSetup();
 const t=await waitTemplate(),initial=clone(t);
 initial.schoolName=account.school_name;initial.semis=account.semis;initial.hmName=account.hm_name;initial.teachers=setup.teachers.map(x=>({id:x.id,name:x.name,pid:x.pid,designation:x.designation}));
 initial.books=Object.fromEntries(selectedGrades().map(n=>[n,clone(setup.books[n]||[])]));
 for(const books of Object.values(initial.books))for(const b of books){b.previous=0;b.current=0;b.notebook=0;b.cleanliness='Good';b.feedback='Good';b.suggestion=''}
 const r=await request('open-period',{period:p,initial_state:initial});
 period=p;version=r.version;pendingState=null;schoolPeriod=p;baseState=r.state;progressVersions={};progressEntries={};progressDirty.clear();
 const entries=await api('load-period',{period:p});for(const x of entries.entries){progressEntries[x.book_id]=x;progressVersions[x.book_id]=x.version}
 // If a new month has no entries, carry forward the last earlier month from subject records.
 let earlier=periods.filter(x=>x.period<p).sort((a,b)=>b.period.localeCompare(a.period))[0];
 if(earlier){const old=await api('load-period',{period:earlier.period});for(const x of old.entries){if(!progressEntries[x.book_id]){const previous=Math.max(0,Number(x.details.previous)||0)+Math.max(0,Number(x.details.current)||0);const book=bookList().find(b=>b.id===x.book_id);if(book){const bs=(baseState.books?.[book.grade]||[]).find(z=>z.id===book.id);if(bs){bs.previous=Math.min(book.chapters.length,previous);bs.current=0}}}}}
 notify('✓ '+p+' opened. Each subject can now be saved independently. Choose a teacher and enter progress.');stage=5;render();await refreshSchool();
 }catch(e){notify(e.message,true)}
 }
 async function loadEntries(){if(!schoolPeriod)return;try{const list=await api('load-period',{period:schoolPeriod});for(const x of list.entries){if(!progressDirty.has(x.book_id)){progressEntries[x.book_id]=x;progressVersions[x.book_id]=x.version}}if(stage===5&&$s('studioPanel')&&!$s('studioPanel').classList.contains('hidden'))render()}catch(e){notify('Refresh failed: '+e.message,true)}}
 function updateEntry(bookId,k,v){if(!schoolPeriod)return notify('Open your reporting month first.',true);const book=assigned().find(x=>x.id===bookId);if(!book)return;let x=progressEntries[bookId];if(!x){x={book_id:bookId,details:progressBy(book),version:0};progressEntries[bookId]=x}
 if(['previous','current','notebook'].includes(k)){v=Math.max(0,Number(v)||0);if(k==='previous')v=Math.min(book.chapters.length,v);if(k==='current')v=Math.min(book.chapters.length-(Number(x.details.previous)||0),v)}
 x.details[k]=v;x.details.updatedBy=filterTeacher==='all'?'HM / School Review':tname(filterTeacher);progressDirty.add(bookId);
 const el=$s('status-'+bookId);if(el){el.textContent='● Unsaved changes';el.className='progressState pending'}
 clearTimeout(saveTimers[bookId]);saveTimers[bookId]=setTimeout(()=>saveSubject(bookId),1100);
 }
 async function saveSubject(bookId){if(!progressDirty.has(bookId)||progressBusy.has(bookId))return true;const book=assigned().find(x=>x.id===bookId);if(!book)return false;const entry=progressEntries[bookId];if(!entry)return false;
 clearTimeout(saveTimers[bookId]);progressBusy.add(bookId);const snapshot=clone(entry.details),ver=progressVersions[bookId]||0,mark=$s('status-'+bookId);
 if(mark)mark.textContent='Saving…';
 try{const r=await api('save-subject',{period:schoolPeriod,book_id:bookId,details:snapshot,version:ver});progressVersions[bookId]=r.version;if(JSON.stringify(entry.details)===JSON.stringify(snapshot))progressDirty.delete(bookId);if(mark){mark.textContent='✓ Saved';mark.className='progressState saved'}return true}
 catch(e){notify('⚠ '+book.name+': '+e.message,true);if(mark){mark.textContent='⚠ Save conflict';mark.className='progressState pending'}return false}
 finally{progressBusy.delete(bookId);if(progressDirty.has(bookId)&&JSON.stringify(entry.details)!==JSON.stringify(snapshot))saveTimers[bookId]=setTimeout(()=>saveSubject(bookId),1300)}
 }
 async function settle(){if(stage===3&&!await saveAssignmentEditor())throw Error('Save the open subject editor before proceeding.');await settleSetup();await Promise.all([...progressDirty].map(id=>saveSubject(id)));if(progressDirty.size)throw Error('Some subject entries are not saved. Resolve conflicts before export.')}
 function compiled(){
 const t=clone(baseState||template);
 t.schoolName=account.school_name;t.semis=account.semis;t.hmName=account.hm_name;t.teachers=setup.teachers.map(x=>({id:x.id,name:x.name,pid:x.pid,designation:x.designation}));
 t.books=Object.fromEntries(selectedGrades().map(n=>[n,clone(setup.books[n]||[])]));
 for(const g of selectedGrades())for(const b of t.books[g]||[]){
 const source=progressBy({...b,grade:g});for(const k of ['previous','current','notebook','cleanliness','feedback','suggestion'])b[k]=source[k]??(k==='notebook'?0:k==='previous'||k==='current'?0:'');
 b.active=Boolean(b.active&&b.teacherId&&selectedGrades().includes(g));
 }return t
 }
 async function review(){if(!schoolPeriod)return notify('Open your reporting month first.',true);
 try{await settle();await loadEntries();const data=compiled();
 // Save a versioned snapshot to support reopening the reviewed report next month.
 let result;
 try{result=await request('save-draft',{period:schoolPeriod,state:data,version});}catch(e){if(/changed|another teacher/i.test(e.message)){const r=await request('open-period',{period:schoolPeriod,initial_state:data});version=r.version;result=await request('save-draft',{period:schoolPeriod,state:data,version})}else throw e}
 version=result.version;pendingState=null;
 notify('✓ Final review snapshot saved. Download Excel from the preview below.');
 const btn=document.querySelectorAll('#schoolTabs button')[2];dashTab('editor',btn);
 const frame=$s('editor');const launch=()=>{frame.contentWindow.postMessage({type:'mpr-hydrate',state:data},location.origin);setTimeout(()=>{const d=frame.contentDocument;d?.querySelector('[data-page="export"]')?.click();d?.querySelectorAll('input,select,textarea').forEach(el=>el.disabled=true);},220)};
 if(frame.contentDocument?.readyState==='complete')launch();else frame.addEventListener('load',launch,{once:true});
 }catch(e){notify('Cannot export yet: '+e.message,true);alert(e.message)}
 }
 function findBook(g,id){return (setup.books[g]||[]).find(b=>b.id===id)}
 function clearAssignmentEditor(){assignmentEditorId='';assignmentEditorDraft=null;addingSubjectGrade=null}
 function openAssignmentEditor(id,g){
  const b=findBook(g,id);if(!b)return;
  if(assignmentEditorId===id){assignmentEditorId='';assignmentEditorDraft=null;render();return}
  assignmentEditorId=id;assignmentEditorDraft={grade:g,name:String(b.name||''),chapters:[...(b.chapters||[])]};addingSubjectGrade=null;render();
 }
 async function saveAssignmentEditor(){
  if(!assignmentEditorId||!assignmentEditorDraft)return true;
  const draft=assignmentEditorDraft,book=findBook(draft.grade,assignmentEditorId);
  if(!book){clearAssignmentEditor();return true}
  const title=String(draft.name||'').trim().replace(/\s+/g,' ');
  if(!title){notify('Subject name cannot be empty. Enter a name before saving.',true);return false}
  if(title.length>120){notify('Subject name must be 120 characters or less.',true);return false}
  const duplicate=duplicateName(draft.grade,title,book.id);
  if(duplicate){notify('⚠ DUPLICATE SUBJECT: "'+title+'" is already listed for Class '+roman[draft.grade]+'. Rename this subject; duplicate subject entries are not allowed.',true);return false}
  if(draft.chapters.length>250){notify('Maximum 250 chapters are supported for each subject.',true);return false}
  const oldName=book.name,oldChapters=[...book.chapters];
  book.name=title;book.chapters=draft.chapters.map(x=>String(x||'').trim());
  markSetup();
  try{await settleSetup();clearAssignmentEditor();notify('✓ Subject "'+title+'" saved successfully. The editor is now minimized.');return true}
  catch(e){book.name=oldName;book.chapters=oldChapters;notify('Could not save subject: '+e.message,true);return false}
 }
 async function moveAssignmentTeacher(index){
  if(index<0||index>=setup.teachers.length)return;
  if(!await saveAssignmentEditor())return;
  try{await settleSetup()}catch(e){notify('Save failed: '+e.message,true);return}
  assignmentTeacherIndex=index;clearAssignmentEditor();render();
  notify('✓ Saved. Now assigning subjects for '+(setup.teachers[index].name||'Teacher '+(index+1))+'. Subjects given to other teachers are hidden.');
 }
 async function handleClick(e){const target=e.target.closest('[data-school-class],[data-classes-all],[data-classes-none],[data-assignment-teacher],[data-assignment-prev],[data-assignment-next],[data-assignment-addsubject],[data-assignment-confirmadd],[data-assignment-canceladd],[data-assignment-edit],[data-assignment-remove],[data-assignment-close],[data-assignment-addchapter],[data-assignment-removechapter],[data-assignment-saveclose],[data-studio-stage],[data-studio-next],[data-studio-back],[data-studio-save],[data-studio-review],[data-studio-addteacher],[data-studio-removeteacher],[data-studio-grade],[data-studio-editbook],[data-studio-removebook],[data-studio-addbook],[data-studio-addchapter],[data-studio-removechapter],[data-studio-saveclose],[data-studio-refresh],[data-studio-openmonth],[data-studio-savesub]');if(!target)return;
 if(target.hasAttribute('data-school-class')){const n=Number(target.dataset.schoolClass),i=setup.selectedClasses.indexOf(n);if(i>=0){if(!confirm('Remove Class '+roman[n]+' from active classes? Existing lesson titles stay saved if you add it back.'))return;setup.selectedClasses.splice(i,1);for(const t of setup.teachers)t.classes=t.classes.filter(x=>x!==n);for(const b of setup.books[n]||[]){b.active=false;b.teacherId=''}}else setup.selectedClasses.push(n);grade=selectedGrades()[0]||5;markSetup();return render()}
 if(target.hasAttribute('data-classes-all')){setup.selectedClasses=[1,2,3,4,5];markSetup();return render()}
 if(target.hasAttribute('data-classes-none')){if(!confirm('Remove all selected classes?'))return;setup.selectedClasses=[];for(const t of setup.teachers)t.classes=[];for(const n of numbers)for(const b of setup.books[n]||[]){b.active=false;b.teacherId=''}markSetup();return render()}
 if(target.hasAttribute('data-assignment-teacher'))return moveAssignmentTeacher(Number(target.dataset.assignmentTeacher));
 if(target.hasAttribute('data-assignment-prev'))return moveAssignmentTeacher(assignmentTeacherIndex-1);
 if(target.hasAttribute('data-assignment-next'))return moveAssignmentTeacher(assignmentTeacherIndex+1);
 if(target.hasAttribute('data-assignment-addsubject')){if(!await saveAssignmentEditor())return;addingSubjectGrade=Number(target.dataset.assignmentAddsubject);render();setTimeout(()=>$s('assignmentNewName')?.focus(),50);return}
 if(target.hasAttribute('data-assignment-canceladd')){addingSubjectGrade=null;render();return}
 if(target.hasAttribute('data-assignment-confirmadd')){const g=Number(target.dataset.assignmentConfirmadd),title=$s('assignmentNewName')?.value?.trim().replace(/\s+/g,' ')||'',t=currentAssignedTeacher();if(!title)return notify('Enter a name for the new subject.',true);if(title.length>120)return notify('Subject name is too long.',true);if(duplicateName(g,title))return notify('⚠ DUPLICATE SUBJECT: "'+title+'" already exists for Class '+roman[g]+'. Please choose another subject name.',true);if(!t.classes.includes(g))return notify('This teacher does not teach Class '+roman[g]+'.',true);const id=g+'_custom_'+crypto.randomUUID().slice(0,12);setup.books[g].push({id,name:title,chapters:[],active:true,teacherId:t.id,previous:0,current:0});addingSubjectGrade=null;markSetup();render();notify('✓ "'+title+'" added and assigned only to '+t.name+'.');return}
 if(target.hasAttribute('data-assignment-edit')){const g=Number(target.dataset.grade),id=target.dataset.assignmentEdit;if(assignmentEditorId&&assignmentEditorId!==id&&!await saveAssignmentEditor())return;return openAssignmentEditor(id,g)}
 if(target.hasAttribute('data-assignment-remove')){const g=Number(target.dataset.grade),id=target.dataset.assignmentRemove,b=findBook(g,id);if(!b)return;if(!confirm('Remove "'+b.name+'" from Class '+roman[g]+' subject list? This removes its current school assignment but does not modify previously exported Excel files.'))return;setup.books[g]=setup.books[g].filter(x=>x.id!==id);if(assignmentEditorId===id)clearAssignmentEditor();markSetup();render();notify('Subject removed from current Class '+roman[g]+' subject list.');return}
 if(target.hasAttribute('data-assignment-close')){if(assignmentEditorId&&!confirm('Close subject editor without saving its changes?'))return;clearAssignmentEditor();render();return}
 if(target.hasAttribute('data-assignment-addchapter')){if(!assignmentEditorDraft)return;if(assignmentEditorDraft.chapters.length>=250)return notify('Maximum 250 chapters.',true);assignmentEditorDraft.chapters.push('');render();return}
 if(target.hasAttribute('data-assignment-removechapter')){if(!assignmentEditorDraft)return;assignmentEditorDraft.chapters.splice(Number(target.dataset.assignmentRemovechapter),1);render();return}
 if(target.hasAttribute('data-assignment-saveclose')){if(await saveAssignmentEditor())render();return}
 if(target.hasAttribute('data-studio-stage')){if(stage===3&&!await saveAssignmentEditor())return;setupStage(+target.dataset.studioStage);return}
 if(target.hasAttribute('data-studio-next'))return next();
 if(target.hasAttribute('data-studio-back')){if(stage===3&&!await saveAssignmentEditor())return;return setupStage(stage-1)}
 if(target.hasAttribute('data-studio-save')){if(stage===3&&!await saveAssignmentEditor())return;try{await settle();expanded='';render();notify('✓ All pending changes saved. Subject editor cards are minimized.')}catch(x){notify(x.message,true)}return}
 if(target.hasAttribute('data-studio-review'))return review();
 if(target.hasAttribute('data-studio-addteacher')){setup.teachers.push({id:'t'+crypto.randomUUID().replace(/-/g,'').slice(0,12),name:'',pid:'',designation:'PST (BPS-14)',classes:[]});markSetup();return render()}
 if(target.dataset.studioRemoveteacher){if(setup.teachers.length<=1)return;const id=target.dataset.studioRemoveteacher;if(!confirm('Remove this teacher and unassign their subjects?'))return;setup.teachers=setup.teachers.filter(t=>t.id!==id);assignmentTeacherIndex=Math.min(assignmentTeacherIndex,setup.teachers.length-1);clearAssignmentEditor();for(const b of bookList())if(b.teacherId===id){const orig=findBook(b.grade,b.id);orig.active=false;orig.teacherId=''}markSetup();return render()}
 if(target.dataset.studioGrade){grade=+target.dataset.studioGrade;expanded='';return render()}
 if(target.dataset.studioEditbook){expanded=expanded===target.dataset.studioEditbook?'':target.dataset.studioEditbook;return render()}
 if(target.dataset.studioRemovebook){if(!confirm('Remove this subject from your school course list?'))return;setup.books[grade]=setup.books[grade].filter(b=>b.id!==target.dataset.studioRemovebook);markSetup();return render()}
 if(target.hasAttribute('data-studio-addbook')){const name=prompt('Name of the new subject or textbook:');if(!name?.trim())return;const id=grade+'_custom_'+crypto.randomUUID().slice(0,8);setup.books[grade].push({id,name:name.trim(),chapters:[],active:false,teacherId:'',previous:0,current:0});expanded=id;markSetup();return render()}
 if(target.dataset.studioAddchapter){const b=findBook(grade,target.dataset.studioAddchapter);if(b?.chapters.length<250)b.chapters.push('');markSetup();return render()}
 if(target.dataset.studioRemovechapter){const b=findBook(grade,target.dataset.studioRemovechapter);if(!b)return;b.chapters.splice(Number(target.dataset.i),1);markSetup();return render()}
 if(target.dataset.studioSaveclose){try{await settleSetup();expanded='';render();notify('✓ Subject updates saved. The card is minimized until you open it again.')}catch(e){notify(e.message,true)}return}
 if(target.hasAttribute('data-studio-openmonth')){return openPeriod($s('studioMonthInput').value)}
 if(target.hasAttribute('data-studio-refresh'))return loadEntries();
 if(target.dataset.studioSavesub)return saveSubject(target.dataset.studioSavesub)
 }
 function handleInput(e){const el=e.target;if(el.hasAttribute('data-assignment-editname')&&assignmentEditorDraft){assignmentEditorDraft.name=el.value;return}if(el.hasAttribute('data-assignment-chapter')&&assignmentEditorDraft){assignmentEditorDraft.chapters[Number(el.dataset.assignmentChapter)]=el.value;return}if(el.dataset.tid){const t=teacher(el.dataset.tid);if(t)t[el.dataset.field]=el.value;markSetup();return}
 if(el.dataset.studioSubname){let b=findBook(grade,el.dataset.studioSubname);if(b)b.name=el.value;markSetup();return}
 if(el.dataset.studioChapter){let b=findBook(grade,el.dataset.studioChapter);if(b)b.chapters[+el.dataset.i]=el.value;markSetup();return}
 if(el.dataset.progressBid){updateEntry(el.dataset.progressBid,el.dataset.pkey,el.value);return}}
 function handleChange(e){const el=e.target;if(el.hasAttribute('data-assignment-edittotal')&&assignmentEditorDraft){const n=Math.max(0,Math.min(250,Number(el.value)||0));while(assignmentEditorDraft.chapters.length<n)assignmentEditorDraft.chapters.push('');assignmentEditorDraft.chapters.length=n;render();return}if(el.dataset.classTid){const t=teacher(el.dataset.classTid),n=+el.value;if(!t)return;if(el.checked){if(!t.classes.includes(n))t.classes.push(n)}else{t.classes=t.classes.filter(x=>x!==n);for(const b of setup.books[n]||[])if(b.teacherId===t.id){b.teacherId='';b.active=false}}markSetup();return render()}
 if(el.dataset.assignTid){const g=Number(el.dataset.assignGrade),t=teacher(el.dataset.assignTid),b=findBook(g,el.dataset.assignBid);if(!b||!t)return;if(el.checked){if(b.active&&b.teacherId&&b.teacherId!==t.id){el.checked=false;notify('⚠ DUPLICATE ASSIGNMENT BLOCKED: "'+b.name+'" (Class '+roman[g]+') is already assigned to '+tname(b.teacherId)+'. It cannot be assigned to a second teacher.',true);return}if(!t.classes.includes(g)){el.checked=false;notify('Teacher is not assigned to this class.',true);return}if(duplicateName(g,b.name,b.id)){el.checked=false;notify('⚠ DUPLICATE SUBJECT NAME: "'+b.name+'" is already listed for Class '+roman[g]+'. Rename duplicate subjects first.',true);return}b.active=true;b.teacherId=t.id}else if(b.teacherId===t.id){b.active=false;b.teacherId=''}markSetup();return render()}
 if(el.dataset.studioCount){let b=findBook(grade,el.dataset.studioCount);if(b){let n=Math.max(0,Math.min(250,Number(el.value)||0));while(b.chapters.length<n)b.chapters.push('');b.chapters.length=n;markSetup();return render()}}
 if(el.id==='studioTeacherFilter'){filterTeacher=el.value;return render()}
 }
 function bind(){document.addEventListener('click',e=>{if(e.target.closest('#studioPanel'))handleClick(e)});document.addEventListener('input',e=>{if(e.target.closest('#studioPanel'))handleInput(e)});document.addEventListener('change',e=>{if(e.target.closest('#studioPanel'))handleChange(e)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&schoolPeriod&&$s('studioPanel')&&!$s('studioPanel').classList.contains('hidden'))loadEntries()});
 refreshHandle=setInterval(()=>{if(!document.hidden&&schoolPeriod&&auth&&!auth.admin&&stage===5&&!progressDirty.size)loadEntries()},18000);
 }
 bind();
 const originalPostLogin=postLogin;postLogin=async function(result){await originalPostLogin(result);if(!auth.admin)await activate();return result};
 const otherDashTab=dashTab;dashTab=function(tab,button){if($s('studioPanel'))$s('studioPanel').classList.add('hidden');return otherDashTab(tab,button)};
 // Restore the studio if the school session existed before a page refresh.
 setTimeout(()=>{if(auth&&!auth.admin&&account)activate()},1700);
 return{activate,openPeriod,review,showPanel,saveSetup,settle,refresh:loadEntries,unsaved:()=>Boolean(setupDirty||setupBusy||setupTimer||assignmentEditorId||addingSubjectGrade!==null||progressDirty.size||progressBusy.size),getSetup:()=>setup,api,stage:setupStage};
})();
