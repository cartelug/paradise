import { cleanBrief, briefText, validDeparture } from './brief';

const root = document.documentElement;
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const wait = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));
const opening = document.querySelector<HTMLElement>('.preloader');
const skipOpening = document.querySelector<HTMLButtonElement>('.skip-opening');
let openingSequence = 0;
let openingReturn: HTMLElement | null = null;

function endOpening(sequence: number) {
  if (sequence !== openingSequence) return;
  root.classList.remove('is-opening');
  root.classList.add('page-ready');
  opening?.setAttribute('aria-hidden', 'true');
  if (skipOpening) skipOpening.tabIndex = -1;
  document.querySelectorAll<HTMLElement>('.site-header, main, .site-footer, .closing-cta').forEach(el => { el.inert = false; });
  try { sessionStorage.setItem('pardus-opening-v2', 'seen'); } catch { /* Storage may be unavailable in privacy mode. */ }
  if (document.activeElement === skipOpening) {
    (openingReturn || document.querySelector<HTMLElement>('.brand-link'))?.focus({ preventScroll: true });
  }
}

async function playOpening(replay = false) {
  if (!opening || motion.matches) { endOpening(openingSequence); return; }
  if (!replay && !root.classList.contains('is-opening')) return;
  const sequence = ++openingSequence;
  openingReturn = replay && document.activeElement instanceof HTMLElement ? document.activeElement : null;
  root.classList.remove('page-ready');
  if (replay) window.scrollTo({ top: 0, behavior: 'instant' });
  root.classList.add('is-opening');
  opening.setAttribute('aria-hidden', 'false');
  if (skipOpening) skipOpening.tabIndex = 0;
  document.querySelectorAll<HTMLElement>('.site-header, main, .site-footer, .closing-cta').forEach(el => { el.inert = true; });
  const hero = document.querySelector<HTMLImageElement>('.hero-picture img');
  const ready = Promise.allSettled([document.fonts.ready, hero?.decode() || Promise.resolve()]);
  // Brand choreography runs concurrently with real readiness; never wait on all site images.
  await Promise.all([wait(1250), Promise.race([ready, wait(2400)])]);
  endOpening(sequence);
}
skipOpening?.addEventListener('click', () => { endOpening(openingSequence); });
document.querySelector('.replay-opening')?.addEventListener('click', () => { void playOpening(true); });
window.addEventListener('pageshow', e => { if (e.persisted) endOpening(openingSequence); });
motion.addEventListener('change', e => { if (e.matches) endOpening(openingSequence); });
void playOpening();
// A second fail-safe also clears inert state after the early boot's hard timeout.
setTimeout(() => { if (!root.classList.contains('is-opening')) endOpening(openingSequence); }, 3600);

const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
toggle?.addEventListener('click', () => { menu?.showModal(); toggle.setAttribute('aria-expanded', 'true'); });
document.querySelector('.menu-close')?.addEventListener('click', () => menu?.close());
menu?.addEventListener('close', () => { toggle?.setAttribute('aria-expanded', 'false'); toggle?.focus({ preventScroll: true }); });
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));

if ('IntersectionObserver' in window && !motion.matches) {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); reveal.unobserve(entry.target); } });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => reveal.observe(el));
  root.classList.add('reveal-ready');
}

document.querySelectorAll<HTMLElement>('[data-destination-editor]').forEach(editor => {
  const tabs = [...editor.querySelectorAll<HTMLButtonElement>('[data-destination-tab]')];
  const panels = [...editor.querySelectorAll<HTMLElement>('[data-panel]')];
  const activate = (tab: HTMLButtonElement) => {
    tabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
    panels.forEach(panel => { const active = panel.dataset.panel === tab.dataset.destinationTab; panel.hidden = !active; panel.classList.toggle('active', active); });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', event => {
      let target = index;
      if (['ArrowRight', 'ArrowDown'].includes(event.key)) target = (index + 1) % tabs.length;
      else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) target = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else return;
      event.preventDefault(); activate(tabs[target]); tabs[target].focus();
      tabs[target].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: motion.matches ? 'instant' : 'smooth' });
    });
  });
});

const filters = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  let count = 0;
  document.querySelectorAll<HTMLElement>('[data-category]').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden) { count++; card.classList.add('revealed'); }
  });
  const label = document.querySelector('[data-collection-count]');
  if (label) label.textContent = `${count} destination${count === 1 ? '' : 's'} to discover`;
}));

const planner = document.querySelector<HTMLFormElement>('#journey-planner');
if (planner) {
  let step = 1;
  const steps = [...planner.querySelectorAll<HTMLFieldSetElement>('[data-step]')];
  const next = planner.querySelector<HTMLButtonElement>('[data-next]')!;
  const back = planner.querySelector<HTMLButtonElement>('[data-back]')!;
  const error = planner.querySelector<HTMLElement>('[data-error]')!;
  const status = planner.querySelector<HTMLElement>('[data-form-status]')!;
  const date = planner.querySelector<HTMLInputElement>('[name="date"]')!;
  const destination = planner.querySelector<HTMLSelectElement>('[name="destination"]')!;
  const style = planner.querySelector<HTMLSelectElement>('[name="style"]')!;
  const now = new Date();
  date.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const params = new URLSearchParams(window.location.search);
  for (const [field, value] of [[destination, params.get('destination')], [style, params.get('style')]] as const) {
    if (value && [...field.options].some(option => option.value === value)) field.value = value;
  }

  const summary = () => {
    const data = cleanBrief(new FormData(planner));
    const list = planner.querySelector<HTMLDListElement>('.brief-summary')!;
    list.replaceChildren();
    const rows = [['Destination', data.destination], ['Travel style', data.style], ['Travellers', data.travellers], ['Budget', data.budget], ['Departure', data.date || 'Flexible'], ['Length', data.nights], ['From', data.departure || 'To discuss'], ['Wishes', data.notes || 'To discuss']];
    rows.forEach(([key, value]) => {
      const row = document.createElement('div'); const term = document.createElement('dt'); const detail = document.createElement('dd');
      term.textContent = key; detail.textContent = value; row.append(term, detail); list.append(row);
    });
  };

  const render = (focus = false) => {
    steps.forEach((fieldset, index) => { fieldset.hidden = index !== step - 1; });
    const label = planner.querySelector('[data-step-label]')!;
    label.textContent = `${String(step).padStart(2, '0')} / 03 — ${['The journey', 'The details', 'Your brief'][step - 1]}`;
    planner.querySelectorAll('.step-indicators i').forEach((item, i) => item.classList.toggle('active', i < step));
    next.querySelector('span')!.textContent = ['Add the details', 'Review my journey', 'Download my brief'][step - 1];
    back.hidden = step === 1; error.textContent = ''; status.textContent = '';
    if (step === 3) summary();
    if (focus) {
      const legend = steps[step - 1].querySelector('legend')!; legend.tabIndex = -1; legend.focus({ preventScroll: true });
      planner.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  };
  render();
  back.addEventListener('click', () => { if (step > 1) { step--; render(true); } });
  planner.addEventListener('submit', event => {
    event.preventDefault();
    if (step === 2 && !validDeparture(date.value, date.min)) {
      error.textContent = 'Choose today or a future departure date, or leave it empty if you’re flexible.';
      date.setAttribute('aria-invalid', 'true'); date.focus(); return;
    }
    date.removeAttribute('aria-invalid');
    if (step < 3) { step++; render(true); return; }
    try {
      const content = briefText(cleanBrief(new FormData(planner)));
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
      const download = document.createElement('a'); download.href = url; download.download = 'Pardus-My-Journey-Brief.txt';
      document.body.append(download); download.click(); download.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      status.textContent = 'Your brief is ready to keep. It has not been sent to Pardus and is not a booking.';
      const printable = document.querySelector('.print-brief'); if (printable) printable.textContent = content;
    } catch {
      error.textContent = 'Your browser could not create the download. Your entries are still here; please try again.';
    }
  });
}
