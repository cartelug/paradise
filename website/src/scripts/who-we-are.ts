const section = document.querySelector<HTMLElement>('[data-who-reference]');
const images = section ? [...section.querySelectorAll<HTMLImageElement>('[data-who-image], [data-who-base]')] : [];
const probe = section?.querySelector<HTMLElement>('.who-reference-rem');
if (section && images.length && probe) {
  let request = 0;
  const fit = () => section.toggleAttribute('data-who-flow', probe.getBoundingClientRect().width > 18);
  const ready = async () => {
    const current = ++request;
    if (images.some(im => !im.complete || !im.naturalWidth)) return;
    try { await Promise.all(images.map(im => im.decode())); if(current === request) section.setAttribute('data-who-ready',''); }
    catch { section.removeAttribute('data-who-ready'); }
  };
  for (const im of images) { im.addEventListener('load', ready); im.addEventListener('error',()=>{ ++request; section.removeAttribute('data-who-ready'); }); }
  new ResizeObserver(fit).observe(probe);
  window.addEventListener('resize', fit, {passive:true});
  document.fonts.ready.then(fit); fit(); ready();
  let intersects = false;
  const heading = section.querySelector<HTMLElement>('[data-art-heading]');
  const reveal = () => {
    if (!intersects || !document.documentElement.classList.contains('is-ready') || !heading?.hasAttribute('data-art-ready')) return;
    section.setAttribute('data-who-visible', '');
    observer.disconnect(); arrival.disconnect();
  };
  const observer = new IntersectionObserver(entries=>{intersects=entries.some(e=>e.isIntersecting);reveal();},{threshold:.1});
  const arrival = new MutationObserver(reveal);
  arrival.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  if (heading) arrival.observe(heading,{attributes:true,attributeFilter:['data-art-ready']});
  observer.observe(section);
}
