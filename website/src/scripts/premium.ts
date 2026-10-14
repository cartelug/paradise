import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** A finite brand signature and scroll choreography; native scrolling stays native. */
function initPremiumMotion(home: HTMLElement) {
  gsap.registerPlugin(ScrollTrigger);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');
  const hero = home.querySelector<HTMLElement>('[data-premium-hero]');
  const depth = hero?.querySelector<HTMLElement>('[data-premium-depth]');
  const leopard = home.querySelector<HTMLElement>('[data-premium-leopard]');
  const sprite = leopard?.querySelector<HTMLImageElement>('img');
  const control = home.querySelector<HTMLButtonElement>('[data-premium-motion]');
  const controlLabel = control?.querySelector<HTMLElement>('[data-premium-motion-label]');
  const lines: HTMLElement[] = [];
  const cleanups: Array<() => void> = [];
  let scene: gsap.Context | undefined;
  let entrance: gsap.core.Timeline | undefined;
  let pageActive = true;
  let heroVisible = !hero || hero.getBoundingClientRect().bottom > 0;
  const leopardBox = leopard?.getBoundingClientRect();
  let leopardVisible = !!leopardBox && leopardBox.top < innerHeight && leopardBox.bottom > 0;
  let userPaused = false;
  let entered = false;
  let failed = false;
  let raf = 0;
  let previousTime = 0;
  let elapsed = 0;
  let distance = 0;
  let frameIndex = -1;
  const walkDuration = 7.6;
  const arrivalDelay = 1.1;

  try { userPaused = localStorage.getItem('pardus-scene-motion') === 'paused'; } catch { /* Storage is optional. */ }

  // Intentional line breaks remain normal text. No per-letter DOM or duplicate a11y copy.
  home.querySelectorAll<HTMLElement>('[data-premium-lines]').forEach(heading => {
    Array.from(heading.children).forEach(child => {
      if (!(child instanceof HTMLElement) || child.tagName !== 'SPAN') return;
      child.classList.add('premium-line-mask');
      const line = document.createElement('span');
      line.className = 'premium-line-content';
      while (child.firstChild) line.appendChild(child.firstChild);
      child.appendChild(line);
      lines.push(line);
    });
  });

  function listen(target: EventTarget, name: string, callback: EventListener) {
    target.addEventListener(name, callback);
    cleanups.push(() => target.removeEventListener(name, callback));
  }

  function staticFrame() {
    frameIndex = 0;
    sprite?.style.setProperty('transform', 'translate3d(0,0,0)');
  }

  function resetLeopard() {
    cancelAnimationFrame(raf);
    raf = 0;
    previousTime = 0;
    elapsed = 0;
    leopard?.style.setProperty('--premium-leopard-x', '0px');
    staticFrame();
  }

  function measureWalk() {
    if (!leopard?.parentElement) return;
    const track = leopard.parentElement;
    // The signature fits its own reserved strip and can never walk over a neighbouring CTA.
    distance = Math.max(0, Math.min(460, track.clientWidth - leopard.offsetLeft - leopard.offsetWidth - 24));
  }

  function canWalk() {
    return !failed && !userPaused && !reduced.matches && desktop.matches && leopardVisible && !document.hidden && pageActive;
  }

  function walk(now: number) {
    raf = 0;
    if (!canWalk() || !leopard || !sprite || elapsed >= walkDuration + arrivalDelay) return;
    if (previousTime) elapsed += Math.min((now - previousTime) / 1000, 0.06);
    previousTime = now;
    const progress = Math.min(1, Math.max(0, (elapsed - arrivalDelay) / walkDuration));
    if (elapsed >= arrivalDelay) {
      const nextFrame = progress === 1 ? 0 : Math.floor((elapsed - arrivalDelay) * 14) % 16;
      if (nextFrame !== frameIndex) {
        frameIndex = nextFrame;
        // The sheet is 6144×256: sixteen 384×256 cells. Transform percentage is sheet-relative.
        sprite.style.transform = `translate3d(${-nextFrame * 6.25}%,0,0)`;
      }
      leopard.style.setProperty('--premium-leopard-x', `${(distance * progress).toFixed(1)}px`);
    }
    if (progress < 1) raf = requestAnimationFrame(walk);
    else home.dataset.premiumSignature = 'settled';
  }

  function syncWalk() {
    cancelAnimationFrame(raf);
    raf = 0;
    previousTime = 0;
    if (canWalk() && elapsed < walkDuration + arrivalDelay) raf = requestAnimationFrame(walk);
    if (reduced.matches || !desktop.matches) resetLeopard();
  }

  function syncControl() {
    const state = failed ? 'static' : reduced.matches ? 'reduced' : userPaused ? 'paused' : 'playing';
    home.dataset.premiumMotionState = state;
    if (!control) return;
    control.hidden = failed || reduced.matches || !desktop.matches;
    control.setAttribute('aria-pressed', String(userPaused));
    control.setAttribute('aria-label', userPaused ? 'Resume page motion' : 'Pause page motion');
    if (controlLabel) controlLabel.textContent = userPaused ? 'Resume motion' : 'Pause motion';
  }

  function revealTargets() {
    const targets = new Set<HTMLElement>();
    home.querySelectorAll<HTMLElement>('[data-premium-reveal]').forEach(element => {
      if (element.matches('p,button,input,textarea,select') || (element.matches('a') && element.dataset.premiumReveal !== 'media')) return;
      if (element.matches('section')) {
        // A section marker choreographs its heading and media, never its essential body copy.
        const heading = element.querySelector<HTMLElement>('h2,h3');
        const media = element.querySelector<HTMLElement>('picture,figure');
        if (heading) targets.add(heading);
        if (media) targets.add(media);
      } else targets.add(element);
    });
    return Array.from(targets).filter(target => !target.closest('[data-premium-hero]') && !target.closest('[data-premium-lines]'));
  }

  function buildScene() {
    scene?.revert();
    scene = undefined;
    entrance = undefined;
    if (failed || reduced.matches || userPaused) {
      entered = true;
      return;
    }
    scene = gsap.context(() => {
      if (!entered && lines.length && heroVisible) {
        entrance = gsap.timeline({ onComplete: () => { entered = true; } });
        entrance.fromTo(lines, { yPercent: 108, rotate: 1.2 }, {
          yPercent: 0, rotate: 0, duration: desktop.matches ? 0.82 : 0.58,
          stagger: 0.095, ease: 'power3.out', clearProps: 'transform',
        }, 0.07);
      } else entered = true;

      revealTargets().forEach((target, index) => {
        const isMedia = target.matches('picture,figure,img') || target.dataset.premiumReveal === 'media';
        gsap.fromTo(target, { y: desktop.matches ? (isMedia ? 24 : 16) : 10, ...(isMedia ? { clipPath: 'inset(8% 0 0 0)' } : {}) }, {
          y: 0, ...(isMedia ? { clipPath: 'inset(0% 0 0 0)' } : {}), duration: isMedia ? 0.9 : 0.66, ease: 'power3.out',
          delay: Math.min(Number(target.dataset.premiumRevealDelay) || (index % 2) * 0.065, 0.2),
          clearProps: 'transform,clipPath',
          scrollTrigger: { trigger: target, start: 'top 92%', once: true },
        });
      });

      if (depth && hero && desktop.matches) {
        gsap.fromTo(depth, { yPercent: 0 }, {
          yPercent: 6.5, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.9, invalidateOnRefresh: true },
        });
      }
    }, home);
    ScrollTrigger.refresh();
  }

  function syncActivity() {
    const active = !document.hidden && pageActive;
    home.classList.toggle('premium-motion-dormant', !active || !heroVisible);
    if (entrance && !entered) {
      if (active && !userPaused && !reduced.matches) entrance.resume();
      else entrance.pause();
    }
    syncWalk();
  }

  function updatePreference() {
    if (reduced.matches || userPaused) {
      entrance?.progress(1);
      entered = true;
    }
    buildScene();
    syncControl();
    syncActivity();
  }

  function failOpen() {
    failed = true;
    scene?.revert();
    scene = undefined;
    resetLeopard();
    home.classList.remove('premium-motion-ready');
    syncControl();
  }

  try {
    measureWalk();
    staticFrame();
    home.classList.add('premium-motion-ready');
    buildScene();
    syncControl();
    syncActivity();

    if (control) listen(control, 'click', () => {
      userPaused = !userPaused;
      try { localStorage.setItem('pardus-scene-motion', userPaused ? 'paused' : 'playing'); } catch { /* Optional persistence. */ }
      updatePreference();
    });
    listen(reduced, 'change', updatePreference);
    listen(desktop, 'change', () => { measureWalk(); buildScene(); syncControl(); syncActivity(); });
    listen(document, 'visibilitychange', syncActivity);
    listen(window, 'pagehide', () => { pageActive = false; syncActivity(); });
    listen(window, 'pageshow', () => { pageActive = true; syncActivity(); });

    if ('IntersectionObserver' in window) {
      const visibility = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.target === hero) heroVisible = entry.isIntersecting;
          if (entry.target === leopard) leopardVisible = entry.isIntersecting;
        }
        syncActivity();
      }, { threshold: 0.01 });
      if (hero) visibility.observe(hero);
      if (leopard) visibility.observe(leopard);
      cleanups.push(() => visibility.disconnect());
    }
    if (leopard?.parentElement && 'ResizeObserver' in window) {
      const resize = new ResizeObserver(measureWalk);
      resize.observe(leopard.parentElement);
      cleanups.push(() => resize.disconnect());
    }
    sprite?.addEventListener('error', () => {
      leopard?.setAttribute('hidden', '');
      cancelAnimationFrame(raf);
      raf = 0;
    }, { once: true });
    document.fonts?.ready.then(() => { if (!failed) ScrollTrigger.refresh(); }).catch(() => undefined);
    listen(document, 'astro:before-swap', () => {
      scene?.revert();
      resetLeopard();
      cleanups.forEach(cleanup => cleanup());
    });
  } catch { failOpen(); }
}

const home = document.querySelector<HTMLElement>('.premium-home');
if (home) initPremiumMotion(home);
