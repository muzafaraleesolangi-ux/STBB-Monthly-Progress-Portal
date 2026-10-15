'use strict';
/* Progressive enhancement. The signed-in school remains the authority for drafts. */
const monthNames=['January','February','March','April','May','June','July','August','September','October','November','December'];
const uxCurrentDate=new Date();
const monthSelect=document.getElementById('newMonthName'),yearSelect=document.getElementById('newMonthYear');
for(let y=Math.max(2022,uxCurrentDate.getFullYear()-5);y<=uxCurrentDate.getFullYear()+3;y++){
 const o=document.createElement('option');o.value=String(y);o.textContent=String(y);yearSelect.appendChild(o);
}
monthSelect.value=String(uxCurrentDate.getMonth()+1).padStart(2,'0');yearSelect.value=String(uxCurrentDate.getFullYear());
function currentMonthPeriod(){return yearSelect.value+'-'+monthSelect.value}
function showMonthGuide(){
 const p=currentMonthPeriod(),known=periods.some(x=>x.period===p);
 document.getElementById('monthGuide').textContent=known?
 '✓ Draft already saved for '+monthNames[Number(monthSelect.value)-1]+' '+yearSelect.value+'. Press Open / Start Month to continue from your last saved progress.':
 '✦ New reporting month. Press Open / Start Month to begin; earlier covered chapters carry forward when a previous month exists. Next, open School & Teachers, assign subjects, enter progress and save.';
}
monthSelect.addEventListener('change',showMonthGuide);yearSelect.addEventListener('change',showMonthGuide);
window.openSelectedMonth=async function(){
 const p=currentMonthPeriod();
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(p)){return showSaveToast('Select a month','Choose a valid month and year.','error')}
 await openMonth(p);
 refreshSaveDock();
};
const signupForm=document.getElementById('signupForm');
const fieldGuidance=[
 ['semis','Step 1 — SEMIS Username','Enter the 8–12 digit SEMIS Code registered for your school. Teachers will use this as the sign-in username.'],
 ['school_name','Step 2 — School Name','Enter the official school name as shown in the school record.'],
 ['hm_name','Step 3 — Head Teacher','Enter the full name of the Head Master or Head Mistress.'],
 ['hm_gender','Step 4 — HM Gender','Select Male for Head Master or Female for Head Mistress. The Excel Proforma will show the appropriate head designation.'],
 ['password','Step 5 — Create Password','Use any mix of letters, numbers and symbols, 8–128 characters. It does not need to be numbers only.'],
 ['confirm_password','Step 6 — Confirm Password','Re-enter your chosen password. Then tick the acknowledgement and create the school account.']
];
function updateSignupGuide(key){
 let i=Math.max(0,fieldGuidance.findIndex(x=>x[0]===key));const [id,title,desc]=fieldGuidance[i];
 document.getElementById('signupGuideTitle').textContent=title;
 document.getElementById('signupGuideText').textContent=desc;
 document.getElementById('signupGuideCounter').textContent=(i+1)+' / 6';
 const guide=document.getElementById('signupGuide');guide.style.setProperty('--guide-width',((i+1)*100/6)+'%');
}
signupForm.addEventListener('focusin',e=>{if(e.target.name)updateSignupGuide(e.target.name)});
signupForm.addEventListener('input',e=>{
 if(e.target.name==='password'){const v=e.target.value;const variety=[/[a-z]/i.test(v),/[0-9]/.test(v),/[^\w\s]/.test(v)].filter(Boolean).length;
 const strength=v.length===0?0:v.length<8?15:Math.min(100,(v.length>=12?55:35)+variety*15);
 const bar=document.getElementById('passwordStrengthBar');bar.style.width=strength+'%';bar.style.background=strength>=80?'#049778':strength>=50?'#dda41e':'#dc6a55';
 document.getElementById('passwordStrengthText').textContent=v.length<8?'Enter at least 8 characters.':strength>=80?'Good — your password uses a stronger combination.':'Tip: Add more characters and mix letters, numbers and symbols for better security.';
 }
 if(e.target.name==='password'||e.target.name==='confirm_password'){
 const p=signupForm.elements.password.value,c=signupForm.elements.confirm_password.value;const hint=document.getElementById('confirmHint');
 hint.textContent=c?(c===p?'✓ Passwords match':'Passwords do not match yet.'):'Type the same password again to confirm.';
 hint.style.color=c&&c!==p?'#ae3e36':'';
 }
});
document.querySelectorAll('[data-toggle-pass]').forEach(b=>b.addEventListener('click',()=>{
 const input=document.getElementById(b.dataset.togglePass);
 input.type=input.type==='password'?'text':'password';b.textContent=input.type==='password'?'Show':'Hide';
 input.focus();
}));
const dialog=document.getElementById('saveDialog'),dialogTitle=document.getElementById('saveDialogTitle'),dialogBody=document.getElementById('saveDialogBody'),
dialogActions=document.getElementById('saveDialogActions'),dialogIcon=document.getElementById('saveDialogIcon');
let saveToastTimer=null,uxDialogMode='save';
function showSaveToast(title,details='',type='success'){
 const el=document.getElementById('saveToast');
 el.innerHTML='<span class="toastGlyph">'+(type==='success'?'✓':'!')+'</span><span><strong></strong><small></small></span>';
 el.querySelector('strong').textContent=title;
 el.querySelector('small').textContent=details;
 el.classList.remove('hidden','error');if(type==='error')el.classList.add('error');
 clearTimeout(saveToastTimer);saveToastTimer=setTimeout(()=>el.classList.add('hidden'),4200);
}
window.closeSaveDialog=function(){dialog.classList.add('hidden');dialogActions.innerHTML='';uxDialogMode='save';};
function displaySaveDialog(mode){
 uxDialogMode=mode;dialog.classList.remove('hidden');
 const logout=mode==='logout';dialogIcon.textContent=logout?'⚠':'💾';
 dialogTitle.textContent=logout?'Save your draft before signing out':'Save your report to the cloud';
 dialogBody.textContent=logout?'You have edits that have not finished saving. Save this month\'s report now so the next teacher can continue where you stopped.':'Your subject progress, teacher assignments and classroom details will be saved in this school\'s current reporting month.';
 dialogActions.innerHTML='';
 const primary=document.createElement('button');primary.className='btn primary';primary.type='button';primary.textContent=logout?'Save Draft & Sign Out':'Save Draft Now';
 primary.addEventListener('click',logout?saveAndLogout:confirmSaveNow);
 const cancel=document.createElement('button');cancel.className='btn ghost';cancel.type='button';cancel.textContent=logout?'Continue Editing':'Not Now';cancel.addEventListener('click',closeSaveDialog);
 dialogActions.append(primary,cancel);
 document.getElementById('saveDialogHint').textContent=logout?'Your school data will remain available after you sign in again.':'You can reopen saved months from the school dashboard.';
 primary.focus();
}
function changesUnsaved(){return Boolean(saveTimer||pendingState||saving||(typeof Studio!=="undefined"&&Studio.unsaved?.()))}
async function saveAllSchoolEdits(){const base=await flushDraft();if(typeof Studio!=="undefined"&&Studio.unsaved?.()){try{await Studio.settle()}catch(err){showSaveToast("Studio draft not saved",err.message,"error");return false}}return base&&!changesUnsaved()}
const baseFlushDraft=flushDraft;
flushDraft=async function(){
 if(saving){
  let tries=0;
  while(saving&&tries++<100)await new Promise(resolve=>setTimeout(resolve,100));
  if(saving)return false;
 }
 if(!pendingState)return true;
 await baseFlushDraft();
 let tries=0;
 while(saving&&tries++<100)await new Promise(resolve=>setTimeout(resolve,100));
 if(saving)return false;
 return !pendingState&&!saveTimer;
};
function refreshSaveDock(){
 const dock=document.getElementById('saveFloat'),btn=document.getElementById('floatingSaveBtn');
 if(!dock||!btn)return;
 const visible=!!auth&&!auth.admin&&activeView==='schooldash'&&(typeof Studio==='undefined'||Studio.status?.()==='draft');dock.classList.toggle('hidden',!visible);
 if(!visible)return;
 btn.disabled=saving;btn.textContent=saving?'Saving…':'Save Draft';
}
window.manualSaveDraft=async function(){
 if(!auth)return showSaveToast('Sign in required','','error');
 const btn=document.getElementById('floatingSaveBtn');
 if(btn){btn.disabled=true;btn.textContent='Saving…'}
 try{
  if(auth.admin){if(!adminEdit)return showSaveToast('Open a draft to save','','error');await saveAllSchoolEdits()}
  else{
   if(typeof Studio!=='undefined'&&Studio.getSetup())await Studio.settle();
   if(pendingState)await flushDraft();
   if(changesUnsaved())throw Error('Some changes are still syncing. Please retry.');
  }
  showSaveToast('Draft saved','Your current work is stored securely.');
 }catch(e){showSaveToast('Could not save draft',e.message,'error')}
 finally{refreshSaveDock()}
};
window.confirmSaveNow=async function(){
 let btn=dialogActions.querySelector('.primary');if(btn){btn.disabled=true;btn.textContent='Saving to cloud…'}
 const result=await saveAllSchoolEdits();
 if(result&&!changesUnsaved()){closeSaveDialog();showSaveToast('Draft saved successfully','Your latest work is securely linked to this reporting month.');}
 else {if(btn){btn.disabled=false;btn.textContent='Try Save Again'}showSaveToast('Draft not saved','Check the connection or resolve the warning above, then try again.','error')}
 refreshSaveDock();
};
const originalLogout=logout;
logout=async function(){
 if(!auth)return originalLogout();
 if(!auth.admin&&period&&changesUnsaved()){displaySaveDialog('logout');return}
 return originalLogout();
};
window.saveAndLogout=async function(){
 let btn=dialogActions.querySelector('.primary');if(btn){btn.disabled=true;btn.textContent='Saving…'}
 const result=await saveAllSchoolEdits();
 if(result&&!changesUnsaved()){
  closeSaveDialog();showSaveToast('Draft saved','Signing you out now.');
  await originalLogout();
 }else{
  if(btn){btn.disabled=false;btn.textContent='Try Save & Sign Out Again'}
  showSaveToast('Unsaved work','Sign out stopped. Please resolve the save problem or continue editing.','error');
 }
 refreshSaveDock();
};
window.addEventListener('beforeunload',e=>{
 if(!auth?.admin&&period&&changesUnsaved()){e.preventDefault();e.returnValue='';}
});
window.addEventListener('message',e=>{
 if(e.origin!==location.origin)return;
 if(e.data?.type==='mpr-save')setTimeout(refreshSaveDock,30);
 if(e.data?.type==='mpr-manual-save')setTimeout(manualSaveDraft,65);
});
const previousShow=show;
show=function(...args){const result=previousShow(...args);refreshSaveDock();if(args[0]==='schooldash')showMonthGuide();return result};
const previousStatus=status;
status=function(...args){const result=previousStatus(...args);setTimeout(refreshSaveDock,25);return result};
const previousDashTab=dashTab;
dashTab=function(tab,...args){const result=previousDashTab(tab,...args);refreshSaveDock();return result};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.classList.contains('hidden'))closeSaveDialog();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&auth&&!auth.admin){e.preventDefault();manualSaveDraft()}});
setInterval(refreshSaveDock,1100);
refreshSaveDock();
