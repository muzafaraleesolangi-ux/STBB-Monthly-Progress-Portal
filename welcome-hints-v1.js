'use strict';
/* Short-lived new/returning user pointers: no modal, no scroll-traps. */
(()=>{
 const landing=document.getElementById('landing'),actions=landing?.querySelector('.hero-actions');
 if(!actions)return;
 const buttons=actions.querySelectorAll('button');
 const specs=[['New here?','Create your school account'],['Already registered?','Sign into your school']];
 const bubbles=[];
 buttons.forEach((btn,i)=>{
  if(i>1)return;
  btn.textContent=i===0?'Create New Account →':'Sign Into School →';
  btn.classList.add('welcomeCTA');
  const tip=document.createElement('span');tip.className='welcomeHint';tip.setAttribute('aria-hidden','true');
  tip.innerHTML='<strong>'+specs[i][0]+'</strong><small>'+specs[i][1]+'</small>';
  btn.appendChild(tip);bubbles.push(tip);
 });
 let closing=null;
 function reveal(){
  if(landing.classList.contains('hidden'))return;
  clearTimeout(closing);
  bubbles.forEach((x,i)=>{x.classList.remove('fadeOut');x.classList.toggle('show',true);x.style.animationDelay=i*180+'ms'});
  closing=setTimeout(()=>bubbles.forEach(x=>{x.classList.add('fadeOut');setTimeout(()=>x.classList.remove('show','fadeOut'),600)}),4100);
 }
 actions.addEventListener('click',e=>{if(e.target.closest('.welcomeCTA')){clearTimeout(closing);bubbles.forEach(x=>x.classList.remove('show','fadeOut'))}});
 const originalShow=show;
 show=function(id){const res=originalShow(id);if(id==='landing')requestAnimationFrame(reveal);return res};
 setTimeout(reveal,400);
})();
