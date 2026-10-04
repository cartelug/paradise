export const site = {
  name: 'Pardus Luxury Escapes',
  description: 'Luxury travel, beautifully arranged. Maldives, Seychelles, Dubai, safaris and private yacht experiences, with flights, stays and transfers planned around you.',
  // Only add business-approved contacts. Empty values never render fake links.
  email: 'info@pardusescapes.com',
  bookingsEmail: 'bookings@pardusescapes.com',
  supportEmail: 'support@pardusescapes.com',
  // Business-approved launch addresses. Mailbox activation is a separate business setup task.
  // International format, e.g. '+256 700 000 000'; spaces and symbols are ignored in the link.
  whatsapp: '',
  // A Formspree-compatible POST endpoint (e.g. https://formspree.io/f/xxxxxxx) that receives the
  // journey planner brief and the contact form. Empty disables all network delivery: forms keep
  // today's behaviour (local download only / no contact form rendered). Paste a value — no other
  // code changes are needed.
  enquiryEndpoint: '',
  // Cloudflare Web Analytics beacon token. Empty disables all analytics script injection.
  analyticsId: '',
  // Full profile URLs, e.g. https://www.instagram.com/yourhandle/ and https://www.tiktok.com/@yourhandle.
  // Empty values render nothing; each link appears in the footer and structured data once set.
  social: {
    instagram: '',
    tiktok: '',
  },
};

export const path = (route = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${route}`;

// Absolute URL on the configured site origin (astro.config `site`, set with PARDUS_SITE).
export const absolute = (route = '') => new URL(path(route), import.meta.env.SITE).toString();

const whatsappDigits = site.whatsapp.replace(/\D/g, '');
export const whatsappUrl = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '';

export const socialLinks = [
  { label: 'Instagram', href: site.social.instagram },
  { label: 'TikTok', href: site.social.tiktok },
].filter(link => link.href.startsWith('https://'));

export const navigation = [
  { label: 'Destinations', href: 'destinations.html' },
  { label: 'Private cruises', href: 'cruises.html' },
  { label: 'What we arrange', href: 'concierge.html' },
  { label: 'Travel desk', href: 'travel-desk.html' },
];
