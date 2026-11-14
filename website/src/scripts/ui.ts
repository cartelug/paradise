import { initFolio } from './folio';

// Header, mobile menu and scroll motion for every page. Content is complete in the HTML without this script.
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 1360px)');
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* Mobile menu */
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const panel = menu?.querySelector<HTMLElement>('.menu-panel');
let closing = 0;
let endClose: (() => void) | null = null;
function openMenu() {
  if (!menu) return;
  endClose?.();
  if (menu.open) return;
  document.querySelectorAll<HTMLDialogElement>('dialog[open]').forEach(dialog => dialog.close());
  menu.classList.remove('is-closing');
  menu.showModal();
  root.classList.add('menu-open');
  toggle?.setAttribute('aria-expanded', 'true');
}
function closeMenu(immediate = false) {
  if (!menu?.open) return;
  if (immediate || reduced.matches) {
    if (endClose) endClose(); else menu.close();
    return;
  }
  if (endClose) return;
  menu.classList.add('is-closing');
  const complete = () => {
    window.clearTimeout(closing);
    panel?.removeEventListener('animationend', onEnd);
    endClose = null;
    menu.classList.remove('is-closing');
    if (menu.open) menu.close();
  };
  const onEnd = (event: AnimationEvent) => { if (event.target === panel) complete(); };
  endClose = complete;
  panel?.addEventListener('animationend', onEnd);
  closing = window.setTimeout(complete, 400);
}
toggle?.addEventListener('click', openMenu);
menu?.querySelector('.menu-close')?.addEventListener('click', () => closeMenu());
menu?.addEventListener('cancel', event => { event.preventDefault(); closeMenu(); });
menu?.addEventListener('close', () => {
  root.classList.remove('menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
  // Another dialog (the Folio) may have taken over; only restore focus when none is open.
  if (!document.querySelector('dialog[open]')) toggle?.focus({ preventScroll: true });
});
menu?.querySelectorAll<HTMLElement>('a, [data-folio-trigger]').forEach(item => item.addEventListener('click', () => closeMenu(true)));
desktop.addEventListener('change', event => { if (event.matches) closeMenu(true); });
initFolio();

// Private View owns eligible arrivals. Content is never hidden while waiting for an observer.
/* Ambient motion pause (the hero photograph drifts continuously, so it can be paused) */
let paused = false;
try { paused = localStorage.getItem('pardus-scene-motion') === 'paused'; } catch { /* Optional preference. */ }
const motionButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-scene-motion]')];
function syncPause() {
  root.classList.toggle('motion-paused', paused);
  motionButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume background animation' : 'Pause background animation');
    const label = button.querySelector('[data-scene-motion-label]');
    if (label) label.textContent = paused ? 'Resume scene' : 'Pause scene';
  });
  window.dispatchEvent(new Event('pardus:motion'));
}
motionButtons.forEach(button => button.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem('pardus-scene-motion', paused ? 'paused' : 'playing'); } catch { /* Works without storage. */ }
  syncPause();
}));
syncPause();

/* Scroll motion: one frame per scroll event, reads before writes. */
const header = document.querySelector<HTMLElement>('.site-header');
const hero = document.querySelector<HTMLElement>('[data-hero]');
let lastY = window.scrollY, frameId = 0;
if ('IntersectionObserver' in window && hero) {
  new IntersectionObserver(entries => root.classList.toggle('hero-dormant', !entries[0].isIntersecting)).observe(hero);
}

function paint() {
  frameId = 0;
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  root.style.setProperty('--progress', clamp(y / max, 0, 1).toFixed(4));
  header?.classList.toggle('is-scrolled', y > 40);
  const delta = y - lastY;
  if (Math.abs(delta) > 6) {
    const focused = header?.contains(document.activeElement);
    if (delta > 0 && y > vh * 0.55 && !focused && !root.classList.contains('menu-open')) header?.classList.add('is-hidden');
    else if (delta < 0) header?.classList.remove('is-hidden');
    lastY = y;
  }
  if (y < 120) header?.classList.remove('is-hidden');

}
const schedule = () => { if (!frameId && !document.hidden) frameId = requestAnimationFrame(paint); };
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
window.addEventListener('pageshow', schedule);
header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));
schedule();

window.addEventListener('pagehide', () => { if (frameId) cancelAnimationFrame(frameId); frameId = 0; closeMenu(true); });
if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(document.body);
reduced.addEventListener('change', () => closeMenu(true));
