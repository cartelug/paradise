/* Independent opening controller: the page never depends on the main bundle to open. */
(() => {
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const storageKey = 'pardus-opening-v2';
  let seen = false;
  try { seen = sessionStorage.getItem(storageKey) === 'seen'; } catch { /* Storage is optional. */ }
  const start = !seen && !motion.matches;
  root.classList.add(start ? 'is-opening' : 'page-ready');
  let sequence = 0;
  let returnFocus = null;
  let timer;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const background = () => document.querySelectorAll('.site-header, main, .site-footer, .closing-cta, .skip-link');

  function finish(id = sequence) {
    if (id !== sequence) return;
    clearTimeout(timer);
    sequence++;
    root.classList.remove('is-opening');
    root.classList.add('page-ready');
    background().forEach(el => { el.inert = false; });
    const opening = document.querySelector('.preloader');
    if (opening?.contains(document.activeElement)) {
      (returnFocus || document.querySelector('.brand-link'))?.focus({ preventScroll: true });
    }
    opening?.setAttribute('aria-hidden', 'true');
    const skip = document.querySelector('.skip-opening');
    if (skip) skip.tabIndex = -1;
    try { sessionStorage.setItem(storageKey, 'seen'); } catch { /* Storage is optional. */ }
  }

  // Protect slow or interrupted parsing before any element handlers can be registered.
  if (start) timer = setTimeout(() => finish(), 3500);

  async function play(replay = false) {
    const opening = document.querySelector('.preloader');
    if (!opening || motion.matches) { finish(); return; }
    const id = ++sequence;
    clearTimeout(timer);
    timer = setTimeout(() => finish(id), 2800);
    returnFocus = replay && document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.classList.remove('page-ready');
    root.classList.add('is-opening');
    opening.setAttribute('aria-hidden', 'false');
    const skip = opening.querySelector('.skip-opening');
    if (skip) { skip.tabIndex = 0; skip.focus({ preventScroll: true }); }
    background().forEach(el => { el.inert = true; });
    const hero = document.querySelector('.hero-art img');
    const ready = Promise.allSettled([document.fonts.ready, hero?.decode() || Promise.resolve()]);
    await Promise.all([wait(1600), Promise.race([ready, wait(2300)])]);
    finish(id);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.skip-opening')?.addEventListener('click', () => finish());
    document.querySelector('.replay-opening')?.addEventListener('click', () => { void play(true); });
    root.classList.add('opening-ready');
    if (root.classList.contains('is-opening')) void play();
  }, { once: true });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && root.classList.contains('is-opening')) finish();
  });
  window.addEventListener('pageshow', event => { if (event.persisted) finish(); });
  motion.addEventListener('change', event => { if (event.matches) finish(); });
})();
