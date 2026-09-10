export const site = {
  name: 'Pardus Luxury Escapes',
  description: 'Highly personalised luxury journeys from Africa to the world, seamlessly curated around you by Pardus Luxury Escapes.',
  // Only add business-approved contacts. Empty values never render fake links.
  email: '',
  whatsapp: '',
  // A Formspree-compatible POST endpoint (e.g. https://formspree.io/f/xxxxxxx) that receives the
  // journey planner brief and the contact form. Empty disables all network delivery: forms keep
  // today's behaviour (local download only / no contact form rendered). Paste a value — no other
  // code changes are needed.
  enquiryEndpoint: '',
  // Cloudflare Web Analytics beacon token. Empty disables all analytics script injection.
  analyticsId: '',
};

export const path = (route = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${route}`;

export const navigation = [
  { label: 'Destinations', href: 'destinations.html' },
  { label: 'The Pardus way', href: 'about.html' },
  { label: 'Concierge', href: 'concierge.html' },
  { label: 'Journal', href: 'journal.html' },
  { label: 'Corporate', href: 'corporate.html' },
];
