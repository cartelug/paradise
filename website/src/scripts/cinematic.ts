import {createLeopardMotion, type LeopardMotion} from './hero-film';

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const intro = document.querySelector<HTMLElement>('[data-pardus-intro]');
const shell = document.querySelector<HTMLElement>('[data-pardus-shell]');
const skip = document.querySelector<HTMLButtonElement>('[data-skip-intro]');
const hero = document.querySelector<HTMLElement>('.escape-hero');
const scene = document.querySelector<HTMLElement>('[data-hero-depth]');
const sceneElement = document.querySelector<HTMLElement>('[data-leopard-scene]');
const motionControl = document.querySelector<HTMLButtonElement>('[data-scene-motion]');
let leopard: LeopardMotion|null = null;
let rendererAttempted = false;
let introTimer = 0, closingTimer = 0, deadline = 0;
let heroPending = 0, sceneX = 0, sceneY = 0;
let visible = true, pageActive = true, userPaused = false;
try { userPaused = localStorage.getItem('pardus-scene-motion') === 'paused'; } catch { /* Optional preference. */ }
if (root.dataset.introFailsafe) window.clearTimeout(Number(root.dataset.introFailsafe));

function resetDepth() {
  if (heroPending) cancelAnimationFrame(heroPending);
  heroPending = 0;
  leopard?.setLook(0,0);
  scene?.style.setProperty('--scene-x','0px');
  scene?.style.setProperty('--scene-y','0px');
}
function syncMotion() {
  root.classList.toggle('motion-reduced', reduced.matches);
  root.classList.toggle('motion-paused', userPaused);
  root.classList.toggle('hero-dormant', !visible || document.hidden || !pageActive);
  const active = visible && !document.hidden && pageActive && !userPaused && !reduced.matches && !root.classList.contains('intro-active');
  // The static photograph arrives first. Reduced motion and a saved pause do not load a renderer.
  if (active && sceneElement && !rendererAttempted) {
    rendererAttempted = true;
    leopard = createLeopardMotion(sceneElement);
  }
  leopard?.setActive(active, reduced.matches);
  if (!active) resetDepth();
  if (motionControl) {
    motionControl.hidden = reduced.matches || sceneElement?.dataset.leopardMotion === 'fallback';
    motionControl.setAttribute('aria-pressed',String(userPaused));
    motionControl.setAttribute('aria-label',userPaused ? 'Resume background animation' : 'Pause background animation');
    const label = motionControl.querySelector('[data-scene-motion-label]');
    if (label) label.textContent = userPaused ? 'Resume scene' : 'Pause scene';
  }
}
function finishIntro(immediate = false) {
  window.clearTimeout(introTimer); window.clearTimeout(deadline);
  if (!root.classList.contains('intro-active')) return;
  if (root.classList.contains('intro-exiting') && !immediate) return;
  window.clearTimeout(closingTimer);
  intro?.style.setProperty('--intro-progress','1');
  const restoreFocus = !!intro?.contains(document.activeElement);
  const complete = () => {
    root.classList.remove('intro-active','intro-exiting');
    root.classList.add('cinema-arrived');
    shell?.removeAttribute('inert');
    try { sessionStorage.setItem('pardus-intro-v28','seen'); } catch { /* Storage is optional. */ }
    if (restoreFocus) document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});
    syncMotion();
  };
  if (immediate || reduced.matches) complete();
  else {
    root.classList.add('intro-exiting','cinema-arrived');
    closingTimer = window.setTimeout(complete,380);
  }
}
function beginIntro() {
  if (!intro || reduced.matches) { finishIntro(true); root.classList.add('cinema-arrived'); return; }
  shell?.setAttribute('inert','');
  skip?.focus({preventScroll:true});
  const elapsed = performance.now() - Number(root.dataset.introStarted || performance.now());
  intro.style.setProperty('--intro-progress','.3');
  const image = document.querySelector<HTMLImageElement>('[data-hero-image]');
  image?.decode().catch(()=>undefined).then(()=>{
    if (root.classList.contains('intro-active') && !root.classList.contains('intro-exiting')) intro.style.setProperty('--intro-progress','.8');
  });
  // Font/image/optional WebGL readiness can never hold a visitor behind the introduction.
  introTimer = window.setTimeout(()=>finishIntro(),Math.max(0,1150-elapsed));
  deadline = window.setTimeout(()=>finishIntro(true),Math.max(0,1800-elapsed));
  syncMotion();
}
skip?.addEventListener('click',()=>finishIntro(true));
intro?.addEventListener('keydown',event=>{
  if (event.key === 'Escape') finishIntro(true);
  if (event.key === 'Tab') { event.preventDefault(); skip?.focus(); }
});
motionControl?.addEventListener('click',()=>{
  userPaused = !userPaused;
  try { localStorage.setItem('pardus-scene-motion',userPaused ? 'paused' : 'playing'); } catch { /* The control works without storage. */ }
  syncMotion();
});
if (motionControl && sceneElement && 'MutationObserver' in window) {
  const stateObserver = new MutationObserver(()=>{
    motionControl.hidden = reduced.matches || sceneElement.dataset.leopardMotion === 'fallback';
  });
  stateObserver.observe(sceneElement,{attributes:true,attributeFilter:['data-leopard-motion']});
}
if (hero && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;syncMotion();},{threshold:0});
  observer.observe(hero);
}
document.addEventListener('visibilitychange',syncMotion);
window.addEventListener('pagehide',()=>{pageActive=false;syncMotion();});
window.addEventListener('pageshow',()=>{pageActive=true;syncMotion();});
reduced.addEventListener('change',()=>{if(reduced.matches)finishIntro(true);syncMotion();});
finePointer.addEventListener('change',resetDepth);
if (root.classList.contains('intro-active')) beginIntro();
else {root.classList.add('cinema-arrived');syncMotion();}

// One scheduled write per pointer frame. Touch input never drives decorative depth.
hero?.addEventListener('pointermove',event=>{
  if (!scene || !finePointer.matches || reduced.matches || userPaused || document.hidden || !pageActive) return;
  const box = hero.getBoundingClientRect();
  sceneX = ((event.clientX-box.left)/box.width-.5)*4;
  sceneY = ((event.clientY-box.top)/box.height-.5)*2;
  if (!heroPending) heroPending = requestAnimationFrame(()=>{
    leopard?.setLook(sceneX/2,sceneY);
    scene.style.setProperty('--scene-x',sceneX.toFixed(2)+'px');
    scene.style.setProperty('--scene-y',sceneY.toFixed(2)+'px');
    heroPending=0;
  });
},{passive:true});
hero?.addEventListener('pointerleave',resetDepth);
