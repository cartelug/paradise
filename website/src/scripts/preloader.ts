// HARD RULE: the preloader runs on every page, in every build (CLAUDE.md, tests/preloader.test.mjs).
// Full sequence on the first page of a visit, a quick version afterwards, and curtains that close as you leave.
// This script times it, lets visitors skip it, and guarantees it can never trap anyone.
const KEY = 'pardus-intro-v30';
const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const intro = document.querySelector<HTMLElement>('[data-pardus-intro]');
const shell = document.querySelector<HTMLElement>('[data-pardus-shell]');
const skip = document.querySelector<HTMLButtonElement>('[data-skip-intro]');
const quick = root.classList.contains('intro-quick');

// Smart timing: the full sequence is shown in full; the quick one lasts only as long as the page needs to be ready.
const MIN_MS = () => (reduced.matches ? (quick ? 450 : 1300) : quick ? 650 : 3500);
const DEADLINE_MS = () => (reduced.matches ? (quick ? 2000 : 2600) : quick ? 2600 : 5600);
const EXIT_MS = () => (reduced.matches ? 300 : quick ? 650 : 1000);
const LEAVE_MS = 360;

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
  // The page is usable as soon as the curtains begin to part, and begins to arrive just as they open.
  shell?.removeAttribute('inert');
  readyTimer = window.setTimeout(markReady, reduced.matches ? 0 : quick ? 180 : 380);
  exitTimer = window.setTimeout(complete, EXIT_MS());
}

function beginIntro() {
  if (!intro) { markReady(); return; }
  shell?.setAttribute('inert', '');
  if (quick) { intro.tabIndex = -1; intro.focus({ preventScroll: true }); } else skip?.focus({ preventScroll: true });
  const started = Number(root.dataset.introStarted || performance.now());
  const elapsed = () => performance.now() - started;
  // Fonts and the first photograph are awaited so the page opens complete, but never past the deadline.
  const image = document.querySelector<HTMLImageElement>('[data-hero-image], .page-hero-bg img');
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
  if (event.key === 'Tab') { event.preventDefault(); (quick ? intro : skip)?.focus(); }
});

// Leaving: close the curtains first, then navigate. Modified clicks, new tabs, downloads and in-page links are left alone.
document.addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (root.classList.contains('intro-active') || root.classList.contains('intro-leaving')) return;
  const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download') || link.hasAttribute('data-no-transition')) return;
  let url: URL;
  try { url = new URL(link.href, location.href); } catch { return; }
  if (!/^https?:$/.test(url.protocol) || url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search) return;
  event.preventDefault();
  root.classList.add('intro-leaving');
  const go = () => location.assign(url.href);
  if (reduced.matches) go(); else window.setTimeout(go, LEAVE_MS);
  // If the navigation never happens (for example it is cancelled), the page is released again.
  window.setTimeout(() => root.classList.remove('intro-leaving'), 5000);
});
// Coming back from the back/forward cache must never show a closed page.
window.addEventListener('pageshow', event => {
  if (!event.persisted) return;
  root.classList.remove('intro-leaving', 'intro-active', 'intro-exiting');
  markReady();
  shell?.removeAttribute('inert');
});

if (root.classList.contains('intro-active')) beginIntro();
else markReady();
