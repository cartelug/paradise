// A floating "Plan your escape" button for phones, so the main action is always one thumb away once the hero has gone.
// It stays out of the way: hidden over the hero, the service picker (which has its own button), the enquiry form, the footer,
// the menu and the opening. Without this script the button simply never appears.
export {};
const cta = document.querySelector<HTMLElement>('[data-sticky-cta]');
const root = document.documentElement;
if (cta && 'IntersectionObserver' in window) {
  const hero = document.querySelector('[data-hero]');
  const quiet = [...document.querySelectorAll('[data-picker], #enquire, .site-footer')];
  let heroGone = false;
  const covering = new Set<Element>();
  function update() {
    const show = heroGone && covering.size === 0 && !root.classList.contains('menu-open') && !root.classList.contains('intro-active');
    cta!.dataset.on = String(show);
    cta!.tabIndex = show ? 0 : -1;
    cta!.setAttribute('aria-hidden', String(!show));
  }
  if (hero) new IntersectionObserver(entries => { heroGone = !entries[0].isIntersecting; update(); }, { threshold: 0, rootMargin: '0px 0px -30% 0px' }).observe(hero);
  const watcher = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) covering.add(entry.target); else covering.delete(entry.target); });
    update();
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  quiet.forEach(element => watcher.observe(element));
  new MutationObserver(update).observe(root, { attributes: true, attributeFilter: ['class'] });
  update();
}
