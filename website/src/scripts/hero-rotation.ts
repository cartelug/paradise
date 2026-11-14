// V46: time-only rotation, preserving the approved hold/fade and complete portrait geometry.
export {};
const root = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero]');
const rotator = hero?.querySelector<HTMLElement>('[data-hero-rotator]');
if (hero && rotator) {
  const slides = [...rotator.querySelectorAll<HTMLElement>('[data-hero-slide]')];
  const layout = matchMedia('(max-width: 767px), (min-width: 1000px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const hold = Number(rotator.dataset.hold) || 3000;
  const fade = Number(rotator.dataset.fade) || 1400;
  rotator.style.setProperty('--hero-fade', `${fade}ms`);
  let index = 0, timer = 0, fallback = 0;
  let started = false, onScreen = true, suspended = false;
  let cycle: AbortController | null = null;
  const displayed = () => rotator.getClientRects().length > 0;
  const paused = () => root.classList.contains('motion-paused');
  const allowed = () => started && !suspended && displayed() && !reduced.matches && !paused() && onScreen && !document.hidden;
  function settle(first = false) {
    if (first) index = 0;
    slides.forEach((slide, n) => {
      slide.dataset.state = n === index ? 'current' : 'idle';
      if (n === index) slide.removeAttribute('aria-hidden'); else slide.setAttribute('aria-hidden', 'true');
    });
  }
  function stop() {
    clearTimeout(timer);
    cycle?.abort(); cycle = null;
  }
  function refresh() {
    stop();
    settle(reduced.matches || paused() || !displayed());
    rotator!.dataset.rotation = reduced.matches || !displayed() ? 'still' : allowed() ? 'running' : 'paused';
    if (allowed()) timer = window.setTimeout(advance, hold);
  }
  function wait(ms: number, signal: AbortSignal) {
    return new Promise<void>(resolve => {
      let id = 0;
      const done = () => { clearTimeout(id); signal.removeEventListener('abort', done); resolve(); };
      if (signal.aborted) return resolve();
      id = window.setTimeout(done, ms);
      signal.addEventListener('abort', done, { once: true });
    });
  }
  function ready(image: HTMLImageElement, signal: AbortSignal) {
    return new Promise<void>(resolve => {
      let id = 0;
      const done = () => {
        clearTimeout(id); image.removeEventListener('load', done); image.removeEventListener('error', done);
        signal.removeEventListener('abort', done); resolve();
      };
      if (signal.aborted || image.complete) return resolve();
      image.addEventListener('load', done, { once: true }); image.addEventListener('error', done, { once: true });
      signal.addEventListener('abort', done, { once: true }); id = window.setTimeout(done, 2500);
    });
  }
  async function advance() {
    if (!allowed() || slides.length < 2) return;
    const current = new AbortController(); cycle = current;
    const { signal } = current;
    const next = (index + 1) % slides.length;
    const image = slides[next].querySelector<HTMLImageElement>('img');
    if (!image) return refresh();
    image.loading = 'eager';
    await ready(image, signal);
    if (signal.aborted) return;
    if (image.naturalWidth <= 1) return refresh();
    try { await image.decode(); } catch { /* Drawable fallback is retained. */ }
    if (signal.aborted || !allowed()) return;
    slides[index].setAttribute('aria-hidden', 'true');
    slides[next].removeAttribute('aria-hidden');
    slides[next].dataset.state = 'entering';
    await wait(fade + 60, signal);
    if (signal.aborted || !allowed()) return;
    index = next;
    refresh();
  }
  function start() { if (!started) { started = true; clearTimeout(fallback); refresh(); } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { const next = entries.at(-1)?.isIntersecting ?? false; if (next !== onScreen) { onScreen = next; refresh(); } }).observe(hero);
  }
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('pardus:motion', refresh);
  layout.addEventListener('change', refresh);
  reduced.addEventListener('change', refresh);
  window.addEventListener('pardus:hero-layout', refresh);
  window.addEventListener('pagehide', () => { suspended = true; clearTimeout(fallback); stop(); settle(); });
  window.addEventListener('pageshow', () => { suspended = false; if (root.classList.contains('is-ready')) start(); refresh(); });
  const readiness = new MutationObserver(() => { if (root.classList.contains('is-ready')) { readiness.disconnect(); start(); } });
  if (root.classList.contains('is-ready')) start();
  else { readiness.observe(root, { attributes: true, attributeFilter: ['class'] }); fallback = window.setTimeout(start, 6000); }
  settle();
}
