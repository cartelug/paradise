// Brings the hero leopard to life. The artwork is layered (see Hero.astro): this script moves the layers.
//   - gaze: the animal turns toward the pointer or a finger, and looks around by itself when left alone
//   - blinks and glints at random intervals, a startled glow when the animal is touched
//   - a slow push toward the viewer as the page scrolls
//   - on phones, the animal follows how the phone is tilted
//   - drifting golden motes in the light, with a speed check that drops the extras on slow devices
// Breathing, the eye ignition and the light sweep are pure CSS. Everything here stops for reduced motion, for the Pause
// scene button, in hidden tabs and when the hero is off screen. Without this script the hero is a complete still picture.
export {};
const root = document.documentElement;
const hero = document.querySelector<HTMLElement>('[data-hero-life]');

if (hero) {
  const picture = hero.querySelector<HTMLElement>('.hero-picture');
  const leopard = hero.querySelector<HTMLElement>('[data-leopard]');
  const eyes = hero.querySelector<HTMLElement>('[data-leopard-eyes]');
  const glows = hero.querySelector<HTMLElement>('.hl-glows');
  const canvas = hero.querySelector<HTMLCanvasElement>('[data-hero-motes]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
  const touchLike = window.matchMedia('(pointer: coarse)');

  let visible = true;
  let raf = 0;
  let last = 0;
  let lastInput = -1e9;
  let nextBlink = 0;
  let nextGlint = 0;
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let shown = { x: 99, y: 99, push: -1 };
  let scrollProgress = 0;
  let sampled = 0;
  let sampleTime = 0;

  const paused = () => root.classList.contains('motion-paused');
  const active = () => !reduced.matches && !paused() && visible && !document.hidden && root.classList.contains('is-ready');

  /* ---------- the leopard zone on phones ----------
     Container height units are unreliable for a flex item that grows to fill the screen, so the zone's height is measured
     here and handed to the CSS, which sizes the leopard to use all the room between the copy and the destination cards. */
  const zone = hero.querySelector<HTMLElement>('.hero-zone');
  if (zone && 'ResizeObserver' in window) {
    const measure = () => { const height = zone.getBoundingClientRect().height; if (height > 0) hero!.style.setProperty('--zone-h', `${height.toFixed(1)}px`); };
    new ResizeObserver(measure).observe(zone);
    measure();
  }

  /* ---------- gaze and scroll push ---------- */
  function light(clientX: number, clientY: number, on: boolean) {
    if (!leopard || !picture) return;
    const box = leopard.getBoundingClientRect();
    if (!box.width) return;
    picture.style.setProperty('--sx', `${clamp(((clientX - box.left) / box.width) * 100, -20, 120).toFixed(1)}%`);
    picture.style.setProperty('--sy', `${clamp(((clientY - box.top) / box.height) * 100, -20, 120).toFixed(1)}%`);
    picture.style.setProperty('--spot', on ? '1' : '0');
  }
  function aim(clientX: number, clientY: number) {
    const box = hero!.getBoundingClientRect();
    if (!box.width || !box.height) return;
    light(clientX, clientY, active());
    target.x = clamp(((clientX - box.left) / box.width - 0.5) * 2.1, -1, 1);
    target.y = clamp(((clientY - box.top) / box.height - 0.5) * 2.1, -1, 1);
    lastInput = performance.now();
    wake();
  }
  hero.addEventListener('pointermove', event => { if (event.pointerType !== 'touch') aim(event.clientX, event.clientY); }, { passive: true });
  hero.addEventListener('touchmove', event => { const touch = event.touches[0]; if (touch) aim(touch.clientX, touch.clientY); }, { passive: true });
  hero.addEventListener('pointerleave', event => { if (event.pointerType !== 'touch') lastInput = performance.now() - 1500; picture?.style.setProperty('--spot', '0'); }, { passive: true });
  hero.addEventListener('touchend', () => picture?.style.setProperty('--spot', '0'), { passive: true });
  hero.addEventListener('touchcancel', () => picture?.style.setProperty('--spot', '0'), { passive: true });

  /* ---------- phone tilt ----------
     Android delivers orientation without asking; iPhones need a permission prompt, so they simply keep the touch gaze. The
     reference angle drifts toward wherever the phone is held, so only a deliberate tilt moves the animal. */
  let tiltBase: { gamma: number; beta: number } | null = null;
  let tiltSeen = 0;
  function onTilt(event: DeviceOrientationEvent) {
    if (event.gamma === null || event.beta === null || reduced.matches || paused()) return;
    const now = performance.now();
    if (!tiltBase) tiltBase = { gamma: event.gamma, beta: event.beta };
    tiltBase.gamma += (event.gamma - tiltBase.gamma) * 0.012;
    tiltBase.beta += (event.beta - tiltBase.beta) * 0.012;
    // A finger on the screen wins for a moment.
    if (now - lastInput < 1200 && now - tiltSeen > 60) { tiltSeen = now; return; }
    target.x = clamp((event.gamma - tiltBase.gamma) / 16, -1, 1);
    target.y = clamp((event.beta - tiltBase.beta) / 20, -1, 1);
    tiltSeen = now;
    lastInput = now - 2200; // keeps the idle look-around quiet while the phone is being tilted
    wake();
  }
  if (touchLike.matches && 'DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission !== 'function') {
    window.addEventListener('deviceorientation', onTilt, { passive: true });
  }

  function readScroll() {
    const height = hero!.offsetHeight || 1;
    scrollProgress = clamp(window.scrollY / height, 0, 1);
    // Scrolling down, the animal looks down after the visitor; this overrides the idle look-around for a moment.
    if (scrollProgress > 0.02 && scrollProgress < 1) { target.y = clamp(scrollProgress * 1.6, 0, 1); lastInput = performance.now() - 1000; }
    wake();
  }
  window.addEventListener('scroll', readScroll, { passive: true });

  function paintPose() {
    if (!picture) return;
    const push = 1 + scrollProgress * 0.09;
    if (Math.abs(shown.x - current.x) > 0.002 || Math.abs(shown.y - current.y) > 0.002) {
      picture.style.setProperty('--gx', current.x.toFixed(3));
      picture.style.setProperty('--gy', current.y.toFixed(3));
      shown.x = current.x; shown.y = current.y;
    }
    if (Math.abs(shown.push - push) > 0.0005) {
      picture.style.setProperty('--push', push.toFixed(4));
      picture.style.setProperty('--push-y', `${(-scrollProgress * 26).toFixed(1)}px`);
      shown.push = push;
    }
  }

  /* ---------- eyes: blink, glint, startle ---------- */
  function blink() {
    if (!eyes) return;
    eyes.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.58 }, { opacity: 0 }], { duration: 280, easing: 'ease-in-out' });
    glows?.animate([{ opacity: 1 }, { opacity: 0, offset: 0.3 }, { opacity: 0, offset: 0.6 }, { opacity: 1 }], { duration: 280, easing: 'ease-in-out' });
  }
  function glint() {
    glows?.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.9)', offset: 0.35 }, { filter: 'brightness(1)' }], { duration: 900, easing: 'ease-in-out' });
  }
  function startle() {
    // Each glow grows around its own centre (the individual `scale` property composes with the glow's own translate).
    glows?.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(2.4)', offset: 0.25 }, { filter: 'brightness(1)' }], { duration: 1100, easing: 'cubic-bezier(.2,.7,.2,1)' });
    hero!.querySelectorAll<HTMLElement>('.hl-glow').forEach(glow => glow.animate([{ scale: '1' }, { scale: '1.45', offset: 0.25 }, { scale: '1' }], { duration: 1100, easing: 'cubic-bezier(.2,.7,.2,1)' }));
    window.setTimeout(blink, 380);
    try { if (touchLike.matches && navigator.vibrate) navigator.vibrate(8); } catch { /* Haptics are optional. */ }
  }
  hero.addEventListener('pointerdown', event => {
    if (!active() || !leopard || (event.target as Element).closest('a, button')) return;
    const box = leopard.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) return;
    aim(event.clientX, event.clientY);
    startle();
  }, { passive: true });

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
    if (now - lastInput > 2600) {
      // Left alone, the animal slowly looks around.
      target.x = Math.sin(now / 3300) * 0.42 + Math.sin(now / 5200) * 0.16;
      target.y = Math.sin(now / 4400 + 1) * 0.22;
    }
    const ease = 1 - Math.exp(-dt * 4.2);
    current.x += (target.x - current.x) * ease;
    current.y += (target.y - current.y) * ease;
    paintPose();
    if (now >= nextBlink) {
      blink();
      nextBlink = now + 2600 + Math.random() * 4600;
      if (Math.random() < 0.18) window.setTimeout(blink, 330);
    }
    if (now >= nextGlint) { glint(); nextGlint = now + 6500 + Math.random() * 6000; }
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
    if (active()) { sizeCanvas(); if (nextBlink === 0) { nextBlink = performance.now() + 3200; nextGlint = performance.now() + 5200; } wake(); }
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
  readScroll();
  sync();
}
