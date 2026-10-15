export const site = {
  name: 'Pardus Luxury Escapes',
  // One primary tagline, used with the logo everywhere (hero, opening, footer, search results and sharing).
  tagline: 'Extraordinary journeys. Personally curated.',
  description: 'Extraordinary journeys. Personally curated. Bespoke luxury travel for Uganda and East Africa: the Maldives, Seychelles, Dubai, safaris and private yachts, arranged around you.',
  // Only add business-approved contacts. Empty values never render fake links.
  email: 'info@pardusescapes.com',
  bookingsEmail: 'bookings@pardusescapes.com',
  supportEmail: 'support@pardusescapes.com',
  // Business-approved launch addresses. Mailbox activation is a separate business setup task.
  // International format, e.g. '+256 700 000 000'; spaces and symbols are ignored in the link.
  whatsapp: '',
  // A verified business telephone number, e.g. '+256 700 000 000'. Empty shows nothing; once set it appears in the footer,
  // on the contact page and in the structured data.
  phone: '',
  // Verified company details only: registered name, registration number, tourism licence, trade-body membership.
  // Each entry is shown on "Our difference" and "Contact" once added; nothing is shown while the list is empty.
  // Never add a badge, licence or partner that has not been verified.
  credentials: [] as { label: string; value: string }[],
  // A Formspree-compatible POST endpoint (e.g. https://formspree.io/f/xxxxxxx) that receives the enquiry and the journey
  // planner brief straight into the Pardus inbox. Empty keeps the email-draft fallback (nothing is sent by the website).
  // Paste it here, or set PUBLIC_PARDUS_ENQUIRY_ENDPOINT when building; no other code changes are needed. Once it is set the
  // enquiry button reads "Send my enquiry", the visitor sees a confirmation, and the privacy page describes the delivery.
  enquiryEndpoint: (import.meta.env.PUBLIC_PARDUS_ENQUIRY_ENDPOINT as string | undefined) || '',
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
const phoneDigits = site.phone.replace(/[^\d+]/g, '');
export const phoneUrl = phoneDigits ? `tel:${phoneDigits}` : '';

export const socialLinks = [
  { label: 'Instagram', href: site.social.instagram },
  { label: 'TikTok', href: site.social.tiktok },
].filter(link => link.href.startsWith('https://'));

// The same five labels on every page, in the header and the menu. "Plan your escape" is the one prominent action beside them;
// saved trips stay available but secondary. Cruises, services and the travel desk live under "More" in the menu and the footer.
export const navigation = [
  { label: 'Destinations', href: 'destinations.html' },
  { label: 'Signature journeys', href: 'journeys.html' },
  { label: 'Our difference', href: 'about.html' },
  { label: 'Corporate travel', href: 'corporate.html' },
  { label: 'Journal', href: 'journal.html' },
];
