import { destinations } from './destinations';
export interface PriceAmounts {
  fromUSD: number | null;
  // Fail closed: absent or false approval never renders a numeric price.
  priceApproved?: boolean;
  // Populate only with an explicitly approved UGX starting amount. Never infer an
  // exchange rate from a visitor's budget, a market rate or the existing USD price.
  fromUGX?: number | null;
}
export interface EscapeOffer extends PriceAmounts {
  slug: string; label: string; nights: string; experience: string; highlights: string[];
  inclusions: string[]; priceBasis: string;
  priceApproved: boolean;
  duration: { nights: number | null; days: number | null };
  travelDates: string | null;
  departureCity: string | null;
  occupancyBasis: string | null;
  currency: 'USD' | 'UGX';
  taxesFees: string | null;
  components: Record<'flights' | 'transfers' | 'meals' | 'activities', 'included' | 'excluded' | 'on-request'>;
  exclusions: string[];
  restrictions: string[];
  previousPardusPrice?: { amount: number; currency: 'USD' | 'UGX'; verified: boolean };
  promotionWindow?: { startsOn: string; endsOn: string };
}
type OfferInput = Pick<EscapeOffer, 'slug' | 'label' | 'nights' | 'experience' | 'highlights' | 'inclusions' | 'fromUSD' | 'priceBasis'> & Partial<EscapeOffer>;
export function defineOffer(input: OfferInput): EscapeOffer {
  const nights = Number(input.nights.match(/^(\d+)-night/)?.[1]) || null;
  return {
    priceApproved: false,
    duration: { nights, days: nights ? nights + 1 : null },
    travelDates: null, departureCity: null, occupancyBasis: null,
    currency: 'USD', taxesFees: null,
    components: { flights: 'on-request', transfers: 'on-request', meals: 'on-request', activities: 'on-request' },
    exclusions: [],
    restrictions: ['Subject to availability and a written proposal. No reservation or price is guaranteed by an enquiry.'],
    ...input,
  };
}
// Starting prices retained from the supplied Pardus content. The dated proposal confirms
// the final itinerary, inclusions, availability and price before any booking.
const suppliedOffers: OfferInput[] = [
  { slug: 'maldives', label: 'Maldives', nights: '7-night escape', experience: 'Overwater mornings. Turquoise lagoons. A sunset cruise for two.', highlights: ['Luxury island stays', 'Snorkelling & lagoon days', 'Private sunset cruises'], inclusions: ['7 resort nights', 'Breakfast', 'Island transfers'], fromUSD: 2950, priceBasis: 'per person · two sharing' },
  { slug: 'seychelles', label: 'Seychelles', nights: '7-night escape', experience: 'Beautiful beaches, island-hopping and private days on the water.', highlights: ['Mahé, Praslin & La Digue', 'Beachfront resorts', 'Island excursions'], inclusions: ['7 resort nights', 'Breakfast', 'Airport transfers'], fromUSD: 2450, priceBasis: 'per person · two sharing' },
  { slug: 'dubai', label: 'Dubai', nights: '4-night escape', experience: 'Luxury hotels, shopping, desert dinners and your own yacht experience.', highlights: ['City & beach hotels', 'Desert experiences', 'Private yacht cruises'], inclusions: ['4 hotel nights', 'Breakfast', 'Airport transfers'], fromUSD: 1250, priceBasis: 'per person · two sharing' },
  { slug: 'africa', label: 'East Africa', nights: '7-night safari', experience: 'Private game drives, exceptional safari stays and time in the wild.', highlights: ['Uganda, Kenya & Tanzania', 'Safari lodges & camps', 'Private guided journeys'], inclusions: ['7 safari nights', 'Full board', 'Guided game drives'], fromUSD: 3250, priceBasis: 'per person · two sharing' },
  { slug: 'zanzibar', label: 'Safari & Zanzibar', nights: '9-night journey', experience: 'Start in safari country. Finish on Zanzibar’s white-sand coast.', highlights: ['Safari & beach in one trip', 'Stone Town & island culture', 'Sunset dhow cruises'], inclusions: ['4 safari + 5 beach nights', 'Selected meals', 'Ground transfers'], fromUSD: 3950, priceBasis: 'per person · two sharing' },
  { slug: 'europe', label: 'Europe', nights: '8-night journey', experience: 'Beautiful cities, private tours and a Mediterranean coast to finish.', highlights: ['City stays & private tours', 'Coast & culture', 'Connected itineraries'], inclusions: ['8 hotel nights', 'Breakfast', 'A private city tour'], fromUSD: 3850, priceBasis: 'per person · two sharing' },
];
// Existing supplied starting prices remain explicitly approved; no research-table
// prices are added. New itineraries use defineOffer's unapproved default.
const retainedOffers = suppliedOffers.map(offer => defineOffer({
  ...offer, priceApproved: true, occupancyBasis: 'Two adults sharing',
  components: {
    flights: 'excluded', transfers: offer.slug === 'africa' || offer.slug === 'europe' ? 'on-request' : 'included',
    meals: 'included', activities: offer.slug === 'africa' || offer.slug === 'europe' ? 'included' : 'on-request',
  },
  exclusions: ['Flights', 'Visas', 'Travel insurance'],
}));
const newOffers = [
  defineOffer({ slug: 'maasai-mara', label: 'Maasai Mara', nights: 'Suggested 3 days / 2 nights', duration: { days: 3, nights: 2 },
    experience: 'Open grasslands, considered safari stays and time to take in the wild. Ask for a journey shaped around you.',
    highlights: ['A personally planned safari', 'Lodge and camp options', 'A pace suited to your group'],
    inclusions: ['Itinerary planning', 'Accommodation proposal', 'Guided safari options'],
    exclusions: ['International flights', 'Visas', 'Travel insurance'],
    restrictions: ['Accommodation, park fees, transfers and activities are confirmed in your written proposal.', 'Wildlife sightings are never guaranteed.'],
    fromUSD: null, priceBasis: 'per person · occupancy confirmed in your proposal' }),
  defineOffer({ slug: 'uganda-gorillas', label: 'Uganda gorillas', nights: 'Suggested 3 days / 2 nights', duration: { days: 3, nights: 2 },
    experience: 'A forest journey in Uganda, with permit availability, accommodation and the route considered together.',
    highlights: ['Bwindi forest journeys', 'Gorilla permit availability checks', 'A practical, personal itinerary'],
    inclusions: ['Route & accommodation planning', 'Gorilla permit availability check', 'Transfer options'],
    exclusions: ['International flights', 'Visas', 'Travel insurance'],
    restrictions: ['Gorilla permits are subject to availability and confirmation; an enquiry does not reserve a permit.', 'Park rules, fitness requirements, accommodation and all inclusions are confirmed before booking.'],
    fromUSD: null, priceBasis: 'per person · occupancy confirmed in your proposal' }),
];
export const destinationOrder = ['zanzibar', 'seychelles', 'maldives', 'dubai', 'maasai-mara', 'uganda-gorillas', 'africa', 'europe'];
export const offers: EscapeOffer[] = destinationOrder.map(slug => [...retainedOffers, ...newOffers].find(offer => offer.slug === slug)!);
export const offerFor = (slug: string) => offers.find(offer => offer.slug === slug)!;
export const destinationFor = (slug: string) => destinations.find(destination => destination.slug === slug)!;
export const usd = (amount: number) => `USD ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`;
export const ugx = (amount: number) => `UGX ${new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(amount)}`;
const usableAmount = (amount: number | null | undefined): amount is number => typeof amount === 'number' && Number.isFinite(amount) && amount > 0;
export const displayPrice = (offer: PriceAmounts) => {
  if (offer.priceApproved !== true) return { amount: 'Request a quote', currency: null, hasStartingPrice: false, secondary: null };
  if (usableAmount(offer.fromUGX)) {
    return { amount: ugx(offer.fromUGX), currency: 'UGX' as const, hasStartingPrice: true, secondary: usableAmount(offer.fromUSD) ? usd(offer.fromUSD) : null };
  }
  if (usableAmount(offer.fromUSD)) {
    return { amount: usd(offer.fromUSD), currency: 'USD' as const, hasStartingPrice: true, secondary: null };
  }
  return { amount: 'Request a quote', currency: null, hasStartingPrice: false, secondary: null };
};
export const priceText = (offer: PriceAmounts) => {
  const price = displayPrice(offer);
  return `${price.hasStartingPrice ? 'From ' : ''}${price.amount}`;
};
export const priceNote = 'Prices are per person, based on two adults sharing. UGX quote available. Your dates and chosen itinerary determine the final price. Flights, visas and travel insurance are quoted separately.';
export function promotionPrice(offer: EscapeOffer, today = new Date().toISOString().slice(0, 10)) {
  const previous = offer.previousPardusPrice;
  const window = offer.promotionWindow;
  const current = displayPrice(offer);
  const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!offer.priceApproved || !previous?.verified || !window || !validDate(today) || !validDate(window.startsOn) || !validDate(window.endsOn)) return null;
  if (window.startsOn > window.endsOn || today < window.startsOn || today > window.endsOn || previous.currency !== current.currency) return null;
  const currentAmount = current.currency === 'UGX' ? offer.fromUGX : offer.fromUSD;
  if (!usableAmount(previous.amount) || !usableAmount(currentAmount) || previous.amount <= currentAmount) return null;
  return { amount: previous.currency === 'UGX' ? ugx(previous.amount) : usd(previous.amount), ...window };
}
export const services = ['Flights', 'Luxury hotels & resorts', 'Private transfers', 'Visa guidance', 'Boat & yacht cruises', 'Safaris', 'Honeymoons', 'Family holidays', 'Group travel', 'Corporate travel', 'Private tours', 'Activities & experiences', 'Custom itineraries'];
export const serviceGroups = [
  { icon: 'plane' as const, title: 'The travel essentials', text: 'Every connection, considered.', items: ['Flights', 'Luxury hotels & resorts', 'Private transfers', 'Visa guidance'] },
  { icon: 'waves' as const, title: 'Exceptional experiences', text: 'More to remember when you arrive.', items: ['Boat & yacht cruises', 'Safaris', 'Private tours', 'Activities & experiences'] },
  { icon: 'sun' as const, title: 'Your kind of occasion', text: 'Time together, beautifully planned.', items: ['Honeymoons', 'Family holidays', 'Group travel'] },
  { icon: 'compass' as const, title: 'Made around your plans', text: 'A journey with your priorities at its heart.', items: ['Corporate travel', 'Custom itineraries'] },
];
export const cruiseTypes = [
  { title: 'Dubai yacht cruises', text: 'Private time on the water, with skyline views and an itinerary built around your group.', fromUSD:450, basis:'per yacht · 3 hours · up to 6 guests' },
  { title: 'Sunset & romantic cruises', text: 'A quiet evening for two, a honeymoon moment or an anniversary on the water.', fromUSD:280, basis:'per boat · 2 hours · 2 guests' },
  { title: 'Island excursions', text: 'Discover coves, snorkelling spots and neighbouring islands with a private boat arrangement.', fromUSD:650, basis:'per boat · 4 hours · up to 4 guests' },
  { title: 'Private celebrations', text: 'Bring friends, family or your team together for a private cruise and a special occasion.', fromUSD:1200, basis:'per charter · 4 hours · up to 10 guests' },
].map(offer => ({ ...offer, priceApproved: true }));
