// PARDUS animation pack (1 November 2026): press feedback. A soft ripple grows from the touch point on buttons and
// choice tiles, then removes itself. It reads no scroll, tilt or pointer movement, only the press itself, and it never
// touches a leopard. Without this script every control works exactly the same. See src/styles/animations.css.
export {};
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

document.addEventListener('pointerdown', event => {
  if (reduced.matches || event.button > 0 || !(event.target instanceof Element)) return;
  // A tile's real hit target is its invisible checkbox, so find the tile through its label and ripple on its face.
  const hit = event.target.closest<HTMLElement>('.btn, .pick');
  const target = hit?.matches('.pick') ? hit.querySelector<HTMLElement>('.pick-face') : hit;
  if (!target || target.matches(':disabled, [aria-disabled="true"]')) return;
  const box = target.getBoundingClientRect();
  if (box.width < 1 || box.height < 1) return;
  const ripple = document.createElement('i');
  ripple.className = 'anim-ripple';
  ripple.setAttribute('aria-hidden', 'true');
  ripple.style.setProperty('--x', `${event.clientX - box.left}px`);
  ripple.style.setProperty('--y', `${event.clientY - box.top}px`);
  ripple.style.setProperty('--s', `${Math.round(Math.max(box.width, box.height) * 2.2)}px`);
  target.append(ripple);
  const remove = () => ripple.remove();
  ripple.addEventListener('animationend', remove, { once: true });
  window.setTimeout(remove, 1000);
}, { passive: true });
