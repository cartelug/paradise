// Enlarged text can need the stacked composition even on a wide screen.
// This observes layout only; the artwork remains still.
const hero = document.querySelector<HTMLElement>('.hero--atlas');
const title = hero?.querySelector<HTMLElement>('h1');
const body = document.body;
const wide = window.matchMedia('(min-width: 1000px)');

function fitReference() {
  if (!hero || !title) return;
  const width = hero.clientWidth;
  const alreadyExpanded = body.hasAttribute('data-expanded-hero');
  const expected = alreadyExpanded
    ? Math.min(62, Math.max(34, window.innerWidth * .063))
    : Math.min(100, Math.max(42, width * .048));
  const enlarged = wide.matches && parseFloat(getComputedStyle(title).fontSize) > expected * 1.2;
  body.toggleAttribute('data-expanded-hero', enlarged);
}

if (hero && title) {
  const observer = new ResizeObserver(fitReference);
  observer.observe(title);
  observer.observe(hero);
  window.addEventListener('resize', fitReference, { passive: true });
  document.fonts.ready.then(fitReference);
  fitReference();
}
