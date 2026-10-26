export {};
const section = document.querySelector<HTMLElement>('[data-window-seat]');
if (section) {
  section.querySelectorAll<HTMLImageElement>('[data-ws-lettering]').forEach(image => {
    const heading = image.closest<HTMLElement>('[data-ws-heading]');
    const ready = () => { if (image.naturalWidth > 0) heading?.setAttribute('data-ws-ready', ''); };
    if (image.complete) ready(); else image.addEventListener('load', ready, { once: true });
    image.addEventListener('error', () => heading?.removeAttribute('data-ws-ready'));
  });
  // Match the selected dark header only while this band is behind it. One RAF per frame.
  let pending = false;
  function measure() {
    pending = false;
    if (!section) return;
    const box = section.getBoundingClientRect();
    const header = document.querySelector<HTMLElement>('[data-header]');
    const bottom = header?.getBoundingClientRect().bottom || 80;
    document.body.toggleAttribute('data-window-seat-header', box.top <= bottom + 20 && box.bottom > bottom);
    section.toggleAttribute('data-ws-large-text', parseFloat(getComputedStyle(document.documentElement).fontSize) > 20);
  }
  const schedule = () => { if (!pending) { pending = true; requestAnimationFrame(measure); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(section);
  measure();
}
