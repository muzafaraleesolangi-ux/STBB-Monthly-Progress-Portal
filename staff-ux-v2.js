'use strict';
/* Accessible shared-school micro-interactions: optional sounds, non-blocking toast and teacher confirmation dialog. */
const StaffUI=(()=>{
 const isStaff=()=>typeof auth!=='undefined'&&auth?.role==='staff';
 let enabled=true,context=null,toastTimer=null,modalResolver=null,previousFocus=null;
 try{enabled=localStorage.getItem('mpr_staff_sounds')!=='off'}catch{}
 const button=document.createElement('button');button.type='button';button.id='staffSoundToggle';
 button.className='staffSoundToggle';button.setAttribute('aria-label','Toggle staff click sounds');
 function label(){button.textContent=enabled?'♫ Sound On':'♫ Sound Off';button.setAttribute('aria-pressed',String(enabled))}
 label();
 document.querySelector('#teacherdash .teacherTopNav')?.prepend(button);
 button.addEventListener('click',()=>{enabled=!enabled;try{localStorage.setItem('mpr_staff_sounds',enabled?'on':'off')}catch{}label()});
 function clickSound(kind='click'){
  if(!enabled||!isStaff())return;
  try{
   const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
   context=context||new AC();
   if(context.state==='suspended')context.resume().catch(()=>{});
   const now=context.currentTime;
   const sequence=kind==='saved'?[659.25,987.77]:kind==='open'?[523.25,659.25]:[440];
   sequence.forEach((pitch,i)=>{
    const oscillator=context.createOscillator(),gain=context.createGain(),start=now+i*.065;
    oscillator.type='sine';oscillator.frequency.setValueAtTime(pitch,start);
    gain.gain.setValueAtTime(0.0001,start);
    gain.gain.exponentialRampToValueAtTime(0.018,start+.012);
    gain.gain.exponentialRampToValueAtTime(0.0001,start+.11);
    oscillator.connect(gain);gain.connect(context.destination);
    oscillator.start(start);oscillator.stop(start+.12)
   })
  }catch{}
 }
 document.addEventListener('click',e=>{
  if(!isStaff()||!e.target.closest('#teacherdash button,#staffConfirmDialog button'))return;
  if(e.target.closest('#staffSoundToggle'))return;
  clickSound(e.target.closest('[data-staff-pick],[data-staff-new],[data-staff-next],[data-staff-stage]')?'open':'click');
 },true);
 const box=document.createElement('div');box.id='staffToast';box.setAttribute('role','status');box.setAttribute('aria-live','polite');box.className='staffToast hidden';document.body.appendChild(box);
 function toast(msg,bad=false){
  if(!isStaff())return;box.replaceChildren();
  const icon=document.createElement('span');icon.textContent=bad?'!':'✓';icon.className='staffToastIcon';
  const text=document.createElement('span');text.textContent=msg;
  box.append(icon,text);box.classList.toggle('isBad',bad);box.classList.remove('hidden');
  if(!bad)clickSound('saved');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.add('hidden'),3200)
 }
 const shade=document.createElement('div');shade.id='staffConfirmDialog';shade.className='staffConfirmOverlay hidden';shade.setAttribute('role','presentation');
 shade.innerHTML='<div class="staffConfirmPanel" role="dialog" aria-modal="true" aria-labelledby="staffConfirmTitle" aria-describedby="staffConfirmDescription"><span class="staffConfirmEmblem">✦</span><h2 id="staffConfirmTitle">Please Confirm</h2><p id="staffConfirmDescription"></p><div class="staffConfirmActions"><button type="button" data-confirm-cancel>Keep Editing</button><button type="button" data-confirm-yes>Confirm</button></div></div>';
 document.body.appendChild(shade);
 function settle(result){
  if(!modalResolver)return;
  shade.classList.add('hidden');const fn=modalResolver;modalResolver=null;fn(result);
  if(previousFocus?.isConnected)previousFocus.focus();
 }
 shade.addEventListener('click',e=>{
  if(e.target.closest('[data-confirm-yes]'))settle(true);
  else if(e.target===shade||e.target.closest('[data-confirm-cancel]'))settle(false)
 });
 document.addEventListener('keydown',e=>{
  if(!modalResolver)return;
  if(e.key==='Escape'){e.preventDefault();settle(false)}
  if(e.key==='Tab'){
   const buttons=[...shade.querySelectorAll('button')],active=document.activeElement;
   if(e.shiftKey&&active===buttons[0]){e.preventDefault();buttons[1].focus()}
   else if(!e.shiftKey&&active===buttons[1]){e.preventDefault();buttons[0].focus()}
  }
 });
 function confirmAction(message,{title='Confirm Action',confirmLabel='Yes, Continue',danger=false}={}){
  if(modalResolver)return Promise.resolve(false);
  return new Promise(resolve=>{
   previousFocus=document.activeElement;modalResolver=resolve;
   shade.querySelector('#staffConfirmTitle').textContent=title;
   shade.querySelector('#staffConfirmDescription').textContent=message;
   const yes=shade.querySelector('[data-confirm-yes]');yes.textContent=confirmLabel;yes.classList.toggle('danger',danger);
   shade.classList.remove('hidden');shade.querySelector('[data-confirm-cancel]').focus()
  })
 }
 return{toast,confirm:confirmAction,clickSound,soundsEnabled:()=>enabled}
})();