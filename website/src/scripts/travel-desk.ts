interface Update { title:string; summary:string; source:string; category:string; url:string; publishedAt:string; expiresAt?:string; }
const allowed = new Set(['caa.go.ug','www.caa.go.ug','www.visitdubai.com','www.emirates.com']);
const formatDate = (value: string) => new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
function valid(item: unknown): item is Update {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Update;
  if (![candidate.title,candidate.summary,candidate.source,candidate.category,candidate.url,candidate.publishedAt].every(value => typeof value === 'string' && value.length < 1000)) return false;
  try { const url = new URL(candidate.url); return url.protocol === 'https:' && allowed.has(url.hostname) && Number.isFinite(Date.parse(candidate.publishedAt)); } catch { return false; }
}
async function refresh(desk: HTMLElement) {
  const local = desk.dataset.localFeed!;
  // Daily Actions commits are visible here even when a Pages rebuild is not triggered by GITHUB_TOKEN.
  const live = `https://raw.githubusercontent.com/cartelug/paradise/main/travel-updates.json?refresh=${Math.floor(Date.now()/300000)}`;
  for (const url of [live,local]) {
    try {
      const response = await fetch(url,{signal:AbortSignal.timeout(7000),cache:'no-cache'});
      if (!response.ok) continue;
      const data = await response.json();
      if (!Array.isArray(data.items) || !data.updatedAt || !Number.isFinite(Date.parse(data.updatedAt))) continue;
      const today = new Date().toISOString().slice(0,10);
      const items = data.items.filter(valid).filter((item: Update) => !item.expiresAt || item.expiresAt >= today).slice(0, Number(desk.dataset.limit || 6));
      if (!items.length) continue;
      const grid = desk.querySelector('[data-feed-items]')!;
      const fragment = document.createDocumentFragment();
      for (const item of items) {
        const article = document.createElement('article'); article.className = 'travel-update';
        const meta = document.createElement('div'); meta.className = 'travel-update-meta';
        const category = document.createElement('span'); category.textContent = item.category;
        const date = document.createElement('time'); date.dateTime = item.publishedAt; date.textContent = formatDate(item.publishedAt); meta.append(category,date);
        const title = document.createElement('h3'); title.textContent = item.title;
        const summary = document.createElement('p'); summary.textContent = item.summary;
        const link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `Read at ${item.source}`;
        article.append(meta,title,summary,link); fragment.append(article);
      }
      grid.replaceChildren(fragment);
      const age = Date.now() - Date.parse(data.updatedAt);
      desk.querySelector('[data-feed-status]')!.textContent = `Official travel updates · ${age > 172800000 ? 'Last feed check' : 'Feed checked'} ${formatDate(data.updatedAt)}`;
      return;
    } catch { /* Keep dated, readable server-rendered updates if refresh is unavailable. */ }
  }
}
document.querySelectorAll<HTMLElement>('[data-travel-desk]').forEach(desk => { void refresh(desk); setInterval(() => { if (!document.hidden) void refresh(desk); },600000); });
