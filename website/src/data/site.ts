export const site = {
  name: 'Pardus Luxury Escapes',
  description: 'Personally planned holidays, private journeys and considered corporate travel. Discover the world with Pardus Luxury Escapes.',
  // Only add business-approved contacts. Empty values never render fake links.
  email: '',
  whatsapp: '',
};

export const path = (route = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${route}`;

export const navigation = [
  { label: 'Destinations', href: 'destinations.html' },
  { label: 'The Pardus way', href: 'about.html' },
  { label: 'Concierge', href: 'concierge.html' },
  { label: 'Corporate', href: 'corporate.html' },
];
