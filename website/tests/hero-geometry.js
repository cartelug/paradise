/**
 * Read-only hero geometry probe for a same-origin Document. No styles, state,
 * animation data, focus, scroll or DOM content are changed. Call after fonts,
 * arrival motion and data-spots="ready" have settled; animation/interaction
 * behavior still requires separate temporal checks.
 *
 * Usage: pardusHeroGeometry(iframe.contentDocument)
 * Options: outlineClearance (10px), pinClearance (0px), breathEnvelope (true),
 * phoneFirstScreen ("standard" | true | false), expectedPins (true),
 * verifyMotion (false; useful on the unmodified, live page only).
 * A non-home page returns applicable:false, not a false pass.
 */
export function pardusHeroGeometry(doc = document, options = {}) {
  const hero = doc.querySelector('[data-hero]');
  if (!hero) return { applicable: false, issues: [], notes: ['No homepage hero on this route.'] };
  const win = doc.defaultView;
  if (!win) return { applicable: true, issues: [{ type: 'document', note: 'No document window.' }], notes: [] };
  const opts = { outlineClearance: 10, pinClearance: 0, breathEnvelope: true, phoneFirstScreen: 'standard', expectedPins: true, verifyMotion: false, ...options };
  const issues = [], notes = [], seen = new Set();
  // CSS media queries use innerWidth, including a classic scrollbar; content
  // bounds use clientWidth. Keep them separate at narrow breakpoint edges.
  const viewport = { cssWidth: win.innerWidth, width: doc.documentElement.clientWidth, height: win.innerHeight, scrollX: win.scrollX, scrollY: win.scrollY, rootFont: parseFloat(win.getComputedStyle(doc.documentElement).fontSize) };
  const readRect = node => {
    const r = node.getBoundingClientRect();
    return { l: r.left, t: r.top, r: r.right, b: r.bottom, width: r.width, height: r.height };
  };
  const add = (type, element, note, extra = {}) => {
    const key = type + '|' + element + '|' + note;
    if (!seen.has(key)) { seen.add(key); issues.push({ type, element, note, ...extra }); }
  };
  const name = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '') + ' ' + JSON.stringify((el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 60));
  const visible = (el, ignoreOpacity = false) => {
    if (!el || el.closest('[hidden],.visually-hidden,.sr-only,dialog:not([open])')) return false;
    for (let p = el; p && p !== doc.documentElement; p = p.parentElement) {
      const s = win.getComputedStyle(p);
      if (s.display === 'none' || s.visibility === 'hidden' || (!ignoreOpacity && Number(s.opacity) === 0)) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1;
  };
  const meets = (a, b, pad = 0) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad;
  const inside = (a, b, tolerance = 1) => a.l >= b.l - tolerance && a.r <= b.r + tolerance && a.t >= b.t - tolerance && a.b <= b.b + tolerance;
  const onScreen = r => inside(r, { l: 0, t: 0, r: viewport.width, b: viewport.height });
  const picture = hero.querySelector('.hero-picture');
  const art = hero.querySelector('[data-hero-art]');
  const image = hero.querySelector('[data-hero-image]');
  const copy = hero.querySelector('[data-hero-copy]');
  const rail = hero.querySelector('[data-hero-rail]');
  const missing = [['art', art], ['picture', picture], ['image', image], ['copy', copy], ['rail', rail]].filter(([, element]) => !element).map(([label]) => label);
  if (missing.length) return { applicable: true, viewport, issues: [{ type: 'missing-hero-markup', element: '[data-hero]', note: missing.join(', ') }], notes };

  // Outline elements are intentionally visibility:hidden; their geometry is the
  // approved measurement data, and must not be filtered like visible content.
  const parts = [...hero.querySelectorAll('[data-leopard-box]')].map(el => ({ part: el.dataset.leopardBox, keep: el.dataset.keep === 'true', rect: readRect(el) }));
  const requiredParts = ['jet', 'flight', 'head', 'chest', 'paw', 'paws', 'back'];
  for (const part of requiredParts) if (!parts.some(p => p.part === part)) add('missing-outline', part, 'Approved outline rectangle is absent.');

  const artRect = readRect(art), imageRect = readRect(image), pictureRect = readRect(picture);
  const style = win.getComputedStyle(image);
  const nativeRatio = image.naturalHeight ? image.naturalWidth / image.naturalHeight : null;
  const frameRatio = artRect.height ? artRect.width / artRect.height : null;
  const expectedRatio = viewport.cssWidth <= 760 ? 2 / 3 : 3 / 2;
  const ratioTolerance = 0.006;
  if (!image.complete || !image.naturalWidth) add('hero-image', '[data-hero-image]', 'Approved artwork is not decoded and loaded.');
  if (nativeRatio && Math.abs(nativeRatio - expectedRatio) > ratioTolerance) add('art-direction', '[data-hero-image]', `Source ratio ${nativeRatio.toFixed(4)} differs from expected ${expectedRatio.toFixed(4)}.`, { currentSrc: image.currentSrc });
  if (frameRatio && nativeRatio && Math.abs(frameRatio - nativeRatio) > ratioTolerance) add('artwork-crop', '[data-hero-art]', `Frame ratio ${frameRatio.toFixed(4)} differs from native ratio ${nativeRatio.toFixed(4)}.`);
  if (!inside(pictureRect, artRect, 2) || Math.abs(pictureRect.width - artRect.width) > 2 || Math.abs(pictureRect.height - artRect.height) > 2) add('picture-frame', '.hero-picture', 'Picture layout box does not match its artwork frame.');
  for (const part of parts) if (!inside(part.rect, artRect, 2)) add('outline-frame', part.part, 'Approved outline rectangle leaves the artwork frame.');

  // Map measured, resting outline coordinates onto the currently transformed
  // image. The allowed motion is scale only; no animation state is mutated.
  const scalePart = (part, imageBox) => {
    const sx = imageBox.width / artRect.width, sy = imageBox.height / artRect.height;
    return { l: imageBox.l + (part.rect.l - artRect.l) * sx, t: imageBox.t + (part.rect.t - artRect.t) * sy,
      r: imageBox.l + (part.rect.r - artRect.l) * sx, b: imageBox.t + (part.rect.b - artRect.t) * sy };
  };
  const origin = style.transformOrigin.split(/\s+/).map(parseFloat);
  const ox = Number.isFinite(origin[0]) ? origin[0] : artRect.width * .5;
  const oy = Number.isFinite(origin[1]) ? origin[1] : artRect.height * .5;
  const fullBreath = { l: artRect.l - ox * .03, t: artRect.t - oy * .03, r: artRect.r + (artRect.width - ox) * .03, b: artRect.b + (artRect.height - oy) * .03, width: artRect.width * 1.03, height: artRect.height * 1.03 };
  const poses = [
    { name: 'rest', parts: parts.map(part => ({ ...part, rect: part.rect })) },
    { name: 'current-image', parts: parts.map(part => ({ ...part, rect: scalePart(part, imageRect) })) },
    ...(opts.breathEnvelope ? [{ name: 'maximum-1.03-breath', parts: parts.map(part => ({ ...part, rect: scalePart(part, fullBreath) })) }] : []),
  ];
  for (const pose of poses) for (const part of pose.parts.filter(p => p.keep)) {
    if (!inside(part.rect, artRect, 1.5)) add('protected-artwork-crop', part.part, `Protected artwork leaves its frame at ${pose.name}.`);
  }

  const content = [];
  const range = doc.createRange(), walker = doc.createTreeWalker(copy, win.NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent.trim() || !visible(node.parentElement)) continue;
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) if (r.width > 1) content.push({ label: 'hero text ' + JSON.stringify(node.textContent.trim().slice(0, 45)), kind: 'text', rect: { l: r.left, t: r.top, r: r.right, b: r.bottom } });
  }
  for (const el of copy.querySelectorAll('.btn,button')) if (visible(el)) content.push({ label: name(el), kind: 'button', rect: readRect(el) });
  if (visible(rail)) content.push({ label: 'hero price rail', kind: 'rail', rect: readRect(rail) });
  for (const el of doc.querySelectorAll('.site-header .brand-link,.site-header .desktop-nav a,.site-header .header-tools > *')) if (visible(el)) content.push({ label: name(el), kind: 'header', rect: readRect(el) });
  for (const item of content) for (const pose of poses) for (const part of pose.parts) {
    if (meets(item.rect, part.rect, opts.outlineClearance)) add('content-leopard-collision', item.label, `${pose.name}: within ${opts.outlineClearance}px of ${part.part}.`, { part: part.part, pose: pose.name });
  }

  const pinsReady = hero.dataset.spots === 'ready';
  const spots = [...hero.querySelectorAll('.spot')].filter(el => visible(el, true)).map(el => ({ key: el.dataset.spot, href: el.getAttribute('href') || '', side: el.dataset.place || null, rect: readRect(el), label: el.querySelector('.spot-label') ? readRect(el.querySelector('.spot-label')) : null }));
  if (!pinsReady) notes.push('Pin placement has not reached data-spots="ready"; wait before treating pin results as final.');
  const placed = [], heroRect = readRect(hero);
  for (const spot of spots) {
    if (!spot.label) add('missing-pin-label', spot.key, 'Pin has no label.');
    const boxes = [{ label: spot.key + ' pin', rect: spot.rect }, ...(spot.label ? [{ label: spot.key + ' label', rect: spot.label }] : [])];
    for (const box of boxes) {
      for (const item of content) if (meets(box.rect, item.rect, opts.pinClearance)) add('pin-content-collision', box.label, `Touches ${item.label}.`);
      for (const pose of poses) for (const part of pose.parts.filter(p => p.keep)) if (meets(box.rect, part.rect, opts.outlineClearance)) add('pin-protected-collision', box.label, `${pose.name}: within ${opts.outlineClearance}px of ${part.part}.`, { part: part.part, pose: pose.name });
      for (const other of placed) if (meets(box.rect, other.rect, opts.pinClearance)) add('pin-pin-collision', box.label, 'Touches ' + other.label + '.');
      if (box.rect.l < -1 || box.rect.r > viewport.width + 1) add('pin-viewport', box.label, 'Leaves the screen horizontally.');
      if (!inside(box.rect, heroRect)) add('pin-hero-frame', box.label, 'Leaves the hero frame.');
    }
    placed.push(...boxes);
    const expected = { maldives: 'destination-maldives.html', dubai: 'destination-dubai.html', yacht: 'cruises.html' }[spot.key];
    const actual = spot.href.split(/[?#]/)[0].split('/').pop();
    if (!expected || actual !== expected) add('pin-link', spot.key, 'Unexpected destination: ' + spot.href);
    if (spot.rect.width < 43.5 || spot.rect.height < 43.5) add('pin-target', spot.key, 'Pin target is smaller than 44 × 44px.');
  }
  if (opts.expectedPins && pinsReady && viewport.rootFont <= 16.1) {
    if ((viewport.cssWidth === 1440 && viewport.height === 900) || (viewport.cssWidth === 1920 && viewport.height === 1080)) {
      for (const key of ['maldives', 'dubai', 'yacht']) if (!spots.some(s => s.key === key)) add('expected-pin', key, 'Common desktop viewport should show this pin.');
    }
    if (viewport.cssWidth === 390 && viewport.height === 844 && !spots.some(s => s.key === 'maldives')) add('expected-pin', 'maldives', 'Flagship phone viewport should show the Maldives pin.');
  }

  const h1 = hero.querySelector('h1');
  const buttons = [...hero.querySelectorAll('.actions .btn')].filter(el => visible(el));
  const tiles = [...hero.querySelectorAll('.hero-offers a')].filter(el => visible(el));
  const head = poses[1].parts.find(p => p.part === 'head');
  const paws = poses[1].parts.find(p => p.part === 'paws');
  const firstScreen = {
    headline: h1 ? onScreen(readRect(h1)) : false,
    buttons: buttons.map(el => ({ label: name(el), fits: onScreen(readRect(el)), height: readRect(el).height })),
    tiles: tiles.map(el => ({ label: name(el), fits: onScreen(readRect(el)) })),
    leopardHead: head ? onScreen(head.rect) : false,
    leopardPaws: paws ? paws.rect.b <= viewport.height + 1 : false,
    eyeOnScreen: head ? head.rect.t + (head.rect.b - head.rect.t) * .45 > 0 && head.rect.t + (head.rect.b - head.rect.t) * .45 < viewport.height : false,
  };
  const standardPhone = viewport.cssWidth <= 430 && viewport.height >= 800 && viewport.rootFont <= 16.1;
  const checkPhone = opts.phoneFirstScreen === true ? viewport.cssWidth <= 760 : opts.phoneFirstScreen === 'standard' && standardPhone;
  if (checkPhone) {
    if (!firstScreen.headline) add('phone-first-screen', 'headline', 'Headline is not entirely on the first screen.');
    if (!firstScreen.leopardHead || !firstScreen.leopardPaws) add('phone-first-screen', 'leopard', 'Head and paws are not entirely on the first screen.');
    if (tiles.length !== 3) add('phone-first-screen', 'price tiles', `Expected three visible tiles; found ${tiles.length}.`);
    if (buttons.length !== 2) add('phone-first-screen', 'hero actions', `Expected two visible actions; found ${buttons.length}.`);
    for (const item of [...firstScreen.buttons, ...firstScreen.tiles]) if (!item.fits) add('phone-first-screen', item.label, 'Control is not entirely on the first screen.');
    for (const item of firstScreen.buttons) if (item.height >= 70) add('phone-action-height', item.label, 'Action is at least 70px high.');
  }

  const animations = typeof image.getAnimations === 'function' ? image.getAnimations().map(animation => ({ name: animation.animationName || null, playState: animation.playState, duration: animation.effect?.getTiming().duration, direction: animation.effect?.getTiming().direction, frames: animation.effect?.getKeyframes().map(frame => frame.transform) })) : [];
  const life = { state: hero.dataset.life || null, imageTransform: style.transform, artworkTransform: win.getComputedStyle(art).transform, pictureTransform: win.getComputedStyle(picture).transform, animationName: style.animationName, animationPlayState: style.animationPlayState, animations, qaMotionOverride: !!doc.querySelector('style[data-qa-freeze]') };
  const forbidden = [...hero.querySelectorAll('.hl-glow,.hl-glows,.hl-eyes,.hl-rim,.hl-motes,.hl-leopard,.hero-glow')].map(name);
  if (forbidden.length) add('forbidden-hero-layers', '[data-hero]', forbidden.join(', '));
  if (opts.verifyMotion && !life.qaMotionOverride) {
    if (life.artworkTransform !== 'none' || life.pictureTransform !== 'none') add('unexpected-artwork-transform', '[data-hero-art]', 'Only the image itself may carry the calm breathing scale.');
    if (life.state === 'running') {
      const breath = animations.find(a => a.name === 'hero-breathe');
      if (!breath) add('breathing-animation', '[data-hero-image]', 'Running hero has no hero-breathe animation.');
      else if (breath.duration < 16000 || breath.duration > 24000 || breath.direction !== 'alternate' || JSON.stringify(breath.frames) !== JSON.stringify(['scale(1)', 'scale(1.03)'])) add('breathing-animation', '[data-hero-image]', 'Breath does not match the approved slow 1.00–1.03 alternate scale.');
    }
    if (life.state === 'still' && life.animationName !== 'none') add('still-animation', '[data-hero-image]', 'Still/reduced-motion hero retains an animation.');
  } else if (opts.verifyMotion && life.qaMotionOverride) notes.push('Motion assertions skipped: settled-layout QA overrides are installed.');
  notes.push('Single read-only snapshot: pointer, touch, Pause scene, visibility changes and reduced-motion transitions are not exercised.');
  return { applicable: true, viewport, issues, notes, artwork: { currentSrc: image.currentSrc, nativeWidth: image.naturalWidth, nativeHeight: image.naturalHeight, nativeRatio, frameRatio, expectedRatio, frame: artRect, picture: pictureRect, image: imageRect, parts, poses: poses.map(pose => pose.name) }, pins: { ready: pinsReady, shown: spots.map(spot => spot.key), spots }, firstScreen: { checked: checkPhone, ...firstScreen }, life, counts: { outlineParts: parts.length, contentRects: content.length, visiblePins: spots.length } };
}
