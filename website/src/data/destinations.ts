export interface Destination {
  slug: string; name: string; country: string; category: string; number: string;
  title: string; subtitle: string; description: string; image: string; alt: string;
  caption: string; mood: string; intro: string; paragraphs: string[];
  highlights: { name: string; text: string }[];
}

export const destinations: Destination[] = [
  {
    slug: 'maldives', name: 'The Maldives', country: 'Indian Ocean', category: 'islands', number: '01',
    title: 'A little further from everything.', subtitle: 'The Indian Ocean, at your pace.',
    description: 'Overwater mornings. Barefoot evenings. A horizon that belongs to the sea.',
    image: 'maldives', alt: 'Overwater villas reaching into turquoise water in the Maldives',
    caption: 'Overwater living / The Maldives', mood: 'For doing less, beautifully.',
    intro: 'An island is a wonderful place to find a little perspective.',
    paragraphs: ['Wake to a different shade of blue. Let the day unfold between the lagoon, a quiet table and somewhere comfortable with a view. In the Maldives, the simplest moments can be the ones you remember.', 'Your island, room category and transfers matter as much as the destination. We shape the stay around who you are travelling with, the occasion and how you want your days to feel.'],
    highlights: [
      { name: 'An island that fits', text: 'An intimate retreat or a resort with more to explore. The right setting starts with your preferences.' },
      { name: 'Time on the water', text: 'Build room for snorkelling, a boat journey or simply the lagoon outside your door, subject to your chosen stay.' },
      { name: 'The occasion, considered', text: 'Honeymoons, anniversaries and time together, with the details discussed before you arrive.' }
    ]
  },
  {
    slug: 'zanzibar', name: 'Zanzibar', country: 'Tanzania', category: 'islands', number: '02',
    title: 'Let the coast set the rhythm.', subtitle: 'Island days. A sense of place.',
    description: 'A slower shore, spice-scented streets and the warm pull of the Indian Ocean.',
    image: 'zanzibar', alt: 'A pale sandbar in the blue-green waters off Zanzibar',
    caption: 'A quieter shoreline / Zanzibar', mood: 'A little culture. A lot of coast.',
    intro: 'An island escape with another story around every corner.',
    paragraphs: ['Zanzibar invites more than beach time. Wander through Stone Town, discover the island’s food and culture, then return to a shore where the pace is entirely different.', 'We bring the coast and the cultural experiences together in a balanced itinerary. The right base, a thoughtful transfer and enough unscheduled time can make all the difference.'],
    highlights: [
      { name: 'A coast of your own', text: 'Quiet stretches, lively villages or a little of both. Choose the beach setting around your pace.' },
      { name: 'Beyond the beach', text: 'Make space for Stone Town, local food and the stories that give the island its character.' },
      { name: 'One considered journey', text: 'Discuss an island-only escape or a coastal chapter alongside an East African safari.' }
    ]
  },
  {
    slug: 'africa', name: 'East Africa', country: 'Safari country', category: 'wild', number: '03',
    title: 'Out here, the world feels bigger.', subtitle: 'Wild landscapes. Lasting perspective.',
    description: 'Open plains, early light and the extraordinary privilege of being a guest in the wild.',
    image: 'africa', alt: 'An acacia tree silhouetted against the warm light of the East African plains',
    caption: 'First light on the plains / East Africa', mood: 'For a different kind of connection.',
    intro: 'Some places change the way you look at everything else.',
    paragraphs: ['A safari is built from small, unrepeatable moments: the quiet before sunrise, a track in the dust, the slow return to camp. The landscape sets the agenda.', 'We help bring together destinations, camps, guides and connections around your interests. Wildlife sightings are never guaranteed; the journey is about the experience of being there.'],
    highlights: [
      { name: 'The right combination', text: 'Build an itinerary around landscapes and interests, with realistic time between each stop.' },
      { name: 'Camp, considered', text: 'Discuss the atmosphere, comfort level and location that best suit your kind of safari.' },
      { name: 'Leave room for wonder', text: 'A thoughtful pace allows time to watch, listen and be present, without rushing from one place to the next.' }
    ]
  },
  {
    slug: 'europe', name: 'Europe', country: 'The Mediterranean & beyond', category: 'culture', number: '04',
    title: 'Stay a little. See a little more.', subtitle: 'Old-world character. Your own route.',
    description: 'Long lunches, beautiful cities and a coast worth taking the scenic route for.',
    image: 'europe', alt: 'Whitewashed buildings and blue domes overlooking the sea in Santorini',
    caption: 'A Mediterranean moment / Santorini', mood: 'For the pleasure of taking your time.',
    intro: 'The best European journeys leave room between the landmarks.',
    paragraphs: ['A favourite neighbourhood. A terrace at the right time of day. An island reached without a rush. Europe offers countless ways to travel well, and the most rewarding itinerary is rarely the busiest.', 'We help shape a coherent route, pairing places to stay with the transport and experiences that connect them. Start with a city, a coastline or simply a season you have in mind.'],
    highlights: [
      { name: 'Cities with character', text: 'Make a well-placed hotel the beginning of an experience, with time to explore on foot.' },
      { name: 'A coastal chapter', text: 'Pair culture with time beside the sea, from a Greek island to a Mediterranean shoreline.' },
      { name: 'Travel that flows', text: 'Flights, rail and ground transfers brought into a route that makes sense for your trip.' }
    ]
  },
  {
    slug: 'dubai', name: 'Dubai', country: 'United Arab Emirates', category: 'culture', number: '05',
    title: 'A city of possibilities.', subtitle: 'A different view of Dubai.',
    description: 'Distinctive stays, late dinners and a little space beyond the skyline.',
    image: 'dubai', alt: 'The Dubai skyline in warm evening light',
    caption: 'When the city lights up / Dubai', mood: 'A city break with your name on it.',
    intro: 'Make the city yours, one considered choice at a time.',
    paragraphs: ['Dubai can be a pause between journeys, a celebration or a destination in its own right. The experience changes with the neighbourhood, the hotel and the rhythm of your days.', 'We shape your stay around what draws you here: food, design, a family escape, time by the water or business with a little more breathing room.'],
    highlights: [
      { name: 'Your kind of address', text: 'A beach setting, a city base or a quieter retreat, selected around the purpose of your visit.' },
      { name: 'Beyond the skyline', text: 'Balance city time with the coast, cultural experiences or a thoughtfully arranged desert excursion.' },
      { name: 'A well-used stopover', text: 'Discuss how a short stay can become a rewarding chapter within a longer itinerary.' }
    ]
  }
];
