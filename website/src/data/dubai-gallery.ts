import { photo } from './photography.ts';
import type { IconName } from './icons.ts';

// Generated scenes describe the kind of journey to plan, not a named property
// or guaranteed inclusion. Provenance and prompts accompany the source masters.
export const dubaiExperiencePhotos = [
  photo('dubai-dining', { image: 'dubai-v24', alt: 'Dubai Marina waterfront and skyline' }),
  photo('dubai-desert', { image: 'dubai-v24', alt: 'Dubai Marina waterfront and skyline' }),
  photo('yacht', { image: 'yacht-dubai-v24', alt: 'A white motor yacht in Dubai Marina' }),
];

export const dubaiDiscoveries: { title: string; text: string; icon: IconName; image: string; alt: string }[] = [
  {
    title: 'Along the creek', icon: 'compass',
    text: 'Leave time for a slower side of the city, with waterfront walks and a cultural chapter in your route.',
    ...photo('dubai-creek', { image: 'dubai-v24', alt: 'Dubai Marina waterfront and skyline' }),
  },
  {
    title: 'The city after sunset', icon: 'city',
    text: 'Choose the skyline views, evening walks and city experiences you would like to make room for.',
    ...photo('dubai-downtown', { image: 'dubai-v24', alt: 'Dubai Marina waterfront and skyline' }),
  },
  {
    title: 'A little time by the sea', icon: 'waves',
    text: 'Balance the city with a beach morning or a coastal stay, chosen around the pace you enjoy.',
    ...photo('dubai-beach', { image: 'dubai-v24', alt: 'Dubai Marina waterfront and skyline' }),
  },
  {
    title: 'A different perspective', icon: 'landmark',
    text: 'Add architecture, design and discoveries that interest you. We check opening times and bookings for your dates.',
    ...photo('dubai-skyline', { image: 'dubai-v24', alt: 'Dubai Marina waterfront and skyline' }),
  },
];
