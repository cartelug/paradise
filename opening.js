/* Small, external early boot. The timeout guarantees access even if the main bundle fails. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  let seen = true;
  try { seen = sessionStorage.getItem('pardus-opening-v2') === 'seen'; } catch { seen = false; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!seen && !reduced) root.classList.add('is-opening');
  else root.classList.add('page-ready');
  setTimeout(() => {
    root.classList.remove('is-opening');
    root.classList.add('page-ready');
    const opening = document.querySelector('.preloader');
    if (opening) opening.setAttribute('aria-hidden', 'true');
    document.querySelectorAll('.site-header, main, .site-footer, .closing-cta').forEach(el => { el.inert = false; });
    const skip = document.querySelector('.skip-opening');
    if (skip) skip.tabIndex = -1;
  }, 3500);
})();
