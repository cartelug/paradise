// One manifest for canonical URLs, compatibility aliases, export and deployment checks.
export const legacyRoutes = Object.freeze({
  "index.html": "",
  "about.html": "about/",
  "concept-note.html": "concept-note/",
  "concierge.html": "concierge/",
  "contact.html": "contact/",
  "corporate.html": "corporate/",
  "cruises.html": "cruises/",
  "destinations.html": "destinations/",
  "journeys.html": "journeys/",
  "journey.html": "journey/",
  "planner.html": "planner/",
  "journal.html": "journal/",
  "privacy.html": "privacy/",
  "terms.html": "terms/",
  "travel-desk.html": "travel-desk/",
  "destination-zanzibar.html": "destinations/zanzibar/",
  "destination-seychelles.html": "destinations/seychelles/",
  "destination-maldives.html": "destinations/maldives/",
  "destination-dubai.html": "destinations/dubai/",
  "destination-maasai-mara.html": "destinations/maasai-mara/",
  "destination-uganda-gorillas.html": "destinations/uganda-gorillas/",
  "destination-africa.html": "destinations/africa/",
  "destination-europe.html": "destinations/europe/",
  "journey-safari-and-shore.html": "journeys/safari-and-shore/",
  "journey-private-island-reset.html": "journeys/private-island-reset/",
  "journey-family-in-the-wild.html": "journeys/family-in-the-wild/",
  "journey-celebration-in-two-acts.html": "journeys/celebration-in-two-acts/",
  "journey-executive-arrivals.html": "journeys/executive-arrivals/",
  "journey-mediterranean-at-human-pace.html": "journeys/mediterranean-at-human-pace/",
  "journal-choosing-your-maldives-island.html": "journal/choosing-your-maldives-island/",
  "journal-how-a-journey-comes-together.html": "journal/how-a-journey-comes-together/",
  "journal-questions-before-a-luxury-booking.html": "journal/questions-before-a-luxury-booking/",
  "journal-what-a-private-safari-involves.html": "journal/what-a-private-safari-involves/",
  "journal-zanzibar-beyond-the-beach.html": "journal/zanzibar-beyond-the-beach/"
});
export const canonicalRoutes = Object.freeze(Object.values(legacyRoutes));
/** Map known page aliases only. Asset filenames and unknown paths remain untouched. */
export function canonicalRoute(route = '') {
  const match = String(route).match(/^([^?#]*)([?#].*)?$/);
  const value = (match?.[1] || '').replace(/^\//, '');
  const suffix = match?.[2] || '';
  return (Object.hasOwn(legacyRoutes, value) ? legacyRoutes[value] : value) + suffix;
}
export function pageFile(route = '') {
  const value = canonicalRoute(route).split(/[?#]/)[0];
  return value === '404.html' ? value : `${value}index.html`;
}
