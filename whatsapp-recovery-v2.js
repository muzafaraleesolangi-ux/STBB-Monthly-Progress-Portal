'use strict';
/* Recovery: request -> admin approves -> WhatsApp prefilled link -> Create Account using token -> old records preserved */
(()=>{
 const ROOT='https://muzafaraleesolangi-ux.github.io/STBB-Monthly-Progress-Portal/';
 const hash=new URLSearchParams(location.hash.replace(/^#/,''));
 let resetToken=hash.get('recreate')||'',resetSemis=hash.get('semis')||'';
 if(!/^[0-9]{8,12}$/.test(resetSemis)||resetToken.length<25){resetToken='';resetSemis='';}
 if(resetToken)history.replaceState(null,'',location.pathname+location.search);
 const signup=document.getElementById('signupForm');
 const requestForm=document.getElementById('resetRequestForm');
 const resetSection=document.getElementById('reset');
 if(!signup||!requestForm||!resetSection)return;
 const info=document.createElement('div');info.className='waRecoveryIntro hidden';info.id='resetSignupNotice';
 info.innerHTML='<span class="waApprovalIcon">✓</span><strong>Approved School Account Reset</strong><p>The administrator has approved access recovery. Enter the SAME school SEMIS, official school name and HM name, and create a NEW password. Your saved drafts, teachers, monthly reports and exports will remain unchanged.</p>';
 signup.before(info);
 if(resetToken){
  signup.elements.semis.value=resetSemis;
  const heading=document.querySelector('#signup h2');if(heading)heading.textContent='Create a New School Password & Resume';
  info.classList.remove('hidden');
  document.getElementById('signupGuideTitle').textContent='Account reset approved — create access again';
  document.getElementById('signupGuideText').textContent='Use the same SEMIS Code, school name and HM name as your previous account, and create a fresh password. No data will be deleted.';
 }
 const oldSignup=signup.onsubmit;
 signup.onsubmit=async e=>{
  if(!resetToken)return oldSignup.call(signup,e);
  e.preventDefault();
  const f=formObj(signup);
  if(f.password!==f.confirm_password){setNotice('signupMsg','Passwords do not match.');return}
  if(f.semis!==resetSemis){setNotice('signupMsg','Use the SEMIS Code attached to this approved reset link.');return}
  setNotice('signupMsg','Restoring access and connecting saved school work…');
  try{
   const result=await request('reset-signup',{semis:f.semis,school_name:f.school_name,hm_name:f.hm_name,password:f.password,reset_token:resetToken},false);
   resetToken='';resetSemis='';info.classList.add('hidden');await postLogin(result);
  }catch(err){setNotice('signupMsg',err.message)}
 };
 const help=resetSection.querySelector('h2');if(help)help.textContent='Forgot School Password?';
 const description=resetSection.querySelector('.desc');
 if(description)description.textContent='Enter your school’s SEMIS Code, official school name, Head Teacher name and WhatsApp number. Your request will go to the administrator for verification and approval.';
 requestForm.innerHTML='<div class="field"><label>School SEMIS Code</label><input name="semis" inputmode="numeric" pattern="[0-9]{8,12}" maxlength="12" placeholder="School SEMIS Username" required></div>'+
  '<div class="field"><label>Official School Name</label><input name="school_name" maxlength="220" required placeholder="Same name as registered school"></div>'+
  '<div class="field"><label>Head Master / Head Mistress Name</label><input name="hm_name" maxlength="180" required placeholder="Name registered with your school"></div>'+
  '<div class="field"><label>Head Teacher WhatsApp Number</label><input name="phone" inputmode="tel" maxlength="35" required placeholder="03XXXXXXXXX"><small>This same number will appear in the administrator’s recovery request, with a direct WhatsApp button.</small></div>'+
  '<button class="btn primary" type="submit">Send Account Reset Request →</button>'+
  '<div class="notice" id="resetMsg" role="status" aria-live="polite"></div>'+
  '<div class="recoveryPromise">🔒 Account reset changes ONLY your login. Your saved monthly drafts, subject entries, teacher profiles and exported reports stay safely stored in the database.</div>';
 // Remove manual recovery-code UI. Only the approved signup link restores access.
 const recovery=resetSection.querySelector('#recoveryForm');if(recovery)recovery.remove();
 let h=Array.from(resetSection.querySelectorAll('h3')).find(x=>/Approved|Code/i.test(x.textContent));
 if(h)h.remove();const hr=resetSection.querySelector('hr');if(hr)hr.remove();
 requestForm.onsubmit=async e=>{
  e.preventDefault();
  const f=formObj(requestForm);
  setNotice('resetMsg','Sending your account reset request…');
  try{
   const result=await request('request-reset',f,false);
   requestForm.querySelector('button[type="submit"]').disabled=true;
   const m=document.getElementById('resetMsg');m.className='recoverySuccess';
   m.innerHTML='<strong>✓ Account Reset Request Received</strong><p>Your request has been received by the administrator. You will be informed through WhatsApp after verification. Then open the private link, choose Create New Account and continue your saved work. Only login details will change; all your saved drafts and monthly reports remain in the backend.</p>';
  }catch(err){setNotice('resetMsg',err.message)}
 };
 function toWhatsApp(v){
  let n=String(v||'').replace(/\D/g,'');
  if(n.startsWith('00'))n=n.slice(2);
  if(n.startsWith('0'))n='92'+n.slice(1);
  else if(n.length===10&&n.startsWith('3'))n='92'+n;
  return /^92[0-9]{10}$/.test(n)?n:null;
 }
 async function approvedWhatsApp(r,button){
  const phone=toWhatsApp(r.phone);
  if(!phone){alert('This request does not contain a valid Pakistani WhatsApp number. Ask the HM to submit a new request.');return}
  if(!confirm('Have you verified the Head Teacher of SEMIS '+r.semis+' and the submitted WhatsApp number '+r.phone+'?'))return;
  const tab=window.open('about:blank','_blank');
  button.disabled=true;button.textContent='Approving reset…';
  try{
   const approved=await request('admin-approve-reset',{id:r.id});
   const link=new URL(ROOT);
   link.hash=new URLSearchParams({recreate:approved.reset_token,semis:approved.semis}).toString();
   const msg=['Assalamualaikum,','Your School Account Reset request has been APPROVED.','SEMIS Code: '+approved.semis,'Your previous school reports and drafts are SAFE.','Use this PRIVATE link to CREATE YOUR SCHOOL ACCOUNT AGAIN with a new password, then continue your saved work:','',link.toString(),'','This link can only be used once and expires in 48 hours. Please do not forward it.','— STBB Monthly Progress Portal Administration'].join('\n');
   const destination='https://wa.me/'+phone+'?text='+encodeURIComponent(msg);
   if(tab)tab.location.replace(destination);else{
    const a=document.createElement('a');a.href=destination;a.target='_blank';a.rel='noopener noreferrer';a.className='btn primary';a.textContent='Open WhatsApp & Send Message';button.after(a);
   }
   const note=document.createElement('p');note.className='waSendInstruction';note.textContent='WhatsApp opened using the exact number submitted in Forgot Password. Press Send in WhatsApp to deliver the prepared approval message.';button.after(note);
   button.textContent='✓ Approved · Send via WhatsApp';
   await loadAdmin();
  }catch(err){if(tab)tab.close();button.disabled=false;button.textContent='Retry Approval';alert(err.message)}
 }
 const previousRender=renderAdminTables;
 renderAdminTables=function(){
  previousRender();
  if(!adminData)return;
  const root=document.getElementById('admin-resets');if(!root)return;
  const search=(document.getElementById('adminSearch')?.value||'').trim().toLowerCase();
  const requests=(adminData.resets||[]).filter(r=>(r.semis+' '+r.school_name+' '+r.hm_name+' '+r.phone).toLowerCase().includes(search));
  root.innerHTML='<h2>Account Recovery Requests</h2><p class="desc">Schools submit SEMIS, school name, HM name and WhatsApp number. Verify identity first, then click Approve & WhatsApp. You never need to re-enter a phone number.</p>';
  if(!requests.length){const n=document.createElement('p');n.className='note';n.textContent='No matching account reset requests.';root.appendChild(n)}
  for(const r of requests){
   const block=document.createElement('article');block.className='feedbackquote waResetRow';
   const title=document.createElement('b');title.textContent=(r.school_name||'School')+' · SEMIS '+r.semis;
   const status=document.createElement('span');status.className='chip';status.style.marginLeft='10px';status.textContent=r.status;
   const p=document.createElement('p');p.textContent='HM: '+(r.hm_name||r.requester||'—')+' · WhatsApp: '+(r.phone||'—')+' · '+new Date(r.created_at).toLocaleString();
   block.append(title,status,p);
   if(r.status==='pending'||r.status==='approved'){
    const button=document.createElement('button');button.className='btn primary waSendBtn';button.type='button';button.textContent='↗ '+(r.status==='pending'?'Approve & Send WhatsApp':'Generate New WhatsApp Link');
    button.addEventListener('click',()=>approvedWhatsApp(r,button));block.appendChild(button);
   }
   root.appendChild(block)
  }
 };
 if(resetToken){
  const priorShow=show;
  show=function(name){return priorShow(name==='landing'?'signup':name)};
  setTimeout(()=>{if(!auth)show('signup')},200);
  setTimeout(()=>{if(!auth)show('signup')},1100);
 }
})();