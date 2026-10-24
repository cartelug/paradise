export const serviceArt: Record<string, string> = {
  'Flights': 'flights',
  'Luxury hotels & resorts': 'resort',
  'Private transfers': 'transfers',
  'Visa guidance': 'visas',
  'Boat & yacht cruises': 'yacht',
  'Safaris': 'safari',
  'Private tours': 'private-tours',
  'Activities & experiences': 'activities',
  'Honeymoons': 'honeymoon',
  'Family holidays': 'family',
  'Group travel': 'groups',
  'Corporate travel': 'corporate',
  'Custom itineraries': 'bespoke',
};
export const destinationArt: Record<string, string> = {
  maldives: 'maldives', seychelles: 'seychelles', dubai: 'dubai',
  africa: 'east-africa', europe: 'europe', zanzibar: 'zanzibar',
};
export const symbolIds = [...Object.values(serviceArt), ...Object.values(destinationArt), 'personal-attention', 'thoughtful-details', 'seamless-service', 'world', 'travel-journal'];
