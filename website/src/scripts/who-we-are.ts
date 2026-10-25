// Preserve the exact approved image at normal text size. Enlarged text,
// unavailable art and no-script visitors receive the normal-flow real copy.
const section = document.querySelector<HTMLElement>('[data-who-reference]');
const image = section?.querySelector<HTMLImageElement>('[data-who-image]');
const probe = section?.querySelector<HTMLElement>('.who-reference-rem');

if (section && image && probe) {
  let decodeRequest = 0;
  const syncTextSize = () => {
    const enlarged = probe.getBoundingClientRect().width > 18;
    section.toggleAttribute('data-who-flow', enlarged);
  };
  const showArtwork = async () => {
    const request = ++decodeRequest;
    section.removeAttribute('data-who-ready');
    if (!image.complete || !image.naturalWidth) return;
    try {
      await image.decode();
      if (request === decodeRequest && image.naturalWidth) section.setAttribute('data-who-ready', '');
    } catch { section.removeAttribute('data-who-ready'); }
  };
  image.addEventListener('load', showArtwork);
  image.addEventListener('error', () => {
    ++decodeRequest;
    section.removeAttribute('data-who-ready');
  });
  new ResizeObserver(syncTextSize).observe(probe);
  window.addEventListener('resize', syncTextSize, { passive: true });
  document.fonts.ready.then(syncTextSize);
  syncTextSize();
  showArtwork();
}
