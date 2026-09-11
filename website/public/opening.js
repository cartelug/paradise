/* Small, external early boot. The timeout guarantees access even if the main bundle fails. */
(() => {
  const root = document.documentElement;
  // Only the successfully initialized main bundle enables JavaScript-only controls.
  root.classList.add('page-ready');
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
