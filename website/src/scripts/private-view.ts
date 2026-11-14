// Private View: one progressive enhancement owner. No pending content is hidden.
export {};
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 767px)');
const fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1000px)');
const active = new Set<Animation>();
const finished = new WeakSet<Element>();
const mediaQuery = '.ws-window, .dest > .frame, .card-media.frame, .journal-card .frame, .article-next .frame';
const protectedQuery = '[data-hero], .coastal-opening-scene, .ws-leopard, .hero-art, .art-heading, [data-motion-still]';
const commercial = '.price, .ws-price, .yacht-rate, [data-price]';
function eligible(element: HTMLElement) {
  if (element.closest(protectedQuery)) return false;
  if (element.matches('form, input, select, textarea') || element.querySelector('form, input, textarea')) return false;
  // No price or ancestor containing one can move. Media siblings are deliberately independent.
  if (element.matches(commercial) || element.querySelector(commercial)) return false;
  return !element.closest('.glance-card, .enquiry-card, .picker');
}
const candidates = [...new Set(document.querySelectorAll<HTMLElement>(`[data-reveal], [data-split], ${mediaQuery}, .ws-eyebrow > span`))].filter(eligible);
// A parent arrival owns its children; never layer two transforms on the same visual group.
const targets = candidates.filter(element => !candidates.some(parent => parent !== element && parent.contains(element)));
const settle = () => { active.forEach(animation => animation.cancel()); active.clear(); };
function arrive(element: HTMLElement) {
  if (finished.has(element)) return;
  finished.add(element);
  element.classList.add('is-in');
  if (reduced.matches || root.classList.contains('motion-paused') || !element.animate) return;
  if (element.contains(document.activeElement)) return;
  const isMedia = element.matches(mediaQuery);
  const small = compact.matches;
  const frames: Keyframe[] = isMedia && !small
    ? [{ opacity: .65, clipPath: 'inset(0 0 7% 0 round 8px)' }, { opacity: 1, clipPath: 'inset(0 0 0 0 round 8px)' }]
    : [{ opacity: .4, transform: `translateY(${small ? 8 : 16}px)` }, { opacity: 1, transform: 'translateY(0)' }];
  const animation = element.animate(frames, { duration: isMedia ? (small ? 380 : 620) : (small ? 360 : 480), easing: 'cubic-bezier(.22,1,.36,1)' });
  active.add(animation);
  animation.finished.catch(() => {}).finally(() => { animation.cancel(); active.delete(animation); });
}
let observer: IntersectionObserver | null = null;
function initialize() {
  if (observer || reduced.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) { arrive(entry.target as HTMLElement); observer?.unobserve(entry.target); }
  }, { threshold: 0, rootMargin: '0px 0px 4% 0px' });
  const limit = innerHeight;
  for (const target of targets) {
    const box = target.getBoundingClientRect();
    // Above-fold and already-passed content is immediately available, never reintroduced.
    if (box.top < limit || target.contains(document.activeElement)) { finished.add(target); target.classList.add('is-in'); }
    else observer.observe(target);
  }
}
if (root.classList.contains('is-ready')) initialize();
else {
  const ready = new MutationObserver(() => { if (root.classList.contains('is-ready')) { ready.disconnect(); initialize(); } });
  ready.observe(root, { attributes: true, attributeFilter: ['class'] });
}
reduced.addEventListener('change', () => { settle(); if (reduced.matches) { observer?.disconnect(); observer = null; } else initialize(); });
window.addEventListener('pardus:motion', settle);
window.addEventListener('pagehide', () => { settle(); observer?.disconnect(); observer = null; });
window.addEventListener('pageshow', () => initialize());
document.addEventListener('visibilitychange', () => { if (document.hidden) settle(); });
document.addEventListener('focusin', settle);
window.addEventListener('hashchange', settle);
compact.addEventListener('change', settle);
fine.addEventListener('change', settle);

// Scroll-linked chapter rules share one event-scheduled frame. No image or animal follows scroll.
const chapters = [...document.querySelectorAll<HTMLElement>('.steps')];
let frame = 0;
function paintChapters() {
  frame = 0;
  if (reduced.matches || document.hidden) return;
  const positions = chapters.map(element => ({ element, box: element.getBoundingClientRect() }));
  for (const { element, box } of positions) {
    const progress = Math.max(0, Math.min(1, (innerHeight * .85 - box.top) / Math.max(1, box.height)));
    element.style.setProperty('--chapter', progress.toFixed(3));
  }
}
const schedule = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(paintChapters); };
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
addEventListener('pageshow', schedule);
addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; });
reduced.addEventListener('change', () => { chapters.forEach(el => el.style.removeProperty('--chapter')); schedule(); });
if ('ResizeObserver' in window) { const resize = new ResizeObserver(schedule); chapters.forEach(el => resize.observe(el)); }
schedule();
