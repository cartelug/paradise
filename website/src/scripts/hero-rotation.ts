// V42 (31 October 2026): the phone hero cross-fades five photographs, each held for about three seconds with a long,
// eased dissolve (data-hold / data-fade on the rotator, in milliseconds).
//   - It only runs on phones (max-width 767px). Wider screens keep the single desktop artwork and never load these pictures.
//   - The first photograph is the still picture: without JavaScript, with reduced motion, and after Pause scene.
//   - It starts once the opening has released the page, and stops while the tab is hidden, the hero is off screen
//     or the visitor has paused the scene (the pause button, or the saved preference read by ui.ts).
//   - A photograph is only faded in once it has downloaded and decoded, so the dissolve never shows a blank frame.
//   - Nothing here reacts to a pointer, a finger, a tilt or the scroll: the sequence is driven by time alone.
//   - Exactly one slide is exposed to assistive technology at a time (the others carry aria-hidden).
export {};
const root = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero]');
const rotator = hero?.querySelector<HTMLElement>('[data-hero-rotator]');

if (hero && rotator) {
  const slides = [...rotator.querySelectorAll<HTMLElement>('[data-hero-slide]')];
  const phone = window.matchMedia('(max-width: 767px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hold = Number(rotator.dataset.hold) || 3000;
  const fade = Number(rotator.dataset.fade) || 1400;
  rotator.style.setProperty('--hero-fade', `${fade}ms`);
  const wait = (ms: number) => new Promise<void>(resolve => window.setTimeout(resolve, ms));
  let index = 0;
  let timer = 0;
  let fading = false;
  let started = false;
  let onScreen = true;

  const pictureOf = (slide: HTMLElement) => slide.querySelector<HTMLImageElement>('img')!;
  const loaded = (image: HTMLImageElement) => image.complete && image.naturalWidth > 1;
  const paused = () => root.classList.contains('motion-paused');
  const allowed = () => phone.matches && !reduced.matches && !paused() && onScreen && !document.hidden;

  function report() {
    rotator!.dataset.rotation = reduced.matches || !phone.matches ? 'still' : allowed() && started ? 'running' : 'paused';
  }

  function schedule() {
    window.clearTimeout(timer);
    report();
    if (started && !fading && allowed()) timer = window.setTimeout(advance, hold);
  }

  async function advance() {
    if (fading || !allowed()) return schedule();
    const next = (index + 1) % slides.length;
    const from = slides[index];
    const to = slides[next];
    const image = pictureOf(to);
    // The photographs below the first are lazy; ask for the next one now, so it is ready when its turn comes.
    image.loading = 'eager';
    if (!loaded(image)) {
      await Promise.race([
        new Promise<void>(resolve => { image.addEventListener('load', () => resolve(), { once: true }); image.addEventListener('error', () => resolve(), { once: true }); }),
        wait(2500),
      ]);
    }
    // Still on its way (a slow connection): keep the current photograph and look again after another hold.
    if (!loaded(image)) return schedule();
    try { await image.decode(); } catch { /* A decode failure still leaves a drawable image. */ }
    if (!allowed()) return schedule();

    fading = true;
    to.removeAttribute('aria-hidden');
    from.setAttribute('aria-hidden', 'true');
    to.dataset.state = 'entering';
    await wait(fade + 60);
    from.dataset.state = 'idle';
    to.dataset.state = 'current';
    index = next;
    fading = false;
    schedule();
  }

  function start() {
    if (started) return;
    started = true;
    schedule();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { onScreen = entries[entries.length - 1].isIntersecting; schedule(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', schedule);
  window.addEventListener('pageshow', schedule);
  window.addEventListener('pardus:motion', schedule);
  phone.addEventListener('change', schedule);
  reduced.addEventListener('change', schedule);

  // The opening releases the page by adding is-ready; the first photograph then gets its full hold.
  if (root.classList.contains('is-ready')) start();
  else {
    new MutationObserver((_, observer) => { if (root.classList.contains('is-ready')) { observer.disconnect(); start(); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
    // Failsafe: never leave the photographs waiting on an opening that did not report.
    window.addEventListener('load', () => window.setTimeout(start, 6000), { once: true });
  }
  report();
}
