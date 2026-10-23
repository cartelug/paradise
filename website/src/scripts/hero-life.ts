// The V31 hero: places the pins on the picture and reports the state of its one slow motion.
//   - the artwork's only motion is a very slow scale (1.00 to 1.03 and back over about 20 s), pure CSS on .hero-art
//   - nothing the visitor does (pointer, finger, tilted phone, scroll) moves the leopard, and nothing reacts to a touch
//   - the pins place themselves so nothing in the hero ever overlaps, and never touch the leopard's head, paws or flight lines
// data-life on the hero says whether the scale is running, paused (Pause scene, hidden tab, hero off screen) or still
// (reduced motion). Without this script the hero is a complete still picture with its copy and prices.
// Owner's note (15 October 2026): a glowing, pointer-following, startling leopard unsettled some clients, so none of that
// behaviour is wanted. The animal is there to feel warm and regal, not to watch the visitor.
export {};
const root = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero-life]');

if (hero) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;

  const paused = () => root.classList.contains('motion-paused');
  function sync() {
    if (reduced.matches) hero!.dataset.life = 'still';
    else hero!.dataset.life = !paused() && visible && !document.hidden ? 'running' : 'paused';
  }

  /* ---------- pins on the picture ----------
     Each pin opens its label on the side with room. A pin whose dot or label would touch the headline, the buttons, the
     price bar, the header, another pin or the leopard's head, paws or flight lines steps aside. */
  const spotLayer = hero.querySelector<HTMLElement>('[data-hero-spots]');
  const spotEls = spotLayer ? [...spotLayer.querySelectorAll<HTMLElement>('.spot')] : [];
  const SIDES = ['above', 'below', 'right', 'left'];
  const stackedQuery = window.matchMedia('(max-width: 760px)');
  type Box = { l: number; t: number; r: number; b: number };
  const boxOf = (rect: DOMRect): Box => ({ l: rect.left, t: rect.top, r: rect.right, b: rect.bottom });
  const PAD = 12;
  const meets = (a: Box, b: Box) => a.l < b.r + PAD && a.r > b.l - PAD && a.t < b.b + PAD && a.b > b.t - PAD;
  function obstacles(): Box[] {
    const list: Box[] = [];
    const copy = hero!.querySelector('[data-hero-copy]');
    if (copy) {
      const range = document.createRange();
      const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.textContent?.trim()) continue;
        range.selectNodeContents(node);
        for (const rect of range.getClientRects()) if (rect.width > 1) list.push(boxOf(rect));
      }
      copy.querySelectorAll('.btn').forEach(element => list.push(boxOf(element.getBoundingClientRect())));
    }
    const rail = hero!.querySelector('[data-hero-rail]');
    if (rail) list.push(boxOf(rail.getBoundingClientRect()));
    // The picture breathes by up to 3%, so the protected parts of the animal are given a little room.
    hero!.querySelectorAll('[data-leopard-box][data-keep="true"]').forEach(element => {
      const rest = boxOf(element.getBoundingClientRect());
      list.push({ l: rest.l - 8, t: rest.t - 8, r: rest.r + 8, b: rest.b + 8 });
    });
    document.querySelectorAll('.site-header .brand-link, .site-header .desktop-nav a, .site-header .header-tools > *').forEach(element => {
      if ((element as HTMLElement).offsetParent !== null) list.push(boxOf(element.getBoundingClientRect()));
    });
    return list;
  }
  function layoutSpots() {
    if (!spotLayer) return;
    const stacked = stackedQuery.matches;
    const frame = boxOf(hero!.getBoundingClientRect());
    frame.r = Math.min(frame.r, document.documentElement.clientWidth);
    const taken = obstacles();
    let shown = 0;
    // Labels slide in; measure them where they rest, not mid-slide.
    spotLayer.classList.add('is-measuring');
    for (const spot of spotEls) {
      spot.dataset.off = 'false';
      if (getComputedStyle(spot).display === 'none') continue;
      const dot = boxOf(spot.getBoundingClientRect());
      const label = spot.querySelector<HTMLElement>('.spot-label');
      const preferred = (stacked ? spot.dataset.mside : spot.dataset.side) || 'above';
      let placed: Box | null = null;
      if (label && !taken.some(other => meets(dot, other))) {
        for (const side of [preferred, ...SIDES.filter(item => item !== preferred)]) {
          spot.dataset.place = side;
          const rect = boxOf(label.getBoundingClientRect());
          const inside = rect.l >= frame.l + 8 && rect.r <= frame.r - 8 && rect.t >= frame.t + 8 && rect.b <= frame.b - 8;
          if (inside && !taken.some(other => meets(rect, other))) { placed = rect; break; }
        }
      }
      if (!placed) { spot.dataset.off = 'true'; continue; }
      taken.push(dot, placed);
      spot.style.setProperty('--k', String(shown++));
    }
    spotLayer.dataset.count = String(shown);
    void spotLayer.offsetWidth;
    spotLayer.classList.remove('is-measuring');
  }
  let spotTimer = 0;
  function scheduleSpots(delay: number) {
    window.clearTimeout(spotTimer);
    // The headline and buttons rise into place after the opening; measure once they have settled.
    spotTimer = window.setTimeout(() => { layoutSpots(); hero!.dataset.spots = 'ready'; }, delay);
  }
  if (spotEls.length) {
    const settle = () => (reduced.matches ? 60 : 2600);
    let scheduled = false;
    const whenReady = () => { if (!scheduled && root.classList.contains('is-ready')) { scheduled = true; scheduleSpots(settle()); } };
    new MutationObserver(whenReady).observe(root, { attributes: true, attributeFilter: ['class'] });
    whenReady();
    let resizeTimer = 0;
    window.addEventListener('resize', () => { window.clearTimeout(resizeTimer); resizeTimer = window.setTimeout(() => { if (hero!.dataset.spots === 'ready') layoutSpots(); }, 180); }, { passive: true });
    document.fonts?.ready.then(() => { if (hero!.dataset.spots === 'ready') layoutSpots(); });
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pardus:motion', sync);
  reduced.addEventListener('change', sync);
  sync();
}
