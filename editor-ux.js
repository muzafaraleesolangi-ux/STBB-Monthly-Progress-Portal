'use strict';
(function(){
const steps=[
 {page:'home',name:'Overview',hint:'Start with the school profile. The progress report has five guided stages.',next:'school',action:'Set Up School & Teachers'},
 {page:'school',name:'School & Teachers',hint:'Check HM details, add teachers and their PIDs. Each teacher can later choose their assigned subjects.',next:'course',action:'Next: Select Subjects'},
 {page:'course',name:'Course Builder',hint:'Select a class, review its books and chapter counts. Edit, add or remove lessons to match the textbook.',next:'progress',action:'Next: Enter Monthly Progress'},
 {page:'progress',name:'Monthly Progress',hint:'Assign teachers and fill covered chapters, notebooks, classroom management and formative assessment for each subject. Changes save to the school draft.',next:'export',action:'Next: Review & Export'},
 {page:'export',name:'Excel Export',hint:'Review totals, then download the one-sheet Proforma. A copy of exported work is also stored in your school report history.',next:'school',action:'Review School Details'}
];
const wrapper=document.querySelector('.content');
if(!wrapper)return;
const coach=document.createElement('div');coach.id='smartCoach';coach.className='smartCoach';
coach.innerHTML='<div class="coachCounter"><span>GUIDED PROGRESS</span><div id="coachBar" class="coachBar"><i></i></div></div><div class="coachNarrative"><b id="coachTitle"></b><small id="coachHint"></small></div><button id="coachNext" class="coachNext" type="button"></button>';
wrapper.prepend(coach);
function updateCoach(){
 let i=Math.max(0,steps.findIndex(s=>s.page===page)),s=steps[i];
 document.getElementById('coachTitle').textContent='Step '+(i+1)+' / '+steps.length+' · '+s.name;
 document.getElementById('coachHint').textContent=s.hint;
 document.querySelector('#coachBar i').style.width=((i+1)*100/steps.length)+'%';
 document.getElementById('coachNext').textContent=s.action+' →';
 coach.dataset.stage=s.page;
}
document.getElementById('coachNext').addEventListener('click',()=>{
 let s=steps.find(x=>x.page===page);if(s)navigate(s.next);
});
const oldNavigate=navigate;
navigate=function(destination){const r=oldNavigate(destination);updateCoach();return r};
const saveBtn=document.getElementById('saveNow');
saveBtn.onclick=function(){
 if(window.parent!==window){save();window.parent.postMessage({type:'mpr-manual-save'},location.origin);}
 else save(false);
};
saveBtn.title='Save your working report to the online school draft. Changes are also saved automatically.';
function addGuideToProgress(){
 const progress=document.getElementById('progress');
 if(!progress||progress.querySelector('#progressCoachInfo'))return;
 const box=document.createElement('div');box.id='progressCoachInfo';box.className='progressCoachInfo';
 box.textContent='✓ Tip: Open your assigned class and subject, fill its progress details and press Save Draft before you finish. If another teacher updated the same month first, refresh to avoid overwriting.';
 const element=progress.querySelector('.lead');
 if(element)element.insertAdjacentElement('afterend',box);
}
addGuideToProgress();
updateCoach();
})();