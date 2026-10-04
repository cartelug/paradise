import { destinations } from './destinations';
export interface EscapeOffer {
  slug: string; label: string; nights: string; experience: string; highlights: string[];
  fromUSD: number | null; priceBasis: string;
}
// Enter PARDUS-approved rates only. The supplied brochure contains sample discounts,
// not package rates. Null renders a USD quote request, never an invented price.
export const offers: EscapeOffer[] = [
  { slug: 'maldives', label: 'Maldives', nights: '7-night escape', experience: 'Overwater mornings. Turquoise lagoons. A sunset cruise for two.', highlights: ['Luxury island stays', 'Snorkelling & lagoon days', 'Private sunset cruises'], fromUSD: null, priceBasis: 'per person' },
  { slug: 'seychelles', label: 'Seychelles', nights: '7-night escape', experience: 'Beautiful beaches, island-hopping and private days on the water.', highlights: ['Mahé, Praslin & La Digue', 'Beachfront resorts', 'Island excursions'], fromUSD: null, priceBasis: 'per person' },
  { slug: 'dubai', label: 'Dubai', nights: '4-night escape', experience: 'Luxury hotels, shopping, desert dinners and your own yacht experience.', highlights: ['City & beach hotels', 'Desert experiences', 'Private yacht cruises'], fromUSD: null, priceBasis: 'per person' },
  { slug: 'africa', label: 'East Africa', nights: '7-night safari idea', experience: 'Private game drives, exceptional safari stays and time in the wild.', highlights: ['Uganda, Kenya & Tanzania', 'Safari lodges & camps', 'Private guided journeys'], fromUSD: null, priceBasis: 'per person' },
  { slug: 'zanzibar', label: 'Safari & Zanzibar', nights: '9-night journey idea', experience: 'Start in safari country. Finish on Zanzibar’s white-sand coast.', highlights: ['Safari & beach in one trip', 'Stone Town & island culture', 'Sunset dhow cruises'], fromUSD: null, priceBasis: 'per person' },
  { slug: 'europe', label: 'Europe', nights: '8-night journey idea', experience: 'Beautiful cities, private tours and a Mediterranean coast to finish.', highlights: ['City stays & private tours', 'Coast & culture', 'Connected itineraries'], fromUSD: null, priceBasis: 'per person' },
];
export const offerFor = (slug: string) => offers.find(offer => offer.slug === slug)!;
export const destinationFor = (slug: string) => destinations.find(destination => destination.slug === slug)!;
export const priceText = (offer: Pick<EscapeOffer, 'fromUSD'>) => offer.fromUSD === null ? 'USD quote on request' : `From USD ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(offer.fromUSD)}`;
export const services = ['Flights', 'Luxury hotels & resorts', 'Private transfers', 'Visa guidance', 'Boat & yacht cruises', 'Safaris', 'Honeymoons', 'Family holidays', 'Group travel', 'Corporate travel', 'Private tours', 'Activities & experiences', 'Custom itineraries'];
export const cruiseTypes = [
  { title: 'Dubai yacht cruises', text: 'Private time on the water, with skyline views and an itinerary built around your group.' },
  { title: 'Sunset & romantic cruises', text: 'A quiet evening for two, a honeymoon moment or an anniversary on the water.' },
  { title: 'Island excursions', text: 'Discover coves, snorkelling spots and neighbouring islands with a private boat arrangement.' },
  { title: 'Private celebrations', text: 'Bring friends, family or your team together for a private cruise and a special occasion.' },
];
