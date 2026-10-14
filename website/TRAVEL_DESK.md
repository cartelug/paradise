# Travel Desk editorial and refresh rules

The Travel Desk carries dated official notices useful for planning a journey. The Uganda CAA RSS feed also contains vacancies, tenders and institutional news; those are excluded before the producer applies its six-notice limit. Titles must describe a passenger or travel-planning topic. The shared server/browser selector applies the same relevance rule to protect visitors while a cached or older public feed remains available.

News carries its original publication date. `checkedAt` records when that source was fetched or manually reviewed. The aviation feed check does not claim that every curated source was reviewed that day. Curated seasonal entries expire on a stated date; other notices leave the feed after 120 days. Future dates, unapproved origins, malformed entries and duplicate links are rejected.

The browser reads the root JSON on `main`, then the locally published JSON. An unavailable source keeps eligible previous notices and the actual last-successful aviation check date. A healthy feed containing no traveller notices clears old news. An empty desk directs the traveller to named official source pages; it does not invent an update or imply that entry rules have been confirmed for their nationality.

Manually review the linked original page before changing curated `HIGHLIGHTS` in `scripts/update-travel-desk.py`. A scheduled RSS run does not advance their `checkedAt` dates. The current Visit Dubai seasonal page and Uganda CAA Jambojet notice were reviewed on 14 October 2026. Their summaries are original and retain a link to the official notice.

Run `python -m unittest discover -s tests -p test_travel_desk.py` for producer regressions and `npm test` for the shared server/browser selector. The daily workflow runs the producer tests before fetching or committing updates.
