'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('.header');
const progress = document.querySelector('.reading-progress');
let ticking = false;
function updateScroll() {
  const y = window.scrollY;
  header?.classList.toggle('scrolled', y > 120);
  if (progress) progress.style.transform = `scaleX(${Math.min(1, y / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
  ticking = false;
}
window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, {passive:true});
updateScroll();
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold:0.07, rootMargin:'0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  document.documentElement.classList.add('motion-ready');
}
document.querySelector('#year')?.replaceChildren(String(new Date().getFullYear()));
const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
menuToggle?.addEventListener('click', () => { menu.showModal(); menuToggle.setAttribute('aria-expanded','true'); });
document.querySelector('.close-menu')?.addEventListener('click', () => menu.close());
menu?.addEventListener('close', () => {menuToggle.setAttribute('aria-expanded','false');menuToggle.focus({preventScroll:true});});
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));
const privacy = document.querySelector('#privacy-dialog');
document.querySelector('.privacy-link')?.addEventListener('click', () => privacy.showModal());
document.querySelector('.close-privacy')?.addEventListener('click', () => privacy.close());
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => {if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('active', b===button); b.setAttribute('aria-pressed',String(b===button)); });
  let count=0;
  document.querySelectorAll('[data-category]').forEach(card => {const show=button.dataset.filter==='all'||card.dataset.category===button.dataset.filter;card.hidden=!show;if(show){card.classList.add('is-visible');count++;}});
  document.querySelector('#result-count').textContent=`${count} destination${count===1?'':'s'}`;
}));
const planner=document.querySelector('#planner');
if(planner){
  let step=1;
  const next=document.querySelector('#next-button');
  const back=document.querySelector('.back-button');
  const status=document.querySelector('#form-status');
  const error=document.querySelector('#form-error');
  const date=document.querySelector('#date');
  const today=new Date();date.min=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const requested=new URLSearchParams(location.search).get('destination');
  if(requested&&[...document.querySelector('#destination').options].some(o=>o.value===requested))document.querySelector('#destination').value=requested;
  document.querySelector('[data-corporate]')?.addEventListener('click',()=>{document.querySelector('#travel-style').value='Corporate travel';step=1;renderStep(false);});
  function fields(){return Object.fromEntries(new FormData(planner));}
  function brief(){const d=fields();return `PARDUS LUXURY ESCAPES\nYour personal journey brief\n\nDestination: ${d.destination}\nTravel style: ${d.style}\nTravellers: ${d.travellers}\nBudget per person: ${d.budget}\nDeparture: ${d.departure||'To be discussed'}\nPreferred date: ${d.date||'Flexible'}\nLength: ${d.nights}\nName: ${d.name||'Not provided'}\n\nPersonal wishes:\n${d.notes||'To be discussed'}\n\nThis brief has not been sent to Pardus and is not a booking confirmation.\n`;}
  function renderStep(focus=true){
    planner.querySelectorAll('[data-step]').forEach(f=>f.hidden=Number(f.dataset.step)!==step);
    document.querySelector('#step-label').textContent=`0${step} / 03`;
    document.querySelectorAll('.step-track i').forEach((el,i)=>el.classList.toggle('active',i<step));
    back.hidden=step===1; next.replaceChildren(document.createTextNode(step===1?'A little more about you':step===2?'Review your journey':'Download my journey brief'));const arrow=document.createElement('span');arrow.textContent=step===3?'↓':'↗';arrow.setAttribute('aria-hidden','true');next.append(arrow);
    if(step===3){const d=fields();const summary=document.querySelector('#brief-summary');summary.replaceChildren();for(const [k,v] of [['Destination',d.destination],['Style',d.style],['Travellers',d.travellers],['Budget',d.budget],['When',d.date||'Flexible']]){const line=document.createElement('div');const key=document.createElement('strong');key.textContent=k+': ';line.append(key,document.createTextNode(v));summary.append(line);}}
    error.textContent='';status.textContent='';
    if(focus){const legend=planner.querySelector(`[data-step="${step}"] legend`);legend.tabIndex=-1;legend.focus({preventScroll:true});planner.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});}
  }
  planner.addEventListener('submit',e=>{e.preventDefault();if(step===2&&date.value&&date.value<date.min){error.textContent='Please choose a future departure date, or leave it empty if you’re flexible.';date.focus();return;}if(step<3){step++;renderStep();return;}const blob=new Blob([brief()],{type:'text/plain;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='Pardus-My-Journey-Brief.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Your download is ready. The brief has not been sent to Pardus.';});
  back.addEventListener('click',()=>{if(step>1){step--;renderStep();}});
}
