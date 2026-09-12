export type FolioPlace = 'Island' | 'Wild' | 'City' | 'Culture' | 'Open';
export type FolioPace = 'Still' | 'Balanced' | 'Immersive';
export type FolioReason = 'Escape' | 'Celebration' | 'Family' | 'Business';

export interface JourneyConcept {
  slug: string;
  number: string;
  name: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  caption: string;
  duration: string;
  destinations: string[];
  place: FolioPlace;
  pace: FolioPace;
  reason: FolioReason;
  idealFor: string[];
  rhythm: string[];
  chapters: { title: string; text: string }[];
  flexibility: string[];
}

export const journeys: JourneyConcept[] = [
  {
    slug: 'safari-and-shore', number: '01', name: 'Safari & Shore',
    eyebrow: 'East Africa / Zanzibar', title: 'A wider world, then a quieter one.',
    description: 'A considered safari chapter followed by time on the Indian Ocean, with the change of pace designed into the journey.',
    image: 'africa', alt: 'An acacia tree at first light on the East African plains', caption: 'The wild, followed by the water',
    duration: 'Suggested rhythm / 10–14 nights', destinations: ['East Africa', 'Zanzibar'], place: 'Wild', pace: 'Balanced', reason: 'Escape',
    idealFor: ['First or returning safari travellers', 'Couples and celebrations', 'Travellers who value contrast'],
    rhythm: ['Arrive without rushing into the itinerary', 'Two distinct safari settings rather than constant movement', 'A final coastal chapter with genuinely open time'],
    chapters: [
      { title: 'Begin with the horizon', text: 'Settle into one landscape long enough to notice its rhythm, guided by the season and the kind of wildlife experience that matters to you.' },
      { title: 'Change the perspective', text: 'A second setting can add contrast without turning the journey into a checklist. Connections and recovery time are treated as part of the design.' },
      { title: 'End beside the ocean', text: 'Move from early starts to slower shoreline days, with the right coast and atmosphere chosen around the note you want to finish on.' },
    ],
    flexibility: ['Reverse the order and begin at the coast', 'Use one longer safari base', 'Choose Zanzibar or another suitable Indian Ocean close'],
  },
  {
    slug: 'private-island-reset', number: '02', name: 'Private Island Reset',
    eyebrow: 'Maldives / Seychelles', title: 'Less itinerary. More arrival.',
    description: 'A deliberately unhurried island stay selected around privacy, water, atmosphere and the people travelling.',
    image: 'maldives', alt: 'Overwater villas extending into clear Indian Ocean water', caption: 'An island chosen for this particular escape',
    duration: 'Suggested rhythm / 7–10 nights', destinations: ['The Maldives', 'Seychelles'], place: 'Island', pace: 'Still', reason: 'Escape',
    idealFor: ['Couples needing real quiet', 'A restorative solo stay', 'Travellers who prefer one excellent base'],
    rhythm: ['A clean arrival and transfer plan', 'Days with one optional point of focus', 'Enough open time for the setting to do its work'],
    chapters: [
      { title: 'Choose the island first', text: 'The lagoon, reef, beach, resort scale and transfer all matter. The right match begins with how you want the stay to feel.' },
      { title: 'Choose the room honestly', text: 'Overwater is not automatically better. Privacy, access, family needs and the length of stay determine which category makes sense.' },
      { title: 'Protect the empty space', text: 'A small number of considered experiences leaves room for long mornings, water and the pleasure of having nowhere else to be.' },
    ],
    flexibility: ['Add a short city stop before the island', 'Split time between two Seychelles islands', 'Build around a honeymoon or anniversary'],
  },
  {
    slug: 'celebration-in-two-acts', number: '03', name: 'Celebration in Two Acts',
    eyebrow: 'City / Indian Ocean', title: 'A little theatre. Then time disappears.',
    description: 'A vibrant opening and a private coastal close, shaped around a honeymoon, anniversary or milestone.',
    image: 'dubai', alt: 'Dubai skyline in warm evening light', caption: 'A celebration with two different energies',
    duration: 'Suggested rhythm / 9–12 nights', destinations: ['Dubai', 'The Maldives'], place: 'City', pace: 'Balanced', reason: 'Celebration',
    idealFor: ['Honeymoons and anniversaries', 'Milestone birthdays', 'Travellers who want energy and stillness'],
    rhythm: ['A compact city opening', 'One memorable celebration moment', 'A longer island close with very little agenda'],
    chapters: [
      { title: 'Open with energy', text: 'A well-placed city stay creates momentum without consuming the journey. Arrival time and neighbourhood guide the first choices.' },
      { title: 'Mark the reason', text: 'One personal moment can carry more meaning than a string of upgrades. It is discussed early and confirmed plainly.' },
      { title: 'Let the pace fall away', text: 'The second act moves towards privacy and water, with enough time to feel different from an ordinary stopover.' },
    ],
    flexibility: ['Use another city gateway', 'Choose Seychelles for a more varied island route', 'Create a family celebration variation'],
  },
  {
    slug: 'family-in-the-wild', number: '04', name: 'Family in the Wild',
    eyebrow: 'East Africa', title: 'Wonder, with room for everyone.',
    description: 'A family safari paced around attention spans, comfort, shared discovery and the practical shape of travelling together.',
    image: 'africa', alt: 'A warm East African landscape beneath a broad sky', caption: 'A safari planned around the whole family',
    duration: 'Suggested rhythm / 8–12 nights', destinations: ['East Africa'], place: 'Wild', pace: 'Immersive', reason: 'Family',
    idealFor: ['Families travelling across generations', 'A first shared safari', 'Parents who want fewer transfers'],
    rhythm: ['A gentle first night after arrival', 'Longer stays in fewer places', 'Flexible activity windows and real downtime'],
    chapters: [
      { title: 'Begin with the family', text: 'Ages, room arrangements, interests and travel stamina shape the route before camp names or activities do.' },
      { title: 'Stay longer', text: 'Fewer moves create deeper encounters and calmer days. The itinerary leaves room to adapt to energy and weather.' },
      { title: 'Share the discovery', text: 'Guiding style and camp atmosphere matter when different generations are experiencing the wild together.' },
    ],
    flexibility: ['Add a coastal finish', 'Use a private vehicle where available', 'Adjust the balance between wildlife and rest'],
  },
  {
    slug: 'mediterranean-at-human-pace', number: '05', name: 'Mediterranean at Human Pace',
    eyebrow: 'Europe', title: 'The pleasure of leaving space between places.',
    description: 'A European route with fewer moves, better-located stays and time for a neighbourhood, table or shoreline to become familiar.',
    image: 'europe', alt: 'Whitewashed buildings above the Mediterranean Sea', caption: 'A route with time to become a place',
    duration: 'Suggested rhythm / 8–14 nights', destinations: ['Europe'], place: 'Culture', pace: 'Immersive', reason: 'Escape',
    idealFor: ['Couples who dislike rushed touring', 'Food and culture-led travellers', 'Returning visitors looking beyond highlights'],
    rhythm: ['One city or cultural base', 'A scenic transfer with purpose', 'A coast or island chapter with unscheduled days'],
    chapters: [
      { title: 'Choose an anchor', text: 'A neighbourhood and a well-placed stay can make a city feel personal without filling every hour with appointments.' },
      { title: 'Make the route coherent', text: 'Rail, road, ferry and flight choices are judged by the experience they create, not only the map distance.' },
      { title: 'Finish slowly', text: 'A coastal close allows the details gathered along the way to settle, with space for the trip to feel lived rather than completed.' },
    ],
    flexibility: ['Build the route around one country', 'Replace the coast with countryside', 'Use rail where it improves the experience'],
  },
  {
    slug: 'executive-arrivals', number: '06', name: 'Executive Arrivals',
    eyebrow: 'Business / Dubai & Europe', title: 'The agenda stays clear. The journey does too.',
    description: 'A practical travel framework for an executive or small team, arranged around the purpose, approvals and people involved.',
    image: 'corporate', alt: 'A refined aircraft cabin prepared for travel', caption: 'Business travel considered as one connected plan',
    duration: 'Typical frame / 3–6 nights', destinations: ['Dubai', 'Europe'], place: 'City', pace: 'Balanced', reason: 'Business',
    idealFor: ['Executive assistants', 'Leadership travel', 'Small teams and important guests'],
    rhythm: ['Schedule and approval requirements first', 'Flights, stay and ground movements as one plan', 'Clear handover and traveller-ready details'],
    chapters: [
      { title: 'Start with the agenda', text: 'Meeting locations, arrival windows and company requirements define the practical route before preferences are layered in.' },
      { title: 'Consider the traveller', text: 'Cabin, hotel, room, transfer and communication preferences are held together rather than repeated at every step.' },
      { title: 'Make changes legible', text: 'Any agreed support model should make revisions, approvals and ownership clear to both the coordinator and traveller.' },
    ],
    flexibility: ['Single executive or small team', 'Add a short personal extension', 'Adapt the approval and billing flow to the organisation'],
  },
];

