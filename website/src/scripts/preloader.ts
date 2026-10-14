// HARD RULE: the preloader is permanent in every build (CLAUDE.md, tests/preloader.test.mjs).
// This script times it, lets visitors skip it, and guarantees it can never trap anyone.
const KEY = 'pardus-intro-v30';
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector<HTMLElement>('[data-pardus-intro]');
const shell = document.querySelector<HTMLElement>('[data-pardus-shell]');
const skip = document.querySelector<HTMLButtonElement>('[data-skip-intro]');

// Full sequence: logo trace, wordmark, aircraft, tagline. A still brand screen is shown for reduced motion.
const MIN_MS = () => (reduced.matches ? 1300 : 3500);
const DEADLINE_MS = () => (reduced.matches ? 2600 : 5600);
const EXIT_MS = () => (reduced.matches ? 380 : 1000);

let minTimer = 0, deadline = 0, exitTimer = 0, readyTimer = 0;

if (root.dataset.introFailsafe) window.clearTimeout(Number(root.dataset.introFailsafe));

function markReady() {
  window.clearTimeout(readyTimer);
  root.classList.add('is-ready');
}

function finishIntro(immediate = false) {
  window.clearTimeout(minTimer);
  window.clearTimeout(deadline);
  if (!root.classList.contains('intro-active')) return;
  if (root.classList.contains('intro-exiting') && !immediate) return;
  window.clearTimeout(exitTimer);
  const restoreFocus = !!intro?.contains(document.activeElement);
  const complete = () => {
    window.clearTimeout(exitTimer);
    root.classList.remove('intro-active', 'intro-exiting');
    markReady();
    shell?.removeAttribute('inert');
    try { sessionStorage.setItem(KEY, 'seen'); } catch { /* Storage is optional. */ }
    if (restoreFocus) document.querySelector<HTMLElement>('#main')?.focus({ preventScroll: true });
  };
  if (immediate) { complete(); return; }
  root.classList.add('intro-exiting');
  // The hero begins to arrive just as the curtains open.
  readyTimer = window.setTimeout(markReady, reduced.matches ? 0 : 380);
  exitTimer = window.setTimeout(complete, EXIT_MS());
}

function beginIntro() {
  if (!intro) { markReady(); return; }
  shell?.setAttribute('inert', '');
  skip?.focus({ preventScroll: true });
  const started = Number(root.dataset.introStarted || performance.now());
  const elapsed = () => performance.now() - started;
  // Fonts and the hero photograph are awaited, but never past the deadline.
  const image = document.querySelector<HTMLImageElement>('[data-hero-image]');
  const artwork = image ? image.decode().catch(() => undefined) : Promise.resolve();
  Promise.allSettled([artwork, document.fonts?.ready]).then(() => {
    if (!root.classList.contains('intro-active') || root.classList.contains('intro-exiting')) return;
    minTimer = window.setTimeout(() => finishIntro(), Math.max(0, MIN_MS() - elapsed()));
  });
  deadline = window.setTimeout(() => finishIntro(), Math.max(0, DEADLINE_MS() - elapsed()));
}

skip?.addEventListener('click', () => finishIntro(true));
intro?.addEventListener('keydown', event => {
  if (event.key === 'Escape') finishIntro(true);
  if (event.key === 'Tab') { event.preventDefault(); skip?.focus(); }
});

if (root.classList.contains('intro-active')) beginIntro();
else markReady();
