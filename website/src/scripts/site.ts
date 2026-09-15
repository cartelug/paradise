import { cleanBrief, briefText, normalisePlannerDraft, resolvePlannerContext, validDeparture, validEmail } from './brief';
import { deliverEnquiry } from './deliver';
import { initFolio, readFolio } from './folio';
import { site, path } from '../data/site';
import { destinations } from '../data/destinations';

const root = document.documentElement;
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const header = document.querySelector<HTMLElement>('.site-header');
const paintHeader = () => header?.classList.toggle('header-scrolled', window.scrollY > 42);
window.addEventListener('scroll', paintHeader, { passive: true });
paintHeader();
const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
toggle?.addEventListener('click', () => { menu?.showModal(); toggle.setAttribute('aria-expanded', 'true'); });
document.querySelector('.menu-close')?.addEventListener('click', () => menu?.close());
menu?.addEventListener('close', () => { toggle?.setAttribute('aria-expanded', 'false'); toggle?.focus({ preventScroll: true }); });
menu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.close()));
initFolio();

if ('IntersectionObserver' in window && !motion.matches) {
  const sectionCounts = new Map<Element, number>();
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
  targets.forEach(target => {
    const section = target.closest('section') || document.body;
    const order = sectionCounts.get(section) || 0;
    sectionCounts.set(section, order + 1);
    target.style.setProperty('--reveal-delay', `${Math.min(order, 5) * 65}ms`);
    if (!target.dataset.revealStyle) {
      target.dataset.revealStyle = target.matches('h1,h2,.section-label') ? 'heading'
        : target.matches('picture,.atelier-image,.business-image,.journey-card-picture,.destination-detail-hero,.full-bleed-picture') ? 'media'
        : target.matches('li,details,.service-detail,.journey-card') ? 'card'
        : 'copy';
    }
  });
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      reveal.unobserve(entry.target);
    });
  }, { threshold: 0, rootMargin: '80px 0px' });
  targets.forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight + 80) el.classList.add('revealed');
    else reveal.observe(el);
  });
  root.classList.add('motion-ready');
  // A slow or interrupted observer must never leave content hidden.
  window.setTimeout(() => targets.forEach(el => el.classList.add('revealed')), 2400);

  const sections = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('section-entered'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('main section').forEach(section => sections.observe(section));
  // Observers enhance decoration only; content remains visible before observation.
}

const scrollMedia = [...document.querySelectorAll<HTMLElement>('[data-scroll-media]')]
  .filter(element => element.querySelector('img'));
const scrollSignature = document.querySelector<HTMLElement>('[data-v20-scroll-signature]');
scrollMedia.forEach(element => { if (!element.dataset.scrollMedia) element.dataset.scrollMedia = ''; });
let scrollFrame = 0;
function paintScrollMotion() {
  scrollFrame = 0;
  const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  root.style.setProperty('--page-progress', String(Math.min(1, Math.max(0, window.scrollY / scrollable))));
  if (motion.matches) return;
  for (const element of scrollMedia) {
    const box = element.getBoundingClientRect();
    if (box.bottom < -100 || box.top > window.innerHeight + 100) continue;
    const depth = window.innerWidth <= 760 ? 0 : Number(element.dataset.scrollDepth || 12);
    const position = (window.innerHeight / 2 - (box.top + box.height / 2)) / (window.innerHeight + box.height);
    const offset = Math.max(-depth, Math.min(depth, position * depth * 2));
    element.style.setProperty('--scroll-y', `${offset.toFixed(2)}px`);
  }
  if (scrollSignature) {
    const box = scrollSignature.getBoundingClientRect();
    // Begin as the scene enters; the complete title arrives before the sticky interval ends.
    const distance = Math.max(1, box.height - window.innerHeight * .45);
    const progress = Math.min(1, Math.max(0, (window.innerHeight * .55 - box.top) / distance));
    scrollSignature.style.setProperty('--explore-y', `${((1 - progress) * 48).toFixed(2)}px`);
    scrollSignature.style.setProperty('--explore-scale', (1.06 - progress * .06).toFixed(4));
    scrollSignature.style.setProperty('--explore-opacity', Math.min(1, progress * 2.7).toFixed(3));
    scrollSignature.style.setProperty('--explore-route', Math.min(1, progress * 1.5).toFixed(3));
  }
}
function requestScrollPaint() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScrollMotion);
}
window.addEventListener('scroll', requestScrollPaint, { passive: true });
window.addEventListener('resize', requestScrollPaint);
motion.addEventListener('change', requestScrollPaint);
requestScrollPaint();

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

document.querySelectorAll<HTMLElement>('[data-journey-library]').forEach(library => {
  const buttons = [...library.querySelectorAll<HTMLButtonElement>('[data-journey-filter]')];
  const cards = [...library.querySelectorAll<HTMLElement>('[data-journey-card]')];
  const empty = library.querySelector<HTMLElement>('[data-journey-empty]');
  buttons.forEach(button => button.addEventListener('click', () => {
    const reason = button.dataset.journeyFilter || 'all';
    let visible = 0;
    library.classList.toggle('has-active-filter', reason !== 'all');
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    cards.forEach(card => {
      card.hidden = reason !== 'all' && card.dataset.reason !== reason;
      if (!card.hidden) visible++;
    });
    if (empty) empty.hidden = visible > 0;
  }));
});

const planner = document.querySelector<HTMLFormElement>('#journey-planner');
document.querySelectorAll<HTMLElement>('[data-journal]').forEach(library => {
  const search = library.querySelector<HTMLInputElement>('[data-journal-search]');
  const topics = [...library.querySelectorAll<HTMLButtonElement>('[data-journal-topic]')];
  const stories = [...library.querySelectorAll<HTMLElement>('[data-story]')];
  const count = library.querySelector<HTMLElement>('[data-journal-count]');
  const empty = library.querySelector<HTMLElement>('[data-journal-empty]');
  const reset = library.querySelector<HTMLButtonElement>('[data-journal-reset]');
  let topic = 'all';
  const filterStories = () => {
    const words = (search?.value || '').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    stories.forEach(story => {
      story.hidden = (topic !== 'all' && story.dataset.topic !== topic)
        || !words.every(word => (story.dataset.search || '').includes(word));
      if (!story.hidden) visible++;
    });
    if (count) count.textContent = `${visible} ${visible === 1 ? 'story' : 'stories'}`;
    if (empty) empty.hidden = visible > 0;
  };
  search?.addEventListener('input', filterStories);
  topics.forEach(button => button.addEventListener('click', () => {
    topic = button.dataset.journalTopic || 'all';
    topics.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filterStories();
  }));
  reset?.addEventListener('click', () => {
    topic = 'all';
    if (search) search.value = '';
    topics.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.journalTopic === 'all')));
    filterStories();
    search?.focus();
  });
  filterStories();
});

if (planner) {
  const DRAFT_KEY = 'pardus-planner-draft-v2';
  const TOTAL_STEPS = 4;
  let step = 1;
  const steps = [...planner.querySelectorAll<HTMLFieldSetElement>('[data-step]')];
  const next = planner.querySelector<HTMLButtonElement>('[data-next]')!;
  const back = planner.querySelector<HTMLButtonElement>('[data-back]')!;
  const error = planner.querySelector<HTMLElement>('[data-error]')!;
  const status = planner.querySelector<HTMLElement>('[data-form-status]')!;
  const date = planner.querySelector<HTMLInputElement>('[name="date"]')!;
  const email = planner.querySelector<HTMLInputElement>('[name="email"]')!;
  const destination = planner.querySelector<HTMLSelectElement>('[name="destination"]')!;
  const style = planner.querySelector<HTMLSelectElement>('[name="style"]')!;
  const signalFields = Object.fromEntries(['place', 'pace', 'reason'].map(name => [name, planner.querySelector<HTMLSelectElement>(`[name="${name}"]`)!]));
  const now = new Date();
  date.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const choose = (field: HTMLSelectElement, value: string | null | undefined) => {
    if (value != null && [...field.options].some(option => option.value === value)) field.value = value;
  };

  let draft: ReturnType<typeof normalisePlannerDraft> = {};
  try {
    draft = normalisePlannerDraft(JSON.parse(sessionStorage.getItem(DRAFT_KEY) || '{}'));
    for (const [name, value] of Object.entries(draft)) {
      if (name === 'priorities') {
        const selected = value.split(', ');
        planner.querySelectorAll<HTMLInputElement>('[name="priorities"]').forEach(input => { input.checked = selected.includes(input.value); });
        continue;
      }
      const field = planner.elements.namedItem(name);
      if (field instanceof HTMLSelectElement) choose(field, value);
      else if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.value = value;
    }
  } catch {}

  const params = new URLSearchParams(window.location.search);
  const context = resolvePlannerContext(draft, readFolio(), params);
  choose(destination, context.destination);
  choose(style, context.style);
  choose(signalFields.place, context.place);
  choose(signalFields.pace, context.pace);
  choose(signalFields.reason, context.reason);
  const savedInspiration = planner.querySelector<HTMLInputElement>('[name="saved"]');
  const savedNotice = planner.querySelector<HTMLElement>('[data-saved-inspiration]');
  const savedCopy = planner.querySelector<HTMLElement>('[data-saved-inspiration-copy]');
  if (savedInspiration) savedInspiration.value = context.saved;
  if (savedNotice) savedNotice.hidden = !context.saved;
  if (savedCopy) savedCopy.textContent = context.saved;

  const saveDraft = () => {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(cleanBrief(new FormData(planner)))); } catch {}
  };
  const asidePicture = planner.parentElement?.querySelector<HTMLElement>('.planner-aside-picture');
  const avifSource = asidePicture?.querySelector<HTMLSourceElement>('source[type="image/avif"]');
  const webpSource = asidePicture?.querySelector<HTMLSourceElement>('source[type="image/webp"]');
  const asideImg = asidePicture?.querySelector<HTMLImageElement>('img');
  if (asidePicture && asideImg) {
    const srcset = (slug: string, format: string) => [640, 1280, 1920].map(w => `${path(`images/${slug}-${w}.${format}`)} ${w}w`).join(', ');
    destination.addEventListener('change', () => {
      const slug = destination.selectedOptions[0]?.dataset.slug;
      const match = slug ? destinations.find(d => d.slug === slug) : undefined;
      const image = match?.image || 'maldives';
      if (avifSource) avifSource.srcset = srcset(image, 'avif');
      if (webpSource) webpSource.srcset = srcset(image, 'webp');
      asideImg.src = path(`images/${image}-1280.webp`);
      asideImg.alt = match ? `An escape in ${match.name}` : 'An overwater escape in the Maldives';
    });
    destination.dispatchEvent(new Event('change'));
  }

  const notes = planner.querySelector<HTMLTextAreaElement>('[name="notes"]');
  const charCount = planner.querySelector<HTMLElement>('[data-char-count]');
  const updateCount = () => { if (notes && charCount) charCount.textContent = `${notes.value.length}/1500`; };
  notes?.addEventListener('input', updateCount);
  updateCount();

  const summary = () => {
    const data = cleanBrief(new FormData(planner));
    const list = planner.querySelector<HTMLDListElement>('.brief-summary')!;
    list.replaceChildren();
    const rows = [
      ['Shape', [data.place, data.pace, data.reason].filter(Boolean).join(' · ') || 'Open'],
      ['Destination', data.destination || 'Open to inspiration'], ['Journey idea', data.style || 'No fixed concept'],
      ['Saved inspiration', data.saved || 'None selected'],
      ['Travellers', `${data.adults || '—'} adults · ${data.children || 'No children noted'}`],
      ['Budget per person', data.budget || 'To discuss'],
      ['Timing', `${data.date || 'Flexible'} · ${data.dateFlexibility || 'To discuss'}`], ['Length', data.nights || 'Flexible'],
      ['From', data.departure || 'To discuss'], ['Priorities', data.priorities || 'To discuss'],
      ['Practical notes', data.access || 'None noted'], ['Personal note', data.notes || 'To discuss'],
      ['Your name', data.name || 'Not provided'],
      ['Reply', [data.email, data.phone].filter(Boolean).join(' · ') || 'Not provided'],
      ['Preferred reply', data.contactPreference || 'To discuss'], ['Country', data.country || 'Not provided'],
    ];
    rows.forEach(([key, value]) => {
      const row = document.createElement('div'); const term = document.createElement('dt'); const detail = document.createElement('dd');
      term.textContent = key; detail.textContent = value; row.append(term, detail); list.append(row);
    });
  };

  const updateDraft = () => {
    saveDraft();
    if (step === TOTAL_STEPS) summary();
  };
  planner.addEventListener('input', updateDraft);
  planner.addEventListener('change', updateDraft);

  const render = (focus = false) => {
    steps.forEach((fieldset, index) => { fieldset.hidden = index !== step - 1; });
    const titles = ['The shape', 'The practical frame', 'What matters', 'Your brief'];
    planner.querySelector<HTMLElement>('[data-step-label]')!.textContent = `${String(step).padStart(2, '0')} / 04 — ${titles[step - 1]}`;
    planner.querySelectorAll('.step-indicators i').forEach((item, index) => item.classList.toggle('active', index < step));
    next.querySelector('span')!.textContent = ['Add the practical frame', 'Add what matters', 'Review your brief', site.enquiryEndpoint ? 'Send and keep my brief' : 'Download my brief'][step - 1];
    back.hidden = step === 1; error.textContent = ''; status.textContent = '';
    if (step === TOTAL_STEPS) summary();
    if (focus) {
      const legend = steps[step - 1].querySelector('legend')!;
      legend.tabIndex = -1; legend.focus({ preventScroll: true });
      planner.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'start' });
    }
  };

  render();
  saveDraft();
  back.addEventListener('click', () => { if (step > 1) { step--; render(true); } });
  planner.addEventListener('submit', async event => {
    event.preventDefault();
    if (step === 2 && !validDeparture(date.value, date.min)) {
      error.textContent = 'Choose today or a future departure date, or leave it empty if you’re flexible.';
      date.setAttribute('aria-invalid', 'true'); date.focus(); return;
    }
    date.removeAttribute('aria-invalid');
    if (step === TOTAL_STEPS && !validEmail(email.value.trim())) {
      error.textContent = 'Enter an email in the format name@example.com, or leave it empty while using the download-only planner.';
      email.setAttribute('aria-invalid', 'true'); email.focus(); return;
    }
    email.removeAttribute('aria-invalid');
    if (step === TOTAL_STEPS && site.enquiryEndpoint && !planner.reportValidity()) return;
    if (step < TOTAL_STEPS) { step++; render(true); return; }

    const data = cleanBrief(new FormData(planner));
    let delivered = false;
    if (site.enquiryEndpoint) {
      status.textContent = 'Sending your enquiry…';
      next.disabled = true; next.setAttribute('aria-busy', 'true');
      const payload = new FormData();
      Object.entries(data).forEach(([key, value]) => payload.set(key, value));
      payload.set('_subject', `Pardus journey brief — ${data.destination || 'Open to inspiration'}`);
      const gotcha = planner.querySelector<HTMLInputElement>('[name="_gotcha"]');
      if (gotcha) payload.set('_gotcha', gotcha.value);
      delivered = await deliverEnquiry(site.enquiryEndpoint, payload);
      next.disabled = false; next.removeAttribute('aria-busy');
    }
    try {
      const content = briefText(data, delivered);
      const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
      const download = document.createElement('a'); download.href = url; download.download = 'Pardus-My-Journey-Brief.txt';
      document.body.append(download); download.click(); download.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
      status.textContent = delivered
        ? 'Your brief is ready to keep, and your enquiry has been sent to Pardus.'
        : site.enquiryEndpoint
          ? 'Your brief is ready to keep. Automatic delivery failed, so your entries remain here for another attempt.'
          : 'Your brief is ready to keep. It has not been sent to Pardus and is not a booking.';
      if (delivered) try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
      const printable = document.querySelector('.print-brief'); if (printable) printable.textContent = content;
    } catch {
      error.textContent = 'Your browser could not create the download. Your entries are still here; please try again.';
    }
  });
}

const contactForm = document.querySelector<HTMLFormElement>('#contact-form');
if (contactForm) {
  const status = contactForm.querySelector<HTMLElement>('[data-form-status]')!;
  const error = contactForm.querySelector<HTMLElement>('[data-error]')!;
  const submit = contactForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
  contactForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    error.textContent = ''; status.textContent = 'Sending your message…'; submit.disabled = true;
    const delivered = await deliverEnquiry(site.enquiryEndpoint, new FormData(contactForm));
    submit.disabled = false;
    if (delivered) { status.textContent = 'Thank you — your message has been sent to Pardus.'; contactForm.reset(); }
    else { status.textContent = ''; error.textContent = 'We could not send your message. Please try again, or email us directly.'; }
  });
}

// Enable interactive controls only after their handlers are registered.
root.classList.add('js');
