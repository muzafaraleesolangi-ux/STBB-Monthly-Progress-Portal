'use strict';
/* STBB Collaborative Studio v2 — school setup + subject-level optimistic concurrency */
const Studio=(()=>{
 const V2='https://oypqcizrlhdouygvazyb.supabase.co/functions/v1/mpr-workspace-v2';
 const numbers=[8,7,6,5,4,3,2,1],monthLabels=['January','February','March','April','May','June','July','August','September','October','November','December'];
 // Actual Class I–V subject/chapter master from MPR_Online_Editor.html; independent of iframe load timing.
 const SUBJECT_MASTER={
 5:[['Sindhi Reader',29,[]],['Asan Urdu',25,['حمد','خاتم النبیین ﷺ کی سیرت طیبہ','نعت','حضرت فاطمہ الزہرا رضی اللہ عنہا','کھیتوں کا لباس','محنت کی عظمت','یوم آزادی','ہمارا پرچم','کہانی ایک جھیل کی','عید الاضحیٰ','بس کا سفر','حفظان صحت','پہیلیاں اور لطائف','ہم سب پاکستانی ہیں','کالی گھٹا','سندھ کی ثقافت','ہے زندگی کا مقصد اوروں کے کام آنا','استاد محترم کو میرا سلام کہنا','اچھے رویے','بھائی بھلکڑ','حمل جھیل کی سیر','ہماری گائے','روزمرہ سائنس','راشد منہاس شہید','دعا']],['English',5,['Helping Others','Responsibility','Importance of Female Education','Truthfulness','My Country']],['Mathematics',9,['Numbers and Arithmetic Operations','HCF and LCM','Fractions','Decimals and Percentages','Distance, Time and Temperature','Unitary Method','Geometry','Perimeter and Area','Information Handling']],['General Science',10,['جاندارن جي درجه بندي','خوردبيني جاندار','ٻج، انهن جي بناوت ۽ ڦٽڻ','ماحول جي آلودگي','مادو ۽ ان جي حالتن جي تبديلي','زور ۽ مشينون','روشني ۽ ان جون خاصيتون','بجلي ۽ مقناطيسيت','مٽي','اسان جو شمسي نظام']],['Social Studies',13,['ڌرتيءَ جو گولو ۽ نقشن جي مهارت','پاڪستان ۽ دنيا جا طبعي ڀاڱا','آبهوا','اسان تاريخ جو اڀياس ڇو ٿا ڪريون؟','آزاديءَ لاءِ جدوجهد','پاڪستان ۽ دنيا جي تاريخ جون اهم شخصيتون ۽ واقعا','ثقافت يا ڪلچر','مال اسباب، شيون ۽ خدمتون','ناتو ۽ انسان جي زندگيءَ جو ڪار وهنوار','ڄاڻ ۽ معلومات جا ذريعا','انساني قدر ۽ سماجي زندگي','پاڪستان جو حڪومتي سرشتو','گڏيل ڪوششون ۽ نيون دريافتون']],['Islamiat',5,['القرآن الڪريم','عقيدا ۽ عبادتون','سيرتِ طيبه','اخلاق ۽ آداب','هدايت جا علمبردار ۽ اسلام جون مشهور شخصيتون']]],
 4:[['Sindhi Reader',30,[]],['Asan Urdu',21,['حمد','ہمارے پیارے نبی ﷺ','نعت','ہمارا وطن','ریل کا سفر','میٹھی عید','محنت سے چل رہے ہیں','میل جول','اچھی عادات','بھنبھور شہر کی سیر','محنت کا پھل','ڈاکٹر ادیب رضوی','ایک گائے اور بکری','موبائل','سندھ کی ثقافتی دستکاریاں','ڈاکٹر نبی بخش بلوچ','سامان کی حفاظت','لطیفے / بوجھو تو جانیں','آیا سبزی والا آیا','سردی کا موسم','سندھ کی تاریخی عمارات']],['English',5,['Health and Cleanliness','Safety','Children of Pakistan','Landforms','Taking Care of the Family']],['Mathematics',7,['Numbers and Arithmetic Operations','Factors and Multiples','Fractions','Decimals and Fractions','Measurement','Geometry','Information Handling']],['General Science',10,['Life Processes','Plants Structure and Function','Animal Structure and Function','Ecosystem – Adaptations','Matter and Its Characteristics','Forms of Energy and Its Transfer','Force and Simple Machines','Technology in Everyday Life','Earth and Its Resources','Earth in the Solar System']],['Social Studies',12,['گلوب ۽ نقشن بابت سکيا','سنڌ جي تاريخ','سنڌ جي ماڳن ۽ زمين جو هڪٻئي سان لاڳاپو','موسم','اسان جي رهڻي ڪهڻي','صوبي جي حڪومت','مواصلات جا ذريعا','ٻين سان گڏجي رهڻ','شيون ۽ خدمتون','نبي سڳورو حضرت محمد ﷺ','خلفاءِ راشدين','اسان جا سورما ۽ سورميون']],['Islamiat',5,['القرآن الڪريم','عقيدا ۽ عبادتون','سيرتِ طيبه','اخلاق ۽ آداب','هدايت جا علمبردار ۽ اسلام جون عظيم شخصيتون']]],
 3:[['Sindhi Reader',33,[]],['Asan Urdu',30,[]],['English',6,['Introduce Yourself / The Treasure','Health and Healthy Eating Habits','School Bus / Safety Measures','Pakistani Festivals','National Hero / Rashid Minhas','Bus Travel / Months of the Year']],['Mathematics',7,['Numbers','Arithmetic Operations','Fractions','Measurement','Time','Geometry','Information Handling']],['General Knowledge',12,['ڌرتي سڀني جاندارن جو گهر','جاندارن ۾ ايندڙ تبديليون','صحت ۽ تندرستي','جانورن ۽ جانورن جو کاڌو','اسان جا ذريعا','قدرتي وسيلا','ماضيءَ کي سمجهڻ','اختلافن کي سمجهڻ','سج جا اثر','ايجادون','مشينون ڪم آسان بڻائين ٿيون','دنيا کي محفوظ ۽ پرامن بڻائڻ']],['Islamiat',5,['قرآن مجيد ۽ حديث شريف','ايمانيات ۽ عبادات','سيرتِ طيبه ﷺ','اخلاق ۽ آداب','هدايت جا سرچشما']]],
 2:[['Sindhi Reader',5,[]],['English',8,['Alphabet, Sounds & Sight Words','Myself and My Family','Good Manners and Courtesy Words','My School and Classroom Objects','Colors, Shapes, and Numbers','Animals and Their Young Ones','Healthy Food and Hygiene','Simple Sentences & Action Words']],['Mathematics',8,['ڳڻپ ۽ اعداد','يڪايون ۽ ڏهايون','جمع ڪرڻ جو بنيادي عمل','تفريق جو عمل','ضرب جي شروعات','پئسا','زمان ۽ وقت','بنيادي جيوميٽري ۽ شڪليون']],['General Knowledge',8,['مان ۽ منهنجو جسم','اسان جو گهر، خاندان ۽ محلو','صحت، صفائي ۽ متوازن غذا','جاندار شيون','زمين، آسمان، سج، چنڊ ۽ موسمون','پاڻي ۽ هوا','پاڪستان ۽ قومي پرچم','ٽريفڪ ۽ روڊن تي حفاظت']]],
 1:[['Sindhi Reader',5,[]],['English',6,['Introduction to Alphabets and Sounds','Things Around Me','Family and Friends','Daily Actions','Modes of Transport and Traffic Rules','Love for Pakistan']],['Mathematics',6,['Concept of Whole Numbers','Number Operations','Measurement: Length and Mass','Money','Time and Date','Geometry']],['General Knowledge',9,['Our Beliefs','The Earth and the Sky','Myself','Family','Neighbourhood','Plants and Animals','Objects Around Us','The Weather and Seasons','Transportation']]]
};
 function defaultBooks(g){return (SUBJECT_MASTER[g]||[]).map(([name,count,titles])=>({id:g+'_'+name.replaceAll(' ','_'),name,chapters:Array.from({length:count},(_,i)=>titles[i]||''),active:false,teacherId:'',previous:0,current:0,notebook:0,cleanliness:'',feedback:'',suggestion:''}))}
 function repairSubjects(state){let changed=false;if(!state.books||typeof state.books!=='object'||Array.isArray(state.books)){state.books={};changed=true}if(!state.subjectCatalogInitialized||typeof state.subjectCatalogInitialized!=='object'){state.subjectCatalogInitialized={};changed=true}for(const grade of numbers){if(!Array.isArray(state.books[grade])){state.books[grade]=[];changed=true}if(!state.subjectCatalogInitialized[grade]){const existing=state.books[grade],names=new Set(existing.map(b=>normalizedSubject(b.name)));for(const book of defaultBooks(grade)){const name=normalizedSubject(book.name);if(!names.has(name)){existing.push(book);names.add(name);changed=true}}state.subjectCatalogInitialized[grade]=true;changed=true}}return changed}

 let setup=null,setupVersion=0,setupBusy=false,setupTimer=null,setupDirty=false,stage=0,grade=5,expanded='',schoolPeriod='',baseState=null,progressVersions={},
 progressEntries={},saveTimers={},progressDirty=new Set(),progressBusy=new Set(),filterTeacher='all',warnings=[],refreshHandle=null,initializing=false,setupConflict=false,assignmentTeacherIndex=0,assignmentEditorId='',assignmentEditorDraft=null,addingSubjectGrade=null,assignmentCollapsedGrades=new Set(),expandedLessonProgress='',lessonNameDraft=null,openingMonthPromise=null,queuedFirstInputs=new Map(),queuedInputFocus=null,detailsOpen=new Set(),progressSearch='',progressPendingOnly=false,rememberTeacher=false,loadedSchoolSemis=null,periodStatus='draft',periodWorkflow=null,collapsedCards=new Set(),expandedProgressCards=new Set();
 const $s=id=>document.getElementById(id);
 const clone=x=>structuredClone(x),safe=x=>esc(x),roman={1:'I',2:'II',3:'III',4:'IV',5:'V',6:'VI',7:'VII',8:'VIII'};
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
 function seed(t){const bs=clone(t.books||{});for(const g of numbers){if(!Array.isArray(bs[g])||!bs[g].length)bs[g]=defaultBooks(g);for(const b of bs[g]){b.active=false;b.teacherId='';b.previous=0;b.current=0;b.notebook=null;b.cleanliness='';b.feedback='';b.suggestion=''}}return{selectedClasses:[],subjectCatalogInitialized:Object.fromEntries(numbers.map(g=>[g,true])),teachers:[{id:'t1',name:'',pid:'',designation:'',classes:[]}],books:bs}}
 function ensure(){if(!auth||auth.admin||!account)throw Error('School sign-in required');if(!setup)throw Error('Finish loading your school setup')}
 function markSetup(){setupDirty=true;if(setupConflict){notify('School setup changed on another device. Refresh this page to review the latest school setup before further saving.',true);return}notify('Changes detected · saving school setup…');clearTimeout(setupTimer);setupTimer=setTimeout(saveSetup,900)}
 async function saveSetup(){setupTimer=null;if(setupBusy||!setupDirty||!auth||auth.admin||setupConflict)return;setupBusy=true;setupDirty=false;const snapshot=clone(setup),atVersion=setupVersion;try{const result=await api('save-setup',{setup:snapshot,version:atVersion});setupVersion=result.version;notify('✓ School setup saved to cloud · version '+setupVersion)}catch(e){setupDirty=true;notify('⚠ '+e.message,true);if(/changed|Concurrent|Reload/i.test(e.message)){setupConflict=true;clearTimeout(setupTimer);alert('School setup was updated elsewhere. Please finish reviewing and reload the latest school setup before saving over it.');return}}finally{setupBusy=false;if(setupDirty&&!setupTimer&&!setupConflict)setupTimer=setTimeout(()=>{setupTimer=null;saveSetup()},1600)}}
 async function settleSetup(){if(setupConflict)throw Error('School setup changed on another device. Please refresh before continuing.');clearTimeout(setupTimer);setupTimer=null;if(setupBusy){let wait=0;while(setupBusy&&wait++<60)await new Promise(ok=>setTimeout(ok,100))}if(setupDirty)await saveSetup();if(setupDirty)throw Error('School setup needs saving. Please resolve the warning.')}
 function setupStage(n){if(!setup)return;stage=Math.max(0,Math.min(5,n));if(stage===4&&!selectedGrades().includes(grade))grade=selectedGrades()[0]||8;render();}
 const MASTER_RATINGS=['Excellent','Very Good','Good','Fair','Needs Improvement'];
 const MASTER_SUGGESTIONS=['No further improvement suggested','Improve lesson planning and preparation','Check and maintain notebooks regularly','Encourage greater student participation','Strengthen formative tests and feedback','Provide revision and practice for difficult lessons','Improve classroom cleanliness and management'];
 const enteredNumber=v=>v!==null&&v!==undefined&&v!==''&&Number.isInteger(Number(v))&&Number(v)>=0;
 function filledFields(book){
  const d=progressEntries[book.id]?.details||{},n=book.chapters?.length||0;
  return {
   total:n>0&&n<=250,
   previous:enteredNumber(d.previous)&&Number(d.previous)<=n,
   current:enteredNumber(d.current)&&Number(d.current)<=n&&(enteredNumber(d.previous)?Number(d.previous):0)+Number(d.current)<=n,
   notebook:enteredNumber(d.notebook)&&Number(d.notebook)<=100,
   cleanliness:MASTER_RATINGS.includes(d.cleanliness),
   feedback:MASTER_RATINGS.includes(d.feedback),
   suggestion:String(d.suggestion||'').trim().length>0
  }
 }
 function fullyEntered(book){return Object.values(filledFields(book)).every(Boolean)}
 function counts(){const bs=assigned(),completed=bs.filter(b=>progressVersions[b.id]>0&&fullyEntered(b)&&!progressDirty.has(b.id)&&!progressBusy.has(b.id)),left=bs.filter(b=>!completed.includes(b));return{total:bs.length,done:completed.length,left}}
 function choiceOptions(max,value,zero=true){let html='<option value="">Select…</option>';for(let i=zero?0:1;i<=max;i++)html+='<option value="'+i+'" '+(value!==null&&value!==undefined&&value!==''&&Number(value)===i?'selected':'')+'>'+i+'</option>';return html}
 function ratingOptions(current){return '<option value="">Select…</option>'+MASTER_RATINGS.map(x=>'<option value="'+safe(x)+'" '+(current===x?'selected':'')+'>'+safe(x)+'</option>').join('')}
 function notebookOptions(value){return '<option value="">Select…</option>'+Array.from({length:21},(_,i)=>i*5).map(n=>'<option value="'+n+'" '+(value!==null&&value!==undefined&&value!==''&&Number(value)===n?'selected':'')+'>'+n+'%</option>').join('')}
 function suggestionOptions(value){return '<option value="">Select…</option>'+MASTER_SUGGESTIONS.map(x=>'<option value="'+safe(x)+'" '+(x===value?'selected':'')+'>'+safe(x)+'</option>').join('')+'<option value="__custom" '+(value&&!MASTER_SUGGESTIONS.includes(value)?'selected':'')+'>Write a custom suggestion…</option>'}
 
 function shell(){
 const dashboard=$s('schooldash'),tabs=$s('schoolTabs');if(!dashboard||$s('studioPanel'))return;
 const b=document.createElement('button');b.textContent='✦ Guided School Studio';b.id='studioTab';b.type='button';b.onclick=()=>showPanel();tabs.prepend(b);
 const panel=document.createElement('div');panel.id='studioPanel';panel.className='studioPanel hidden';
 panel.innerHTML='<div class="studioTop"><div><span class="studioEyebrow">STBB · FAST SCHOOL REPORTING</span><h2>School Academic Setup & Reporting</h2><p>Set up school classes and teachers once, then enter monthly progress quickly. Your school’s saved work stays available for future months.</p><div class="studioShortcuts"><button type="button" data-studio-quick-progress>⚡ Monthly Quick Fill</button><button type="button" data-studio-quick-assign>👩‍🏫 Teacher Subjects</button></div></div><div class="studioCloud"><span id="studioCloudDot">●</span><span id="studioCloudText">Cloud sync ready</span></div></div><div id="studioStageNav" class="studioStageNav"></div><div id="studioAlert" class="studioAlert">Your school setup is loading…</div><div id="studioBody"></div><div id="studioFooter" class="studioFooter"></div>';
 dashboard.insertBefore(panel,$s('school-overview'));return panel
 }
 function showPanel(){shell();['overview','editor','history','feedbackschool'].forEach(x=>$s('school-'+x)?.classList.add('hidden'));$s('studioPanel').classList.remove('hidden');document.querySelectorAll('#schoolTabs button').forEach(x=>x.classList.toggle('active',x.id==='studioTab'));render();refreshSaveDock();window.scrollTo({top:0,behavior:'smooth'})}
 function clearSchoolSession(){
 clearTimeout(setupTimer);for(const timer of Object.values(saveTimers))clearTimeout(timer);
 setup=null;setupVersion=0;setupBusy=false;setupTimer=null;setupDirty=false;setupConflict=false;
 stage=0;grade=8;expanded='';schoolPeriod='';baseState=null;progressVersions={};progressEntries={};saveTimers={};
 progressDirty.clear();progressBusy.clear();filterTeacher='all';rememberTeacher=false;detailsOpen.clear();
 assignmentTeacherIndex=0;assignmentEditorId='';assignmentEditorDraft=null;addingSubjectGrade=null;
 assignmentCollapsedGrades.clear();expandedLessonProgress='';lessonNameDraft=null;progressSearch='';progressPendingOnly=false;
 queuedFirstInputs.clear();queuedInputFocus=null;openingMonthPromise=null;periodStatus='draft';periodWorkflow=null;collapsedCards.clear();expandedProgressCards.clear();
 }
 async function activate(){if(!auth||auth.admin||!account||initializing)return;
 if(loadedSchoolSemis!==account.semis){clearSchoolSession();loadedSchoolSemis=account.semis}
 initializing=true;try{
 shell();let r=await api('load-setup');setupVersion=r.version;setup=r.setup;
 if(!setup){const t=await waitTemplate();setup=seed(t);setupVersion=0;stage=0;notify('Step 1: Select school classes. The Class I–V subject lists are ready. For VI–VIII, staff can add their own subjects and chapter totals.');}
 else{const repaired=repairSubjects(setup);for(const x of setup.teachers||[])if(!Array.isArray(x.classes))x.classes=[];if(!Array.isArray(setup.selectedClasses)){setup.selectedClasses=numbers.filter(n=>setup.teachers.some(t=>t.classes.includes(n))||(setup.books[n]||[]).some(b=>b.active));}setup.selectedClasses=setup.selectedClasses.map(Number).filter(n=>numbers.includes(n));for(const t of setup.teachers)t.classes=t.classes.filter(n=>setup.selectedClasses.includes(n));grade=selectedGrades()[0]||5;
 if(!setup.selectedClasses.length)stage=0;
 else if(!setup.teachers.every(t=>String(t.name||'').trim()&&String(t.pid||'').trim()&&String(t.designation||'').trim()))stage=1;
 else if(!setup.teachers.every(t=>Array.isArray(t.classes)&&t.classes.length))stage=2;
 else if(!assigned().length)stage=selectedGrades().some(g=>g>=6)?5:3;
 else stage=5;
 notify(repaired?'✓ Missing standard subjects loaded. Your existing school subjects and assignments have been preserved.':stage===5?'✓ Welcome back! Your school setup is ready. Enter monthly progress directly below.':'✓ Saved setup restored. Continue from the next unfinished step.');if(repaired)markSetup()}
 restoreTeacherPreference();showPanel();
 }catch(e){notify(e.message,true)}finally{initializing=false}}
 function stageBar(){const names=['School Classes','Teachers','Teaching Classes','Subjects','Chapter Totals','Monthly Progress'];return '<div class="wizardTrack">'+names.map((name,i)=>'<button type="button" data-studio-stage="'+i+'" class="'+(i===stage?'current':i<stage?'finished':'')+'"><span>'+(i<stage?'✓':i+1)+'</span>'+safe(name)+'</button>').join('')+'</div>'}
 function render(){if(!setup||!$s('studioPanel')||$s('studioPanel').classList.contains('hidden'))return;
 $s('studioStageNav').innerHTML=stageBar();
 const body=$s('studioBody');$s('studioPanel').dataset.stage=String(stage);body.innerHTML=[renderSchoolClasses,renderTeachers,renderClasses,renderAssignments,renderCourses,renderProgress][stage]();if(stage===5)progressVisibleFilter();
 $s('studioFooter').innerHTML=(stage>0?'<button class="btn line" type="button" data-studio-back>← Back</button>':'')+'<span class="spacer"></span><button class="btn primary" type="button" data-studio-save>💾 Save Draft</button>'+(stage<5?'<button class="btn primary" type="button" data-studio-next>'+(stage===3&&assignmentTeacherIndex<setup.teachers.length-1?'Save & Next Teacher →':stage===3?'✓ Start Monthly Report →':'Next: '+['Teachers','Teaching Classes','Subjects','Chapter Totals','Monthly Progress'][stage]+' →')+'</button>':'<button class="btn primary" type="button" id="studioReviewAction" data-studio-review '+(!(periodStatus==='submitted'&&schoolPeriod&&counts().total&&counts().left.length===0)?'hidden':'')+'>⬇ Export Excel →</button>');
 }
 function renderSchoolClasses(){const selected=selectedGrades();return '<div class="studioHead"><div><h3>1. Select Classes Offered by Your School</h3><p>Only selected classes will appear in teacher assignments, textbooks, progress and Excel export. Add or remove classes any time; your textbook lesson lists stay available.</p></div><span class="studioCountBadge">'+selected.length+' Selected</span></div><div class="schoolClassCards">'+[1,2,3,4,5,6,7,8].map(n=>'<button type="button" class="schoolClassCard '+(selected.includes(n)?'chosen':'')+'" data-school-class="'+n+'"><span class="classEmblem">'+roman[n]+'</span><strong>Class '+roman[n]+'</strong><small>'+(selected.includes(n)?'✓ Added · Click to Remove':'+ Add Class')+'</small></button>').join('')+'</div><div class="classQuickButtons"><button class="ghostMini" data-classes-all>Select All Classes</button><button class="ghostMini" data-classes-none>Remove All</button></div><p class="studioHint">Next: Enter teachers, then assign them to these selected classes.</p>'}
 function renderTeachers(){return '<div class="studioHead"><div><h3>2. Enter Your School Teachers</h3><p>Add each teacher once. Enter full name, official PID and designation. Use Add Teacher for additional staff.</p></div><button class="btn ghost" data-studio-addteacher>＋ Add Teacher</button></div><div class="teacherCards">'+setup.teachers.map((t,i)=>'<article class="studioCard"><div class="studioCardTitle"><span class="indexBubble">'+(i+1)+'</span><strong>Teacher '+(i+1)+'</strong>'+(setup.teachers.length>1?'<button class="ghostMini" data-studio-removeteacher="'+safe(t.id)+'">Remove</button>':'')+'</div><div class="studioFormGrid"><label>Full Name<input data-tid="'+safe(t.id)+'" data-field="name" value="'+safe(t.name)+'" placeholder="As per school staff record"></label><label>PID Number<input data-tid="'+safe(t.id)+'" data-field="pid" value="'+safe(t.pid)+'" placeholder="Official PID"></label><label>Designation / BPS<input data-tid="'+safe(t.id)+'" data-field="designation" value="'+safe(t.designation)+'" placeholder="PST (BPS-14), JEST, HST…"></label></div></article>').join('')+'</div>'}
 function renderClasses(){return '<div class="studioHead"><div><h3>3. Choose Classes for Each Teacher</h3><p>One teacher can teach multiple classes, and <b>the same class can be selected for several teachers</b>. Subject assignments in the next step are unique: Class V English can belong to only one teacher.</p></div></div>'+setup.teachers.map(t=>'<article class="studioCard"><h3>'+safe(t.name||'Unnamed Teacher')+'</h3><p class="studioHint">Choose one or more classes. Different teachers may teach the same class.</p><div class="classTeacherShortcuts"><button type="button" class="ghostMini" data-class-all="'+safe(t.id)+'">✓ All Offered Classes</button><button type="button" class="ghostMini" data-class-clear="'+safe(t.id)+'">Clear Classes</button></div><div class="multiChips">'+selectedGrades().slice().reverse().map(n=>'<label class="multiChip '+(t.classes?.includes(n)?'checked':'')+'"><input type="checkbox" data-class-tid="'+safe(t.id)+'" value="'+n+'" '+(t.classes?.includes(n)?'checked':'')+'>Class '+roman[n]+'</label>').join('')+'</div></article>').join('')}
 function normalizedSubject(name){return String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en')}
 function duplicateName(grade,name,exceptId=''){return (setup.books[grade]||[]).find(b=>b.id!==exceptId&&normalizedSubject(b.name)===normalizedSubject(name))}
 function teacherPrefKey(){return 'mpr_teacher_choice_'+(account?.semis||'unknown')}
 function restoreTeacherPreference(){
  filterTeacher='all';rememberTeacher=false;
  try{const id=localStorage.getItem(teacherPrefKey());if(id&&setup.teachers.some(t=>t.id===id)){filterTeacher=id;rememberTeacher=true}}catch{}
 }
 function saveTeacherPreference(){
  try{if(rememberTeacher&&filterTeacher!=='all')localStorage.setItem(teacherPrefKey(),filterTeacher);else localStorage.removeItem(teacherPrefKey())}catch{}
 }
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
 if(!setup.teachers.length)return '<div class="studioMissing">Please add teachers in the Teachers step first.</div>';
 const t=currentAssignedTeacher(),selected=[...(t.classes||[])].filter(g=>selectedGrades().includes(g)).sort((a,b)=>b-a);
 const totalSubjects=selectedGrades().flatMap(g=>setup.books[g]||[]);
 let out='<div class="studioHead"><div><h3>4. Select Subjects — Classwise Checkboxes</h3><p>Choose a teacher, then simply tick the subjects in each selected class. All existing subjects are listed automatically — <b>no need to type each subject</b>. One teacher can take any number of classes and subjects; a class–subject cannot be assigned to two teachers.</p></div><span class="studioCountBadge">'+(assignmentTeacherIndex+1)+' / '+setup.teachers.length+' Teachers</span></div>';
 out+='<div class="teacherAssignRail">'+setup.teachers.map((person,i)=>{const count=selectedGrades().reduce((sum,g)=>sum+(setup.books[g]||[]).filter(b=>b.active&&b.teacherId===person.id).length,0);return '<button type="button" data-assignment-teacher="'+i+'" class="teacherRailCard '+(i===assignmentTeacherIndex?'current':'')+'"><span class="teacherRailIndex">'+(i+1)+'</span><span><strong>'+safe(person.name||'Teacher '+(i+1))+'</strong><small>'+count+' subject'+(count===1?'':'s')+' selected</small></span>'+(count?'<span class="teacherRailCheck">✓</span>':'')+'</button>'}).join('')+'</div>';
 out+='<div class="assignmentCurrentTeacher"><div><span class="studioEyebrow">SUBJECT SELECTION · CURRENT TEACHER</span><h3>'+safe(t.name||'Teacher '+(assignmentTeacherIndex+1))+'</h3><p>'+safe(t.designation||'')+' · '+selected.length+' selected class'+(selected.length===1?'':'es')+' · Select as many subjects as this teacher teaches.</p></div><div class="assignmentSwitch"><button type="button" class="ghostMini" data-assignment-prev '+(assignmentTeacherIndex===0?'disabled':'')+'>← Previous Teacher</button><button type="button" class="btn primary" data-assignment-next '+(assignmentTeacherIndex>=setup.teachers.length-1?'disabled':'')+'>Save & Next Teacher →</button></div></div>';
 if(!selected.length)out+='<div class="studioMissing">No classes selected for '+safe(t.name)+'. Go back to Teaching Classes and select one or more classes first.</div>';
 for(const g of selected){
   const books=setup.books[g]||[],mine=books;
   const hidden=books.length-mine.length;
   const assignedMine=books.filter(b=>b.active&&b.teacherId===t.id).length;
   const unassigned=mine.filter(b=>!b.active||!b.teacherId);
   const closed=assignmentCollapsedGrades.has(g);
   const summary=assignedMine+' selected · '+unassigned.length+' available'+(hidden?' · '+hidden+' assigned to others (hidden)':'');
   out+='<section class="studioCard assignmentGradeCard '+(closed?'gradeMinimized':'')+'"><div class="assignmentGradeHead"><button class="assignmentClassToggle" type="button" data-assignment-togglegrade="'+g+'" aria-expanded="'+(!closed)+'" aria-controls="assignmentGradeBody-'+g+'"><span class="classPill">CLASS '+roman[g]+'</span><span class="assignmentGradeSummary"><strong>Class '+roman[g]+' Subjects</strong><small>'+summary+'</small></span><span class="expandChevron" aria-hidden="true">'+(closed?'＋':'−')+'</span></button><div class="assignmentHeaderActions"><button class="ghostMini" type="button" data-assignment-restoregrade="'+g+'" title="Restore missing standard textbooks without deleting custom subjects">↻ Standard Subjects</button><button class="ghostMini assignmentAddSubject" type="button" data-assignment-addsubject="'+g+'">＋ Add Subject</button></div></div>';
   if(!closed){
     out+='<div id="assignmentGradeBody-'+g+'" class="assignmentGradeBody">';
     if(addingSubjectGrade===g)out+='<div class="assignmentAddForm"><label>New Subject Name<input id="assignmentNewName" maxlength="120" placeholder="Type only if you are adding a new subject"></label><label>Total Chapters / Lessons (Required)<input id="assignmentNewTotal" type="number" min="1" max="250" value="1" required></label><button class="btn primary" type="button" data-assignment-confirmadd="'+g+'">✓ Add & Assign</button><button class="ghostMini" type="button" data-assignment-canceladd>Cancel</button><small>Subjects already listed below only need a tick. Same-class duplicate subject names are blocked.</small></div>';
     out+='<div class="assignmentClassActions"><span>Tick the subjects taught by '+safe(t.name||'this teacher')+'</span><div><button type="button" class="ghostMini" data-assignment-selectall="'+g+'" '+(!unassigned.length?'disabled':'')+'>✓ Tick All Available</button><button type="button" class="ghostMini" data-assignment-clear="'+g+'" '+(!assignedMine?'disabled':'')+'>Clear Selected</button></div></div>';
     if(hidden)out+='<details class="subjectHiddenDetails"><summary>🔒 '+hidden+' subject'+(hidden===1?'':'s')+' already assigned to other teachers — view</summary><div class="assignedElsewhereList">'+books.filter(b=>b.active&&b.teacherId&&b.teacherId!==t.id).map(b=>'<div><span>'+safe(b.name)+'</span><small>Assigned to '+safe(tname(b.teacherId))+'</small><button class="ghostMini" type="button" data-assignment-jumpteacher="'+safe(b.teacherId)+'">Manage Assignment</button></div>').join('')+'</div><p>To transfer a subject, open its existing teacher, untick it, then return here and tick it for '+safe(t.name)+'.</p></details>';
     if(!mine.length)out+='<div class="studioMissing">No unassigned subjects left in this class. You can add a new subject if your school teaches something else.</div>';
     out+='<div class="assignmentSubjectRows">'+mine.map(b=>{
       const checked=b.active&&b.teacherId===t.id,taken=b.active&&b.teacherId&&b.teacherId!==t.id;
       return '<div class="assignmentSubjectRow '+(checked?'selected':'')+'" data-row-subject="'+safe(b.id)+'"><div class="assignmentSubjectSummary"><label class="assignmentSelect"><input type="checkbox" data-assign-tid="'+safe(t.id)+'" data-assign-grade="'+g+'" data-assign-bid="'+safe(b.id)+'" '+(checked?'checked':'')+' '+(taken?'disabled':'')+' aria-label="Assign '+safe(b.name)+' Class '+roman[g]+' to '+safe(t.name)+'"><span><strong>'+safe(b.name)+'</strong><small>'+b.chapters.length+' chapters · '+(checked?'✓ Selected for this teacher':taken?'Already assigned to '+safe(tname(b.teacherId)):'Available — tick to assign')+'</small></span></label><div class="assignmentSubjectActions">'+(taken?'':'<button class="ghostMini" type="button" data-assignment-edit="'+safe(b.id)+'" data-grade="'+g+'">'+(assignmentEditorId===b.id?'− Hide Editor':'✎ Edit')+'</button><button class="ghostMini danger" type="button" data-assignment-remove="'+safe(b.id)+'" data-grade="'+g+'">Remove</button>')+'</div></div>'+(taken?'':editableSubjectCard(b,g))+'</div>'
     }).join('')+'</div></div>';
   }
   out+='</section>';
 }
 out+='<div class="assignmentSummary"><span>✓ '+totalSubjects.filter(b=>b.active&&b.teacherId).length+' school subject assignments saved/selected</span><span>Class selection can overlap; subject selection cannot overlap within the same class.</span></div>';
 return out;
 }
 function renderCourses(){if(!selectedGrades().length)return '<div class="studioMissing">First select the classes taught in your school. Only those classes will be available for subjects and textbook chapters.</div>';if(!selectedGrades().includes(grade))grade=selectedGrades()[0];const bs=setup.books[grade]||[];return '<div class="studioHead"><div><h3>5. Edit Your Subject & Chapter Master</h3><p>Set only the total chapters / lessons. Individual chapter names are optional.</p></div><button class="btn ghost" data-studio-addbook>＋ Add Subject</button></div><div class="gradePills">'+selectedGrades().map(n=>'<button class="'+(n===grade?'active':'')+'" data-studio-grade="'+n+'">Class '+roman[n]+'</button>').join('')+'</div>'+bs.map(b=>{
 const open=expanded===b.id;
 return '<article class="studioCard"><div class="studioBookHeader"><div><b>'+safe(b.name)+'</b><small>Teacher: '+safe(tname(b.teacherId))+' · '+b.chapters.length+' chapters</small></div><div class="bookActions"><span class="stateDot '+(b.active?'isAssigned':'')+'">'+(b.active?'Assigned':'Not assigned')+'</span><button class="ghostMini" data-studio-editbook="'+safe(b.id)+'">'+(open?'Close':'Edit')+'</button><button class="ghostMini danger" data-studio-removebook="'+safe(b.id)+'">Remove</button></div></div>'+(open?'<div class="studioBookEdit"><label>Subject Name<input data-studio-subname="'+safe(b.id)+'" value="'+safe(b.name)+'"></label><label>Total Chapters / Units<input type="number" min="0" max="250" data-studio-count="'+safe(b.id)+'" value="'+b.chapters.length+'"></label><div class="lessonHead"><strong>Chapter / Lesson Titles</strong><button class="ghostMini" data-studio-addchapter="'+safe(b.id)+'">＋ Add</button></div><div class="lessonInputs">'+b.chapters.map((title,i)=>'<div><span>'+(i+1)+'</span><input data-studio-chapter="'+safe(b.id)+'" data-i="'+i+'" value="'+safe(title)+'" placeholder="Lesson '+(i+1)+'"><button type="button" class="ghostMini danger" data-studio-removechapter="'+safe(b.id)+'" data-i="'+i+'" title="Remove this lesson">✕</button></div>').join('')+'</div><button type="button" class="btn primary studioSaveClose" data-studio-saveclose="'+safe(b.id)+'">✓ Save & Close Subject</button></div>':'')+'</article>'}).join('')}
 function progressBy(b){
 const x=progressEntries[b.id]?.details;if(x)return clone(x);
 const from=(baseState?.books?.[b.grade]||[]).find(z=>z.id===b.id);
 return{previous:Number(from?.previous)>0?Number(from.previous):null,current:null,notebook:null,cleanliness:'',feedback:'',suggestion:'',updatedBy:''}
 }
 function chapterSelections(b,d){
  const n=b.chapters.length,previous=Math.min(n,Math.max(0,Number(d.previous)||0)),current=Math.min(n-previous,Math.max(0,Number(d.current)||0));
  const stored=d.lessonSelections;
  if(stored&&Array.isArray(stored.previous)&&Array.isArray(stored.current)){
   const valid=a=>a.every(i=>Number.isInteger(i)&&i>=0&&i<n)&&new Set(a).size===a.length;
   if(valid(stored.previous)&&valid(stored.current)&&!stored.previous.some(i=>stored.current.includes(i))&&stored.previous.length===previous&&stored.current.length===current){
    return{previous:[...stored.previous],current:[...stored.current],legacy:false}
   }
  }
  return{previous:Array.from({length:previous},(_,i)=>i),current:Array.from({length:current},(_,i)=>previous+i),legacy:previous+current>0}
 }
 function progressFigures(b,d){const total=b.chapters.length,prev=Math.min(total,Math.max(0,Number(d.previous)||0)),curr=Math.min(total-prev,Math.max(0,Number(d.current)||0));return{total,prev,curr,remaining:Math.max(0,total-prev-curr),pct:total?Math.round((prev+curr)/total*100):0}}
 function renderLessonNameWriter(b){
  const draft=lessonNameDraft?.bookId===b.id?lessonNameDraft:null;
  let out='<div class="lessonWriterWrap"><div class="lessonWriterHeader"><div><strong>✎ Write / Edit Chapter & Lesson Names</strong><small>Easy typing: add one lesson, paste a full list, or correct existing names. Changes apply to this school’s textbook master after saving.</small></div><button type="button" class="ghostMini" data-lesson-write-open="'+safe(b.id)+'">'+(draft?'Hide Editor':'✎ Write Lessons')+'</button></div>';
  if(!draft)return out+'</div>';
  out+='<div class="lessonWriterPanel"><div class="lessonWriterIntro">Class '+roman[b.grade]+' · '+safe(b.name)+' · <b>'+draft.chapters.length+' total lessons</b>. Your Previous and This Month chapter totals are preserved.</div>';
  out+='<label class="lessonWriterLabel">New lesson / chapter name<div class="lessonWriterAddRow"><input type="text" maxlength="240" data-lesson-newname="'+safe(b.id)+'" placeholder="e.g. Our Environment" value="'+safe(draft.newInput||'')+'"><button type="button" class="btn primary" data-lesson-addone="'+safe(b.id)+'">＋ Add Lesson</button></div></label>';
  out+='<label class="lessonWriterLabel">Or paste many lessons (one lesson per line)<textarea rows="3" data-lesson-pasteinput="'+safe(b.id)+'" placeholder="Lesson 1 title&#10;Lesson 2 title&#10;Lesson 3 title">'+safe(draft.batchInput||'')+'</textarea><small>Fill empty lesson names first, then append extra titles. Existing named lessons will not be overwritten.</small></label><button type="button" class="ghostMini" data-lesson-applypaste="'+safe(b.id)+'">✓ Add Pasted Lessons</button>';
  out+='<div class="lessonWriterExisting"><strong>Existing lesson names — edit directly below</strong><div class="lessonWriterInputList">';
  draft.chapters.forEach((value,i)=>{
   const removable=i===draft.chapters.length-1;
   out+='<div class="lessonWriterRow"><span>'+(i+1)+'</span><input type="text" maxlength="240" data-lesson-title="'+safe(b.id)+'" data-lesson-title-index="'+i+'" value="'+safe(value)+'" placeholder="Write lesson / chapter '+(i+1)+' name">'+(removable?'<button type="button" class="ghostMini danger" data-lesson-remove-last="'+safe(b.id)+'" title="Remove last lesson only">Remove Last</button>':'')+'</div>';
  });
  out+='</div></div><div class="lessonWriterFooter"><p>Removing lessons is limited to the last uncompleted lesson, protecting numbering and older progress records.</p><div><button type="button" class="ghostMini" data-lesson-cancelwrite="'+safe(b.id)+'">Cancel</button><button type="button" class="btn primary" data-lesson-savewrite="'+safe(b.id)+'">💾 Save Lesson Names & Close</button></div></div></div></div>';
  return out;
 }
 function startLessonWriter(bookId){
  const b=assigned().find(x=>x.id===bookId);if(!b)return;
  lessonNameDraft={bookId,grade:b.grade,chapters:[...b.chapters],newInput:'',batchInput:''};
  expandedLessonProgress=bookId;
  render();
 }
 function addOneLesson(){
  if(!lessonNameDraft)return;
  const draft=lessonNameDraft,title=String(draft.newInput||'').trim();
  if(!title)return notify('Write the new lesson name first.',true);
  if(draft.chapters.length>=250)return notify('Maximum 250 lessons for one subject.',true);
  draft.chapters.push(title);draft.newInput='';
  render();notify('✓ Lesson added to the list. Press Save Lesson Names & Close to save it online.');
 }
 function addPastedLessons(){
  if(!lessonNameDraft)return;
  const draft=lessonNameDraft,lines=String(draft.batchInput||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(!lines.length)return notify('Paste at least one lesson title, one per line.',true);
  const blanks=draft.chapters.reduce((a,x,i)=>(String(x||'').trim()?a:(a.push(i),a)),[]);
  const extra=Math.max(0,lines.length-blanks.length);
  if(draft.chapters.length+extra>250)return notify('Too many lessons. Maximum 250 per subject; split your list.',true);
  let added=0,filled=0;
  for(const name of lines){
    if(blanks.length){draft.chapters[blanks.shift()]=name;filled++}
    else{draft.chapters.push(name);added++}
  }
  draft.batchInput='';render();notify('✓ '+filled+' blank titles filled, '+added+' new lessons added. Save when ready.');
 }
 function removeLastLesson(){
  const draft=lessonNameDraft;if(!draft||!draft.chapters.length)return;
  const b=assigned().find(x=>x.id===draft.bookId);if(!b)return;
  const idx=draft.chapters.length-1;
  if(idx<b.chapters.length){
   const d=progressBy({...b,grade:draft.grade}),sel=chapterSelections(b,d);
   if(sel.previous.includes(idx)||sel.current.includes(idx)||idx<Number(d.previous||0)+Number(d.current||0)){
     notify('This last lesson is already counted in monthly progress. Clear its progress status first, then try removing it.',true);return;
   }
   if(!confirm('Remove the last lesson? This changes the textbook total for future reports. Saved Excel files remain unchanged.'))return;
  }
  draft.chapters.pop();render();notify('Last uncompleted lesson removed from the edit list. Save to apply.');
 }
 async function saveLessonNames(){
  const draft=lessonNameDraft;if(!draft)return true;
  const b=findBook(draft.grade,draft.bookId);if(!b){lessonNameDraft=null;return true}
  if(draft.chapters.length>250){notify('Maximum 250 lessons per subject.',true);return false}
  const titles=draft.chapters.map(x=>String(x||'').trim());
  if(titles.some(x=>x.length>240)){notify('Each lesson name must be 240 characters or shorter.',true);return false}
  if(titles.length<b.chapters.length){
   const d=progressBy({...b,grade:draft.grade}),sel=chapterSelections(b,d);
   if(Number(d.previous||0)+Number(d.current||0)>titles.length||[...sel.previous,...sel.current].some(i=>i>=titles.length)){
    notify('Cannot remove completed lessons. Clear the corresponding month progress first.',true);return false}
  }
  // Record pending progress before modifying the shared curriculum. Never overwrite a separate teacher’s subject.
  if(progressDirty.has(b.id)&&!await saveSubject(b.id)){notify('Save this subject’s monthly progress first.',true);return false}
  const original=[...b.chapters];
  b.chapters=titles;markSetup();
  try{
    await settleSetup();
    lessonNameDraft=null;
    notify('✓ '+b.name+': '+titles.length+' lesson titles saved to the school cloud. Progress counters and Excel export updated.');
    render();return true;
  }catch(e){
    b.chapters=original;
    notify('Could not save lesson names: '+e.message,true);
    return false;
  }
 }
 function refreshProgressSummary(){
 const c=counts(),root=$s('studioBody');if(!root)return;
 for(const [sel,v] of [['[data-quick-done]',c.done],['[data-quick-pending]',c.left.length],['[data-quick-total]',c.total]]){const el=root.querySelector(sel);if(el)el.textContent=String(v)}
 const review=$s('studioReviewAction');if(review)review.hidden=!(periodStatus==='submitted'&&schoolPeriod&&c.total>0&&c.left.length===0);const final=$s('studioFinalAction');if(final)final.disabled=!(schoolPeriod&&c.total&&c.left.length===0);
 for(const person of setup.teachers){const books=assigned().filter(b=>b.teacherId===person.id),done=books.filter(b=>progressVersions[b.id]>0&&fullyEntered(b)&&!progressDirty.has(b.id)).length;const el=root.querySelector('[data-teacher-count="'+person.id+'"]');if(el)el.textContent=done+'/'+books.length}
 for(const card of root.querySelectorAll('[data-progress-card]')){
  const b=assigned().find(x=>x.id===card.dataset.progressCard);if(!b)continue;
  const f=filledFields(b),n=Object.values(f).filter(Boolean).length,complete=progressVersions[b.id]>0&&n===7&&!progressDirty.has(b.id)&&!progressBusy.has(b.id);
  card.classList.toggle('isComplete',complete);card.classList.toggle('isSaved',complete);card.classList.toggle('isPending',!complete);
  for(const field of card.querySelectorAll('[data-field-wrap]')){const key=field.dataset.fieldWrap;field.classList.toggle('hasValue',key==='remaining'||Boolean(f[key]));field.classList.toggle('needsValue',key!=='remaining'&&!f[key])}
  const mark=card.querySelector('.progressState');if(mark){mark.className='progressState '+(complete?'saved':'pending');mark.textContent=complete?'✓ Complete':'○ Pending · '+(7-n)+' left'}
  const text=card.querySelector('[data-progress-percent]');if(text)text.textContent=n+'/7 fields filled';
  const bar=card.querySelector('[data-progress-bar]');if(bar)bar.style.width=(n/7*100)+'%';
 }
 const list=root.querySelector('#studioPendingList');if(list){if(c.left.length){list.hidden=false;list.querySelector('summary').textContent=c.left.length+' subject(s) still pending — see which';list.querySelectorAll('span').forEach(x=>x.remove());for(const b of c.left){const p=document.createElement('span');p.textContent='Class '+roman[b.grade]+' · '+b.name+' — '+tname(b.teacherId);list.appendChild(p)}}else list.hidden=true}
 if(progressPendingOnly)progressVisibleFilter()
}
 function progressVisibleFilter(){
 const term=progressSearch.trim().toLowerCase();
 let visible=0;
 for(const card of document.querySelectorAll('#studioBody [data-progress-card]')){
  const search=(card.dataset.search||'').toLowerCase();
  const match=(!term||search.includes(term))&&(!progressPendingOnly||!card.classList.contains('isComplete'));
  card.hidden=!match;if(match)visible++;
 }
 const label=$s('studioVisibleCount');if(label)label.textContent=visible+' matching subjects';
 const empty=$s('studioFilteredEmpty');if(empty)empty.hidden=visible!==0;
}
function renderWorkflow(){
 const c=counts(),steps=['Draft','Final','Submitted','Exported'],ix={draft:0,final:1,submitted:2,exported:3}[periodStatus]??0;
 const stepsHTML=steps.map((step,i)=>'<span class="'+(i===ix?'current':i<ix?'passed':'future')+'">'+(i<ix?'✓ ':i+1+' ')+step+'</span>').join('');
 let buttons='';
 if(periodStatus==='draft')buttons='<button type="button" class="flowAction neutral" data-studio-save>Save Draft</button><button type="button" class="flowAction premium" id="studioFinalAction" data-workflow-final '+(!(schoolPeriod&&c.total&&c.left.length===0)?'disabled':'')+'>✓ Mark Final</button>';
 if(periodStatus==='final')buttons='<button type="button" class="flowAction neutral" data-workflow-reopen>✎ Edit Draft</button><button type="button" class="flowAction premium" data-workflow-submit>Submit Report →</button>';
 if(periodStatus==='submitted')buttons='<button type="button" class="flowAction neutral" data-workflow-reopen>✎ Reopen Draft</button><button type="button" class="flowAction premium" data-studio-review>⬇ Export Excel</button>';
 if(periodStatus==='exported')buttons='<button type="button" class="flowAction neutral" data-workflow-reopen>✎ Reopen & Edit</button><button type="button" class="flowAction premium" data-workflow-history>View Export History ↗</button>';
 const desc={draft:'Save as you work. Complete every subject to enable Final.',final:'Fields locked for review. Submit to enable Excel export.',submitted:'Submission complete. Export to store Excel in History.',exported:'Export saved in History. Month details are minimized.'}[periodStatus];
 return '<section class="premiumFlow '+safe(periodStatus)+'"><div class="flowSteps">'+stepsHTML+'</div><div class="flowActions">'+buttons+'</div><small class="flowMessage">'+desc+'</small></section>';
}
function renderProgress(){
 const c=counts(),selected=filterTeacher==='all'?null:selectedTeacher(),list=assigned().filter(b=>!selected||b.teacherId===selected.id).sort((a,b)=>{
 const ca=progressVersions[a.id]>0&&fullyEntered(a)&&!progressDirty.has(a.id),cb=progressVersions[b.id]>0&&fullyEntered(b)&&!progressDirty.has(b.id);
 return Number(ca)-Number(cb)||b.grade-a.grade||String(a.name).localeCompare(String(b.name))
 });
 let html='<div class="studioCompactHead"><h3>Monthly Academic Progress</h3><button type="button" class="ghostMini" data-studio-stage="1">Edit Teachers</button><span class="studioTinySync">'+(schoolPeriod?'Month '+safe(schoolPeriod):'Select reporting month')+'</span></div>';
 html+='<div class="studioPeriodMini"><label>Reporting Month <input type="month" id="studioMonthInput" value="'+safe(schoolPeriod||new Date().toISOString().slice(0,7))+'"></label><button type="button" data-studio-openmonth class="ghostMini">Use Month</button><button type="button" data-studio-refresh class="ghostMini" title="Refresh other teachers’ saved entries">↻ Sync</button><select id="studioTeacherFilter" class="visuallyHidden" aria-label="Teacher Profile"><option value="all">All Teachers</option>'+setup.teachers.map(t=>'<option value="'+safe(t.id)+'" '+(filterTeacher===t.id?'selected':'')+'>'+safe(t.name)+'</option>').join('')+'</select><label class="studioRememberMini"><input id="studioRememberTeacher" type="checkbox" '+(rememberTeacher?'checked':'')+' '+(filterTeacher==='all'?'disabled':'')+'> This device</label></div>';
 html+='<div class="studioTeacherTabs" role="tablist" aria-label="Teachers">'+['<button type="button" data-teacher-tab="all" class="'+(filterTeacher==='all'?'selected':'')+'">All Teachers</button>',...setup.teachers.map(t=>{const bs=assigned().filter(b=>b.teacherId===t.id),done=bs.filter(b=>progressVersions[b.id]>0&&fullyEntered(b)&&!progressDirty.has(b.id)).length;return '<button type="button" data-teacher-tab="'+safe(t.id)+'" class="'+(filterTeacher===t.id?'selected':'')+'">'+safe(t.name||'Teacher')+' <small data-teacher-count="'+safe(t.id)+'">'+done+'/'+bs.length+'</small></button>'})].join('')+'</div>';
 if(filterTeacher!=='all'){const t=selectedTeacher();if(t){html+='<details class="studioManageDetails"><summary>＋ Manage Classes & Subjects</summary><div class="studioAddPanel"><div class="studioNewClass"><select id="studioClassQuickPick" aria-label="Choose class to add"><option value="">Choose additional class</option>'+numbers.filter(n=>!(t.classes||[]).includes(n)).map(n=>'<option value="'+n+'">Class '+roman[n]+'</option>').join('')+'</select><button type="button" class="ghostMini" data-progress-addclass>＋ Add Class</button></div><div class="studioAddFields"><label>Class<select id="studioNewSubjectClass">'+(t.classes||[]).filter(n=>selectedGrades().includes(n)).sort((a,b)=>b-a).map(n=>'<option value="'+n+'">Class '+roman[n]+'</option>').join('')+'</select></label><label>Subject Name<input id="studioNewSubjectName" maxlength="120" placeholder="New subject"></label><label>Total No. of Chapters<select id="studioNewSubjectTotal">'+choiceOptions(250,null,false)+'</select></label><button class="btn primary" data-progress-addsubject type="button">＋ Add Subject</button></div></div>';
 const available=(t.classes||[]).filter(n=>selectedGrades().includes(n)).sort((a,b)=>b-a).flatMap(g=>(setup.books[g]||[]).filter(b=>!b.active||!b.teacherId).map(b=>({grade:g,book:b})));
 if(available.length)html+='<div class="studioExistingSelect"><label>Existing subject<select id="studioExistingSubject"><option value="">Select subject</option>'+available.map(x=>'<option value="'+x.grade+'::'+safe(x.book.id)+'">Class '+roman[x.grade]+' · '+safe(x.book.name)+'</option>').join('')+'</select></label><button type="button" class="btn primary" data-progress-claimsubject>Assign Subject</button></div>';
 html+='</details>'}}
 html+=renderWorkflow();
 html+='<div class="studioPendingStrip"><span><b data-quick-done>'+c.done+'</b> Complete</span><span><b data-quick-pending>'+c.left.length+'</b> Pending</span><span class="studioCountAlt"><b data-quick-total>'+c.total+'</b> Subjects</span></div>';
 html+='<div class="studioQuickTools"><label class="studioQuickSearch"><span>Find subject</span><input type="search" id="studioProgressSearch" value="'+safe(progressSearch)+'" placeholder="Search class, subject or teacher…" autocomplete="off"></label><div class="quickToolActions"><button type="button" class="ghostMini '+(!progressPendingOnly?'quickActive':'')+'" data-progress-show-all>All</button><button type="button" class="ghostMini '+(progressPendingOnly?'quickActive':'')+'" data-progress-pending>Pending Only</button></div></div><span class="studioResultsStatus" id="studioVisibleCount">'+list.length+' subjects</span><p class="studioMissing" id="studioFilteredEmpty" hidden>No matching subjects.</p>';
 if(c.left.length)html+='<details class="pendingBox" id="studioPendingList"><summary>'+c.left.length+' subject(s) still pending — see which</summary>'+c.left.map(b=>'<span>Class '+roman[b.grade]+' · '+safe(b.name)+' — '+safe(tname(b.teacherId))+'</span>').join('')+'</details>';
 if(!list.length)html+='<div class="studioMissing">No subjects yet. Select a teacher tab and add or assign subjects.</div>';
 if(periodStatus==='exported')html+='<details class="monthArchiveTray"><summary>✓ '+c.done+' subject(s) archived · View monthly details</summary>';
 html+='<div class="studioSubjectCards" id="studioSubjectCards">';
 for(const b of list){
  const d=progressBy(b),fig=progressFigures(b,d),complete=Boolean(progressVersions[b.id]&&fullyEntered(b)&&!progressDirty.has(b.id)),fields=filledFields(b),n=Object.values(fields).filter(Boolean).length,closed=Boolean(complete&&!expandedProgressCards.has(b.id));
  html+='<article class="studioCard progressCard fastProgressCard premiumSubject '+(complete?'isSaved isComplete':'isPending')+' '+(closed?'isCollapsed':'')+'" data-progress-card="'+safe(b.id)+'" data-search="'+safe('Class '+roman[b.grade]+' '+b.name+' '+tname(b.teacherId))+'"><header class="progressCardHeader"><div><span class="subGrade">CLASS '+roman[b.grade]+'</span><h3>'+safe(b.name)+'</h3><small>'+safe(tname(b.teacherId))+'</small></div><div class="premiumCardBadges"><span class="progressState '+(complete?'saved':'pending')+'" id="status-'+safe(b.id)+'">'+(complete?'✓ Complete':'◉ Pending · '+(7-n)+' left')+'</span><button type="button" class="ghostMini collapseToggle" data-progress-expand="'+safe(b.id)+'" aria-expanded="'+(!closed)+'">'+(closed?'Expand ▾':'Minimize ▴')+'</button></div></header>';
 html+='<div class="masterCardBody" '+(closed?'hidden':'')+(periodStatus!=='draft'?' inert':'')+'>';
  html+='<div class="masterEntryGrid"><label class="masterField masterTotal" data-field-wrap="total"><span>Total No. of Chapters</span><select data-progress-total="'+safe(b.id)+'" aria-label="Total No. of Chapters">'+choiceOptions(250,fig.total,false)+'</select></label>';
  html+='<label class="masterField" data-field-wrap="previous"><span>Chapters covered up to previous month</span><select data-progress-bid="'+safe(b.id)+'" data-pkey="previous" data-progress-metric="previous" aria-label="Chapters covered up to previous month">'+choiceOptions(Math.max(0,fig.total-fig.curr),d.previous)+'</select></label>';
  html+='<label class="masterField" data-field-wrap="current"><span>Chapters covered during the instant month</span><select data-progress-bid="'+safe(b.id)+'" data-pkey="current" data-progress-metric="current" aria-label="Chapters covered during the instant month">'+choiceOptions(Math.max(0,fig.total-fig.prev),d.current)+'</select></label>';
  html+='<div class="masterField masterRemaining" data-field-wrap="remaining"><span>No of chapters still remaining</span><strong data-progress-metric="remaining">'+fig.remaining+'</strong></div>';
  html+='<label class="masterField" data-field-wrap="notebook"><span>Preparation & Maintenance of Note Books and Text Books</span><select data-progress-bid="'+safe(b.id)+'" data-pkey="notebook">'+notebookOptions(d.notebook)+'</select></label>';
  html+='<label class="masterField" data-field-wrap="cleanliness"><span>Cleanliness & Class Room management</span><select data-progress-bid="'+safe(b.id)+'" data-pkey="cleanliness">'+ratingOptions(d.cleanliness)+'</select></label>';
  html+='<label class="masterField" data-field-wrap="feedback"><span>Feedback from the students during formative tests</span><select data-progress-bid="'+safe(b.id)+'" data-pkey="feedback">'+ratingOptions(d.feedback)+'</select></label>';
  html+='<label class="masterField masterSuggestion" data-field-wrap="suggestion"><span>Suggestions given to the Honourable Teacher for further improvement</span><select data-progress-suggestionselect="'+safe(b.id)+'">'+suggestionOptions(d.suggestion)+'</select><textarea rows="2" maxlength="900" data-progress-bid="'+safe(b.id)+'" data-pkey="suggestion" placeholder="Write suggestion" '+(d.suggestion&&!MASTER_SUGGESTIONS.includes(d.suggestion)?'':'hidden')+'>'+safe(d.suggestion&&!MASTER_SUGGESTIONS.includes(d.suggestion)?d.suggestion:'')+'</textarea></label></div>';
  html+='<div class="masterRowFooter"><div class="masterFieldProgress"><span data-progress-percent>'+n+'/7 fields filled</span><div class="barBg"><i data-progress-bar style="width:'+(n/7*100)+'%"></i></div></div><button type="button" data-studio-savesub="'+safe(b.id)+'" class="ghostMini">Save Subject</button><button type="button" data-progress-manage="'+safe(b.id)+'" class="ghostMini" title="Rename or remove this subject" aria-expanded="false">⋯</button><span class="masterEditTools" data-progress-edittools="'+safe(b.id)+'" hidden><button type="button" class="ghostMini" data-progress-rename="'+safe(b.id)+'">Rename</button><button type="button" class="ghostMini danger" data-progress-remove="'+safe(b.id)+'">Remove</button></span></div></div></article>';
 }
 html+='</div>';
 if(periodStatus==='exported')html+='</details>';
 return html
}

 async function workflowAction(status){
  if(!schoolPeriod)return notify('Choose a reporting month first.',true);
  if(status==='final'&&counts().left.length)return notify('Complete '+counts().left.length+' pending subject(s) before marking Final.',true);
  if(status==='draft'&&!confirm('Reopen '+schoolPeriod+' for editing? Previously exported files stay in History.'))return;
  if(status==='submitted'&&!confirm('Submit final Monthly Report '+schoolPeriod+'? Export Excel will unlock next.'))return;
  try{
   if(status!=='draft')await settle();
   const r=await api('set-workflow',{period:schoolPeriod,status});
   periodWorkflow=r.workflow||{status};periodStatus=periodWorkflow.status;
   if(status==='draft'){collapsedCards.clear();notify('✓ Draft reopened. You can edit and save again. Previous Excel exports remain in History.')}
   else if(status==='final')notify('✓ Report is Final. Review your entries, then Submit when ready.');
   else notify('✓ Monthly report submitted. Excel Export is now available.');
   render()
  }catch(e){notify('Report status not changed: '+e.message,true);alert(e.message)}
 }
 function applyCardCollapse(card,collapsed){
  if(!card)return;const body=card.querySelector('.masterCardBody'),button=card.querySelector('[data-progress-expand]');
  card.classList.toggle('isCollapsed',Boolean(collapsed));
  if(body)body.hidden=Boolean(collapsed);
  if(button){button.setAttribute('aria-expanded',String(!collapsed));button.textContent=collapsed?'Expand ▾':'Minimize ▴'}
 }
 function collapseSavedCard(bookId){
  if(!schoolPeriod||stage!==5)return;
  const card=[...document.querySelectorAll('#studioBody [data-progress-card]')].find(x=>x.dataset.progressCard===bookId);
  const b=assigned().find(x=>x.id===bookId);
  if(!card||!b||!(progressVersions[bookId]>0&&fullyEntered(b)&&!progressDirty.has(bookId)))return;
  collapsedCards.add(bookId);applyCardCollapse(card,true);
  const holder=$s('studioSubjectCards');if(holder&&card.parentElement===holder)holder.append(card);
  card.classList.remove('justSaved');void card.offsetWidth;card.classList.add('justSaved')
 }
function summaryForCheck(){if(!selectedGrades().length)return 'Please select at least one class offered by your school.';if(!setup.teachers.every(t=>t.name.trim()&&t.pid.trim()&&t.designation.trim()))return 'Please complete teacher name, PID and designation.';if(stage>=1&&!setup.teachers.every(t=>t.classes?.length))return 'Select at least one teaching class for every teacher.';if(stage>=2&&!assigned().length&&!selectedGrades().some(g=>g>=6))return 'Assign at least one subject to a teacher.';return null}
 async function next(){if(stage===0&&!selectedGrades().length)return notify('Add at least one school class before continuing.',true);if(stage===1&&!setup.teachers.every(t=>t.name.trim()&&t.pid.trim()&&t.designation.trim()))return notify('Complete Name, PID and Designation for each teacher before continuing.',true);if(stage===2&&!setup.teachers.every(t=>t.classes?.length))return notify('Choose at least one teaching class for each teacher.',true);if(stage===3){if(!await saveAssignmentEditor())return;if(!assigned().length&&!selectedGrades().some(g=>g>=6))return notify('Tick at least one subject for the school before continuing.',true);if(assignmentTeacherIndex<setup.teachers.length-1){await moveAssignmentTeacher(assignmentTeacherIndex+1);return}}
 try{await settleSetup()}catch(e){return notify(e.message,true)}setupStage(stage===3?5:stage+1)}
 async function openPeriod(p){ensure();if(!selectedGrades().length)return notify('Select the school classes first, then assign teachers and subjects.',true);if(!/^20\d\d-(0[1-9]|1[0-2])$/.test(p||''))return notify('Choose a valid reporting month.',true);
 try{
 await settleSetup();
 if(progressDirty.size){await Promise.all([...progressDirty].map(id=>saveSubject(id)));if(progressDirty.size)throw Error('Unsaved subject progress. Save it before switching months.')}
 const t=await waitTemplate(),initial=clone(t);
 initial.schoolName=account.school_name;initial.semis=account.semis;initial.hmName=account.hm_name;initial.hmDesignation=account.hm_gender==='female'?'HEAD MISTRESS':'HEAD MASTER';initial.teachers=setup.teachers.map(x=>({id:x.id,name:x.name,pid:x.pid,designation:x.designation}));
 initial.books=Object.fromEntries(selectedGrades().map(n=>[n,clone(setup.books[n]||[])]));
 for(const books of Object.values(initial.books))for(const b of books){b.previous=0;b.current=0;b.notebook=0;b.cleanliness='';b.feedback='';b.suggestion=''}
 const r=await request('open-period',{period:p,initial_state:initial});
 period=p;version=r.version;pendingState=null;schoolPeriod=p;baseState=r.state;progressVersions={};progressEntries={};progressDirty.clear();
 const [entries,workflow]=await Promise.all([api('load-period',{period:p}),api('load-workflow',{period:p})]);periodWorkflow=workflow.workflow||{status:'draft'};periodStatus=periodWorkflow.status;collapsedCards.clear();for(const x of entries.entries){progressEntries[x.book_id]=x;progressVersions[x.book_id]=x.version}
 // If a new month has no entries, carry forward the last earlier month from subject records.
 let earlier=periods.filter(x=>x.period<p).sort((a,b)=>b.period.localeCompare(a.period))[0];
 if(earlier){const old=await api('load-period',{period:earlier.period});for(const x of old.entries){if(!progressEntries[x.book_id]){const previous=Math.max(0,Number(x.details.previous)||0)+Math.max(0,Number(x.details.current)||0);const book=bookList().find(b=>b.id===x.book_id);if(book){const bs=(baseState.books?.[book.grade]||[]).find(z=>z.id===book.id);if(bs){bs.previous=Math.min(book.chapters.length,previous);bs.current=0;const oldSelection=x.details.lessonSelections;if(oldSelection&&Array.isArray(oldSelection.previous)&&Array.isArray(oldSelection.current)){bs.lessonSelections={previous:[...new Set([...oldSelection.previous,...oldSelection.current])].filter(i=>Number.isInteger(i)&&i>=0&&i<book.chapters.length).sort((a,b)=>a-b),current:[]};if(bs.lessonSelections.previous.length!==bs.previous)delete bs.lessonSelections}}}}}}
 notify('✓ '+p+' opened. Each subject can now be saved independently. Choose a teacher and enter progress.');stage=5;render();await refreshSchool();
 }catch(e){notify(e.message,true)}
 }
 async function loadEntries(){if(!schoolPeriod)return;try{const readingMonth=schoolPeriod,list=await api('load-period',{period:readingMonth});if(readingMonth!==schoolPeriod)return;for(const x of list.entries){if(!progressDirty.has(x.book_id)&&!progressBusy.has(x.book_id)){progressEntries[x.book_id]=x;progressVersions[x.book_id]=x.version}}refreshProgressSummary();const active=document.activeElement,editing=active?.closest?.('#studioBody')&&/^(INPUT|SELECT|TEXTAREA)$/.test(active.tagName);if(stage===5&&!editing&&!progressDirty.size&&!progressBusy.size&&$s('studioPanel')&&!$s('studioPanel').classList.contains('hidden'))render()}catch(e){notify('Refresh failed: '+e.message,true)}}
 function redrawProgressMetrics(bookId){
  const b=assigned().find(x=>x.id===bookId),card=[...document.querySelectorAll('[data-progress-card]')].find(x=>x.dataset.progressCard===bookId);
  if(!b||!card)return;
  const d=progressBy(b),v=progressFigures(b,d);
  const remaining=card.querySelector('[data-progress-metric="remaining"]');if(remaining)remaining.textContent=v.remaining;
 for(const key of ['previous','current']){const el=card.querySelector('[data-pkey="'+key+'"]');if(!el)continue;const expected=enteredNumber(d[key])?String(d[key]):'';if(el.value!==expected)el.value=expected;const limit=key==='previous'?v.total-v.curr:v.total-v.prev;for(const opt of el.options)if(opt.value!=='')opt.disabled=Number(opt.value)>limit}
  const percent=card.querySelector('[data-progress-percent]');if(percent)percent.textContent=v.pct+'% complete';
  const bottom=card.querySelector('[data-progress-bottom]');if(bottom)bottom.textContent=v.pct+'% completed · '+v.remaining+' remaining';
  refreshProgressSummary();
  const bar=card.querySelector('[data-progress-bar]');if(bar)bar.style.width=v.pct+'%';
 }
 function startMonthForTyping(bookId,key,value){
  if(value!==undefined)queuedFirstInputs.set(bookId+'::'+key,String(value));
  queuedInputFocus={bookId,key};
  if(openingMonthPromise)return openingMonthPromise;
  const wanted=$s('studioMonthInput')?.value || new Date().toISOString().slice(0,7);
  openingMonthPromise=(async()=>{
    try{
      await openPeriod(wanted);
      if(schoolPeriod!==wanted){notify('The reporting month could not be opened. Your number was not saved. Please try Open / Continue Month.',true);return false}
      for(const [joined,typed] of queuedFirstInputs){
        const [id,k]=joined.split('::');updateEntry(id,k,typed);
      }
      const pending=queuedInputFocus;
      if(pending){
        const newInput=[...document.querySelectorAll('[data-progress-bid]')].find(el=>el.dataset.progressBid===pending.bookId&&el.dataset.pkey===pending.key);
        if(newInput)newInput.focus({preventScroll:true});
      }
      return true;
    }catch(err){notify('Cannot open month: '+err.message,true);return false}
    finally{openingMonthPromise=null;queuedFirstInputs.clear();queuedInputFocus=null}
  })();
  return openingMonthPromise;
 }
 function updateEntry(bookId,k,v){
 if(periodStatus!=='draft')return notify('This report is '+periodStatus+'. Tap Edit / Reopen Draft before changing fields.',true);
 if(!schoolPeriod)return notify('Open your reporting month first.',true);
 const book=assigned().find(x=>x.id===bookId);if(!book)return;
 let x=progressEntries[bookId];if(!x){x={book_id:bookId,details:progressBy(book),version:0};progressEntries[bookId]=x}
 if(['previous','current','notebook'].includes(k)){
  v=v===''||v===null?null:Math.max(0,Number(v)||0);if(v!==null&&(k==='previous'||k==='current'))v=Math.floor(v);
  if(k==='previous'&&v!==null)v=Math.min(book.chapters.length-(Number(x.details.current)||0),v);
  if(k==='current'&&v!==null)v=Math.min(book.chapters.length-(Number(x.details.previous)||0),v);
  if(k==='notebook'&&v!==null)v=Math.min(100,v);
  if((k==='previous'||k==='current')&&x.details.lessonSelections){delete x.details.lessonSelections;notify('Chapter counts updated. Remaining recalculated automatically.')}
 }
 if(k==='lessonSelections'){
  if(!v||!Array.isArray(v.previous)||!Array.isArray(v.current))return;
  const prev=[...new Set(v.previous)].sort((a,b)=>a-b),curr=[...new Set(v.current)].sort((a,b)=>a-b);
  if(prev.some(i=>curr.includes(i))||[...prev,...curr].some(i=>!Number.isInteger(i)||i<0||i>=book.chapters.length)){notify('Duplicate or invalid lesson selection blocked.',true);return}
  x.details.previous=prev.length;x.details.current=curr.length;
  v={previous:prev,current:curr};
 }
 x.details[k]=v;x.details.updatedBy=filterTeacher==='all'?'HM / School Review':tname(filterTeacher);progressDirty.add(bookId);
 const el=$s('status-'+bookId);if(el){el.textContent='● Unsaved changes';el.className='progressState pending'}
 const cardPending=[...document.querySelectorAll('[data-progress-card]')].find(x=>x.dataset.progressCard===bookId);if(cardPending)cardPending.classList.remove('isSaved');
 redrawProgressMetrics(bookId);
 if(k==='previous'||k==='current'){
   const card=[...document.querySelectorAll('[data-progress-card]')].find(el=>el.dataset.progressCard===bookId);
   const edited=card?.querySelector('[data-pkey="'+k+'"][data-progress-bid]');
   if(edited&&edited.value!==(v===null?'':String(v)))edited.value=v===null?'':String(v);
 }
 clearTimeout(saveTimers[bookId]);saveTimers[bookId]=setTimeout(()=>saveSubject(bookId),1100);
 }
 async function saveSubject(bookId){if(periodStatus!=='draft')return false;if(!progressDirty.has(bookId)||progressBusy.has(bookId))return true;const book=assigned().find(x=>x.id===bookId);if(!book)return false;const entry=progressEntries[bookId];if(!entry)return false;
 clearTimeout(saveTimers[bookId]);progressBusy.add(bookId);const snapshot=clone(entry.details),ver=progressVersions[bookId]||0,mark=$s('status-'+bookId);
 if(mark)mark.textContent='Saving…';
 try{const r=await api('save-subject',{period:schoolPeriod,book_id:bookId,details:snapshot,version:ver});progressVersions[bookId]=r.version;if(JSON.stringify(entry.details)===JSON.stringify(snapshot))progressDirty.delete(bookId);if(mark){mark.textContent='✓ Draft saved'}refreshProgressSummary();if(!progressDirty.has(bookId)){collapseSavedCard(bookId)}if(progressPendingOnly)progressVisibleFilter();return true}
 catch(e){notify('⚠ '+book.name+': '+e.message,true);if(mark){mark.textContent='⚠ Save conflict';mark.className='progressState pending'}return false}
 finally{progressBusy.delete(bookId);refreshProgressSummary();if(progressDirty.has(bookId)&&JSON.stringify(entry.details)!==JSON.stringify(snapshot))saveTimers[bookId]=setTimeout(()=>saveSubject(bookId),1300)}
 }
 async function settle(){if(stage===3&&!await saveAssignmentEditor())throw Error('Save the open subject editor before proceeding.');if(lessonNameDraft&&!await saveLessonNames())throw Error('Save the lesson name editor before continuing.');await settleSetup();for(let i=0;i<30&&(progressDirty.size||progressBusy.size);i++){await Promise.all([...progressDirty].filter(id=>!progressBusy.has(id)).map(id=>saveSubject(id)));if(progressDirty.size||progressBusy.size)await new Promise(resolve=>setTimeout(resolve,160))}if(progressDirty.size||progressBusy.size)throw Error('Some subject entries are not saved. Check connection or resolve concurrent edits.')}
 function compiled(){
 const t=clone(baseState||template);
 t.schoolName=account.school_name;t.semis=account.semis;t.hmName=account.hm_name;t.hmDesignation=account.hm_gender==='female'?'HEAD MISTRESS':'HEAD MASTER';t.teachers=setup.teachers.map(x=>({id:x.id,name:x.name,pid:x.pid,designation:x.designation}));
 t.books=Object.fromEntries(selectedGrades().map(n=>[n,clone(setup.books[n]||[])]));
 for(const g of selectedGrades())for(const b of t.books[g]||[]){
 const source=progressBy({...b,grade:g});for(const k of ['previous','current'])b[k]=Number(source[k])||0;b.notebook=enteredNumber(source.notebook)?Number(source.notebook):null;b.cleanliness=source.cleanliness||'';b.feedback=source.feedback||'';b.suggestion=source.suggestion||'';if(source.lessonSelections)b.lessonSelections=clone(source.lessonSelections);
 b.active=Boolean(b.active&&b.teacherId&&selectedGrades().includes(g));
 }return t
 }
 async function review(){if(periodStatus!=='submitted')return notify('Submit the final Monthly Report before exporting.',true);if(!schoolPeriod)return notify('Open your reporting month first.',true);if(!assigned().length)return notify('Add and assign at least one subject and its total chapters / lessons before exporting.',true);if(assigned().some(b=>!b.chapters?.length))return notify('Total chapters / lessons are required for each assigned subject.',true);if(counts().left.length)return notify('Complete every master Proforma field for all '+counts().left.length+' pending subject(s) before reviewing.',true);
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
  notify('✓ Saved. Now assigning subjects for '+(setup.teachers[index].name||'Teacher '+(index+1))+'. Subjects given to other teachers are shown as locked.');
 }
 async function handleClick(e){const target=e.target.closest('[data-teacher-tab],[data-progress-addclass],[data-progress-addsubject],[data-progress-manage],[data-progress-claimsubject],[data-progress-rename],[data-progress-remove],[data-progress-month],[data-class-all],[data-class-clear],[data-studio-quick-progress],[data-studio-quick-assign],[data-progress-details],[data-progress-show-all],[data-progress-pending],[data-progress-saveall],[data-school-class],[data-classes-all],[data-classes-none],[data-assignment-jumpteacher],[data-assignment-restoregrade],[data-assignment-togglegrade],[data-assignment-selectall],[data-assignment-clear],[data-assignment-teacher],[data-assignment-prev],[data-assignment-next],[data-assignment-addsubject],[data-assignment-confirmadd],[data-assignment-canceladd],[data-assignment-edit],[data-assignment-remove],[data-assignment-close],[data-assignment-addchapter],[data-assignment-removechapter],[data-assignment-saveclose],[data-studio-stage],[data-studio-next],[data-studio-back],[data-studio-save],[data-studio-review],[data-studio-addteacher],[data-studio-removeteacher],[data-studio-grade],[data-studio-editbook],[data-studio-removebook],[data-studio-addbook],[data-studio-addchapter],[data-studio-removechapter],[data-studio-saveclose],[data-lesson-write-open],[data-lesson-cancelwrite],[data-lesson-addone],[data-lesson-applypaste],[data-lesson-remove-last],[data-lesson-savewrite],[data-studio-lessons],[data-lesson-close],[data-studio-refresh],[data-studio-openmonth],[data-studio-savesub],[data-workflow-final],[data-workflow-reopen],[data-workflow-submit],[data-workflow-history],[data-progress-expand]');if(!target)return;
 if(target.hasAttribute('data-workflow-final'))return workflowAction('final');
 if(target.hasAttribute('data-workflow-reopen'))return workflowAction('draft');
 if(target.hasAttribute('data-workflow-submit'))return workflowAction('submitted');
 if(target.hasAttribute('data-workflow-history')){const tab=[...document.querySelectorAll('#schoolTabs button')].find(x=>x.textContent.includes('History'));if(tab)dashTab('history',tab);else{dashTab('history',document.querySelectorAll('#schoolTabs button')[2])}await loadHistory();return}
 if(target.hasAttribute('data-progress-expand')){
  const id=target.dataset.progressExpand,card=target.closest('[data-progress-card]'),collapsed=!card.classList.contains('isCollapsed');
  if(collapsed)expandedProgressCards.delete(id);else expandedProgressCards.add(id);
  applyCardCollapse(card,collapsed);return
 }
 if(periodStatus!=='draft'&&stage===5&&!target.matches('[data-teacher-tab],[data-studio-refresh],[data-studio-openmonth],[data-progress-month],[data-progress-show-all],[data-progress-pending]')&&!(target.dataset.studioReview!==undefined))return notify('Report is '+periodStatus+'. Choose Edit / Reopen Draft to change data.',true);
 if(target.hasAttribute('data-lesson-write-open')){
   const id=target.dataset.lessonWriteOpen;
   if(lessonNameDraft?.bookId===id){if(!confirm('Discard unsaved lesson name changes?'))return;lessonNameDraft=null;render();return}
   if(lessonNameDraft&&!await saveLessonNames())return;
   startLessonWriter(id);return;
 }
 if(target.hasAttribute('data-lesson-cancelwrite')){if(!confirm('Discard unsaved lesson name changes?'))return;lessonNameDraft=null;render();return}
 if(target.hasAttribute('data-lesson-addone')){addOneLesson();return}
 if(target.hasAttribute('data-lesson-applypaste')){addPastedLessons();return}
 if(target.hasAttribute('data-lesson-remove-last')){removeLastLesson();return}
 if(target.hasAttribute('data-lesson-savewrite')){await saveLessonNames();return}
 if(target.hasAttribute('data-studio-lessons')){const id=target.dataset.studioLessons;if(lessonNameDraft&&!await saveLessonNames())return;expandedLessonProgress=expandedLessonProgress===id?'':id;render();return}
 if(target.hasAttribute('data-lesson-close')){if(lessonNameDraft&&!await saveLessonNames())return;expandedLessonProgress='';render();return}
 if(target.hasAttribute('data-studio-quick-progress')){if(!assigned().length)return notify('First assign at least one subject to a teacher.',true);setupStage(5);return}
 if(target.hasAttribute('data-studio-quick-assign')){setupStage(3);return}
 if(target.hasAttribute('data-progress-details')){const id=target.dataset.progressDetails;if(detailsOpen.has(id))detailsOpen.delete(id);else detailsOpen.add(id);return render()}
 if(target.hasAttribute('data-progress-show-all')){progressPendingOnly=false;render();return}
 if(target.hasAttribute('data-progress-pending')){progressPendingOnly=true;render();return}
 if(target.hasAttribute('data-progress-saveall')){try{await settle();notify('✓ All pending changes have been saved to the school account.')}catch(e){notify('Unable to save all: '+e.message,true)}return}
 if(target.hasAttribute('data-progress-month')){await openPeriod(target.dataset.progressMonth);return}
 if(target.hasAttribute('data-class-all')){const t=teacher(target.dataset.classAll);if(!t)return;t.classes=selectedGrades();markSetup();render();notify('✓ All '+t.classes.length+' offered classes selected for '+t.name+'.');return}
 if(target.hasAttribute('data-class-clear')){const t=teacher(target.dataset.classClear);if(!t)return;const assignedBooks=bookList().filter(b=>b.teacherId===t.id&&b.active);if(assignedBooks.length&&!confirm('Clearing classes will unassign '+assignedBooks.length+' subjects from '+t.name+'. Continue?'))return;t.classes=[];for(const b of assignedBooks){b.teacherId='';b.active=false}markSetup();render();notify('Classes cleared for '+t.name+'. Other teachers’ classes remain unchanged.');return}
 if(target.hasAttribute('data-school-class')){const n=Number(target.dataset.schoolClass),i=setup.selectedClasses.indexOf(n);if(i>=0){if(!confirm('Remove Class '+roman[n]+' from active classes? Existing lesson titles stay saved if you add it back.'))return;setup.selectedClasses.splice(i,1);for(const t of setup.teachers)t.classes=t.classes.filter(x=>x!==n);for(const b of setup.books[n]||[]){b.active=false;b.teacherId=''}}else setup.selectedClasses.push(n);grade=selectedGrades()[0]||5;markSetup();return render()}
 if(target.hasAttribute('data-classes-all')){setup.selectedClasses=[1,2,3,4,5];markSetup();return render()}
 if(target.hasAttribute('data-classes-none')){if(!confirm('Remove all selected classes?'))return;setup.selectedClasses=[];for(const t of setup.teachers)t.classes=[];for(const n of numbers)for(const b of setup.books[n]||[]){b.active=false;b.teacherId=''}markSetup();return render()}
 if(target.hasAttribute('data-assignment-togglegrade')){
  const g=Number(target.dataset.assignmentTogglegrade);
  if(assignmentEditorId&&assignmentEditorDraft?.grade===g&&!await saveAssignmentEditor())return;
  if(assignmentCollapsedGrades.has(g))assignmentCollapsedGrades.delete(g);else assignmentCollapsedGrades.add(g);
  if(addingSubjectGrade===g)addingSubjectGrade=null;
  render();return;
 }
 if(target.hasAttribute('data-assignment-selectall')){
  const g=Number(target.dataset.assignmentSelectall),t=currentAssignedTeacher();
  if(!t.classes.includes(g))return notify('This teacher is not assigned to Class '+roman[g]+'.',true);
  if(!await saveAssignmentEditor())return;
  let added=0,duplicates=[];
  for(const b of setup.books[g]||[]){
   if(b.active&&b.teacherId&&b.teacherId!==t.id)continue;
   if(duplicateName(g,b.name,b.id)){duplicates.push(b.name);continue}
   if(!(b.active&&b.teacherId===t.id)){b.active=true;b.teacherId=t.id;added++}
  }
  if(added)markSetup();
  render();
  notify((added?'✓ '+added+' new subject'+(added===1?'':'s')+' ticked for '+t.name+'. ':'No more subjects to assign. ')+(duplicates.length?'⚠ '+duplicates.length+' duplicate subject name(s) skipped.':'Other teachers’ subjects remain unavailable.'),!!duplicates.length);
  return;
 }
 if(target.hasAttribute('data-assignment-clear')){
  const g=Number(target.dataset.assignmentClear),t=currentAssignedTeacher();
  const mine=(setup.books[g]||[]).filter(b=>b.active&&b.teacherId===t.id);
  if(!mine.length)return;
  if(!confirm('Clear all '+mine.length+' selected Class '+roman[g]+' subjects from '+t.name+'? Other teachers’ assignments will stay unchanged.'))return;
  if(!await saveAssignmentEditor())return;
  for(const b of mine){b.active=false;b.teacherId=''}
  markSetup();render();notify(mine.length+' subjects cleared for '+t.name+'.');return;
 }
 if(target.hasAttribute('data-assignment-restoregrade')){
  const g=Number(target.dataset.assignmentRestoregrade);
  if(!await saveAssignmentEditor())return;
  const existing=new Set((setup.books[g]||[]).map(b=>normalizedSubject(b.name)));
  let added=0;
  for(const b of defaultBooks(g)){const name=normalizedSubject(b.name);if(!existing.has(name)){setup.books[g].push(b);existing.add(name);added++}}
  assignmentCollapsedGrades.delete(g);
  if(added)markSetup();
  render();
  notify(added?'✓ '+added+' missing Class '+roman[g]+' standard subjects restored. Existing teacher assignments and custom subjects preserved.':'✓ All Class '+roman[g]+' standard subjects are already present. If none are available, view the assigned subjects and manage their current teachers.');
  return;
 }
 if(target.hasAttribute('data-assignment-jumpteacher')){const teacherId=target.dataset.assignmentJumpteacher,index=setup.teachers.findIndex(x=>x.id===teacherId);return moveAssignmentTeacher(index)}
 if(target.hasAttribute('data-assignment-teacher'))return moveAssignmentTeacher(Number(target.dataset.assignmentTeacher));
 if(target.hasAttribute('data-assignment-prev'))return moveAssignmentTeacher(assignmentTeacherIndex-1);
 if(target.hasAttribute('data-assignment-next'))return moveAssignmentTeacher(assignmentTeacherIndex+1);
 if(target.hasAttribute('data-assignment-addsubject')){if(!await saveAssignmentEditor())return;const g=Number(target.dataset.assignmentAddsubject);assignmentCollapsedGrades.delete(g);addingSubjectGrade=g;render();setTimeout(()=>$s('assignmentNewName')?.focus(),50);return}
 if(target.hasAttribute('data-assignment-canceladd')){addingSubjectGrade=null;render();return}
 if(target.hasAttribute('data-assignment-confirmadd')){const g=Number(target.dataset.assignmentConfirmadd),title=$s('assignmentNewName')?.value?.trim().replace(/\s+/g,' ')||'',t=currentAssignedTeacher(),total=Number($s('assignmentNewTotal')?.value);if(!Number.isInteger(total)||total<1||total>250)return notify('Enter total chapters / lessons (1–250).',true);if(!title)return notify('Enter a name for the new subject.',true);if(title.length>120)return notify('Subject name is too long.',true);if(duplicateName(g,title))return notify('⚠ DUPLICATE SUBJECT: "'+title+'" already exists for Class '+roman[g]+'. Please choose another subject name.',true);if(!t.classes.includes(g))return notify('This teacher does not teach Class '+roman[g]+'.',true);const id=g+'_custom_'+crypto.randomUUID().slice(0,12);setup.books[g].push({id,name:title,chapters:Array(total).fill(''),active:true,teacherId:t.id,previous:0,current:0});addingSubjectGrade=null;markSetup();render();notify('✓ "'+title+'" added and assigned only to '+t.name+'.');return}
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
 if(target.hasAttribute('data-studio-addteacher')){setup.teachers.push({id:'t'+crypto.randomUUID().replace(/-/g,'').slice(0,12),name:'',pid:'',designation:'',classes:[]});markSetup();return render()}
 if(target.dataset.studioRemoveteacher){if(setup.teachers.length<=1)return;const id=target.dataset.studioRemoveteacher;if(!confirm('Remove this teacher and unassign their subjects?'))return;setup.teachers=setup.teachers.filter(t=>t.id!==id);assignmentTeacherIndex=Math.min(assignmentTeacherIndex,setup.teachers.length-1);clearAssignmentEditor();for(const b of bookList())if(b.teacherId===id){const orig=findBook(b.grade,b.id);orig.active=false;orig.teacherId=''}markSetup();return render()}
 if(target.dataset.studioGrade){grade=+target.dataset.studioGrade;expanded='';return render()}
 if(target.dataset.studioEditbook){expanded=expanded===target.dataset.studioEditbook?'':target.dataset.studioEditbook;return render()}
 if(target.dataset.studioRemovebook){if(!confirm('Remove this subject from your school course list?'))return;setup.books[grade]=setup.books[grade].filter(b=>b.id!==target.dataset.studioRemovebook);markSetup();return render()}
 if(target.hasAttribute('data-studio-addbook')){const name=prompt('Name of the new subject or textbook:');if(!name?.trim())return;const id=grade+'_custom_'+crypto.randomUUID().slice(0,8);setup.books[grade].push({id,name:name.trim(),chapters:[],active:false,teacherId:'',previous:0,current:0});expanded=id;markSetup();return render()}
 if(target.dataset.studioAddchapter){const b=findBook(grade,target.dataset.studioAddchapter);if(b?.chapters.length<250)b.chapters.push('');markSetup();return render()}
 if(target.dataset.studioRemovechapter){const b=findBook(grade,target.dataset.studioRemovechapter);if(!b)return;b.chapters.splice(Number(target.dataset.i),1);markSetup();return render()}
 if(target.dataset.studioSaveclose){try{await settleSetup();expanded='';render();notify('✓ Subject updates saved. The card is minimized until you open it again.')}catch(e){notify(e.message,true)}return}
 if(target.hasAttribute('data-teacher-tab')){filterTeacher=target.dataset.teacherTab;saveTeacherPreference();render();return}
 if(target.hasAttribute('data-progress-addclass')){const tid=filterTeacher,t=teacher(tid);if(!t)return;const raw=$s('studioClassQuickPick')?.value;if(!raw)return notify('Choose a class to add.',true);const g=Number(raw);if(!Number.isInteger(g)||g<1||g>8)return notify('Please choose a class from 1 to 8.',true);if(!setup.selectedClasses.includes(g))setup.selectedClasses.push(g);if(!Array.isArray(t.classes))t.classes=[];if(!t.classes.includes(g))t.classes.push(g);if(!Array.isArray(setup.books[g]))setup.books[g]=defaultBooks(g);markSetup();render();return}
 if(target.hasAttribute('data-progress-addsubject')){const t=teacher(filterTeacher),g=Number($s('studioNewSubjectClass')?.value),name=($s('studioNewSubjectName')?.value||'').trim(),n=Number($s('studioNewSubjectTotal')?.value);if(!t||!t.classes.includes(g))return notify('Choose a teacher and assigned class first.',true);if(!name||!Number.isInteger(n)||n<1||n>250)return notify('Enter subject name and total chapters / lessons (1–250).',true);if(duplicateName(g,name))return notify('Subject already exists for this class. Please select or edit it instead.',true);setup.books[g].push({id:g+'_custom_'+crypto.randomUUID().slice(0,12),name,chapters:Array(n).fill(''),active:true,teacherId:t.id,previous:0,current:0});markSetup();render();notify('✓ Class '+roman[g]+' · '+name+' added for '+t.name);return}
 if(target.hasAttribute('data-progress-claimsubject')){const t=selectedTeacher(),choice=$s('studioExistingSubject')?.value||'',parts=choice.split('::'),g=Number(parts[0]),b=findBook(g,parts[1]);if(!t||!b||!t.classes.includes(g)||b.active&&b.teacherId)return notify('Pick an unassigned subject from a class this teacher teaches.',true);b.active=true;b.teacherId=t.id;markSetup();render();notify('✓ Class '+roman[g]+' · '+b.name+' assigned to '+t.name);return}
 if(target.hasAttribute('data-progress-manage')){const card=target.closest('[data-progress-card]');if(!card)return;const menu=card.querySelector('[data-progress-edittools]');if(menu){menu.hidden=!menu.hidden;target.setAttribute('aria-expanded',String(!menu.hidden))}return}
 if(target.hasAttribute('data-progress-rename')){const b=assigned().find(x=>x.id===target.dataset.progressRename);if(!b)return;const next=prompt('Subject name:',b.name);if(next===null)return;const name=next.trim();if(!name||duplicateName(b.grade,name,b.id))return notify('Enter a unique subject name.',true);findBook(b.grade,b.id).name=name;markSetup();render();return}
 if(target.hasAttribute('data-progress-remove')){const b=assigned().find(x=>x.id===target.dataset.progressRemove);if(!b||!confirm('Remove '+b.name+' from Class '+roman[b.grade]+'? Past Excel exports remain in history.'))return;setup.books[b.grade]=setup.books[b.grade].filter(x=>x.id!==b.id);markSetup();render();return}
 if(target.hasAttribute('data-studio-openmonth')){return openPeriod($s('studioMonthInput').value)}
 if(target.hasAttribute('data-studio-refresh'))return loadEntries();
 if(target.dataset.studioSavesub){if(lessonNameDraft?.bookId===target.dataset.studioSavesub&&!await saveLessonNames())return;return saveSubject(target.dataset.studioSavesub)}
 }
 function handleInput(e){const el=e.target;
 if(el.id==='studioProgressSearch'){progressSearch=el.value;progressVisibleFilter();return}
 
 if(el.hasAttribute('data-lesson-title')&&lessonNameDraft?.bookId===el.dataset.lessonTitle){lessonNameDraft.chapters[Number(el.dataset.lessonTitleIndex)]=el.value;return}
 if(el.hasAttribute('data-lesson-newname')&&lessonNameDraft?.bookId===el.dataset.lessonNewname){lessonNameDraft.newInput=el.value;return}
 if(el.hasAttribute('data-lesson-pasteinput')&&lessonNameDraft?.bookId===el.dataset.lessonPasteinput){lessonNameDraft.batchInput=el.value;return}
 if(el.hasAttribute('data-assignment-editname')&&assignmentEditorDraft){assignmentEditorDraft.name=el.value;return}if(el.hasAttribute('data-assignment-chapter')&&assignmentEditorDraft){assignmentEditorDraft.chapters[Number(el.dataset.assignmentChapter)]=el.value;return}if(el.dataset.tid){const t=teacher(el.dataset.tid);if(t)t[el.dataset.field]=el.value;markSetup();return}
 if(el.dataset.studioSubname){let b=findBook(grade,el.dataset.studioSubname);if(b)b.name=el.value;markSetup();return}
 if(el.dataset.studioChapter){let b=findBook(grade,el.dataset.studioChapter);if(b)b.chapters[+el.dataset.i]=el.value;markSetup();return}
 if(el.dataset.progressBid){if(periodStatus!=='draft')return;if(!schoolPeriod){startMonthForTyping(el.dataset.progressBid,el.dataset.pkey,el.value);return}updateEntry(el.dataset.progressBid,el.dataset.pkey,el.value);return}}
 function handleChange(e){const el=e.target;
 if(periodStatus!=='draft'&& (el.dataset.progressSuggestionselect||el.dataset.progressBid||el.dataset.progressTotal)){notify('Reopen Draft to edit this report.',true);return}
 if(el.dataset.progressSuggestionselect){const bid=el.dataset.progressSuggestionselect,card=el.closest('[data-progress-card]'),box=card?.querySelector('textarea[data-pkey="suggestion"]');if(el.value==='__custom'){if(box){box.hidden=false;box.focus();updateEntry(bid,'suggestion',box.value.trim())}}else{if(box){box.hidden=true;box.value=''}if(!schoolPeriod){startMonthForTyping(bid,'suggestion',el.value)}else updateEntry(bid,'suggestion',el.value)}return}
 if(el.dataset.progressBid){if(!schoolPeriod){startMonthForTyping(el.dataset.progressBid,el.dataset.pkey,el.value)}else updateEntry(el.dataset.progressBid,el.dataset.pkey,el.value);return}
 if(el.dataset.progressTotal){const b=assigned().find(x=>x.id===el.dataset.progressTotal);if(!b)return;const n=Number(el.value),details=progressBy(b);if(!Number.isInteger(n)||n<1||n>250||n<Number(details.previous||0)+Number(details.current||0)){notify('Total must be 1–250 and cannot be below already completed chapters.',true);el.value=b.chapters.length;return}const real=findBook(b.grade,b.id);while(real.chapters.length<n)real.chapters.push('');real.chapters.length=n;markSetup();render();return}if(el.id==='studioMonthInput'){if(el.value&&el.value!==schoolPeriod)openPeriod(el.value);return}if(el.hasAttribute('data-assignment-edittotal')&&assignmentEditorDraft){const n=Math.max(0,Math.min(250,Number(el.value)||0));while(assignmentEditorDraft.chapters.length<n)assignmentEditorDraft.chapters.push('');assignmentEditorDraft.chapters.length=n;render();return}if(el.dataset.classTid){const t=teacher(el.dataset.classTid),n=+el.value;if(!t)return;if(el.checked){if(!t.classes.includes(n))t.classes.push(n)}else{t.classes=t.classes.filter(x=>x!==n);for(const b of setup.books[n]||[])if(b.teacherId===t.id){b.teacherId='';b.active=false}}markSetup();return render()}
 if(el.dataset.assignTid){const g=Number(el.dataset.assignGrade),t=teacher(el.dataset.assignTid),b=findBook(g,el.dataset.assignBid);if(!b||!t)return;if(el.checked){if(b.active&&b.teacherId&&b.teacherId!==t.id){el.checked=false;notify('⚠ DUPLICATE ASSIGNMENT BLOCKED: "'+b.name+'" (Class '+roman[g]+') is already assigned to '+tname(b.teacherId)+'. It cannot be assigned to a second teacher.',true);return}if(!t.classes.includes(g)){el.checked=false;notify('Teacher is not assigned to this class.',true);return}if(duplicateName(g,b.name,b.id)){el.checked=false;notify('⚠ DUPLICATE SUBJECT NAME: "'+b.name+'" is already listed for Class '+roman[g]+'. Rename duplicate subjects first.',true);return}b.active=true;b.teacherId=t.id}else if(b.teacherId===t.id){b.active=false;b.teacherId=''}markSetup();return render()}
 if(el.dataset.studioCount){let b=findBook(grade,el.dataset.studioCount);if(b){let n=Math.max(0,Math.min(250,Number(el.value)||0));while(b.chapters.length<n)b.chapters.push('');b.chapters.length=n;markSetup();return render()}}
 if(el.id==='studioTeacherFilter'){filterTeacher=el.value;if(filterTeacher==='all')rememberTeacher=false;saveTeacherPreference();return render()}
 if(el.id==='studioRememberTeacher'){rememberTeacher=Boolean(el.checked)&&filterTeacher!=='all';saveTeacherPreference();return}
 }
 function bind(){document.addEventListener('keydown',e=>{const el=e.target;if(e.key==='Enter'&&el?.dataset?.progressBid&&['previous','current'].includes(el.dataset.pkey)){e.preventDefault();const all=[...document.querySelectorAll('#studioBody input[data-progress-bid][data-pkey]')].filter(x=>!x.closest('[hidden]')&&['previous','current'].includes(x.dataset.pkey));const idx=all.indexOf(el);if(idx>=0&&idx<all.length-1)all[idx+1].focus();else el.blur()}});document.addEventListener('focusin',e=>{const el=e.target;if(!schoolPeriod&&el?.dataset?.progressBid&&['previous','current'].includes(el.dataset.pkey))startMonthForTyping(el.dataset.progressBid,el.dataset.pkey)});document.addEventListener('click',e=>{if(e.target.closest('#studioPanel'))handleClick(e)});document.addEventListener('input',e=>{if(e.target.closest('#studioPanel'))handleInput(e)});document.addEventListener('change',e=>{if(e.target.closest('#studioPanel'))handleChange(e)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&schoolPeriod&&$s('studioPanel')&&!$s('studioPanel').classList.contains('hidden'))loadEntries()});
 refreshHandle=setInterval(()=>{if(!document.hidden&&schoolPeriod&&auth&&!auth.admin&&stage===5&&!progressDirty.size)loadEntries()},18000);
 }
 bind();
 const originalPostLogin=postLogin;postLogin=async function(result){await originalPostLogin(result);if(!auth.admin)await activate();return result};
 const otherDashTab=dashTab;dashTab=function(tab,button){if($s('studioPanel'))$s('studioPanel').classList.add('hidden');return otherDashTab(tab,button)};
 // Restore the studio if the school session existed before a page refresh.
 setTimeout(()=>{if(auth&&!auth.admin&&account)activate()},1700);
 return{activate,openPeriod,review,showPanel,saveSetup,settle,setStatus:workflowAction,status:()=>periodStatus,refresh:loadEntries,markExported:async()=>{if(!schoolPeriod)return;try{const r=await api('load-workflow',{period:schoolPeriod});periodWorkflow=r.workflow;periodStatus=periodWorkflow.status;render()}catch(e){notify('Excel saved; refresh status to view the archive: '+e.message,true)}},unsaved:()=>Boolean(setupDirty||setupBusy||setupTimer||assignmentEditorId||addingSubjectGrade!==null||lessonNameDraft||progressDirty.size||progressBusy.size),getSetup:()=>setup,api,stage:setupStage};
})();
