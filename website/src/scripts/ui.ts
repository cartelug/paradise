import { initFolio } from './folio';

// Header, mobile menu and scroll motion for every page. Content is complete in the HTML without this script.
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 1200px)');
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/* Mobile menu */
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const panel = menu?.querySelector<HTMLElement>('.menu-panel');
let closing = 0;
function openMenu() {
  if (!menu || menu.open) return;
  window.clearTimeout(closing);
  menu.classList.remove('is-closing');
  menu.showModal();
  root.classList.add('menu-open');
  toggle?.setAttribute('aria-expanded', 'true');
}
function closeMenu(immediate = false) {
  if (!menu?.open || menu.classList.contains('is-closing')) return;
  if (immediate || reduced.matches) { menu.close(); return; }
  menu.classList.add('is-closing');
  let done = false;
  const end = () => { if (done) return; done = true; window.clearTimeout(closing); menu.classList.remove('is-closing'); if (menu.open) menu.close(); };
  panel?.addEventListener('animationend', event => { if (event.target === panel) end(); });
  closing = window.setTimeout(end, 480);
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

/* Reveals and word-by-word headings */
function splitWords(heading: HTMLElement) {
  let index = 0;
  const walk = (node: Node): Node[] => {
    if (node.nodeType === Node.TEXT_NODE) {
      const out: Node[] = [];
      (node.textContent || '').split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) { out.push(document.createTextNode(' ')); return; }
        const word = document.createElement('span'); word.className = 'w'; word.style.setProperty('--w', String(index++));
        const inner = document.createElement('span'); inner.textContent = part; word.append(inner); out.push(word);
      });
      return out;
    }
    if (node instanceof HTMLElement && node.tagName !== 'BR') {
      const clone = node.cloneNode(false) as HTMLElement;
      node.childNodes.forEach(child => walk(child).forEach(piece => clone.append(piece)));
      return [clone];
    }
    return [node.cloneNode(true)];
  };
  const pieces: Node[] = [];
  heading.childNodes.forEach(child => pieces.push(...walk(child)));
  heading.replaceChildren(...pieces);
}

if ('IntersectionObserver' in window && !reduced.matches) {
  const headings = [...document.querySelectorAll<HTMLElement>('[data-split]')];
  headings.forEach(splitWords);
  document.querySelectorAll<HTMLElement>('[data-stagger]').forEach(group => {
    const step = Number(group.dataset.stagger) || 90;
    [...group.querySelectorAll<HTMLElement>(':scope > [data-reveal]')].forEach((child, i) => child.style.setProperty('--d', `${i * step}ms`));
  });
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-split]')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  root.classList.add('motion-ready');
  targets.forEach(target => {
    const box = target.getBoundingClientRect();
    if (box.top < window.innerHeight * 0.92 && box.bottom > 0) target.classList.add('is-in');
    else observer.observe(target);
  });
  // If anything goes wrong, the content stays readable.
  window.addEventListener('error', () => root.classList.remove('motion-ready'), { once: true });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    observer.disconnect();
    targets.forEach(target => target.classList.add('is-in'));
    root.classList.remove('motion-ready');
  });
}

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

/* "Your next escape": a pinned stage on large screens. Scroll position chooses the scene; the tabs jump to a scene. */
const escapes = document.querySelector<HTMLElement>('[data-escapes]');
const escapeTrack = escapes?.querySelector<HTMLElement>('[data-escape-track]') ?? null;
const escapeStage = escapes?.querySelector<HTMLElement>('[data-escape-stage]') ?? null;
const escapeScenes = escapeStage ? [...escapeStage.querySelectorAll<HTMLElement>('[data-scene]')] : [];
const escapeTabs = escapeStage ? [...escapeStage.querySelectorAll<HTMLButtonElement>('[data-escape-go]')] : [];
const stageQuery = window.matchMedia('(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)');
let stageOn = false, stageActive = -1, headerHeight = 78;
function syncStage() {
  stageOn = !!escapeStage && escapeScenes.length > 0 && stageQuery.matches;
  root.classList.toggle('stage-ready', stageOn);
  headerHeight = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 78;
  if (!stageOn && escapeStage) {
    stageActive = -1;
    escapeScenes.forEach(scene => { scene.removeAttribute('data-state'); scene.style.removeProperty('--lp'); });
    escapeTabs.forEach(tab => tab.removeAttribute('aria-current'));
  }
}
function paintStage() {
  if (!stageOn || !escapeTrack || !escapeStage) return;
  const box = escapeTrack.getBoundingClientRect();
  const total = Math.max(1, box.height - escapeStage.offsetHeight);
  const progress = clamp((headerHeight - box.top) / total, 0, 1);
  const count = escapeScenes.length;
  const active = Math.min(count - 1, Math.floor(progress * count));
  escapeStage.style.setProperty('--sp', progress.toFixed(4));
  escapeScenes.forEach((scene, i) => {
    scene.style.setProperty('--lp', clamp(progress * count - i, 0, 1).toFixed(3));
    if (i === active) scene.dataset.state = 'active'; else scene.dataset.state = i < active ? 'before' : 'after';
  });
  if (active !== stageActive) {
    stageActive = active;
    escapeStage.dataset.active = String(active);
    escapeTabs.forEach((tab, i) => { if (i === active) tab.setAttribute('aria-current', 'true'); else tab.removeAttribute('aria-current'); });
  }
}
escapeTabs.forEach((tab, i) => tab.addEventListener('click', () => {
  if (!escapeTrack || !escapeStage) return;
  const box = escapeTrack.getBoundingClientRect();
  const total = Math.max(1, box.height - escapeStage.offsetHeight);
  const target = window.scrollY + box.top - headerHeight + ((i + 0.5) / escapeScenes.length) * total;
  window.scrollTo({ top: target, behavior: reduced.matches ? 'auto' : 'smooth' });
}));
stageQuery.addEventListener('change', () => { syncStage(); schedule(); });
window.addEventListener('resize', () => { syncStage(); });
syncStage();

/* Scroll motion: one frame per scroll event, reads before writes. */
const header = document.querySelector<HTMLElement>('.site-header');
const hero = document.querySelector<HTMLElement>('[data-hero]');
const pageHero = document.querySelector<HTMLElement>('.page-hero');
const yacht = document.querySelector<HTMLElement>('[data-yacht]');
const parallax = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
let lastY = window.scrollY, frameId = 0;
const visible = new Set<Element>();
if ('IntersectionObserver' in window) {
  const spy = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target); }), { rootMargin: '120px 0px' });
  [...parallax, ...(yacht ? [yacht] : [])].forEach(element => spy.observe(element));
  if (hero) new IntersectionObserver(entries => root.classList.toggle('hero-dormant', !entries[0].isIntersecting), { threshold: 0 }).observe(hero);
}

function paint() {
  frameId = 0;
  const y = window.scrollY;
  const vh = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - vh);
  root.style.setProperty('--progress', clamp(y / max, 0, 1).toFixed(4));
  header?.classList.toggle('is-scrolled', y > 40);
  paintStage();
  const delta = y - lastY;
  if (Math.abs(delta) > 6) {
    const focused = header?.contains(document.activeElement);
    if (delta > 0 && y > vh * 0.55 && !focused && !root.classList.contains('menu-open')) header?.classList.add('is-hidden');
    else if (delta < 0) header?.classList.remove('is-hidden');
    lastY = y;
  }
  if (y < 120) header?.classList.remove('is-hidden');
  if (reduced.matches) return;
  if (hero && y < hero.offsetHeight + 80) {
    const progress = clamp(y / hero.offsetHeight, 0, 1);
    hero.style.setProperty('--hero-shift', `${(y * 0.26).toFixed(1)}px`);
    hero.style.setProperty('--copy-shift', `${(-y * 0.1).toFixed(1)}px`);
    hero.style.setProperty('--copy-fade', clamp(1 - progress * 1.5, 0, 1).toFixed(3));
    hero.style.setProperty('--rail-shift', `${(y * 0.05).toFixed(1)}px`);
  }
  if (pageHero && y < pageHero.offsetHeight + 80) pageHero.style.setProperty('--hero-shift', `${(y * 0.22).toFixed(1)}px`);
  for (const element of parallax) {
    if (!visible.has(element)) continue;
    const box = element.getBoundingClientRect();
    const factor = Number(element.dataset.parallax) || 0.06;
    const offset = (box.top + box.height / 2 - vh / 2) * -factor;
    element.style.setProperty('--par', `${clamp(offset, -box.height * 0.06, box.height * 0.06).toFixed(1)}px`);
  }
  if (yacht && visible.has(yacht)) {
    const box = yacht.getBoundingClientRect();
    const progress = clamp((vh - box.top) / (vh + box.height * 0.6), 0, 1);
    yacht.style.setProperty('--yacht-scale', (1.2 - progress * 0.2).toFixed(4));
  }
}
const schedule = () => { if (!frameId && !document.hidden) frameId = requestAnimationFrame(paint); };
window.addEventListener('scroll', schedule, { passive: true });
window.addEventListener('resize', schedule);
window.addEventListener('pageshow', schedule);
header?.addEventListener('focusin', () => header.classList.remove('is-hidden'));
schedule();
