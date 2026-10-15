'use strict';
(function(){
const landing=document.querySelector('#landing'),hero=landing?.querySelector('.hero'),portrait=landing?.querySelector('.portrait');
if(!landing||!hero||!portrait)return;
portrait.insertAdjacentHTML('beforeend','<span class="devSpark one" aria-hidden="true"></span><span class="devSpark two" aria-hidden="true"></span>');
const title=hero.querySelector('h1');if(title){title.innerHTML='Smarter reporting.<br><em>Stronger school progress.</em>'}
const text=hero.querySelector('p');if(text)text.textContent='A connected academic workspace for Sindh schools. Create one school account. All teachers use its shared password, choose their own name tabs, pick classes I–XII, manage subjects and save monthly progress from their phones. One login opens school details, teacher tabs, reporting and Excel History together.';
const ribbon=document.createElement('div');ribbon.className='premiumRibbon';ribbon.innerHTML='<span>✦ Classes I–XII · Primary to Inter</span><span>✦ One SEMIS School Account</span><span>✦ Cloud Drafts & Excel Export</span><span>✦ Protected Administrator</span>';
const cards=landing.querySelector('.cardsection');if(cards)cards.after(ribbon);
const steps=cards?.querySelectorAll('.panel');if(steps?.length===3){
steps[0].querySelector('h2').textContent='Set up your school';
steps[0].querySelector('.desc').textContent='Create the school account once. Head Master saves school details; teachers create their own name tabs and update their data.';
steps[1].querySelector('h2').textContent='Every teacher contributes';
steps[1].querySelector('.desc').textContent='The single school sign-in opens one dashboard with teacher name tabs. Every teacher picks classes, subjects and chapter totals, then completes their monthly report.';
steps[2].querySelector('h2').textContent='Review & export';
steps[2].querySelector('.desc').textContent='Review teacher submissions, finalize the school report and save the original Excel workbook to school History.';
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
