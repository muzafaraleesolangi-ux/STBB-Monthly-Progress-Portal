'use strict';
(function(){
const landing=document.querySelector('#landing'),hero=landing?.querySelector('.hero'),portrait=landing?.querySelector('.portrait');
if(!landing||!hero||!portrait)return;
portrait.insertAdjacentHTML('beforeend','<span class="devSpark one" aria-hidden="true"></span><span class="devSpark two" aria-hidden="true"></span>');
const title=hero.querySelector('h1');if(title){title.innerHTML='Smarter reporting.<br><em>Stronger school progress.</em>'}
const text=hero.querySelector('p');if(text)text.textContent='A connected academic workspace for Sindh schools. Head Teachers set up staff, classes and subjects once; every teacher updates their assigned monthly progress from their own phone. Review together, save securely, and export the original Excel Proforma.';
const ribbon=document.createElement('div');ribbon.className='premiumRibbon';ribbon.innerHTML='<span>✦ Class I–V Course Planning</span><span>✦ One SEMIS School Account</span><span>✦ Cloud Drafts & Excel Export</span><span>✦ Protected Administrator</span>';
const cards=landing.querySelector('.cardsection');if(cards)cards.after(ribbon);
const steps=cards?.querySelectorAll('.panel');if(steps?.length===3){
steps[0].querySelector('h2').textContent='Set up your school';
steps[0].querySelector('.desc').textContent='Register school once. Add teachers, select their classes and assign subjects with guided checklists.';
steps[1].querySelector('h2').textContent='Every teacher contributes';
steps[1].querySelector('.desc').textContent='Teachers sign in from separate phones using school credentials, update their own subjects and save independently.';
steps[2].querySelector('h2').textContent='Review & export';
steps[2].querySelector('.desc').textContent='See missing subjects, reopen monthly drafts, review progress and export your one-sheet Excel report.';
}
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion&&matchMedia('(pointer:fine)').matches){
 portrait.addEventListener('pointermove',e=>{const r=portrait.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;portrait.style.setProperty('--mx',(x*11).toFixed(2)+'deg');portrait.style.setProperty('--my',(-y*10).toFixed(2)+'deg')});
 portrait.addEventListener('pointerleave',()=>{portrait.style.setProperty('--mx','0deg');portrait.style.setProperty('--my','0deg')});
}
if('IntersectionObserver' in window&&!reduceMotion){
 const observer=new IntersectionObserver(items=>items.forEach(x=>{if(x.isIntersecting){x.target.classList.add('inView');observer.unobserve(x.target)}}),{threshold:.09});
 landing.querySelectorAll('.cardsection .panel,.premiumRibbon,.support').forEach(el=>{el.classList.add('revealScroll');observer.observe(el)});
}
document.querySelectorAll('#landing .hero-actions button').forEach(button=>{
 button.addEventListener('click',()=>{button.style.transform='scale(.98)';setTimeout(()=>button.style.transform='',180)});
});
})();
