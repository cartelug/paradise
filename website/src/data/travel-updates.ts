export interface TravelUpdate {
  id?: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  url: string;
  publishedAt: string;
  checkedAt?: string;
  expiresAt?: string;
  sourceCategories?: string[];
}

const allowedHosts = new Set(['caa.go.ug', 'www.caa.go.ug', 'www.visitdubai.com', 'www.emirates.com']);
const recruitment = /\b(?:vacanc(?:y|ies)|recruit(?:ment|ing)?|careers?|employment|jobs?|hiring|tenders?|procurement|bids?|shortlist(?:ed)?|job\s+description|application\s+deadline)\b/i;
const staffRole = /^(?:(?:principal|senior|chief|assistant|deputy)\s+)?(?:(?:civil|flight\s+operations|aerodrome|electrical|mechanical)\s+)?(?:engineer|inspector|manager|officer|accountant|secretary|director)\b/i;
const travellerTopic = /\b(?:flights?|airlines?|routes?|passengers?|check[\s-]?in|baggage|visas?|entry\s+requirements?|travel(?:lers?|ers?)?|touris[mt]|connectivity|jambojet|parking|terminal|disruptions?|delays?|closures?|closed|reopen(?:ing)?|schedules?|winter|seasonal|events?)\b/i;

export function validTravelDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

/** Also protects against legacy public feeds which predate producer filtering. */
export function isTravellerRelevant(item: Pick<TravelUpdate, 'title' | 'url' | 'category' | 'sourceCategories'>): boolean {
  const context = [item.title, item.url.replaceAll('-', ' '), item.category, ...(item.sourceCategories || [])].join(' ');
  return !recruitment.test(context) && !staffRole.test(item.title) && travellerTopic.test(item.title);
}

export function validTravelUpdate(item: unknown): item is TravelUpdate {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as TravelUpdate;
  if (![candidate.title, candidate.summary, candidate.source, candidate.category, candidate.url]
    .every(value => typeof value === 'string' && value.trim().length > 0 && value.length < 1000)) return false;
  if (!validTravelDate(candidate.publishedAt)) return false;
  if (candidate.checkedAt !== undefined && !validTravelDate(candidate.checkedAt)) return false;
  if (candidate.expiresAt !== undefined && !validTravelDate(candidate.expiresAt)) return false;
  if (candidate.sourceCategories !== undefined && (!Array.isArray(candidate.sourceCategories)
    || !candidate.sourceCategories.every(value => typeof value === 'string' && value.length < 100))) return false;
  try {
    const url = new URL(candidate.url);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && allowedHosts.has(url.hostname) && isTravellerRelevant(candidate);
  } catch { return false; }
}

export function selectTravelUpdates(items: unknown, limit = 6, now = new Date()): TravelUpdate[] {
  if (!Array.isArray(items)) return [];
  const today = now.toISOString().slice(0, 10);
  const oldest = new Date(now.getTime() - 120 * 86400000).toISOString().slice(0, 10);
  const seen = new Set<string>();
  return items.filter(validTravelUpdate).filter(item => {
    if (item.publishedAt > today || (item.checkedAt && item.checkedAt > today)) return false;
    if (item.expiresAt ? item.expiresAt < today : item.publishedAt < oldest) return false;
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  }).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, Math.max(0, limit));
}

export function formatTravelDate(value: string): string {
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function travelFeedStatus(updatedAt: unknown, now = new Date()): string {
  if (typeof updatedAt !== 'string' || !Number.isFinite(Date.parse(updatedAt)) || Date.parse(updatedAt) > now.getTime()) {
    return 'Official travel sources';
  }
  const prefix = now.getTime() - Date.parse(updatedAt) > 172800000 ? 'Last aviation feed check' : 'Aviation feed checked';
  return `${prefix} ${formatTravelDate(updatedAt)}`;
}
