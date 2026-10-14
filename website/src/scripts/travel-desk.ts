import { formatTravelDate, selectTravelUpdates, travelFeedStatus } from '../data/travel-updates';
async function refresh(desk: HTMLElement) {
  const local = desk.dataset.localFeed!;
  // Daily Actions commits are visible here even when a Pages rebuild is not triggered by GITHUB_TOKEN.
  const live = `https://raw.githubusercontent.com/cartelug/paradise/main/travel-updates.json?refresh=${Math.floor(Date.now()/300000)}`;
  for (const url of [live,local]) {
    try {
      const response = await fetch(url,{signal:AbortSignal.timeout(7000),cache:'no-cache'});
      if (!response.ok) continue;
      const data = await response.json();
      if (!data || !Array.isArray(data.items) || (data.updatedAt !== null && !Number.isFinite(Date.parse(data.updatedAt)))) continue;
      const items = selectTravelUpdates(data.items, Number(desk.dataset.limit || 6));
      const grid = desk.querySelector('[data-feed-items]')!;
      const fragment = document.createDocumentFragment();
      for (const item of items) {
        const article = document.createElement('article'); article.className = 'travel-update';
        const meta = document.createElement('div'); meta.className = 'travel-update-meta';
        const category = document.createElement('span'); category.textContent = item.category;
        const date = document.createElement('time'); date.dateTime = item.publishedAt; date.textContent = `Published ${formatTravelDate(item.publishedAt)}`; meta.append(category,date);
        const title = document.createElement('h3'); title.textContent = item.title;
        const summary = document.createElement('p'); summary.textContent = item.summary;
        const link = document.createElement('a'); link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `Read at ${item.source}`;
        article.append(meta,title,summary,link); fragment.append(article);
      }
      grid.replaceChildren(fragment);
      const empty = desk.querySelector<HTMLElement>('[data-feed-empty]');
      if (empty) empty.hidden = items.length > 0;
      desk.querySelector('[data-feed-status]')!.textContent = travelFeedStatus(data.updatedAt);
      return;
    } catch { /* Keep dated, readable server-rendered updates if refresh is unavailable. */ }
  }
}
document.querySelectorAll<HTMLElement>('[data-travel-desk]').forEach(desk => { void refresh(desk); setInterval(() => { if (!document.hidden) void refresh(desk); },600000); });
