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
// V49 (15 November 2026): scroll arrivals on every page and every device. Each kind of block has its own entrance:
// headings rise out of a soft focus, eyebrows glide in from the left, paragraphs lift, pictures open like a window while the
// photograph settles, list items, cards, questions and footer columns follow one another, and buttons settle into place.
// Content is never pre-hidden (it starts invisible only for the frames of its own entrance, after it nears the viewport),
// prices, priced cards, forms and animals never move, and reduced motion or Pause switches all of it off.
const pricedCard = ':is(.card, .dest, .exp, .tile, .concept, .ws-card, .glance-card, .offer, .package, article):has(.price, .ws-price, .yacht-rate, [data-price])';
const blockQuery = [
  'main section h2', 'main section h3', 'main .eyebrow', 'main .lead', 'main .ws-eyebrow > span', 'main section p:not(.eyebrow):not(.lead)',
  'main section li', 'main details', 'main figure', 'main blockquote', 'main .actions', 'main section .btn',
  'main .card', 'main .dest', 'main .exp', 'main .tile', 'main .concept', 'main .promise', 'main .journal-card', 'main .travel-update',
  '.page-hero .breadcrumb', 'footer .footer-brand', 'footer .footer-links', 'footer .footer-contact', 'footer .footer-licences',
].join(', ');
function eligible(element: HTMLElement) {
  if (element.closest(protectedQuery) || element.closest('.pardus-intro, .menu, .folio-panel, dialog')) return false;
  if (element.matches('form, input, select, textarea, label') || element.closest('form') || element.querySelector('form, input, textarea')) return false;
  // No price or ancestor containing one can move, and nothing inside a priced card moves either.
  if (element.matches(commercial) || element.querySelector(commercial) || element.closest(commercial)) return false;
  if (element.closest(pricedCard) && !element.matches(mediaQuery)) return false;
  if (element.closest('.glance-card, .enquiry-card, .picker, .page-hero h1, .page-hero .lead')) return false;
  const box = element.getBoundingClientRect();
  return box.width > 0 && box.height > 0;
}
const candidates = [...new Set(document.querySelectorAll<HTMLElement>(`[data-reveal], [data-split], ${mediaQuery}, ${blockQuery}`))].filter(eligible);
// A parent arrival owns its children; never layer two transforms on the same visual group.
const targets = candidates.filter(element => !candidates.some(parent => parent !== element && parent.contains(element)));
const settle = () => { active.forEach(animation => animation.cancel()); active.clear(); };
type Kind = 'media' | 'heading' | 'eyebrow' | 'item' | 'action' | 'text';
function kindOf(element: HTMLElement): Kind {
  if (element.matches(mediaQuery) || element.matches('figure')) return 'media';
  if (element.matches('h2, h3, [data-split]')) return 'heading';
  if (element.matches('.eyebrow, .ws-eyebrow > span, .breadcrumb')) return 'eyebrow';
  if (element.matches('.actions, .btn')) return 'action';
  if (element.matches('li, details, .card, .dest, .exp, .tile, .concept, .promise, .journal-card, .travel-update, footer *, blockquote')) return 'item';
  return 'text';
}
const ease = 'cubic-bezier(.22,1,.36,1)';
function choreography(kind: Kind): { frames: Keyframe[]; duration: number } {
  const small = compact.matches;
  const lift = small ? 14 : 26;
  switch (kind) {
    case 'media': return {
      frames: [{ opacity: 0, clipPath: small ? 'inset(0 0 14% 0 round 8px)' : 'inset(10% 6% 10% 6% round 14px)' }, { opacity: 1, clipPath: 'inset(0 0 0 0 round 0px)' }],
      duration: small ? 640 : 900 };
    case 'heading': return {
      frames: [{ opacity: 0, transform: `translateY(${lift}px)`, filter: 'blur(8px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
      duration: small ? 620 : 820 };
    case 'eyebrow': return {
      frames: [{ opacity: 0, transform: `translateX(${small ? -14 : -24}px)` }, { opacity: 1, transform: 'none' }],
      duration: small ? 520 : 680 };
    case 'action': return {
      frames: [{ opacity: 0, transform: `translateY(${lift / 2}px) scale(.94)` }, { opacity: 1, transform: 'none' }],
      duration: small ? 520 : 640 };
    case 'item': return {
      frames: [{ opacity: 0, transform: `translateY(${lift}px) scale(.97)` }, { opacity: 1, transform: 'none' }],
      duration: small ? 560 : 720 };
    default: return {
      frames: [{ opacity: 0, transform: `translateY(${Math.round(lift * .7)}px)` }, { opacity: 1, transform: 'none' }],
      duration: small ? 520 : 700 };
  }
}
function arrive(element: HTMLElement, delay = 0) {
  if (finished.has(element)) return;
  finished.add(element);
  element.classList.add('is-in');
  if (reduced.matches || root.classList.contains('motion-paused') || !element.animate) return;
  if (element.contains(document.activeElement)) return;
  const kind = kindOf(element);
  const { frames, duration } = choreography(kind);
  const animation = element.animate(frames, { duration, delay, easing: ease, fill: 'backwards' });
  active.add(animation);
  animation.finished.catch(() => {}).finally(() => { animation.cancel(); active.delete(animation); });
  // The photograph inside an opening picture settles from a gentle close-up as its window opens (pictures only, never a price).
  if (kind === 'media') {
    const image = element.querySelector<HTMLElement>('img');
    if (image && !image.closest(protectedQuery)) {
      const zoom = image.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: duration + 500, delay, easing: ease, fill: 'backwards' });
      active.add(zoom);
      zoom.finished.catch(() => {}).finally(() => { zoom.cancel(); active.delete(zoom); });
    }
  }
}
let observer: IntersectionObserver | null = null;
function initialize() {
  if (observer || reduced.matches || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver(entries => {
    const arriving = entries.filter(entry => entry.isIntersecting).map(entry => entry.target as HTMLElement)
      .sort((a, b) => { const p = a.getBoundingClientRect(), q = b.getBoundingClientRect(); return (p.top - q.top) || (p.left - q.left); });
    const step = compact.matches ? 70 : 90;
    arriving.forEach((element, index) => { arrive(element, Math.min(index * step, 540)); observer?.unobserve(element); });
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
