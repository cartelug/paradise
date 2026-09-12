export type FolioSignal = 'place' | 'pace' | 'reason';
export type FolioItem = { type: 'destination' | 'journey'; slug: string; label: string };
export type FolioState = {
  place: string;
  pace: string;
  reason: string;
  items: FolioItem[];
  expiresAt: number;
};

const STORAGE_KEY = 'pardus-folio-v2';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
const allowed = {
  place: new Set(['Island', 'Wild', 'City', 'Culture', 'Open']),
  pace: new Set(['Still', 'Balanced', 'Immersive']),
  reason: new Set(['Escape', 'Celebration', 'Family', 'Business']),
};

const emptyState = (): FolioState => ({ place: '', pace: '', reason: '', items: [], expiresAt: Date.now() + THIRTY_DAYS });
let memoryState = emptyState();

function normalise(input: unknown): FolioState {
  if (!input || typeof input !== 'object') return emptyState();
  const value = input as Partial<FolioState>;
  if (!Number.isFinite(value.expiresAt) || Number(value.expiresAt) < Date.now()) return emptyState();
  const items = Array.isArray(value.items) ? value.items.filter((item): item is FolioItem => {
    if (!item || typeof item !== 'object') return false;
    return (item.type === 'destination' || item.type === 'journey')
      && typeof item.slug === 'string' && /^[a-z0-9-]+$/.test(item.slug)
      && typeof item.label === 'string' && item.label.trim().length > 0 && item.label.length <= 80;
  }).slice(0, 12) : [];
  return {
    place: allowed.place.has(String(value.place)) ? String(value.place) : '',
    pace: allowed.pace.has(String(value.pace)) ? String(value.pace) : '',
    reason: allowed.reason.has(String(value.reason)) ? String(value.reason) : '',
    items,
    expiresAt: Number(value.expiresAt),
  };
}

export function readFolio(): FolioState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) memoryState = normalise(JSON.parse(saved));
  } catch {
    // The in-memory state keeps the current session useful when storage is unavailable.
  }
  return structuredClone(memoryState);
}

function writeFolio(next: FolioState): FolioState {
  memoryState = normalise({ ...next, expiresAt: Date.now() + THIRTY_DAYS });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryState)); } catch {}
  return structuredClone(memoryState);
}

function hasContent(state: FolioState) {
  return Boolean(state.place || state.pace || state.reason || state.items.length);
}

function plannerUrl(anchor: HTMLAnchorElement, state: FolioState) {
  const url = new URL(anchor.getAttribute('href') || 'journey.html', window.location.href);
  for (const signal of ['place', 'pace', 'reason'] as const) {
    if (state[signal]) url.searchParams.set(signal, state[signal]);
  }
  if (state.items.length) url.searchParams.set('saved', state.items.map(item => item.label).join(', '));
  return `${url.pathname}${url.search}`;
}

export function initFolio() {
  const panel = document.querySelector<HTMLDialogElement>('#pardus-folio');
  if (!panel) return;
  const triggers = [...document.querySelectorAll<HTMLButtonElement>('[data-folio-trigger]')];
  const choices = [...document.querySelectorAll<HTMLButtonElement>('[data-folio-choice]')];
  const saves = [...document.querySelectorAll<HTMLButtonElement>('[data-folio-save]')];
  const empty = panel.querySelector<HTMLElement>('[data-folio-empty]')!;
  const content = panel.querySelector<HTMLElement>('[data-folio-content]')!;
  const actions = panel.querySelector<HTMLElement>('[data-folio-actions]')!;
  const items = panel.querySelector<HTMLUListElement>('[data-folio-items]')!;
  const plan = panel.querySelector<HTMLAnchorElement>('[data-folio-plan]')!;
  const status = panel.querySelector<HTMLElement>('[data-folio-status]')!;
  let state = readFolio();
  let undoState: FolioState | null = null;
  let opener: HTMLButtonElement | null = null;

  const announce = (message: string) => {
    status.replaceChildren();
    status.textContent = message;
  };

  const render = () => {
    const populated = hasContent(state);
    empty.hidden = populated;
    content.hidden = !populated;
    actions.hidden = !populated;
    (['place', 'pace', 'reason'] as const).forEach(signal => {
      const target = panel.querySelector<HTMLElement>(`[data-folio-value="${signal}"]`);
      if (target) target.textContent = state[signal] || 'Open';
    });
    choices.forEach(choice => {
      const signal = choice.dataset.folioChoice as FolioSignal;
      const selected = Boolean(signal && state[signal] === choice.dataset.value);
      choice.setAttribute('aria-pressed', String(selected));
    });
    saves.forEach(button => {
      const saved = state.items.some(item => item.type === button.dataset.folioType && item.slug === button.dataset.folioSave);
      button.setAttribute('aria-pressed', String(saved));
      const label = button.querySelector('[data-save-label]');
      if (label) label.textContent = saved ? 'Saved to your Folio' : 'Save to your Folio';
    });
    items.replaceChildren(...state.items.map(item => {
      const row = document.createElement('li');
      const copy = document.createElement('span');
      const kind = document.createElement('small');
      const label = document.createElement('strong');
      const remove = document.createElement('button');
      kind.textContent = item.type;
      label.textContent = item.label;
      copy.append(kind, label);
      remove.type = 'button';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${item.label} from your Folio`);
      remove.addEventListener('click', () => {
        state = writeFolio({ ...state, items: state.items.filter(saved => saved.type !== item.type || saved.slug !== item.slug) });
        announce(`${item.label} removed.`);
        render();
      });
      row.append(copy, remove);
      return row;
    }));
    const count = state.items.length + Number(Boolean(state.place)) + Number(Boolean(state.pace)) + Number(Boolean(state.reason));
    triggers.forEach(trigger => {
      const badge = trigger.querySelector<HTMLElement>('[data-folio-count]');
      if (badge) { badge.textContent = String(count); badge.hidden = count === 0; }
      trigger.setAttribute('aria-label', count ? `Open your Pardus Folio, ${count} saved ${count === 1 ? 'note' : 'notes'}` : 'Open your empty Pardus Folio');
    });
    plan.href = plannerUrl(plan, state);
    window.dispatchEvent(new CustomEvent('pardus:folio', { detail: structuredClone(state) }));
  };

  triggers.forEach(trigger => trigger.addEventListener('click', () => { opener = trigger; panel.showModal(); }));
  panel.addEventListener('close', () => opener?.focus({ preventScroll: true }));
  panel.querySelectorAll<HTMLElement>('[data-folio-close], [data-folio-close-link]').forEach(control => control.addEventListener('click', () => panel.close()));
  panel.addEventListener('click', event => { if (event.target === panel) panel.close(); });

  choices.forEach(choice => choice.addEventListener('click', () => {
    const signal = choice.dataset.folioChoice as FolioSignal;
    if (!signal || !allowed[signal]) return;
    const value = choice.dataset.value || '';
    state = writeFolio({ ...state, [signal]: state[signal] === value ? '' : value });
    announce(`${signal[0].toUpperCase()}${signal.slice(1)} ${state[signal] ? `set to ${state[signal]}` : 'cleared'}.`);
    render();
  }));

  saves.forEach(button => button.addEventListener('click', () => {
    const type = button.dataset.folioType === 'journey' ? 'journey' : 'destination';
    const slug = button.dataset.folioSave || '';
    const label = (button.dataset.folioLabel || '').trim().slice(0, 80);
    if (!slug || !label) return;
    const exists = state.items.some(item => item.type === type && item.slug === slug);
    state = writeFolio({
      ...state,
      items: exists ? state.items.filter(item => item.type !== type || item.slug !== slug) : [...state.items, { type, slug, label }],
    });
    announce(exists ? `${label} removed from your Folio.` : `${label} saved to your Folio.`);
    render();
  }));

  panel.querySelector<HTMLButtonElement>('[data-folio-clear]')?.addEventListener('click', () => {
    undoState = structuredClone(state);
    state = writeFolio(emptyState());
    render();
    status.replaceChildren(document.createTextNode('Your Folio was cleared. '));
    const undo = document.createElement('button');
    undo.type = 'button'; undo.textContent = 'Undo';
    undo.addEventListener('click', () => {
      if (!undoState) return;
      state = writeFolio(undoState); undoState = null; announce('Your Folio was restored.'); render();
    });
    status.append(undo);
  });

  render();
}
