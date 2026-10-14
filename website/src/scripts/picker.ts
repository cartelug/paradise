// The "What should we arrange?" picker. Without this script it is a plain form that sends the ticked services to the
// enquiry page. This adds a live summary, a Clear button and a small pulse when something is chosen.
export {};
const form = document.querySelector<HTMLFormElement>('[data-picker]');
if (form) {
  const boxes = [...form.querySelectorAll<HTMLInputElement>('input[name="services"]')];
  const summary = form.querySelector<HTMLElement>('[data-picker-summary]');
  const clear = form.querySelector<HTMLButtonElement>('[data-picker-clear]');
  const bar = form.querySelector<HTMLElement>('[data-picker-bar]');
  const empty = summary?.innerHTML ?? '';
  const short: Record<string, string> = {
    'Luxury hotels & resorts': 'Hotels', 'Boat & yacht cruises': 'Yacht cruises', 'Activities & experiences': 'Experiences',
    'Custom itineraries': 'Custom itinerary', 'Private transfers': 'Transfers', 'Visa guidance': 'Visa help',
  };
  const names = (list: string[]) => list.map(label => short[label] ?? label);

  function paint(pulse: boolean) {
    const chosen = boxes.filter(box => box.checked).map(box => box.value);
    if (summary) {
      if (!chosen.length) summary.innerHTML = empty;
      else {
        const shown = names(chosen);
        const label = shown.length > 3 ? `${shown.slice(0, 3).join(', ')} +${shown.length - 3}` : shown.join(', ');
        summary.innerHTML = `<strong>${chosen.length} selected</strong> <span></span>`;
        summary.querySelector('span')!.textContent = label;
      }
    }
    if (clear) clear.hidden = chosen.length === 0;
    form!.dataset.count = String(chosen.length);
    if (pulse && bar && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bar.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.018)', offset: 0.35 }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }
  boxes.forEach(box => box.addEventListener('change', () => paint(true)));
  clear?.addEventListener('click', () => { boxes.forEach(box => { box.checked = false; }); paint(false); });
  // The browser can restore ticks when you come back with the Back button.
  window.addEventListener('pageshow', () => paint(false));
  paint(false);
}
