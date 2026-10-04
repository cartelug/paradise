const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const intro = document.querySelector<HTMLElement>('[data-pardus-intro]');
const shell = document.querySelector<HTMLElement>('[data-pardus-shell]');
const skip = document.querySelector<HTMLButtonElement>('[data-skip-intro]');
let introTimer = 0;
let closingTimer = 0;
let deadline = 0;
let introReturnFocus: HTMLElement | null = null;
if (root.dataset.introFailsafe) window.clearTimeout(Number(root.dataset.introFailsafe));

function finishIntro(immediate = false) {
  window.clearTimeout(introTimer);
  window.clearTimeout(deadline);
  window.clearTimeout(closingTimer);
  if (!root.classList.contains('intro-active')) return;
  const restoreFocus = !!intro?.contains(document.activeElement);
  const complete = () => {
    root.classList.remove('intro-active', 'intro-exiting');
    root.classList.add('cinema-arrived');
    shell?.removeAttribute('inert');
    try { sessionStorage.setItem('pardus-intro-v23', 'seen'); } catch { /* storage is optional */ }
    if (restoreFocus) (introReturnFocus || document.querySelector<HTMLElement>('#main'))?.focus({preventScroll:true});
    syncMotion();
  };
  if (immediate || reduced.matches) complete();
  else {
    root.classList.add('intro-exiting', 'cinema-arrived');
    window.clearTimeout(closingTimer);
    closingTimer = window.setTimeout(complete, 880);
  }
}

function beginIntro(replay = false) {
  if (!intro || reduced.matches) { root.classList.add('cinema-arrived'); return; }
  window.clearTimeout(introTimer); window.clearTimeout(closingTimer); window.clearTimeout(deadline);
  if (replay) {
    introReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.classList.remove('intro-active', 'intro-exiting', 'cinema-arrived');
    void intro.offsetWidth;
    root.dataset.introStarted = String(performance.now());
  }
  root.classList.add('intro-active');
  shell?.setAttribute('inert', '');
  skip?.focus({preventScroll:true});
  const elapsed = performance.now() - Number(root.dataset.introStarted || performance.now());
  introTimer = window.setTimeout(() => finishIntro(), Math.max(250, 3300 - elapsed));
  deadline = window.setTimeout(() => finishIntro(true), 5800);
  syncMotion();
}
skip?.addEventListener('click', () => finishIntro(true));
intro?.addEventListener('keydown', event => {
  if (event.key === 'Escape') finishIntro(true);
  if (event.key === 'Tab') { event.preventDefault(); skip?.focus(); }
});
document.querySelectorAll<HTMLButtonElement>('[data-replay-intro]').forEach(button => button.addEventListener('click', () => beginIntro(true)));

// A sixteen-pose, aligned gait moves on a continuous frame-rate-independent path.
// Stop work when the hero is off-screen, hidden, paused, or reduced motion is requested.
const stage = document.querySelector<HTMLElement>('[data-leopard-stage]');
const cat = document.querySelector<HTMLElement>('[data-leopard-traveller]');
const hero = document.querySelector<HTMLElement>('.escape-hero');
const pause = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
let stageWidth = stage?.clientWidth || window.innerWidth;
let catWidth = cat?.offsetWidth || 300;
let position = Math.max(0, stageWidth * .57 - catWidth / 2);
let visible = true;
let paused = false;
let frame = 0;
let previous = 0;
function paintCat() {
  cat?.style.setProperty('--leopard-x', position.toFixed(2) + 'px');
  const fade = Math.min(1, Math.max(0, (position + catWidth - 20) / 70), Math.max(0, (stageWidth - position) / 70));
  cat?.style.setProperty('--leopard-opacity', String(fade));
}
function tick(time: number) {
  const delta = previous ? Math.min(40, time - previous) : 0;
  previous = time;
  position += delta * (stageWidth < 760 ? .057 : .074);
  if (position > stageWidth + 20) position = -catWidth;
  paintCat();
  frame = window.requestAnimationFrame(tick);
}
function syncMotion() {
  root.classList.toggle('motion-reduced', reduced.matches);
  root.classList.toggle('motion-paused', paused);
  root.classList.toggle('hero-dormant', !visible || document.hidden);
  const canRun = !!cat && visible && !document.hidden && !paused && !reduced.matches && !root.classList.contains('intro-active');
  if (canRun && !frame) { previous = 0; frame = window.requestAnimationFrame(tick); }
  else if (!canRun && frame) { window.cancelAnimationFrame(frame); frame = 0; previous = 0; }
}
pause?.addEventListener('click', () => {
  paused = !paused;
  pause.setAttribute('aria-pressed', String(paused));
  pause.textContent = paused ? 'Play motion' : 'Pause motion';
  syncMotion();
});
if (hero && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncMotion(); }, {threshold:0});
  observer.observe(hero);
}
window.addEventListener('resize', () => {
  stageWidth = stage?.clientWidth || window.innerWidth;
  catWidth = cat?.offsetWidth || 300;
  position = Math.min(position, stageWidth - catWidth * .4);
  paintCat();
}, {passive:true});
document.addEventListener('visibilitychange', syncMotion);
reduced.addEventListener('change', () => { if(reduced.matches) finishIntro(true); syncMotion(); });
paintCat();
if (root.classList.contains('intro-active')) beginIntro();
else { root.classList.add('cinema-arrived'); syncMotion(); }

// Restrained pointer depth on imagery; touch interaction and native links stay unchanged.
document.querySelectorAll<HTMLElement>('.escape-card-image,.escape-dubai-image').forEach(card => {
  let pending = 0, x = 0, y = 0;
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || reduced.matches || paused) return;
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
