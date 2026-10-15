// Keeps the hero leopard gently alive, and calm. The artwork is layered (see Hero.astro): this script moves the layers.
//   - the head sways a little by itself, slowly, and never follows the visitor's pointer, finger or phone
//   - a slow, relaxed blink every so often (the way a contented cat slow-blinks), no glowing eyes, no flaring, no vibration
//   - drifting golden motes in the light, with a speed check that drops the extras on slow devices
//   - the hero pins place themselves so nothing in the hero ever overlaps
// Breathing and the light band are pure CSS. Everything here stops for reduced motion, for the Pause scene button, in
// hidden tabs and when the hero is off screen. Without this script the hero is a complete still picture.
// Owner's note (15 October 2026): the earlier glowing, pointer-following, startling leopard unsettled some clients, so
// none of that behaviour is wanted. The animal is there to feel warm and regal, not to watch the visitor.
export {};
const root = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero-life]');

if (hero) {
  const picture = hero.querySelector<HTMLElement>('.hero-picture');
  const eyes = hero.querySelector<HTMLElement>('[data-leopard-eyes]');
  const canvas = hero.querySelector<HTMLCanvasElement>('[data-hero-motes]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const touchLike = window.matchMedia('(pointer: coarse)');

  let visible = true;
  let raf = 0;
  let last = 0;
  let nextBlink = 0;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let shown = { x: 99, y: 99 };
  let sampled = 0;
  let sampleTime = 0;

  const paused = () => root.classList.contains('motion-paused');
  const active = () => !reduced.matches && !paused() && visible && !document.hidden && root.classList.contains('is-ready');

  /* ---------- pins on the picture ----------
     Each pin opens its label on the side with room. A pin whose dot or label would touch the headline, the chips, the
     buttons, the price bar, the header, the leopard or another pin steps aside, so nothing in the hero ever overlaps. */
  const spotLayer = hero.querySelector<HTMLElement>('[data-hero-spots]');
  const spotEls = spotLayer ? [...spotLayer.querySelectorAll<HTMLElement>('.spot')] : [];
  const SIDES = ['above', 'below', 'right', 'left'];
  const stackedQuery = window.matchMedia('(max-width: 760px), (max-aspect-ratio: 11/10)');
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
    // The head sways a little, so the animal is given a little room beyond where it rests.
    const box = hero!.querySelector('[data-leopard-box]');
    if (box) { const rest = boxOf(box.getBoundingClientRect()); list.push({ l: rest.l - 14, t: rest.t - 10, r: rest.r + 14, b: rest.b + 10 }); }
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

  /* ---------- the leopard zone on phones ----------
     Container height units are unreliable for a flex item that grows to fill the screen, so the zone's height is measured
     here and handed to the CSS, which sizes the leopard to use all the room between the copy and the destination cards. */
  const zone = hero.querySelector<HTMLElement>('.hero-zone');
  if (zone && 'ResizeObserver' in window) {
    const measure = () => { const height = zone.getBoundingClientRect().height; if (height > 0) hero!.style.setProperty('--zone-h', `${height.toFixed(1)}px`); };
    new ResizeObserver(measure).observe(zone);
    measure();
  }

  /* ---------- the pose ----------
     --gx and --gy are a tiny sway of the head (and the matching counter-drift of the world behind it). They come only from
     the slow idle motion in the loop below; nothing the visitor does (pointer, touch, tilt, scroll) changes them. */
  function paintPose() {
    if (!picture) return;
    if (Math.abs(shown.x - current.x) > 0.002 || Math.abs(shown.y - current.y) > 0.002) {
      picture.style.setProperty('--gx', current.x.toFixed(3));
      picture.style.setProperty('--gy', current.y.toFixed(3));
      shown.x = current.x; shown.y = current.y;
    }
  }

  /* ---------- eyes: one slow, relaxed blink ---------- */
  function slowBlink() {
    if (!eyes) return;
    eyes.animate([{ opacity: 0 }, { opacity: 1, offset: 0.34 }, { opacity: 1, offset: 0.62 }, { opacity: 0 }], { duration: 1000, easing: 'ease-in-out' });
  }

  /* ---------- drifting motes ---------- */
  type Mote = { x: number; y: number; size: number; rise: number; sway: number; phase: number; tw: number };
  let motes: Mote[] = [];
  let context: CanvasRenderingContext2D | null = null;
  let canvasW = 0, canvasH = 0;
  function sizeCanvas() {
    if (!canvas || !picture) return;
    const ratio = Math.min(window.devicePixelRatio || 1, touchLike.matches ? 1.5 : 2);
    const w = Math.round(picture.clientWidth * ratio), h = Math.round(picture.clientHeight * ratio);
    if (w === canvasW && h === canvasH) return;
    canvasW = w; canvasH = h; canvas.width = w; canvas.height = h;
    context = canvas.getContext('2d');
    const count = touchLike.matches ? 22 : 38;
    // Most of the light is on the right, near the sun and the animal.
    motes = Array.from({ length: count }, () => ({
      x: 0.28 + Math.random() * 0.72, y: Math.random(), size: 0.7 + Math.random() * 1.7, rise: 0.012 + Math.random() * 0.03,
      sway: 0.004 + Math.random() * 0.012, phase: Math.random() * Math.PI * 2, tw: 0.5 + Math.random() * 1.2,
    }));
  }
  // One soft glow is drawn once and stamped for every mote, so a frame allocates nothing.
  let sprite: HTMLCanvasElement | null = null;
  function makeSprite() {
    const size = 64;
    const piece = document.createElement('canvas');
    piece.width = piece.height = size;
    const c = piece.getContext('2d');
    if (!c) return null;
    const gradient = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255, 228, 164, 1)');
    gradient.addColorStop(0.35, 'rgba(255, 214, 140, .45)');
    gradient.addColorStop(1, 'rgba(255, 200, 120, 0)');
    c.fillStyle = gradient;
    c.fillRect(0, 0, size, size);
    return piece;
  }
  function drawMotes(now: number, dt: number) {
    if (!context || !canvas) return;
    sprite ??= makeSprite();
    if (!sprite) return;
    context.clearRect(0, 0, canvasW, canvasH);
    context.globalCompositeOperation = 'lighter';
    const unit = canvasH / 900;
    for (const mote of motes) {
      mote.y -= mote.rise * dt;
      mote.x += Math.sin(now / 1000 * mote.tw + mote.phase) * mote.sway * dt;
      if (mote.y < -0.04) { mote.y = 1.04; mote.x = 0.28 + Math.random() * 0.72; }
      const fade = clamp(Math.sin(Math.PI * clamp(mote.y, 0, 1)), 0, 1);
      const twinkle = 0.55 + 0.45 * Math.sin(now / 1000 * mote.tw * 2 + mote.phase);
      const radius = mote.size * unit * 6.6;
      context.globalAlpha = 0.55 * fade * twinkle;
      context.drawImage(sprite, mote.x * canvasW - radius, mote.y * canvasH - radius, radius * 2, radius * 2);
    }
    context.globalAlpha = 1;
  }

  /* ---------- the loop ---------- */
  function frame(now: number) {
    raf = 0;
    if (!active()) { hero!.dataset.life = reduced.matches ? 'still' : 'paused'; return; }
    hero!.dataset.life = 'running';
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    // Speed check: if the first two seconds of frames average slower than about 33 fps, keep the animal and drop the extras.
    if (last && sampled < 120) { sampleTime += (now - last) / 1000; sampled++; if (sampled === 120 && sampleTime / 120 > 0.03) hero!.dataset.quality = 'lite'; }
    last = now;
    // A slow, small sway of the head: about one gentle turn every ten seconds, never toward the visitor.
    target.x = Math.sin(now / 6900) * 0.3 + Math.sin(now / 11300) * 0.12;
    target.y = Math.sin(now / 8300 + 1) * 0.14;
    const ease = 1 - Math.exp(-dt * 2.2);
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    paintPose();
    if (now >= nextBlink) { slowBlink(); nextBlink = now + 7000 + Math.random() * 6000; }
    if (hero!.dataset.quality !== 'lite') drawMotes(now, dt);
    raf = requestAnimationFrame(frame);
  }
  function wake() {
    if (!raf && active()) { last = 0; raf = requestAnimationFrame(frame); }
  }
  function sync() {
    if (reduced.matches) {
      hero!.dataset.life = 'still';
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      return;
    }
    if (active()) { sizeCanvas(); if (nextBlink === 0) nextBlink = performance.now() + 6500; wake(); }
    else hero!.dataset.life = 'paused';
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pardus:motion', sync);
  window.addEventListener('resize', () => { canvasW = 0; sync(); }, { passive: true });
  reduced.addEventListener('change', sync);
  // The opening hands over to the hero when the page becomes ready.
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['class'] });
  sync();
}
