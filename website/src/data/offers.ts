import { destinations } from './destinations';
export interface EscapeOffer {
  slug: string; label: string; nights: string; experience: string; highlights: string[];
  inclusions: string[]; fromUSD: number | null; priceBasis: string;
}
// Starting prices retained from the supplied Pardus content. The dated proposal confirms
// the final itinerary, inclusions, availability and price before any booking.
export const offers: EscapeOffer[] = [
  { slug: 'maldives', label: 'Maldives', nights: '7-night escape', experience: 'Overwater mornings. Turquoise lagoons. A sunset cruise for two.', highlights: ['Luxury island stays', 'Snorkelling & lagoon days', 'Private sunset cruises'], inclusions: ['7 resort nights', 'Breakfast', 'Island transfers'], fromUSD: 2950, priceBasis: 'per person · two sharing' },
  { slug: 'seychelles', label: 'Seychelles', nights: '7-night escape', experience: 'Beautiful beaches, island-hopping and private days on the water.', highlights: ['Mahé, Praslin & La Digue', 'Beachfront resorts', 'Island excursions'], inclusions: ['7 resort nights', 'Breakfast', 'Airport transfers'], fromUSD: 2450, priceBasis: 'per person · two sharing' },
  { slug: 'dubai', label: 'Dubai', nights: '4-night escape', experience: 'Luxury hotels, shopping, desert dinners and your own yacht experience.', highlights: ['City & beach hotels', 'Desert experiences', 'Private yacht cruises'], inclusions: ['4 hotel nights', 'Breakfast', 'Airport transfers'], fromUSD: 1250, priceBasis: 'per person · two sharing' },
  { slug: 'africa', label: 'East Africa', nights: '7-night safari', experience: 'Private game drives, exceptional safari stays and time in the wild.', highlights: ['Uganda, Kenya & Tanzania', 'Safari lodges & camps', 'Private guided journeys'], inclusions: ['7 safari nights', 'Full board', 'Guided game drives'], fromUSD: 3250, priceBasis: 'per person · two sharing' },
  { slug: 'zanzibar', label: 'Safari & Zanzibar', nights: '9-night journey', experience: 'Start in safari country. Finish on Zanzibar’s white-sand coast.', highlights: ['Safari & beach in one trip', 'Stone Town & island culture', 'Sunset dhow cruises'], inclusions: ['4 safari + 5 beach nights', 'Selected meals', 'Ground transfers'], fromUSD: 3950, priceBasis: 'per person · two sharing' },
  { slug: 'europe', label: 'Europe', nights: '8-night journey', experience: 'Beautiful cities, private tours and a Mediterranean coast to finish.', highlights: ['City stays & private tours', 'Coast & culture', 'Connected itineraries'], inclusions: ['8 hotel nights', 'Breakfast', 'A private city tour'], fromUSD: 3850, priceBasis: 'per person · two sharing' },
];
export const offerFor = (slug: string) => offers.find(offer => offer.slug === slug)!;
export const destinationFor = (slug: string) => destinations.find(destination => destination.slug === slug)!;
export const usd = (amount: number) => `USD ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`;
export const priceText = (offer: {fromUSD:number|null}) => offer.fromUSD === null ? 'USD quote on request' : `From ${usd(offer.fromUSD)}`;
export const priceNote = 'Prices are per person, based on two adults sharing. Your dates and chosen itinerary determine the final price. Flights, visas and travel insurance are quoted separately.';
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
];
