export interface JournalEntry {
  slug: string; title: string; subtitle: string; description: string;
  image: string; alt: string; category: string;
  intro: string; paragraphs: string[];
}

export const journal: JournalEntry[] = [
  {
    slug: 'how-a-journey-comes-together', title: 'How a Pardus journey actually comes together', subtitle: 'The process, in plain terms.',
    description: 'What actually happens between your first message and a confirmed itinerary.',
    image: 'corporate', alt: 'A comfortable aircraft cabin interior', category: 'Process',
    intro: 'A lot of travel planning happens behind the scenes. Here is what that actually looks like.',
    paragraphs: [
      'It starts with a conversation, not a form. Whether that begins with our journey planner, an email or a message, the first thing we want to understand is you: who is travelling, what the occasion is, and what would make the time genuinely worthwhile.',
      'From there, we shape a first draft. This is rarely a finished itinerary — it is a proposed shape for the trip, with a destination or two, a rough pace, and the kind of stays that fit the occasion. We would rather show you a direction early and adjust it than disappear for a week and present something fixed.',
      'Every adjustment happens in conversation. Budget, dates, the balance between structure and free time — these get refined together, not guessed at. Nothing is booked, held or paid for during this stage.',
      'Once a shape feels right, we move to specifics: confirmed availability, an exact price, a payment schedule and the supplier terms that apply. This is the point where a proposal becomes something you can actually decide on.',
      'Only after you confirm do arrangements get booked. Before that point, you can walk away at any stage without cost or obligation. A good itinerary should earn your confirmation, not assume it.'
    ]
  },
  {
    slug: 'choosing-your-maldives-island', title: 'Choosing your Maldives island, considered', subtitle: 'One ocean, many very different stays.',
    description: 'The Maldives is not one experience. Here is how the choice of island actually changes your trip.',
    image: 'maldives', alt: 'Overwater villas reaching into turquoise water in the Maldives',
    category: 'Destination notes',
    intro: 'Every Maldives photo looks similar. Every Maldives stay does not.',
    paragraphs: [
      'The Maldives is made up of roughly twenty atolls and well over a hundred resort islands, and the difference between them matters more than most people expect. Proximity to the airport, the size of the lagoon, the house reef, and the atmosphere the resort has built all shape what your days actually feel like.',
      'A shorter transfer means more time on the island but often a busier surrounding atoll. A longer speedboat or seaplane transfer usually trades travel time for a quieter, more remote setting — sometimes worth it, sometimes not, depending on how precious the first and last day of your trip are to you.',
      'Overwater villas are the image everyone has in mind, and for good reason. But a beach villa with direct lagoon access can suit families, longer stays or anyone who prefers solid ground more than the postcard implies.',
      'The house reef is the detail most easily overlooked and most likely to define your days. Some islands have exceptional snorkelling steps from your villa; others need a boat excursion to reach the best of the marine life. If time in the water matters to you, this is worth asking about specifically.',
      'There is rarely a single "best" island — there is a best island for this particular trip, with these travellers, at this pace. That is the question we start with, rather than working backwards from a list of resort names.'
    ]
  },
  {
    slug: 'zanzibar-beyond-the-beach', title: 'Zanzibar beyond the beach', subtitle: 'A shoreline with a lot more behind it.',
    description: 'Stone Town, spice country and the case for spending a little time off the sand.',
    image: 'zanzibar', alt: 'A pale sandbar in the blue-green waters off Zanzibar', category: 'Destination notes',
    intro: 'It is entirely possible to visit Zanzibar and never leave the beach. It is also a bit of a missed opportunity.',
    paragraphs: [
      'Zanzibar\'s coastline is genuinely beautiful — pale sand, warm shallow water and a slower rhythm than most Indian Ocean islands. It would be a completely reasonable trip to arrive, settle in, and not move for a week.',
      'But Stone Town, a short transfer away, is a UNESCO World Heritage old quarter with a distinct character: narrow lanes, carved wooden doors, rooftop views and a food scene shaped by centuries of trade between Africa, the Arabian peninsula and South Asia. An afternoon there changes the texture of the trip.',
      'The island is also one of the world\'s notable spice producers, and a well-run spice tour is less a tourist formality and more a genuinely interesting couple of hours — cloves, nutmeg, cardamom and vanilla growing in ways that rarely make it onto a supermarket shelf.',
      'The practical question is balance: how much beach time against how much culture, and on what schedule. Stone Town is warm and busy during the day and considerably more pleasant in the early morning or evening — worth building the itinerary around rather than squeezing in as an afterthought.',
      'Zanzibar also pairs naturally with an East African safari, either before or after — a coastal close to a wilder itinerary, or a wilder opening before slowing down by the water. Neither order is objectively better; it depends what note you want the trip to end on.'
    ]
  },
  {
    slug: 'what-a-private-safari-involves', title: 'What a private safari actually involves', subtitle: 'Demystifying the days, the camps and the timing.',
    description: 'What a safari day actually looks like, and the honest realities of wildlife, weather and timing.',
    image: 'africa', alt: 'An acacia tree silhouetted against the warm light of the East African plains', category: 'Destination notes',
    intro: 'Safari is one of the most talked-about, least-explained kinds of travel. Here is what actually happens.',
    paragraphs: [
      'A typical safari day starts early — often before sunrise, when animals are most active and the light is at its best. A morning game drive, a break through the heat of midday, and an afternoon or evening drive is the usual rhythm, though camps vary in how strictly they hold to it.',
      'Camps range enormously: a permanent lodge with a pool and full service, a tented camp with canvas walls and paraffin lanterns, or a fully mobile camp that moves with the seasons. None is objectively better — the right one depends on how much comfort matters against how immersive you want the setting to feel.',
      'Wildlife sightings are never guaranteed, and we would rather say that plainly than imply otherwise. Guides read tracks, radio calls and seasonal patterns to maximise the odds, but the wild does not run on a schedule. The privilege is being a guest in it, not a customer owed a checklist.',
      'Timing shapes the experience more than most first-time safari travellers expect. Dry season generally means easier wildlife viewing as animals gather near water; green season brings dramatic landscapes, fewer crowds and newborn animals, at some cost to visibility. Neither is wrong — they are simply different trips.',
      'Between drives, the pace is genuinely slow: reading, resting, watching the camp\'s waterhole or simply sitting with the quiet. A good safari itinerary leaves room for that stillness rather than filling every hour, because a lot of what people remember afterwards happens in the gaps.'
    ]
  },
  {
    slug: 'questions-before-a-luxury-booking', title: 'Questions worth asking before a luxury booking', subtitle: 'A short, honest checklist — for any operator, not just us.',
    description: 'A few plain questions that make any high-value travel booking clearer, whoever you book it with.',
    image: 'europe', alt: 'Whitewashed buildings and blue domes overlooking the sea in Santorini', category: 'Before you book',
    intro: 'A significant booking deserves a few plain questions before you commit — of any operator, including us.',
    paragraphs: [
      'What exactly is included, and what is not? Flights, transfers, meals, activities and taxes can be bundled very differently between two proposals that look similar on price. Ask for the full breakdown before comparing numbers.',
      'What is the cancellation and change policy, in writing? Circumstances change. A trustworthy proposal names its deadlines and any non-refundable portions clearly, rather than leaving that conversation for after you have paid.',
      'Who is the supplier, and what is the relationship? Understanding whether you are booking directly with a property or through an intermediary — and what protections that involves — is a reasonable question to ask of anyone handling a significant payment on your behalf.',
      'What happens if something goes wrong during the trip? A flight delay, a closed property, a medical concern. Ask how support actually works while you are travelling, not just how the sale is made beforehand.',
      'Is the price final, or does it depend on availability that has not been confirmed yet? A quote and a confirmed booking are not the same thing, and a good operator will be clear about which stage you are at, at every point.'
    ]
  }
];
