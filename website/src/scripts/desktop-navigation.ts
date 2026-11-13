// Native links remain the primary action. This is an optional desktop disclosure.
const trigger = document.querySelector<HTMLButtonElement>('[data-destination-toggle]');
const panel = document.querySelector<HTMLElement>('#desktop-destinations');
if (trigger && panel) {
  const button = trigger;
  const menu = panel;
  const desktop = matchMedia('(min-width: 1360px)');
  const open = () => !menu.hidden;
  function close(returnFocus = false) {
    menu.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }
  function show(focusFirst = false) {
    if (!desktop.matches) return;
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    if (focusFirst) menu.querySelector<HTMLAnchorElement>('a')?.focus();
  }
  button.addEventListener('click', () => open() ? close() : show());
  button.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown') { event.preventDefault(); show(true); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open()) { event.preventDefault(); close(true); }
  });
  document.addEventListener('click', event => {
    if (event.target instanceof Node && !menu.contains(event.target) && !button.contains(event.target)) close();
  });
  document.addEventListener('focusin', event => {
    if (open() && event.target instanceof Node && !menu.contains(event.target) && !button.contains(event.target)) close();
  });
  desktop.addEventListener('change', () => close());
  addEventListener('pageshow', () => close());
}
export {};
