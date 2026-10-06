import {createLeopardMotion} from './leopard-motion';

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const intro = document.querySelector<HTMLElement>('[data-pardus-intro]');
const shell = document.querySelector<HTMLElement>('[data-pardus-shell]');
const skip = document.querySelector<HTMLButtonElement>('[data-skip-intro]');
const hero = document.querySelector<HTMLElement>('.escape-hero');
const scene = document.querySelector<HTMLElement>('[data-hero-depth]');
const leopard = createLeopardMotion(document.querySelector<HTMLElement>('[data-leopard-scene]'));
let introTimer = 0, closingTimer = 0, deadline = 0;
let visible = true;
let pageActive = true;
if (root.dataset.introFailsafe) window.clearTimeout(Number(root.dataset.introFailsafe));

function syncMotion() {
  root.classList.toggle('motion-reduced', reduced.matches);
  root.classList.toggle('hero-dormant', !visible || document.hidden || !pageActive);
  leopard?.setActive(visible && !document.hidden && pageActive && !root.classList.contains('intro-active'),reduced.matches);
}
function finishIntro(immediate = false) {
  window.clearTimeout(introTimer); window.clearTimeout(deadline);
  if (!root.classList.contains('intro-active')) return;
  if (root.classList.contains('intro-exiting') && !immediate) return;
  window.clearTimeout(closingTimer);
  intro?.style.setProperty('--intro-progress', '1');
  const restoreFocus = !!intro?.contains(document.activeElement);
  const complete = () => {
    root.classList.remove('intro-active', 'intro-exiting');
    root.classList.add('cinema-arrived');
    shell?.removeAttribute('inert');
    try { sessionStorage.setItem('pardus-intro-v25', 'seen'); } catch { /* storage is optional */ }
    if (restoreFocus) document.querySelector<HTMLElement>('#main')?.focus({preventScroll:true});
    syncMotion();
  };
  if (immediate || reduced.matches) complete();
  else {
    root.classList.add('intro-exiting', 'cinema-arrived');
    closingTimer = window.setTimeout(complete, 880);
  }
}
function beginIntro() {
  if (!intro || reduced.matches) { finishIntro(true); root.classList.add('cinema-arrived'); return; }
  shell?.setAttribute('inert', '');
  skip?.focus({preventScroll:true});
  const started = Number(root.dataset.introStarted || performance.now());
  intro.style.setProperty('--intro-progress', '.15');
  const image = document.querySelector<HTMLImageElement>('[data-hero-image]');
  const artworkReady = image ? image.decode().catch(() => undefined) : Promise.resolve();
  artworkReady.then(() => {
    if (root.classList.contains('intro-active') && !root.classList.contains('intro-exiting')) intro.style.setProperty('--intro-progress', '.65');
  });
  const fontsReady = document.fonts.ready;
  Promise.allSettled([artworkReady, fontsReady, leopard?.ready]).then(() => {
    if (!root.classList.contains('intro-active') || root.classList.contains('intro-exiting')) return;
    intro.style.setProperty('--intro-progress', '.95');
    introTimer = window.setTimeout(() => finishIntro(), Math.max(0, 3800 - (performance.now() - started)));
  });
  deadline = window.setTimeout(() => finishIntro(), Math.max(0, 5500 - (performance.now() - started)));
  syncMotion();
}
skip?.addEventListener('click', () => finishIntro(true));
intro?.addEventListener('keydown', event => {
  if (event.key === 'Escape') finishIntro(true);
  if (event.key === 'Tab') { event.preventDefault(); skip?.focus(); }
});
if (hero && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncMotion(); }, {threshold:0});
  observer.observe(hero);
}
document.addEventListener('visibilitychange', syncMotion);
window.addEventListener('pagehide', () => {pageActive=false;syncMotion();});
window.addEventListener('pageshow', () => {pageActive=true;syncMotion();});
reduced.addEventListener('change', () => { if(reduced.matches) finishIntro(true); syncMotion(); });
if (root.classList.contains('intro-active')) beginIntro();
else { root.classList.add('cinema-arrived'); syncMotion(); }

// Only pointer events schedule a frame; ambient camera motion is handled by CSS.
let heroPending = 0, sceneX = 0, sceneY = 0;
hero?.addEventListener('pointermove', event => {
  if (!scene || !finePointer.matches || reduced.matches) return;
  const box = hero.getBoundingClientRect();
  sceneX = ((event.clientX - box.left) / box.width - .5) * 12;
  sceneY = ((event.clientY - box.top) / box.height - .5) * 8;
  leopard?.setLook(sceneX/6,sceneY/4);
  if (!heroPending) heroPending = requestAnimationFrame(() => {
    scene.style.setProperty('--scene-x', sceneX.toFixed(2) + 'px');
    scene.style.setProperty('--scene-y', sceneY.toFixed(2) + 'px');
    heroPending = 0;
  });
}, {passive:true});
hero?.addEventListener('pointerleave', () => {
  if (heroPending) cancelAnimationFrame(heroPending);
  heroPending = 0;
  leopard?.setLook(0,0);
  scene?.style.setProperty('--scene-x','0px'); scene?.style.setProperty('--scene-y','0px');
});

// Restrained pointer depth on imagery; touch interaction and native links stay unchanged.
document.querySelectorAll<HTMLElement>('.escape-card-image,.escape-dubai-image').forEach(card => {
  let pending = 0, x = 0, y = 0;
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || reduced.matches) return;
    const box = card.getBoundingClientRect();
    x = (event.clientX - box.left) / box.width - .5;
    y = (event.clientY - box.top) / box.height - .5;
    if (!pending) pending = requestAnimationFrame(() => {
      card.style.setProperty('--photo-x', (x * 12).toFixed(2) + 'px');
      card.style.setProperty('--photo-y', (y * 10).toFixed(2) + 'px');
      card.style.setProperty('--shine-x', ((x + .5) * 100).toFixed(2) + '%');
      pending = 0;
    });
  }, {passive:true});
  card.addEventListener('pointerleave', () => {
    if(pending) cancelAnimationFrame(pending);
    pending = 0;
    card.style.setProperty('--photo-x','0px'); card.style.setProperty('--photo-y','0px');
  });
});
