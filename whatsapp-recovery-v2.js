'use strict';
/* WhatsApp recovery: HM opens private approval link; no manually typed recovery code. */
(()=>{
const resetRoot=document.getElementById('reset'),recoveryForm=document.getElementById('recoveryForm');
if(!resetRoot||!recoveryForm)return;
const urlParameters=new URLSearchParams(location.hash.replace(/^#/,''));
let privateToken=urlParameters.get('reset')||'',privateSemis=urlParameters.get('semis')||'';
if(privateToken&&/^[0-9]{8,12}$/.test(privateSemis)){
 history.replaceState(null,'',location.pathname+location.search);
}else{privateToken='';privateSemis=''}
const intro=recoveryForm.previousElementSibling;
if(intro?.tagName==='H3')intro.textContent='Re-register School Access — Approved WhatsApp Link';
recoveryForm.innerHTML='<div class="waRecoveryIntro"><span class="waApprovalIcon">✓</span><strong>Administrator-approved password recovery</strong><p>Create a new password using the private WhatsApp link. Your existing school profile, teacher records, drafts and Excel export history remain unchanged.</p></div>'+
'<div class="field"><label>School SEMIS Code</label><input name="semis" readonly required></div>'+
'<div class="field"><label>New School Password</label><input type="password" name="password" minlength="8" maxlength="128" required autocomplete="new-password" placeholder="8–128 characters · any letters, numbers or symbols"></div>'+
'<div class="field"><label>Confirm New Password</label><input type="password" id="waConfirmPassword" minlength="8" maxlength="128" required autocomplete="new-password" placeholder="Re-enter your chosen password"></div>'+
'<button class="btn primary" type="submit">Update Password & Continue Saved Work →</button><div class="notice" id="recoveryMsg"></div>';
const note=document.createElement('p');note.className='note';note.textContent='After approval, the Head Teacher will receive a private WhatsApp reset link. Open that link here to choose a new password. No code entry is needed.';
if(!privateToken){recoveryForm.classList.add('hidden');recoveryForm.before(note)}else{
 recoveryForm.elements.semis.value=privateSemis;
 resetRoot.querySelector('h2').textContent='Set a New Password for Your School';
}
const requestForm=document.getElementById('resetRequestForm');
if(requestForm){
 const label=requestForm.querySelector('[name="phone"]')?.closest('.field')?.querySelector('label');
 if(label)label.textContent='Head Teacher WhatsApp Number';
 requestForm.querySelector('[name="phone"]')?.setAttribute('placeholder','03XXXXXXXXX');
 const paragraph=requestForm.previousElementSibling;
 if(paragraph?.classList.contains('desc'))paragraph.textContent='Submit school SEMIS Code and HM WhatsApp number. Admin verifies and approves your request, then prepares a private WhatsApp password-reset link. All earlier drafts and reports stay saved.';
}
recoveryForm.onsubmit=async event=>{
 event.preventDefault();
 const password=recoveryForm.elements.password.value;
 if(password!==document.getElementById('waConfirmPassword').value){setNotice('recoveryMsg','Passwords do not match. Please confirm your password.');return}
 if(!privateToken){setNotice('recoveryMsg','Missing reset link. Request a new WhatsApp link from the administrator.');return}
 setNotice('recoveryMsg','Updating your school password securely…');
 try{
  const result=await request('reset-confirm',{semis:privateSemis,reset_token:privateToken,password},false);
  privateToken='';privateSemis='';
  await postLogin(result);
  setNotice('recoveryMsg','Password updated. All saved school work is available.',true)
 }catch(e){setNotice('recoveryMsg',e.message)}
};
function toWhatsAppNumber(value){
 let n=String(value||'').replace(/[^0-9]/g,'');
 if(n.startsWith('00'))n=n.slice(2);
 if(n.startsWith('0'))n='92'+n.slice(1);
 else if(n.length===10&&n.startsWith('3'))n='92'+n;
 return /^[0-9]{11,15}$/.test(n)?n:''
}
const oldRender=renderAdminTables;
renderAdminTables=function(){
 oldRender();
 if(!adminData)return;
 const root=document.getElementById('admin-resets');
 if(!root)return;
 const q=(document.getElementById('adminSearch')?.value||'').trim().toLowerCase();
 const list=(adminData.resets||[]).filter(x=>(x.semis+' '+x.requester+' '+x.phone).toLowerCase().includes(q));
 const title=document.createElement('h2');title.textContent='Password Reset Approval · WhatsApp';
 const note=document.createElement('p');note.className='desc';
 note.textContent='Verify the HM and their WhatsApp number independently. Click Approve & WhatsApp. A private reset message opens in WhatsApp and must be sent by you; no manual recovery code is needed.';
 root.replaceChildren(title,note);
 if(!list.length){const x=document.createElement('p');x.className='note';x.textContent='No matching recovery requests.';root.appendChild(x)}
 for(const r of list){
  const card=document.createElement('div');card.className='feedbackquote waResetRow';
  const heading=document.createElement('b');heading.textContent='SEMIS '+r.semis+' · '+(r.requester||'Head Teacher');
  const status=document.createElement('span');status.className='chip';status.style.marginLeft='10px';status.textContent=r.status;
  const summary=document.createElement('p');summary.textContent='WhatsApp '+(r.phone||'Not supplied')+' · '+new Date(r.created_at).toLocaleString()+(r.note?' · '+r.note:'');
  card.append(heading,status,summary);
  if(r.status==='pending'||r.status==='approved'){
   const btn=document.createElement('button');btn.className='btn primary waSendBtn';btn.type='button';
   btn.textContent=r.status==='pending'?'✳ Approve & Send via WhatsApp':'↗ Create New WhatsApp Link';
   btn.addEventListener('click',()=>sendWhatsAppLink(r,btn));card.appendChild(btn)
  }
  root.appendChild(card);
 }
};
async function sendWhatsAppLink(r,button){
 const mobile=toWhatsAppNumber(r.phone);
 if(!mobile){alert('Invalid HM WhatsApp number. Please ask for a correct mobile number.');return}
 if(!confirm('Have you verified the requester is Head Teacher of school SEMIS '+r.semis+'? This will end existing school login sessions.'))return;
 const tab=window.open('about:blank','_blank');
 button.disabled=true;button.textContent='Preparing secure link…';
 try{
  const approved=await request('admin-approve-reset',{id:r.id});
  const link=new URL(location.origin+location.pathname);
  link.hash=new URLSearchParams({reset:approved.reset_token,semis:approved.semis}).toString();
  const message=['Assalamualaikum,','Your school portal password reset has been APPROVED by the administrator.','School SEMIS: '+approved.semis,'Open this private link to CREATE A NEW PASSWORD and continue your saved school reports:','',link.toString(),'','Existing teachers, drafts and Excel export history are preserved.','This one-time link is for the verified Head Teacher only and expires in 48 hours. Do not forward it.'].join('\n');
  const target='https://wa.me/'+mobile+'?text='+encodeURIComponent(message);
  if(tab){tab.location.replace(target)}else{
   const a=document.createElement('a');a.href=target;a.target='_blank';a.rel='noopener noreferrer';a.className='btn primary';a.textContent='Open WhatsApp & Send Reset Link ↗';button.after(a)
  }
  button.textContent='✓ Approved · Send in WhatsApp';
  const info=document.createElement('p');info.className='waSendInstruction';
  info.textContent='WhatsApp opened with a prepared message. Press Send in WhatsApp to deliver it; this portal cannot send WhatsApp messages automatically.';
  button.after(info);
  await loadAdmin()
 }catch(e){if(tab)tab.close();button.disabled=false;button.textContent='Retry WhatsApp Approval';alert(e.message)}
}
const previousShow=show;
show=function(id){return previousShow(privateToken&&id==='landing'?'reset':id)};
if(privateToken){setTimeout(()=>{if(!auth)show('reset')},50);setTimeout(()=>{if(!auth)show('reset')},850)}
})();